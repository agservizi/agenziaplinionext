import fs from "node:fs";
let p = fs.readFileSync("src/app/admin-login/page.tsx", "utf8");
p = p.replace(
  "Usa le credenziali admin (`STORE_ADMIN`) per entrare in `/area-admin`.",
  "Usa le credenziali admin per entrare nell'editor del sito.",
);
fs.writeFileSync("src/app/admin-login/page.tsx", p);

// smoke redirects
async function check(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    console.log(url, res.status, res.headers.get("location") || "");
  } catch (e) {
    console.log(url, "ERR", e.message);
  }
}
await check("http://localhost:3000/area-admin");
await check("http://localhost:3000/admin-login");
