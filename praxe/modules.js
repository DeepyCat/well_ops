/**
 * Centrální registr modulů pro interaktivní lab (OPS).
 * Slouží pro dynamický přepínač zadání na stránce praxe.html.
 */
window.OPS_MODULES = [
  {
    id: "00",
    code: "M00",
    title: "Modul 00: Příprava a instalace OS",
    shortTitle: "Modul 00",
    folder: "praxe/00",
    vms: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/00/tasks.js",
    verifiedFile: "praxe/00/verified.json"
  },
  {
    id: "01",
    code: "M01",
    title: "Modul 01: Active Directory Domain Services",
    shortTitle: "Modul 01",
    folder: "praxe/01",
    vms: ["SRV1-DC"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/01/tasks.js",
    verifiedFile: "praxe/01/verified.json"
  }
];

// Fallback pro lokální otevírání přes file:// protokol bez web serveru
window.OPS_MODULE_VERIFIED = {
  "00": {
    "SRV1-DC": true,
    "SRV2-FS": true,
    "PC1-WIN": true
  },
  "01": {
    "SRV1-DC": false
  }
};
