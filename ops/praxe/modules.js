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
    verifiedFile: "praxe/00/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      zipName: "Prijmeni_Jmeno_Modul00.zip",
      folders: [
        "<code>Moje dokumentace / Modul 0 Příprava</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
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
    verifiedFile: "praxe/01/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      zipName: "Prijmeni_Jmeno_Modul01.zip",
      folders: [
        "<code>Moje dokumentace / Modul 1 Domain Controller</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
  },
  {
    id: "02",
    code: "M02",
    title: "Modul 02: DHCP Server",
    shortTitle: "Modul 02",
    folder: "praxe/02",
    vms: ["SRV1-DC", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/02/tasks.js",
    verifiedFile: "praxe/02/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      zipName: "Prijmeni_Jmeno_Modul2.zip",
      folders: [
        "<code>Moje dokumentace / Modul 2 DHCP</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)",
        "<code>Moje dokumentace / Modul 0 Příprava</code> (část <code>PC1-WIN</code>)"
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
  },
  {
    id: "03",
    code: "M03",
    title: "Modul 03: DNS Server",
    shortTitle: "Modul 03",
    folder: "praxe/03",
    vms: ["SRV1-DC", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/03/tasks.js",
    verifiedFile: "praxe/03/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      description: "Odevzdává se přes <strong>GitHub Push</strong> (do vašeho repozitáře) a potvrzením <strong>Odevzdat</strong> v MS Teams:",
      folders: [
        "<code>Moje dokumentace / Modul 3 DNS</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
  },
  {
    id: "04",
    code: "M04",
    title: "Modul 04: Active Directory",
    shortTitle: "Modul 04",
    folder: "praxe/04",
    vms: ["SRV1-DC", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/04/tasks.js",
    verifiedFile: "praxe/04/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      description: "Odevzdává se přes <strong>GitHub Push</strong> (do vašeho repozitáře) a kliknutím na <strong>Odevzdat</strong> v MS Teams:",
      deadline: "skupina B 4. 1. 2027 v 8:00, skupina A 11. 1. 2027 v 8:00",
      folders: [
        "<code>Moje dokumentace / Modul 4 Active Directory</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ],
      notes: [
        "<strong>Před odevzdáním:</strong> Na <strong>PC1-WIN</strong> se alespoň jednou skutečně přihlaste jako <code>eva.student</code> a následně ji <strong>odhlaste</strong>, aby se na <strong>SRV1-DC</strong> vytvořil kočovný profil <code>C:\\profiles\\eva.student.V6</code>.",
        "<strong>Ruční dokumentace:</strong> Vyplňte <code>postup.md</code> vlastními slovy a do <code>overeni.md</code> vložte výstupy z PowerShellu s nastaveným <code>OPS_PROMPT</code> a <strong>3 povinné screenshoty s viditelnými hodinami na hlavním panelu</strong> u bodů <code>M4-SRV1.V1-D2</code>, <code>M4-SRV1.V7-D2</code> a <code>M4-PC1.V1-D2</code> (obrázky do <code>images/</code>), následně vault pushněte přes <strong>GitHub</strong> a odevzdejte v <strong>MS Teams</strong>."
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
  }
];

// Fallback pro lokální otevírání přes file:// protokol bez web serveru
window.OPS_MODULE_VERIFIED = {
  "00": {
    "SRV1-DC": true,
    "SRV2-FS": true,
    "PC1-WIN": true,
    "dokumentace": false
  },
  "01": {
    "SRV1-DC": true,
    "dokumentace": false
  },
  "02": {
    "SRV1-DC": true,
    "PC1-WIN": true,
    "dokumentace": false
  },
  "03": {
    "SRV1-DC": true,
    "PC1-WIN": true,
    "dokumentace": false
  },
  "04": {
    "SRV1-DC": false,
    "PC1-WIN": false,
    "dokumentace": false
  }
};
