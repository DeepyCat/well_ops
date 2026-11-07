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
      title: "Automatické vygenerování dokumentace & odeslání na Discord",
      warning: "DŮLEŽITÉ PRAVIDLO: Příkazy provádějte POSTUPNĚ jeden po druhém! Nikdy nespouštějte skripty na více strojích naráz. Počkejte, až bot potvrdí předchozí krok, a teprve poté spusťte další.",
      steps: [
        {
          num: 1,
          vm: "SRV1-DC",
          title: "Krok 1: Spusťte na serveru SRV1-DC",
          desc: "Otevřete PowerShell jako Správce na stroji SRV1-DC, spusťte níže uvedený příkaz a vyplňte své jméno, třídu (T3A) a přesné Discord uživatelské jméno. Skript provede audit přípravy serveru SRV1-DC a odešle data na Discord do kanálu #dokumentace. Vyčkejte, až se v kanálu zobrazí potvrzení od bota '[KROK 1/3 PRIJAT]'.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/00_doc_SRV1-DC.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        },
        {
          num: 2,
          vm: "SRV2-FS",
          title: "Krok 2: Spusťte na serveru SRV2-FS (až po potvrzení Kroku 1!)",
          desc: "Přepněte se na souborový server SRV2-FS a otevřete PowerShell jako Správce. Spusťte níže uvedený příkaz a zadejte STEJNÉ uživatelské jméno na Discordu jako v prvním kroku. Skript provede audit přípravy SRV2-FS a odešle data. Vyčkejte na potvrzení bota '[KROK 2/3 PRIJAT]'.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/00_doc_SRV2-FS.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        },
        {
          num: 3,
          vm: "PC1-WIN",
          title: "Krok 3: Spusťte na stanici PC1-WIN (až po potvrzení Kroku 2!)",
          desc: "Přepněte se na klientskou stanici PC1-WIN a otevřete PowerShell jako Správce. Spusťte níže uvedený příkaz a zadejte STEJNÉ uživatelské jméno na Discordu. Skript provede audit klientské stanice a odešle závěrečnou část botovi.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/00_doc_PC1-WIN.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        }
      ],
      footnote: "Po přijetí všech 3 částí bot zahájí generování a do 5 minut vám do kanálu doručí hotový ZIP archiv. DŮLEŽITÉ: V souboru overeni.md doplňte požadované screenshoty z hypervizoru a nastavení!"
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
      title: "Automatické vygenerování dokumentace & odeslání na Discord",
      warning: "Příkaz spusťte v PowerShellu jako Správce na řadiči domény SRV1-DC po dokončení všech úkolů modulu.",
      steps: [
        {
          num: 1,
          vm: "SRV1-DC",
          title: "Krok 1: Spusťte na serveru SRV1-DC",
          desc: "Otevřete PowerShell jako Správce na stroji SRV1-DC, spusťte níže uvedený příkaz a vyplňte své jméno, třídu (T3A) a přesné Discord uživatelské jméno. Skript provede audit AD DS doménového řadiče, FSMO rolí a DNS a odešle data na Discord do kanálu #dokumentace.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_doc_SRV1-DC.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        }
      ],
      footnote: "Po odeslání dat bot ihned zahájí generování a do 5 minut vám do kanálu doručí hotový ZIP archiv. DŮLEŽITÉ: U bodů M1-SRV1.V2-D1, V3-D1 a V5-D1 nezapomeňte vložit screenshoty ze Server Manageru a ADUC!"
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
      title: "Automatické vygenerování dokumentace & odeslání na Discord",
      warning: "DŮLEŽITÉ PRAVIDLO: Příkazy provádějte POSTUPNĚ jeden po druhém! Nikdy nespouštějte skripty na více strojích naráz. Počkejte, až bot potvrdí Krok 1, a teprve poté spusťte Krok 2.",
      steps: [
        {
          num: 1,
          vm: "SRV1-DC",
          title: "Krok 1: Spusťte na serveru SRV1-DC",
          desc: "Otevřete PowerShell jako Správce na stroji SRV1-DC, spusťte níže uvedený příkaz a vyplňte své jméno, třídu (T3A) a přesné Discord uživatelské jméno. Skript provede audit konfigurace DHCP serveru a odešle data na Discord do kanálu #dokumentace. Vyčkejte, až se v kanálu zobrazí potvrzení od bota '[KROK 1/2 PRIJAT]'.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_doc_SRV1-DC.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        },
        {
          num: 2,
          vm: "PC1-WIN",
          title: "Krok 2: Spusťte na stanici PC1-WIN (až po potvrzení Kroku 1!)",
          desc: "Přepněte se na klientskou stanici PC1-WIN a otevřete PowerShell jako Správce. Spusťte níže uvedený příkaz a zadejte STEJNÉ uživatelské jméno na Discordu jako v prvním kroku. Skript provede klientské testy převzetí a obnovení DHCP a odešle druhou část botovi.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_doc_PC1-WIN.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        }
      ],
      footnote: "Po přijetí obou částí bot zahájí generování a do 5 minut vám do kanálu doručí hotový ZIP archiv. DŮLEŽITÉ: U bodu M2-SRV1.V1-D1 nezapomeňte ručně vložit screenshot DHCP Manageru!"
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
      zipName: "Prijmeni_Jmeno_Modul3.zip",
      folders: [
        "<code>Moje dokumentace / Modul 3 DNS</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ]
    },
    docWorkflow: {
      title: "Automatické vygenerování dokumentace & odeslání na Discord",
      warning: "DŮLEŽITÉ PRAVIDLO: Příkazy provádějte POSTUPNĚ jeden po druhém! Nikdy nespouštějte skripty na více strojích naráz. Počkejte, až bot potvrdí Krok 1, a teprve poté spusťte Krok 2.",
      steps: [
        {
          num: 1,
          vm: "SRV1-DC",
          title: "Krok 1: Spusťte na serveru SRV1-DC",
          desc: "Otevřete PowerShell jako Správce na stroji SRV1-DC, spusťte níže uvedený příkaz a vyplňte své jméno, třídu (T3A) a přesné Discord uživatelské jméno. Skript provede audit konfigurace DNS serveru a odešle data na Discord do kanálu #dokumentace. Vyčkejte, až se v kanálu zobrazí potvrzení od bota '[KROK 1/2 PRIJAT]'.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_doc_SRV1-DC.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        },
        {
          num: 2,
          vm: "PC1-WIN",
          title: "Krok 2: Spusťte na stanici PC1-WIN (až po potvrzení Kroku 1!)",
          desc: "Přepněte se na klientskou stanici PC1-WIN a otevřete PowerShell jako Správce. Spusťte níže uvedený příkaz a zadejte STEJNÉ uživatelské jméno na Discordu jako v prvním kroku. Skript provede klientské testy překladu a odešle druhou část botovi.",
          command: 'powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_doc_PC1-WIN.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"'
        }
      ],
      footnote: "Po přijetí obou částí bot zahájí generování a do 5 minut vám do kanálu doručí hotový ZIP archiv. DŮLEŽITÉ: U bodu M3-SRV1.V1-D2 nezapomeňte ručně vložit screenshot DNS Manageru!"
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
  }
};
