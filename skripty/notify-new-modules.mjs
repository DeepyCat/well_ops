
import { execFileSync } from "node:child_process";

const {
  RESEND_API_KEY,
  RESEND_FROM,
  OPS_RECIPIENTS,
  BEFORE_SHA,
  CURRENT_SHA,
  REPOSITORY
} = process.env;

// Kontrola povinných proměnných
if (!RESEND_API_KEY || !RESEND_FROM || !OPS_RECIPIENTS) {
  throw new Error("Missing required GitHub Actions secrets.");
}

if (!CURRENT_SHA || !REPOSITORY) {
  throw new Error("Missing CURRENT_SHA or REPOSITORY.");
}

// Při prvním pushi není co porovnávat
if (!BEFORE_SHA || /^0+$/.test(BEFORE_SHA)) {
  console.log("Initial push; no previous version to compare.");
  process.exit(0);
}

// Načtení modulů z konkrétního commitu
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

  const ids = new Set();

  for (const module of modules) {
    if (
      module.id == null ||
      String(module.id).trim() === "" ||
      !module.title ||
      typeof module.title !== "string"
    ) {
      throw new Error(
        "Every module must have a valid id and title."
      );
    }

    const id = String(module.id);

    if (ids.has(id)) {
      throw new Error(`Duplicate module ID: ${id}`);
    }

    ids.add(id);
  }

  return modules;
}

const previousModules = readModules(BEFORE_SHA);
const currentModules = readModules(CURRENT_SHA);

// Porovnáme ID modulů
const previousIds = new Set(
  previousModules.map(module => String(module.id))
);

const addedModules = currentModules.filter(
  module => !previousIds.has(String(module.id))
);

// Pokud nepřibyl žádný modul, nic neposíláme
if (addedModules.length === 0) {
  console.log("No new modules. No email will be sent.");
  process.exit(0);
}

console.log(
  `New modules detected: ${addedModules
    .map(module => module.id)
    .join(", ")}`
);

// Příjemci se očistí od mezer a prázdných položek
const recipients = [
  ...new Set(
    OPS_RECIPIENTS
      .split(",")
      .map(email => email.trim())
      .filter(Boolean)
  )
];

if (recipients.length === 0) {
  throw new Error("No email recipients configured.");
}

// Kontrola základního formátu e-mailových adres
for (const recipient of recipients) {
  if (!/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(recipient)) {
    throw new Error(`Invalid recipient email address: ${recipient}`);
  }
}

// Bezpečné vložení textu do HTML
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
    Kód: ${escapeHtml(module.code ?? module.id)}
    <br>
    Složka: ${escapeHtml(module.folder ?? "neuvedena")}
  </li>
`).join("");

const subject = addedModules.length === 1
  ? `OPS: Nový modul – ${addedModules[0].title}`
  : `OPS: Přidáno ${addedModules.length} nových modulů`;

const commitUrl =
  `https://github.com/${REPOSITORY}/commit/${encodeURIComponent(CURRENT_SHA)}`;

const html = `
  <h2>🆕 Nový obsah na OPS</h2>
  <p>Do praktické části byly přidány nové moduly:</p>
  <ul>${moduleList}</ul>
  <p>
    <a href="${escapeHtml(commitUrl)}">
      Zobrazit změny na GitHubu
    </a>
  </p>
  <p>Automatické oznámení webu OPS.</p>
`;

// Každému příjemci pošleme samostatný e-mail.
// Jejich adresy se tak navzájem nezobrazí.
const failures = [];

for (const recipient of recipients) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [recipient],
        subject,
        html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `Resend API error (${response.status}): ${JSON.stringify(result)}`
      );
    }

    console.log(
      `Email accepted by Resend for ${recipient}. ID: ${result.id}`
    );
  } catch (error) {
    console.error(
      `Failed to send email to ${recipient}:`,
      error.message
    );

    failures.push(recipient);
  }
}

// GitHub Actions označí běh jako neúspěšný, pokud některý e-mail selhal.
if (failures.length > 0) {
  throw new Error(
    `Failed to send email to ${failures.length} recipient(s): ` +
    failures.join(", ")
  );
}

console.log(
  `Successfully submitted notifications to all ${recipients.length} recipients.`
);
