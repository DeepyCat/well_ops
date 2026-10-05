/**
 * Modul 02: Active Directory Domain Services (Domain Controller)
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["02"] = [
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
        <div style="background: rgba(56, 139, 253, 0.1); border: 1px solid rgba(56, 139, 253, 0.35); border-left: 4px solid #1f6feb; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 0.88rem;">
          <strong>Důležité:</strong> V proměnné <code>$DomainName</code> nahraďte zástupný text <code>&lt;prijmeni&gt;</code> vaším skutečným příjmením bez diakritiky, malými písmeny (např. <code>novak.cyberschool.internal</code>). DSRM heslo pro obnovení adresáře nastavte na standardní <code>Pa55w.rd</code>.<br>
          <em>Po dokončení příkazu se server automaticky restartuje!</em>
        </div>
      `;
    },
    how: () => {
      return `# 1. Zadejte název domény s vaším příjmením bez diakritiky (např. novak.cyberschool.internal):\n$DomainName = "<prijmeni>.cyberschool.internal"\n$SecurePassword = ConvertTo-SecureString "Pa55w.rd" -AsPlainText -Force\n\n# 2. Spusťte instalaci nového lesa a řadiče domény (po dokončení se server sám restartuje):\nInstall-ADDSForest -DomainName $DomainName -SafeModeAdministratorPassword $SecurePassword -InstallDns:$true -Force:$true`;
    },
    verify: () => {
      return `# Spusťte po restartu serveru a novém přihlášení:\nGet-ADDomain | Select-Object Name, Forest, DomainMode`;
    },
    expected: () => {
      return `Name       Forest                          DomainMode\n----       ------                          ----------\n<prijmeni> <prijmeni>.cyberschool.internal Windows2016Forest`;
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
  }
];
