#!/bin/sh
# Importers: none (pipe via ssh). No HTTP API schemas.
# User: "cloudflare e in selfhost su nas" / expose Nuvera demo.
# Adds nuvera-casa.agenziaplinio.it → shopping-house :3086 on tunnel corehost.
set -e
HOST="nuvera-casa.agenziaplinio.it"
FE_ENV="/home/Carmine/shopping-house-demo/frontend.env"
CFG="/opt/cloudflared/config.yml"
DOCKER="/Volume1/@apps/DockerEngine/dockerd/bin/docker"

cp -f "$FE_ENV" "$FE_ENV.bak-$(date +%Y%m%d-%H%M%S)"
python3 - <<'PY'
from pathlib import Path
p = Path("/home/Carmine/shopping-house-demo/frontend.env")
lines = []
seen_origin = seen_secure = False
for line in p.read_text().splitlines():
    if line.startswith("DEMO_FRONTEND_ORIGIN="):
        lines.append("DEMO_FRONTEND_ORIGIN=https://nuvera-casa.agenziaplinio.it")
        seen_origin = True
    elif line.startswith("DEMO_COOKIE_SECURE="):
        lines.append("DEMO_COOKIE_SECURE=1")
        seen_secure = True
    else:
        lines.append(line)
if not seen_origin:
    lines.append("DEMO_FRONTEND_ORIGIN=https://nuvera-casa.agenziaplinio.it")
if not seen_secure:
    lines.append("DEMO_COOKIE_SECURE=1")
p.write_text("\n".join(lines) + "\n")
print("FRONTEND_ENV_UPDATED")
PY

cd /home/Carmine/shopping-house-demo
"$DOCKER" compose -f compose.yaml up -d --force-recreate frontend
sleep 5
curl -sS -o /dev/null -w "local_fe=%{http_code}\n" "http://192.168.1.50:3086/"

cp -f "$CFG" "$CFG.bak-nuvera-$(date +%Y%m%d-%H%M%S)"
python3 - <<'PY'
from pathlib import Path
import re
p = Path("/opt/cloudflared/config.yml")
text = p.read_text()
host = "nuvera-casa.agenziaplinio.it"
wanted = f"""  - hostname: {host}
    service: http://192.168.1.50:3086
    originRequest:
      httpHostHeader: {host}
"""
pat = re.compile(
    r"  - hostname: nuvera-casa\.agenziaplinio\.it\n(?:    .*\n)*?(?=  - hostname:|  - service:)",
    re.M,
)
if pat.search(text):
    text = pat.sub(wanted, text, count=1)
    print("REPLACED_NUVERA_INGRESS")
elif f"hostname: {host}" in text:
    raise SystemExit("hostname found but pattern mismatch")
else:
    marker = "  - service: https://localhost:4443"
    if marker not in text:
        raise SystemExit("catch-all marker not found")
    text = text.replace(marker, wanted + marker, 1)
    print("INSERTED_NUVERA_INGRESS")
p.write_text(text)
print("CONFIG_OK")
PY

grep -n -A4 "nuvera-casa.agenziaplinio.it" "$CFG"

"$DOCKER" exec cloudflared_corehost cloudflared tunnel route dns corehost "$HOST" 2>&1 || \
"$DOCKER" exec cloudflared_corehost cloudflared tunnel route dns --overwrite-dns corehost "$HOST" 2>&1 || \
echo DNS_ROUTE_WARN

"$DOCKER" restart cloudflared_corehost
sleep 8
"$DOCKER" ps --filter name=cloudflared_corehost --format '{{.Names}} {{.Status}}'

i=0
while [ "$i" -lt 18 ]; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 8 "https://$HOST/" 2>/dev/null || echo 000)
  echo "try=$i code=$code"
  case "$code" in 200|301|302|303) break ;; esac
  i=$((i + 1))
  sleep 5
done
curl -sSI --connect-timeout 10 "https://$HOST/" 2>&1 | head -15
echo DONE
