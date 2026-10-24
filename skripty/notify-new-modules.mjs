
import { execFileSync } from "node:child_process";

const {
  RESEND_API_KEY,
  RESEND_FROM,
  OPS_RECIPIENTS,
  BEFORE_SHA,
  CURRENT_SHA,
  REPOSITORY
} = process.env;

if (!RESEND_API_KEY || !RESEND_FROM || !OPS_RECIPIENTS) {
  throw new Error("Missing required GitHub Actions secrets.");
}

if (!BEFORE_SHA || /^0+$/.test(BEFORE_SHA)) {
  console.log("Initial push; no previous version to compare.");
  process.exit(0);
}

function readModules(revision) {
  const json = execFileSync(
    "git",
    ["show", `${revision}:praxe/modules.json`],
    { encoding: "utf8" }
  );

  const modules = JSON.parse(json);

  if (!Array.isArray(modules)) {
    throw new Error("praxe/modules.json must contain an array.");
  }

  for (const module of modules) {
    if (!module.id || !module.title) {
      throw new Error("Every module must have an id and title.");
    }
  }

  return modules;
}

const previousModules = readModules(BEFORE_SHA);
const currentModules = readModules(CURRENT_SHA);

const previousIds = new Set(
  previousModules.map(module => String(module.id))
);

const addedModules = currentModules.filter(
  module => !previousIds.has(String(module.id))
);

if (addedModules.length === 0) {
  console.log("No new modules. No email will be sent.");
  process.exit(0);
}

const recipients = OPS_RECIPIENTS
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

if (recipients.length === 0) {
  throw new Error("No email recipients configured.");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

const moduleList = addedModules.map(module => `
  <li>
    <strong>${escapeHtml(module.title)}</strong>
    <br>
    Kód: ${escapeHtml(module.code || module.id)}
    <br>
    Složka: ${escapeHtml(module.folder || "neuvedena")}
  </li>
`).join("");

const subject = addedModules.length === 1
  ? `OPS: Nový modul – ${addedModules[0].title}`
  : `OPS: Přidáno ${addedModules.length} nových modulů`;

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    from: RESEND_FROM,
    to: recipients,
    subject,
    html: `
      <h2>🆕 Nový obsah na OPS</h2>
      <p>Do praktické části byly přidány nové moduly:</p>
      <ul>${moduleList}</ul>
      <p>
        <a href="https://github.com/${encodeURI(REPOSITORY)}/commit/${encodeURIComponent(CURRENT_SHA)}">
          Zobrazit změny na GitHubu
        </a>
      </p>
      <p>Automatické oznámení webu OPS.</p>
    `
  })
});

const result = await response.json();

if (!response.ok) {
  throw new Error(
    `Resend API error (${response.status}): ${JSON.stringify(result)}`
  );
}

console.log(
  `Email accepted by Resend. ID: ${result.id}. ` +
  `New modules: ${addedModules.map(m => m.id).join(", ")}`
);
