#!/usr/bin/env node
/**
 * Smoke: Saleor GraphQL reachable + optional App Token auth.
 */
const raw = (
  process.env.SALEOR_API_URL ||
  process.env.NEXT_PUBLIC_SALEOR_API_URL ||
  ""
).trim();

if (!raw) {
  console.error("FAIL: NEXT_PUBLIC_SALEOR_API_URL / SALEOR_API_URL missing");
  process.exit(1);
}

const endpoint = raw.includes("/graphql")
  ? raw.replace(/\/?$/, "/")
  : `${raw.replace(/\/$/, "")}/graphql/`;

async function main() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.SALEOR_APP_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SALEOR_APP_TOKEN}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: "{ shop { name } }" }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("FAIL: non-JSON response", res.status, text.slice(0, 200));
    process.exit(1);
  }

  if (!res.ok || json.errors?.length) {
    console.error("FAIL:", res.status, json.errors || json);
    process.exit(1);
  }

  console.log("OK: Saleor shop =", json.data?.shop?.name || "(unnamed)");
  console.log("endpoint:", endpoint);
  console.log(
    "appToken:",
    process.env.SALEOR_APP_TOKEN ? "present" : "absent (public query only)",
  );
}

main().catch((err) => {
  console.error("FAIL: unreachable —", err.message);
  console.error("Start stack: cd docker/saleor && docker compose up -d");
  process.exit(1);
});
