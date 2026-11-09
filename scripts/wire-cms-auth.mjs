import fs from "node:fs";

// keystatic APP_SLUG gate
let kc = fs.readFileSync("keystatic.config.ts", "utf8");
kc = kc.replace(
  `const githubConfigured = Boolean(
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET,
);`,
  `const githubConfigured = Boolean(
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
    process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
    process.env.KEYSTATIC_SECRET &&
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
);`,
);
fs.writeFileSync("keystatic.config.ts", kc);

// proxy matcher
let px = fs.readFileSync("src/proxy.ts", "utf8");
px = px.replace(
  `matcher: ["/area-clienti/:path*", "/area-admin", "/area-admin/:path*"],`,
  `matcher: [
    "/area-clienti/:path*",
    "/area-admin",
    "/area-admin/:path*",
    "/keystatic",
    "/keystatic/:path*",
    "/api/keystatic/:path*",
  ],`,
);
fs.writeFileSync("src/proxy.ts", px);

fs.writeFileSync(
  "src/app/api/cms/save/route.ts",
  `import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { requireStaffSession } from "@/lib/auth/api-guard";

const ALLOWED: Record<string, string> = {
  "site-settings": "content/site-settings.json",
  "home-page": "content/home-page.json",
};

const COLLECTION_PREFIXES: Record<string, string> = {
  faqs: "content/faqs",
  reviews: "content/reviews",
  services: "content/services",
};

function githubModeReady() {
  return Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
      process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
      process.env.KEYSTATIC_SECRET &&
      process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
  );
}

async function commitViaGithub(relPath: string, contents: string, message: string) {
  const token = process.env.CMS_GITHUB_TOKEN?.trim();
  const repo = process.env.KEYSTATIC_GITHUB_REPO?.trim() || "carva/agenziaplinio.it";
  if (!token) {
    throw Object.assign(new Error("CMS_GITHUB_TOKEN mancante"), { status: 501 });
  }
  const [owner, name] = repo.split("/");
  const apiBase = \`https://api.github.com/repos/\${owner}/\${name}/contents/\${relPath.replace(/\\\\/g, "/")}\`;
  const existing = await fetch(apiBase, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: \`Bearer \${token}\`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  let sha: string | undefined;
  if (existing.ok) {
    const json = (await existing.json()) as { sha?: string };
    sha = json.sha;
  }
  const put = await fetch(apiBase, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: \`Bearer \${token}\`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(contents, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!put.ok) {
    const text = await put.text();
    throw Object.assign(new Error(text.slice(0, 300) || "GitHub commit fallito"), {
      status: put.status,
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "dashboard");
  if ("error" in auth) return auth.error;

  let body: { target?: string; slug?: string; data?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
  }

  const target = String(body.target || "");
  const data = body.data;
  if (!target || data === undefined) {
    return NextResponse.json({ error: "target e data obbligatori" }, { status: 400 });
  }

  let rel = ALLOWED[target];
  if (!rel) {
    const [collection, slug] = target.split("/");
    const dir = COLLECTION_PREFIXES[collection];
    if (!dir || !slug) {
      return NextResponse.json({ error: "target non consentito" }, { status: 400 });
    }
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(slug)) {
      return NextResponse.json({ error: "slug non valido" }, { status: 400 });
    }
    rel = path.join(dir, \`\${slug}.json\`);
  }

  const contents = JSON.stringify(data, null, 2) + "\\n";
  const posixRel = rel.replace(/\\\\/g, "/");

  if (githubModeReady()) {
    try {
      await commitViaGithub(posixRel, contents, \`cms: update \${target}\`);
      return NextResponse.json({ ok: true, path: posixRel, mode: "github" });
    } catch (error) {
      const status = (error as { status?: number })?.status || 502;
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Salvataggio GitHub fallito",
          hint: "Verifica CMS_GITHUB_TOKEN o usa /keystatic",
        },
        { status },
      );
    }
  }

  const full = path.join(process.cwd(), rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, contents, "utf8");
  return NextResponse.json({ ok: true, path: posixRel, mode: "local" });
}
`,
);
console.log("cms save + proxy + keystatic gate");
