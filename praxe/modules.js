/**
 * Centrální registr modulů pro interaktivní lab (OPS).
 * Slouží pro dynamický přepínač zadání na stránce praxe.html.
 */
window.OPS_MODULES = [
  {
    id: "01",
    code: "M01",
    title: "Modul 01: Příprava a instalace OS",
    shortTitle: "Modul 01",
    folder: "praxe/01",
    vms: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/01/tasks.js",
    verifiedFile: "praxe/01/verified.json"
  }
];

// Fallback pro lokální otevírání přes file:// protokol bez web serveru
window.OPS_MODULE_VERIFIED = {
  "01": {
    "SRV1-DC": true,
    "SRV2-FS": true,
    "PC1-WIN": true
  }
};
