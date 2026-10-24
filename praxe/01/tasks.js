/**
 * Modul 01: Active Directory Domain Services (Domain Controller)
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["01"] = [
  {
    id: "prerequisites",
    title: "1. Kontrola předpokladů (IP a Hostname)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <div class="params-table-wrapper">
          <table class="params-table">
            <thead>
              <tr>
                <th>Parametr</th>
                <th class="active-col">Požadovaná hodnota na SRV1-DC</th>
                <th>Poznámka</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hostname</strong></td>
                <td class="active-col"><code>SRV1-DC</code></td>
                <td>Před povýšením na DC musí mít server finální název</td>
              </tr>
              <tr>
                <td><strong>Rozhraní interní sítě</strong></td>
                <td class="active-col"><code>Ethernet1</code> (NIC 2 v CyLabu)</td>
                <td>Musí být zapnuté v hypervizoru</td>
              </tr>
              <tr>
                <td><strong>Statická IPv4 adresa</strong></td>
                <td class="active-col"><code>192.168.${x}.10 / 24</code></td>
                <td>Pro pracoviště č. ${x}</td>
              </tr>
              <tr>
                <td><strong>Výchozí brána (Gateway)</strong></td>
                <td class="active-col"><code>192.168.${x}.1</code></td>
                <td>Směrovač pracoviště</td>
              </tr>
              <tr>
                <td><strong>Lokální účet správce</strong></td>
                <td class="active-col"><code>Administrator</code></td>
                <td>Heslo: <code>Pa55w.rd</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Ověřte, že server splňuje všechny parametry z Modulu 01. Před instalací Active Directory musí mít server správné statické IP nastavení a jednoznačný hostname.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# 1. Ověřte jméno počítače (musí být SRV1-DC):\nhostname\n\n# 2. Ověřte statickou IP adresu na adaptéru Ethernet1:\nGet-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength`;
    },
    verify: () => {
      return `hostname\nGet-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `SRV1-DC\n\nIPAddress     PrefixLength\n---------     ------------\n192.168.${x}.10           24`;
    }
  },
  {
    id: "install-adds-role",
    title: "2. Instalace role AD DS (Active Directory)",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `Nainstalujte na server roli <strong>Active Directory Domain Services (AD DS)</strong> včetně RSAT nástrojů pro grafickou i příkazovou správu domény. V této fázi se instalují binární soubory role, k samotnému povýšení na DC dojde v následujícím kroku.`;
    },
    how: () => {
      return `# Instalace role AD DS včetně RSAT administračních nástrojů:\nInstall-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools`;
    },
    verify: () => {
      return `Get-WindowsFeature -Name AD-Domain-Services, RSAT-ADDS | Select-Object Name, InstallState`;
    },
    expected: () => {
      return `Name               InstallState\n----               ------------\nAD-Domain-Services    Installed\nRSAT-ADDS             Installed`;
    }
  },
  {
    id: "promote-dc-forest",
    title: "3. Povýšení na řadič domény (Install-ADDSForest)",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `
        <p>Povyšte server <strong>SRV1-DC</strong> na první řadič domény (Domain Controller) a vytvořte nový kořenový les domény <code>&lt;prijmeni&gt;.cyberschool.internal</code>.</p>
        <div style="background: rgba(255, 85, 85, 0.08); border: 1px solid rgba(255, 85, 85, 0.3); border-left: 4px solid #ff5555; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 0.88rem;">
          <strong>Důležité:</strong> V proměnné <code>$DomainName</code> nahraďte zástupný text <code>&lt;prijmeni&gt;</code> vaším skutečným příjmením bez diakritiky, malými písmeny (např. <code>pachomov.cyberschool.internal</code>). DSRM heslo pro obnovení adresáře nastavte na standardní <code>Pa55w.rd</code>.<br>
          <em>Po dokončení příkazu se server automaticky restartuje!</em>
        </div>
      `;
    },
    how: () => {
      return `# 1. Zadejte název domény s vaším příjmením bez diakritiky (např. pachomov.cyberschool.internal):\n$DomainName = "<prijmeni>.cyberschool.internal"\n$SecurePassword = ConvertTo-SecureString "Pa55w.rd" -AsPlainText -Force\n\n# 2. Spusťte instalaci nového lesa a řadiče domény (po dokončení se server sám restartuje):\nInstall-ADDSForest -DomainName $DomainName -SafeModeAdministratorPassword $SecurePassword -InstallDns:$true -Force:$true`;
    },
    verify: () => {
      return `# Spusťte po restartu serveru a novém přihlášení:\nGet-ADDomain | Select-Object Name, Forest, DomainMode`;
    },
    expected: () => {
      return `Name     Forest                         DomainMode\n----     ------                         ----------\npachomov pachomov.cyberschool.internal Windows2025Domain`;
    }
  },
  {
    id: "verify-dns",
    title: "4. Kontrola integrovaného DNS a překladu jmen",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `Při instalaci nového lesa se automaticky nainstalovala role <strong>DNS Server</strong>. Povýšení nastavilo preferovaný DNS server na loopback adresu <code>127.0.0.1</code>. Ověřte, že existuje primární AD-integrovaná dopředná zóna domény a správně překládá název domény na IP adresu serveru <code>192.168.${x}.10</code>.`;
    },
    how: () => {
      return `# 1. Ověření DNS zón integrovaných v Active Directory:\nGet-DnsServerZone | Select-Object ZoneName, ZoneType, IsDsIntegrated\n\n# 2. Test rozlišení jména domény:\nResolve-DnsName -Name "<prijmeni>.cyberschool.internal"`;
    },
    verify: () => {
      return `Get-DnsServerZone | Select-Object ZoneName, ZoneType, IsDsIntegrated`;
    },
    expected: () => {
      return `ZoneName                        ZoneType IsDsIntegrated\n--------                        -------- --------------\n_msdcs.<prijmeni>.cyberschool... Primary            True\n<prijmeni>.cyberschool.internal  Primary            True`;
    }
  },
  {
    id: "verify-fsmo-gc",
    title: "5. Ověření FSMO rolí a Global Catalog",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `Ověřte, že server <strong>SRV1-DC</strong> je držitelem všech 5 rolí <strong>FSMO (Flexible Single Master Operations)</strong>: Schema master, Domain naming master, PDC emulator, RID pool manager a Infrastructure master. Dále ověřte, že má aktivní roli <strong>Global Catalog (GC)</strong>.`;
    },
    how: () => {
      return `# 1. Dotaz na všech 5 FSMO rolí v doméně a lese:\nnetdom query fsmo\n\n# 2. Ověření stavu Global Catalog (GC):\nGet-ADDomainController -Identity SRV1-DC | Select-Object Name, IsGlobalCatalog, OperationMasterRoles`;
    },
    verify: () => {
      return `netdom query fsmo\n(Get-ADDomainController -Identity SRV1-DC).IsGlobalCatalog`;
    },
    expected: () => {
      return `Schema master               SRV1-DC.<prijmeni>.cyberschool.internal\nDomain naming master        SRV1-DC.<prijmeni>.cyberschool.internal\nPDC                         SRV1-DC.<prijmeni>.cyberschool.internal\nRID pool manager            SRV1-DC.<prijmeni>.cyberschool.internal\nInfrastructure master       SRV1-DC.<prijmeni>.cyberschool.internal\n\nTrue`;
    }
  },
  {
    id: "verify-domain-logon",
    title: "6. Přihlášení do domény a nástroje správy (ADUC)",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `Po restartu se přihlaste pod doménovým účtem <code>PRIJMENI\\Administrator</code> (nebo <code>Administrator@prijmeni.cyberschool.internal</code>) s heslem <code>Pa55w.rd</code>. Ověřte, že přihlášení probíhá v doméně, účet má plná práva a nástroje <strong>Active Directory Users and Computers (ADUC)</strong> jsou dostupné.`;
    },
    how: () => {
      return `# 1. Zkontrolujte přihlášeného uživatele (musí být doménový, např. NOVAK\\Administrator):\nwhoami\n\n# 2. Ověřte výchozí organizační kontejnery v doméně:\nGet-ADOrganizationalUnit -Filter *\nGet-ADUser -Identity Administrator | Select-Object SamAccountName, UserPrincipalName, Enabled`;
    },
    verify: () => {
      return `whoami\nGet-ADUser -Identity Administrator | Select-Object SamAccountName, Enabled`;
    },
    expected: () => {
      return `<PRIJMENI>\\administrator\n\nSamAccountName Enabled\n-------------- -------\nAdministrator     True`;
    }
  },
  {
    id: "quick-verification",
    title: "7. (Nepovinné) Rychlé ověření celého stroje",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Pro rychlou a komplexní kontrolu celé konfigurace serveru <strong>SRV1-DC</strong> můžete spustit interaktivní ověřovací skript přímo z repozitáře.</p>
        <div style="background: rgba(85, 255, 170, 0.08); border: 1px solid rgba(85, 255, 170, 0.3); border-left: 4px solid #55ffaa; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 0.88rem;">
          <strong>Vlastnosti skriptu:</strong>
          <ul style="margin: 6px 0 0 18px; padding: 0;">
            <li><strong>Striktně Read-Only:</strong> Pouze čte konfiguraci, žádná nastavení neupravuje.</li>
            <li><strong>Neukládá se na disk:</strong> Po dokončení testu se automaticky smaže ze systému.</li>
            <li><strong>3-úrovňový souhrn:</strong> Zeleně <code>[ OK ]</code> pro splněné body, žlutě <code>[KONTROLA]</code> pro položky vyžadující ruční kontrolu (DSRM heslo, tvar příjmení) a červeně <code>[CHYBA]</code> s nápovědou pro opravu.</li>
          </ul>
        </div>
      `;
    },
    how: (vm, wsX) => {
      return `# Spusťte v PowerShellu jako Administrator na SRV1-DC:\ncurl.exe -sL https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue\n\n# Alternativně přímé spuštění v RAM bez zápisu na disk:\nirm https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_check_SRV1-DC.ps1 | iex`;
    },
    verify: (vm, wsX) => {
      return `curl.exe -sL https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `============================================================\n  WELL_OPS :: Overeni konfigurace SRV1-DC (Modul 01)\n============================================================\nZadejte cislo vaseho pracoviste (X) [vychozi: ${x}]: ${x}\n\n--- 1. System a sitova konfigurace ---\n  [ OK ]       Hostname stroje je 'SRV1-DC'\n  [ OK ]       Sitovy adapter 'Ethernet1' existuje a je ve stavu Up\n  [ OK ]       IPv4 adresa na Ethernet1 je 192.168.${x}.10/24\n  [ OK ]       Vychozi brana je 192.168.${x}.1\n  [ OK ]       DNS klient na Ethernet1 ukazuje na lokalni resolver (127.0.0.1)\n\n--- 2. Windows Server role a komponenty ---\n  [ OK ]       Role 'Active Directory Domain Services' (AD-Domain-Services) je nainstalovana\n  [ OK ]       Administracni nastroje 'RSAT-ADDS' jsou nainstalovany\n\n--- 3. Stav radice domeny (Domain Controller) ---\n  [ OK ]       Server funguje jako radic domeny (Domain Controller, ProductType = 2)\n  [ OK ]       Active Directory domena je dostupna: <prijmeni>.cyberschool.internal\n  [ OK ]       NetBIOS nazev domeny: <PRIJMENI>\n  [ OK ]       Domena ma spravnou priponu: .cyberschool.internal\n  [KONTROLA]   Overte vizualne: Odpovida predpona '<prijmeni>' vasemu skutecnemu prijmeni bez diakritiky?\n  [ OK ]       Funkcni uroven domeny: Windows2025Domain\n  [ OK ]       Vsech 5 FSMO roli je umisteno na tomto radici (SRV1-DC)\n  [ OK ]       Server SRV1-DC je nastaven jako Global Catalog (GC = True)\n\n--- 4. Klicove sluzby a sdilene slozky ---\n  [ OK ]       Sluzba 'Active Directory Domain Services (NTDS)' bezi (Running)\n  [ OK ]       Sluzba 'Active Directory Web Services (ADWS)' bezi (Running)\n  [ OK ]       Sluzba 'Kerberos Key Distribution Center (Kdc)' bezi (Running)\n  [ OK ]       Sluzba 'Netlogon Service' bezi (Running)\n  [ OK ]       Sluzba 'DNS Server Service' bezi (Running)\n  [ OK ]       Domenove sdilene slozky SYSVOL a NETLOGON jsou aktivni\n\n--- 5. Integrovany DNS Server a preklad jmen ---\n  [ OK ]       AD-integrovana dopredna DNS zona '<prijmeni>.cyberschool.internal' existuje\n  [ OK ]       DNS zona pro sluzebni zaznamy domeny (_msdcs) je dostupna\n  [ OK ]       DNS preklad domeny '<prijmeni>.cyberschool.internal' uspesne vraci IP 192.168.${x}.10\n\n--- 6. Polozky vyzadujici rucni vizualni kontrolu ---\n  [KONTROLA]   DSRM heslo (SafeModeAdministratorPassword): Z bezpecnostnich duvodu nelze precist z AD\n               -> Overte, ze jste pri instalaci pouzili heslo 'Pa55w.rd'\n  [ OK ]       Aktualne jste prihlaseni pod domenovym uctem '<PRIJMENI>\\Administrator'\n\n============================================================\n                    VYSLEDNY SOUHRN                         \n============================================================\n  Pocet uspesnych kontrol [ OK ]:       17\n  Pocet k rucni kontrole  [KONTROLA]:    2\n  Pocet nalezenych chyb   [CHYBA]:       0\n------------------------------------------------------------\n\nVYSLEDEK: VSE V PORADKU! Stroj SRV1-DC splnuje pozadavky Modulu 01.\nMuzete pokracovat k dalsimu modulu.\n============================================================`;
    }
  }
];
