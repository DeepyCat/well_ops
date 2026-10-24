
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

if (!CURRENT_SHA || !REPOSITORY) {
  throw new Error("Missing CURRENT_SHA or REPOSITORY.");
}

if (!BEFORE_SHA || /^0+$/.test(BEFORE_SHA)) {
  console.log("Initial push; no previous version to compare.");
  process.exit(0);
}

// Načtení modulů z konkrétního commitu
function readModules(revision) {
  const filePath = `${revision}:praxe/modules.json`;

  console.log(`\nNačítám praxe/modules.json z commitu: ${revision}`);

  const json = execFileSync(
    "git",
    ["show", filePath],
    { encoding: "utf8" }
  );

  let modules;

  try {
    modules = JSON.parse(json);
  } catch (error) {
    console.error("\n❌ Chyba při parsování praxe/modules.json");
    console.error(`Commit: ${revision}`);
    console.error(`Původní chyba: ${error.message}`);
    console.error("Obsah souboru načtený z tohoto commitu:\n");
    console.error(json);
    throw error;
  }

  if (!Array.isArray(modules)) {
    throw new Error(
      `praxe/modules.json must contain an array. Commit: ${revision}`
    );
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
        `Every module must have a valid id and title. Commit: ${revision}`
      );
    }

    const id = String(module.id);

    if (ids.has(id)) {
      throw new Error(`Duplicate module ID: ${id}`);
    }

    ids.add(id);
  }

  console.log(`JSON OK — počet modulů: ${modules.length}`);

  return modules;
}

console.log("=== Kontrola změn modulů OPS ===");
console.log(`Předchozí commit: ${BEFORE_SHA}`);
console.log(`Aktuální commit:  ${CURRENT_SHA}`);

const previousModules = readModules(BEFORE_SHA);
const currentModules = readModules(CURRENT_SHA);

// Porovnání ID předchozích a aktuálních modulů
const previousIds = new Set(
  previousModules.map(module => String(module.id))
);

const addedModules = currentModules.filter(
  module => !previousIds.has(String(module.id))
);

// Při přidání ID zobrazíme nové moduly.
// Při jiné změně JSONu zobrazíme aktuální moduly.
const modulesToShow = addedModules.length > 0
  ? addedModules
  : currentModules;

console.log(
  addedModules.length > 0
    ? `Nová ID: ${addedModules.map(module => module.id).join(", ")}`
    : "JSON byl změněn, ale žádné nové ID nebylo přidáno."
);

// Příjemci bez duplicit
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

for (const recipient of recipients) {
  if (!/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(recipient)) {
    throw new Error(`Invalid recipient email address: ${recipient}`);
  }
}

// Ochrana textu v HTML
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Karta a odkaz pro každý zobrazovaný modul
const moduleList = modulesToShow.map(module => {
  const moduleId = String(module.id);

  const moduleUrl =
    `https://www.kokot.fit/praxe.html?modul=${encodeURIComponent(moduleId)}`;

  return `
    <div style="
      background:#202033;
      border:1px solid #393653;
      border-radius:12px;
      padding:20px;
      margin:16px 0;
    ">
      <div style="
        color:#a78bfa;
        font-size:12px;
        font-weight:bold;
        letter-spacing:1.5px;
        margin-bottom:8px;
      ">${escapeHtml(module.code ?? `M${moduleId}`)}</div>

      <h3 style="
        color:#ffffff;
        margin:0 0 10px;
        font-size:20px;
      ">${escapeHtml(module.title)}</h3>

      <p style="
        color:#b9b7ce;
        font-size:13px;
        margin:0 0 18px;
      ">Složka: ${escapeHtml(module.folder ?? "neuvedena")}</p>

      <a href="${escapeHtml(moduleUrl)}" style="
        display:inline-block;
        background:#8b5cf6;
        color:#ffffff;
        text-decoration:none;
        font-weight:bold;
        padding:12px 18px;
        border-radius:8px;
      ">Otevřít modul →</a>
    </div>
  `;
}).join("");

// Předmět e-mailu
const subject = addedModules.length > 0
  ? addedModules.length === 1
    ? `🚀 OPS | Nový modul: ${addedModules[0].title}`
    : `🚀 OPS | Přidáno ${addedModules.length} nových modulů`
  : "OPS | Aktualizace modulů";

// HTML e-mailu
const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novinky na OPS</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#11111b;
  font-family:Arial,Helvetica,sans-serif;
  color:#ffffff;
">
  <div style="padding:32px 12px;">

    <div style="
      max-width:600px;
      margin:0 auto;
      background:#181825;
      border:1px solid #302d46;
      border-radius:16px;
      overflow:hidden;
    ">

      <div style="
        padding:30px 28px;
        background:#1e1b32;
        border-bottom:1px solid #393653;
      ">
        <div style="
          color:#a78bfa;
          font-size:12px;
          font-weight:bold;
          letter-spacing:3px;
          margin-bottom:10px;
        ">PRAKTICKÁ ČÁST</div>

        <h1 style="
          color:#ffffff;
          font-size:30px;
          margin:0;
        ">🚀 OPS</h1>

        <p style="
          color:#c4b5fd;
          margin:10px 0 0;
          font-size:14px;
        ">Novinky na webu</p>
      </div>

      <div style="padding:28px;">

        <div style="
          color:#a78bfa;
          font-size:12px;
          font-weight:bold;
          letter-spacing:1.5px;
        ">NOVÝ OBSAH</div>

        <h2 style="
          color:#ffffff;
          font-size:25px;
          line-height:1.3;
          margin:10px 0 12px;
        ">
          ${addedModules.length > 0
            ? addedModules.length === 1
              ? "Přibyl nový modul!"
              : "Přibyly nové moduly!"
            : "Moduly byly aktualizovány!"}
        </h2>

        <p style="
          color:#c4c4d4;
          font-size:15px;
          line-height:1.7;
          margin:0 0 22px;
        ">
          ${addedModules.length > 0
            ? "Na OPS byl právě přidán nový obsah. Vyber si modul níže a můžeš se pustit do práce."
            : "Na OPS došlo ke změně seznamu modulů. Aktuální moduly najdeš níže."}
        </p>

        ${moduleList}

        <div style="
          margin-top:28px;
          padding-top:22px;
          border-top:1px solid #302d46;
        ">
          <p style="
            color:#a5a3b8;
            font-size:13px;
            line-height:1.6;
          ">
            Nějaký problém? tvoje chyba
          </p>
        </div>
      </div>

      <div style="
        padding:20px 28px;
        background:#141420;
        border-top:1px solid #302d46;
      ">
        <p style="
          color:#a5a3b8;
          font-size:12px;
          line-height:1.7;
          margin:0;
        ">
          Toto je automatické oznámení webu OPS.<br>
          Bylo odesláno při změně souboru modules.json.
        </p>

        <p style="
          color:#77758b;
          font-size:11px;
          margin:12px 0 0;
        ">
          © OPS · Praktická část
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;

// Každému příjemci posíláme samostatný e-mail
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

if (failures.length > 0) {
  throw new Error(
    `Failed to send email to ${failures.length} recipient(s): ` +
    failures.join(", ")
  );
}

console.log(
  `Successfully submitted notifications to all ${recipients.length} recipients.`
);
