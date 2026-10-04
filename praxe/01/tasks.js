/**
 * Modul 01: Příprava a instalace OS
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["01"] = [
  {
    id: "vm-specs",
    title: "1. Parametry virtuálního stroje",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm) => `
      <div class="params-table-wrapper">
        <table class="params-table">
          <thead>
            <tr>
              <th>Parametr</th>
              <th class="${vm === 'SRV1-DC' ? 'active-col' : ''}">SRV1-DC</th>
              <th class="${vm === 'SRV2-FS' ? 'active-col' : ''}">SRV2-FS</th>
              <th class="${vm === 'PC1-WIN' ? 'active-col' : ''}">PC1-WIN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>vCPU</strong></td>
              <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">2 jádra</td>
              <td class="${vm === 'SRV2-FS' ? 'active-col' : ''}">2 jádra</td>
              <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">2 jádra</td>
            </tr>
            <tr>
              <td><strong>RAM</strong></td>
              <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">8 GB</td>
              <td class="${vm === 'SRV2-FS' ? 'active-col' : ''}">8 GB</td>
              <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">8 GB</td>
            </tr>
            <tr>
              <td><strong>Systémový disk</strong></td>
              <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">100 GB</td>
              <td class="${vm === 'SRV2-FS' ? 'active-col' : ''}">100 GB</td>
              <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">60 GB</td>
            </tr>
            <tr>
              <td><strong>Další disky</strong></td>
              <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">—</td>
              <td class="${vm === 'SRV2-FS' ? 'active-col' : ''}"><strong>5× 5 GB (V zadání je 10, můžeme max 5)</strong> (Storage Pool)</td>
              <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">—</td>
            </tr>
            <tr>
              <td><strong>Sítě v CyLab</strong></td>
              <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">NIC 1, <strong>NIC 2 (zapnout!)</strong>, NIC 3</td>
              <td class="${vm === 'SRV2-FS' ? 'active-col' : ''}">NIC 1, <strong>NIC 2 (zapnout!)</strong>, NIC 3</td>
              <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">NIC 1, <strong>NIC 2 (zapnout!)</strong>, NIC 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    how: (vm) => {
      if (vm === "PC1-WIN") return "V hypervizoru (CyLab): 2 vCPU, 8 GB RAM, 60 GB systémový disk. Zkontrolujte, že je zapnutý síťový adaptér NIC 2.";
      if (vm === "SRV2-FS") return "V hypervizoru (CyLab): 2 vCPU, 8 GB RAM, 100 GB systémový disk + 5x virtuální disk 10 GB. (V zadání je 10, můžeme max 5) Zkontrolujte, že je zapnutý adaptér NIC 2.";
      return "V hypervizoru (CyLab): 2 vCPU, 8 GB RAM, 100 GB systémový disk. Zkontrolujte, že je zapnutý síťový adaptér NIC 2.";
    },
    verify: (vm) => {
      if (vm === "SRV2-FS") return "Get-Disk | Select-Object Number, FriendlyName, Size, PartitionStyle\n# Ověřte systémový disk (~100 GB) a 5x RAW disků (~10 GB)";
      return "Get-Disk | Select-Object Number, FriendlyName, Size";
    },
    expected: (vm) => {
      if (vm === "SRV2-FS") return "Výpis obsahuje systémový disk (~100 GB) a 5x neinicializovaných disků (~10 GB) ve stavu RAW:\nNumber  FriendlyName            Size  PartitionStyle\n------  ------------            ----  --------------\n0       ... (Systémový disk)  ~100 GB  GPT/MBR\n1-5     ... (5x datový disk)   ~10 GB  RAW";
      if (vm === "PC1-WIN") return "Výpis obsahuje systémový disk o velikosti přibližně 60 GB:\nNumber  FriendlyName  Size\n0       ...          ~60 GB";
      return "Výpis obsahuje systémový disk o velikosti přibližně 100 GB:\nNumber  FriendlyName  Size\n0       ...          ~100 GB";
    }
  },
  {
    id: "os-edition",
    title: "2. Edice a instalace Windows",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm) => `
      <div class="params-table-wrapper">
        <table class="params-table">
          <thead>
            <tr>
              <th>Stroj</th>
              <th>Edice Windows</th>
              <th>Typ rozhraní</th>
              <th>Jazyk média</th>
            </tr>
          </thead>
          <tbody>
            <tr class="${vm === 'SRV1-DC' ? 'active-row' : ''}">
              <td><strong>SRV1-DC</strong></td>
              <td>Windows Server 2025 Datacenter</td>
              <td>Desktop Experience (s GUI)</td>
              <td>English (United States)</td>
            </tr>
            <tr class="${vm === 'SRV2-FS' ? 'active-row' : ''}">
              <td><strong>SRV2-FS</strong></td>
              <td>Windows Server 2025 Datacenter</td>
              <td>Desktop Experience (s GUI)</td>
              <td>English (United States)</td>
            </tr>
            <tr class="${vm === 'PC1-WIN' ? 'active-row' : ''}">
              <td><strong>PC1-WIN</strong></td>
              <td>Windows 11 Education N</td>
              <td>Bez multimédií (EU edice)</td>
              <td>English (United States)</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    how: (vm) => {
      if (vm === "PC1-WIN") return "Instalace Windows 11 Education N (jazyk: English - United States).";
      return "Instalace Windows Server 2025 Datacenter (Desktop Experience). Neinstalovat Server Core.";
    },
    verify: (vm) => {
      if (vm === "PC1-WIN") return "Get-ComputerInfo | Select-Object WindowsProductName";
      return "Get-ComputerInfo | Select-Object WindowsProductName, OsServerLevel";
    },
    expected: (vm) => {
      if (vm === "PC1-WIN") return "WindowsProductName : Windows 11 Education N (případně Windows 11 Education)";
      return "WindowsProductName : Windows Server 2025 Datacenter\nOsServerLevel      : FullServer (potvrzuje Desktop Experience, nikoliv ServerCore)";
    }
  },
  {
    id: "hostname",
    title: "3. Jméno počítače (Hostname)",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm) => `Přejmenujte stroj na přesný název "${vm}" a restartujte jej. Jednoznačné jméno je klíčové pro komunikaci v síti a budoucí řadič domény.`,
    how: (vm) => `Rename-Computer -NewName "${vm}" -Restart`,
    verify: () => "hostname",
    expected: (vm) => `Vrátí přesný název stroje:\n${vm}`
  },
  {
    id: "networking",
    title: "4. Nastavení TCP/IPv4",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      const nicBanner = `
        <div class="nic-warning-banner">
          <div class="nic-warning-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>DŮLEŽITÉ: Pravidla síťových rozhraní (NIC) a kontrola adaptéru</span>
          </div>
          <div class="nic-list">
            <div class="nic-list-row">
              <span class="nic-name">NIC 1 (Ethernet0 / Ethernet)</span>
              <span class="nic-tag-badge danger">NEŠAHAT</span>
              <span>Ponechat na pokoji. Slouží pro NAT, internetový přístup a management hypervizoru.</span>
            </div>
            <div class="nic-list-row">
              <span class="nic-name">NIC 2 (Ethernet1 / Ethernet 1)</span>
              <span class="nic-tag-badge success">INTERNÍ LAB SÍŤ</span>
              <span><strong>ZDE NASTAVUJETE IP!</strong> Rozhraní musí být <strong>ZAPNUTÉ V HYPERVIZORU (CyLab)</strong>. Propojuje všechny vaše lokální VM (DC, FS, PC). Podsíť: <code>192.168.${x}.0/24</code>.</span>
            </div>
            <div class="nic-list-row">
              <span class="nic-name">NIC 3 (Ethernet2 / Ethernet 2)</span>
              <span class="nic-tag-badge info">TŘÍDNÍ SÍŤ</span>
              <span>Propojení se všemi VM v učebně pro společné úlohy (ponechat dle pokynů lektora).</span>
            </div>
          </div>
          <div class="nic-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <strong>DŮLEŽITÉ UPOZORNĚNÍ PRO CYLAB:</strong> Síťový adaptér <strong>NIC 2 musíte mít v rozhraní hypervizoru (CyLab) zapnutý / připojený</strong> u všech svých VM, jinak virtuální stroje nebudou navzájem komunikovat!<br>
              V CyLabu (VMware) se adaptéry jmenují <strong>Ethernet0</strong> (NIC 1) a <strong>Ethernet1</strong> (NIC 2) <strong>bez mezery</strong>! V níže uvedených příkazech je použit přesný alias <code>Ethernet1</code>. Pokud by se u vás jmenoval s mezerou (<code>Ethernet 1</code>), upravte parametr <code>-InterfaceAlias</code>.
            </div>
          </div>
        </div>
      `;

      if (vm === "SRV1-DC") {
        return `
          ${nicBanner}
          <p>Pro pracoviště <strong>č. ${x}</strong> nastavte na rozhraní <strong>NIC 2 (Ethernet1)</strong> statickou IP adresu <strong>192.168.${x}.10/24</strong>, výchozí bránu <strong>192.168.${x}.1</strong> a preferovaný DNS server <strong>192.168.${x}.10</strong> (sám na sebe pro budoucí roli doménového řadiče a DNS).</p>
        `;
      }
      if (vm === "SRV2-FS") {
        return `
          ${nicBanner}
          <p>Pro pracoviště <strong>č. ${x}</strong> nastavte na rozhraní <strong>NIC 2 (Ethernet1)</strong> statickou IP adresu <strong>192.168.${x}.20/24</strong> (servery mají krok po 10), výchozí bránu <strong>192.168.${x}.1</strong> a preferovaný DNS <strong>192.168.${x}.10</strong> (směřující na SRV1-DC).</p>
        `;
      }
      return `
        ${nicBanner}
        <p>Pro klientskou stanici <strong>PC1-WIN</strong> ponechte síťové rozhraní NIC 2 (Ethernet1) ve výchozím nastavení <strong>DHCP</strong> (automatické přidělení adresy). Klient obdrží IP z dynamického rozsahu <strong>192.168.${x}.100 – 192.168.${x}.200</strong> v Modulu 2 po spuštění a autorizaci DHCP serveru na SRV1-DC.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `# 1. Zkontrolujte adaptéry (NIC 2 je v CyLabu Ethernet1):\nGet-NetAdapter\n\n# 2. Nastavte statickou IP a bránu na NIC 2:\nNew-NetIPAddress -InterfaceAlias "Ethernet1" -IPAddress "192.168.${x}.10" -PrefixLength 24 -DefaultGateway "192.168.${x}.1"\n\n# 3. Nastavte DNS na adresu budoucího řadiče (sám na sebe):\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet1" -ServerAddresses ("192.168.${x}.10")`;
      }
      if (vm === "SRV2-FS") {
        return `# 1. Zkontrolujte adaptéry (NIC 2 je v CyLabu Ethernet1):\nGet-NetAdapter\n\n# 2. Nastavte statickou IP a bránu na NIC 2:\nNew-NetIPAddress -InterfaceAlias "Ethernet1" -IPAddress "192.168.${x}.20" -PrefixLength 24 -DefaultGateway "192.168.${x}.1"\n\n# 3. Nastavte DNS směřující na SRV1-DC:\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet1" -ServerAddresses ("192.168.${x}.10")`;
      }
      return `# 1. Zkontrolujte adaptéry (NIC 2 je v CyLabu Ethernet1):\nGet-NetAdapter\n\n# 2. Ověřte, že NIC 2 je nakonfigurován pro automatické DHCP:\nSet-NetIPInterface -InterfaceAlias "Ethernet1" -Dhcp Enabled\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet1" -ResetServerAddresses`;
    },
    verify: (vm) => {
      if (vm === "PC1-WIN") {
        return `Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet1 | Select-Object IPAddress, PrefixOrigin\nGet-NetIPInterface -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object InterfaceAlias, Dhcp`;
      }
      return `Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet1 | Select-Object IPAddress, PrefixLength, PrefixOrigin\nGet-NetIPConfiguration -InterfaceAlias Ethernet1 | Select-Object -ExpandProperty IPv4DefaultGateway\nGet-DnsClientServerAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `IPAddress       : 192.168.${x}.10\nPrefixLength    : 24\nPrefixOrigin    : Manual (statická adresa, nikoliv DHCP)\nNextHop (GW)    : 192.168.${x}.1\nServerAddresses : {192.168.${x}.10}`;
      }
      if (vm === "SRV2-FS") {
        return `IPAddress       : 192.168.${x}.20\nPrefixLength    : 24\nPrefixOrigin    : Manual (statická adresa, nikoliv DHCP)\nNextHop (GW)    : 192.168.${x}.1\nServerAddresses : {192.168.${x}.10}`;
      }
      return `Dhcp         : Enabled\nPrefixOrigin : Dhcp (případně AutoConfiguration před spuštěním DHCP serveru v Modulu 2)\nU klientského PC nesmí být zadána ruční statická adresa (Manual).`;
    }
  },
  {
    id: "admin-account",
    title: "5. Účet administrátora a heslo",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm) => {
      if (vm === "PC1-WIN") return "U Windows 11 je vestavěný účet Administrator vypnutý. Povolte jej, nastavte standardizované heslo Pa55w.rd, přihlaste se pod ním a odstraňte dočasný instalační účet.";
      return "Zajistěte funkční vestavěný účet Administrator s heslem Pa55w.rd. Žádný jiný/personalizovaný administrátorský účet se nevytváří.";
    },
    how: (vm) => {
      if (vm === "PC1-WIN") return `Enable-LocalUser -Name "Administrator"\nSet-LocalUser -Name "Administrator" -Password ("Pa55w.rd" | ConvertTo-SecureString -AsPlainText -Force)\n# Odhlásit se, přihlásit pod Administrator a odstranit dočasný účet.`;
      return "Při instalaci nastavit heslo účtu Administrator na: Pa55w.rd";
    },
    verify: () => "Get-LocalUser | Select-Object Name, Enabled",
    expected: (vm) => {
      if (vm === "PC1-WIN") return "Name          Enabled\n----          -------\nAdministrator True\n(Dočasný instalační účet Setup/User byl odstraněn, přihlášení s heslem Pa55w.rd funguje lokálně)";
      return "Name          Enabled\n----          -------\nAdministrator True\n(Přihlášení s heslem Pa55w.rd funguje lokálně)";
    }
  },
  {
    id: "locale",
    title: "6. Jazyk, region a formáty (cs-CZ)",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: () => "Nastavte regionální konvence a polohu na Česko (cs-CZ, GeoId 0x4b / 75), přičemž jazyk rozhraní systému zůstane v angličtině (English US) kvůli odborné terminologii.",
    how: () => `Set-Culture cs-CZ\nSet-WinSystemLocale cs-CZ\nSet-WinHomeLocation -GeoId 0x4b`,
    verify: () => `Get-Culture | Select-Object Name, DisplayName\nGet-WinSystemLocale\nGet-WinHomeLocation\nGet-WinUILanguageOverride`,
    expected: () => "Name : cs-CZ, DisplayName : Czech (Czechia)\nGet-WinSystemLocale: cs-CZ\nHomeLocation: 75 / Czech Republic (GeoId: 0x4b)\nGet-WinUILanguageOverride: prázdné nebo en-US (UI rozhraní zůstává anglicky)"
  },
  {
    id: "datetime-format",
    title: "7. Formáty data, času a měny",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: () => "Ověřte a nastavte správné české formátování: datum d.M.yyyy, 24hodinový čas H:mm:ss a symbol měny Kč.",
    how: () => `Settings -> Time & language -> Language & region -> Regional format: Czech (Czechia)`,
    verify: () => `Get-Date -Format "d.M.yyyy H:mm:ss"\n(12345.67).ToString("C")`,
    expected: () => "Get-Date : vypíše datum a čas ve tvaru např. 20.9.2026 13:45:02\nToString : vypíše 12 345,67 Kč (s mezerou jako oddělovačem tisíců a symbolem Kč)"
  },
  {
    id: "timezone",
    title: "8. Časové pásmo (Praha)",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: () => "Nastavte časové pásmo na Praha / Bratislava (Central Europe Standard Time, UTC+1). Synchronizace času je nezbytná pro autentizaci Kerberos v Active Directory.",
    how: () => `Set-TimeZone -Id "Central Europe Standard Time"`,
    verify: () => "Get-TimeZone",
    expected: () => "Id                         : Central Europe Standard Time\nDisplayName                : (UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague\nBaseUtcOffset              : 01:00:00\nSupportsDaylightSavingTime : True"
  },
  {
    id: "keyboards",
    title: "9. Klávesnice US a Czech (QWERTZ)",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: () => "Nakonfigurujte dvě klávesnice: US jako primární/výchozí (snadné psaní příkazů v PowerShellu) a Czech QWERTZ jako sekundární s přepínáním přes Win + mezerník.",
    how: () => `$List = New-WinUserLanguageList "en-US"\n$List.Add("cs-CZ")\nSet-WinUserLanguageList $List -Force`,
    verify: () => `Get-WinUserLanguageList | Select-Object LanguageTag, InputMethodTips\n# Nebo kontrola rozložení přímo z registru:\nGet-ItemProperty "HKCU:\\Keyboard Layout\\Preload"`,
    expected: () => `LanguageTag InputMethodTips\n----------- ---------------\nen-US       {0409:00000409}\ncs-CZ       {0405:00000405}\n\nNebo v registru (1 : 00000409 pro US, 2 : 00000405 pro CZ).\nPokud už na liště u hodin vidíte přepínač ENG / CES a funguje vám psaní českých znaků (ěščřž), máte úkol splněný.`
  },
  {
    id: "privacy",
    title: "10. Telemetrie a diagnostika na minimum",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: () => "Omezte síťový provoz na pozadí: nastavte telemetrii na minimální úroveň (Required data), vypněte lokalizační služby (Location) a zakažte reklamní ID.",
    how: () => `reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 1 /f\nreg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors" /v DisableLocation /t REG_DWORD /d 1 /f\nreg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f`,
    verify: () => `Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" -Name AllowTelemetry\nGet-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors" -Name DisableLocation\nGet-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" -Name DisabledByGroupPolicy`,
    expected: () => "AllowTelemetry         : 1 (Required diagnostic data)\nDisableLocation        : 1 (poloha vypnuta)\nDisabledByGroupPolicy  : 1 (reklamní ID vypnuto)"
  },
  {
    id: "activation",
    title: "11. Aktivace Windows (LAB KEY)",
    forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    what: (vm) => {
      const osName = vm === "PC1-WIN" ? "Windows 11 Education N" : `Windows Server 2025 Datacenter (${vm})`;
      return `Aktivujte systém <strong>${osName}</strong> pomocí školního produktového klíče <strong>LAB KEY</strong>. Produktový klíč si <strong>zkopírujte ze zadání v Microsoft Teams</strong>. Cílem je odstranit časové omezení zkušební verze a vodoznak.`;
    },
    how: (vm) => `# 1. Zadejte produktový klíč pro ${vm} (zkopírujte ze zadání na Teams):\nslmgr.vbs /ipk <LAB-KEY-Z-TEAMS>\n\n# 2. Spusťte aktivaci systému:\nslmgr.vbs /ato`,
    verify: () => "slmgr.vbs /xpr",
    expected: () => "Dialogové okno Windows Script Host oznámí:\n\"The machine is permanently activated\"\n(nebo datum příští kontroly licence u KMS multilicence).\nV Settings -> System -> Activation svítí \"Windows is activated\"."
  },
  {
    id: "local-user-only",
    title: "12. Pouze lokální účet (bez Microsoft Account)",
    forVMs: ["PC1-WIN"],
    what: () => "Zajistěte, že klientský počítač PC1-WIN nepoužívá cloudový Microsoft účet, ale je provozován výhradně pod lokálním účtem Administrator.",
    how: () => "V instalačním rozhraní OOBE nepoužívat Microsoft účet. Účet musí mít typ Local account.",
    verify: () => "Get-LocalUser | Select-Object Name, Enabled",
    expected: () => "Name          Enabled\n----          -------\nAdministrator True\n(V Settings -> Accounts -> Your info je uveden typ \"Local account\", nikoliv e-mailová adresa Microsoft účtu.)"
  }
];
