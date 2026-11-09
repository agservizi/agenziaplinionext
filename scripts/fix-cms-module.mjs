import fs from "node:fs";

let s = fs.readFileSync("src/lib/auth/session.ts", "utf8");
s = s.replace(
  `| "staff"
    | "settings",
) {
  if (role === "SUPERADMIN") return true;
  if (role === "ADMIN") {
    return module !== "staff" && module !== "settings";
  }
  if (role === "OPERATOR") {
    return module === "ops" || module === "shop_read";
  }`,
  `| "staff"
    | "settings"
    | "cms",
) {
  if (role === "SUPERADMIN") return true;
  if (role === "ADMIN") {
    return module !== "staff" && module !== "settings";
  }
  if (role === "OPERATOR") {
    return module === "ops" || module === "shop_read" || module === "cms";
  }`,
);
fs.writeFileSync("src/lib/auth/session.ts", s);

let c = fs.readFileSync("src/app/api/cms/save/route.ts", "utf8");
c = c.replace('requireStaffSession(request, "dashboard")', 'requireStaffSession(request, "cms")');
// fix escaped newlines that may have been double-escaped in template
c = c.replace(/\\\\n/g, "\\n");
c = c.replace(/\\\\/g, "\\");
fs.writeFileSync("src/app/api/cms/save/route.ts", c);
console.log("cms module fixed");
