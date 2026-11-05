/**
 * Modul 02: DHCP Server (Dynamic Host Configuration Protocol)
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["02"] = [
  {
    id: "prerequisites",
    title: "1. Kontrola předpokladů (SRV1-DC a PC1-WIN)",
    forVMs: ["SRV1-DC", "PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      const nicBanner = `
        <div class="nic-warning-banner">
          <div class="nic-warning-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>POZOR NA VÝBĚR SÍŤOVÉHO ROZHRANÍ (NIC 2 v CyLabu = Ethernet1)</span>
          </div>
          <div class="nic-warning-text">
            Virtuální stroje mají 3 síťová rozhraní. <strong>Na rozhraní NIC 1 (Ethernet0 / NAT) nikdy nesahejte!</strong><br>
            Veškerá síťová komunikace interní učebny probíhá <strong>výhradně na rozhraní NIC 2 (v systému Ethernet1)</strong>.
          </div>
        </div>
      `;

      return `
        ${nicBanner}
        <div class="params-table-wrapper">
          <table class="params-table">
            <thead>
              <tr>
                <th>Parametr</th>
                <th class="${vm === 'SRV1-DC' ? 'active-col' : ''}">SRV1-DC (Server)</th>
                <th class="${vm === 'PC1-WIN' ? 'active-col' : ''}">PC1-WIN (Klient)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Stav systému</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">Řadič domény (DC) z Modulu 01</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Windows 11 připravené z Modulu 00</td>
              </tr>
              <tr>
                <td><strong>Interní rozhraní (NIC 2)</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>Ethernet1</code> (zapnuto v CyLabu)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>Ethernet1</code> (zapnuto v CyLabu)</td>
              </tr>
              <tr>
                <td><strong>IPv4 adresa</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>192.168.${x}.10 / 24</code> (statická)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Získá automaticky z DHCP</td>
              </tr>
              <tr>
                <td><strong>Výchozí brána (Router)</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>192.168.${x}.1</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.1</code> (přidělí DHCP)</td>
              </tr>
              <tr>
                <td><strong>Doména Active Directory</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Zatím v pracovní skupině (WORKGROUP)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Před konfigurací DHCP serveru ověřte, že server <strong>SRV1-DC</strong> běží, je přihlášen pod doménovým účtem <code>Administrator</code> a má správně nakonfigurovanou statickou IP adresu na rozhraní <code>Ethernet1</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `# 1. Ověřte název počítače a statickou IP adresu na interním rozhraní Ethernet1:\nhostname\nGet-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength\n\n# 2. Ověřte funkčnost Active Directory z Modulu 01:\nGet-ADDomain | Select-Object Name, Forest`;
      }
      return `# 1. Ověřte dostupnost síťového adaptéru Ethernet1 na PC1-WIN:\nGet-NetAdapter -Name Ethernet1 | Select-Object Name, Status, LinkSpeed`;
    },
    verify: (vm, wsX) => {
      if (vm === "SRV1-DC") {
        return `hostname\nGet-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength\n(Get-ADDomain).Forest`;
      }
      return `Get-NetAdapter -Name Ethernet1 | Select-Object Name, Status`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `SRV1-DC\n\nIPAddress     PrefixLength\n---------     ------------\n192.168.${x}.10           24\n\n<prijmeni>.cyberschool.internal`;
      }
      return `Name      Status\n----      ------\nEthernet1 Up`;
    }
  },
  {
    id: "install-dhcp-role",
    title: "2. Instalace role DHCP Server",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `
        <p>Nainstalujte na server <strong>SRV1-DC</strong> roli <strong>DHCP Server</strong> včetně grafických i příkazových nástrojů pro správu (RSAT-DHCP).</p>
        <p>Role DHCP Server zajišťuje automatické přidělování IP adres a síťových parametrů zařízením připojeným do sítě učebny bez nutnosti jejich ruční konfigurace.</p>
      `;
    },
    how: () => {
      return `# Instalace role DHCP Serveru včetně administračních nástrojů:\nInstall-WindowsFeature -Name DHCP -IncludeManagementTools`;
    },
    verify: () => {
      return `Get-WindowsFeature -Name DHCP, RSAT-DHCP | Select-Object Name, InstallState`;
    },
    expected: () => {
      return `Name      InstallState\n----      ------------\nDHCP         Installed\nRSAT-DHCP    Installed`;
    }
  },
  {
    id: "dhcp-security-groups",
    title: "3. Bezpečnostní skupiny a spuštění služby DHCP",
    forVMs: ["SRV1-DC"],
    what: () => {
      return `
        <p>Po instalaci binárních souborů role je nutné provést dokončení instalace (Post-Install configuration): vytvořit bezpečnostní skupiny <strong>DHCP Users</strong> a <strong>DHCP Administrators</strong> a restartovat službu <strong>DHCPServer</strong>.</p>
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; border-radius: 6px; padding: 10px 14px; margin: 10px 0; font-size: 0.88rem; line-height: 1.5;">
          <strong>Oznámení v Server Manageru (žlutá vlajka / DHCP Post-Install wizard):</strong><br>
          Po instalaci role se v Server Manageru u horní vlajky objeví výzva <em>Complete DHCP configuration</em>. Pokud na ni kliknete, otevře se okno <em>DHCP Post-Install configuration wizard</em>. To je zcela v pořádku! Průvodce dělá přesně to samé, co tyto dva úkoly:
          <ol style="margin: 6px 0 6px 20px; padding: 0;">
            <li>Vytvoří skupiny <strong>DHCP Administrators</strong> a <strong>DHCP Users</strong> (tento úkol 3).</li>
            <li>Autorizuje server v Active Directory (následující úkol 4).</li>
          </ol>
          <strong>Jak naložit s otevřeným oknem průvodce:</strong><br>
          V okně můžete kliknout na <strong>Next &gt;</strong> &rarr; na stránce Authorization nechat výchozí doménový účet administrátora &rarr; kliknout na <strong>Commit</strong> a poté <strong>Close</strong>. Tím žlutá notifikace zmizí. Alternativně, pokud postupujete čistě přes PowerShell, provedete úkoly 3 a 4 skriptem a žlutou vlaječku můžete v Server Manageru potvrdit příkazem v bodu 3 níže.
        </div>
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-left: 4px solid #38bdf8; border-radius: 6px; padding: 10px 14px; margin: 10px 0; font-size: 0.88rem;">
          <strong>Poznámka pro řadič domény (DC):</strong> Protože server <strong>SRV1-DC</strong> je řadičem domény Active Directory (nemá lokální SAM databázi), příkaz <code>Add-DhcpServerSecurityGroup</code> vytvoří obě skupiny přímo v doméně Active Directory jako doménové lokální skupiny. Pro jejich ověření se proto na řadiči domény používá cmdlet <code>Get-ADGroup</code> (nikoliv <code>Get-LocalGroup</code>, který je určen pro členské stanice a na DC vrací neúplný výstup).
        </div>
      `;
    },
    how: () => {
      return `# 1. Vytvoření bezpečnostních skupin pro správu DHCP v Active Directory:\nAdd-DhcpServerSecurityGroup\n\n# 2. Restartování služby DHCP Serveru pro načtení nového oprávnění:\nRestart-Service -Name DHCPServer\n\n# 3. (Volitelné) Potvrzení dokončení konfigurace pro Server Manager (odstraní žlutou notifikační vlajku):\nSet-ItemProperty -Path 'registry::HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\ServerManager\\Roles\\12' -Name 'ConfigurationState' -Value 2`;
    },
    verify: () => {
      return `Get-Service -Name DHCPServer | Select-Object Name, Status, StartType\nGet-ADGroup -Filter 'Name -like "DHCP*"' | Select-Object Name`;
    },
    expected: () => {
      return `Name       Status  StartType\n----       ------  ---------\nDHCPServer Running Automatic\n\nName\n----\nDHCP Administrators\nDHCP Users`;
    }
  },
  {
    id: "authorize-dhcp",
    title: "4. Autorizace DHCP serveru v Active Directory",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>V prostředí Active Directory smí DHCP adresy přidělovat pouze <strong>autorizovaný</strong> DHCP server. Neautorizovaný server je systémem automaticky zablokován, aby se zabránilo vzniku falešných (rogue) DHCP serverů a konfliktům v síti.</p>
        <p>Autorizujte server <strong>SRV1-DC</strong> s IP adresou <code>192.168.${x}.10</code> v Active Directory doméně <code>&lt;prijmeni&gt;.cyberschool.internal</code>.</p>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;"><em>Poznámka:</em> Pokud jste po instalaci role proklikli grafického průvodce <strong>DHCP Post-Install configuration wizard</strong> (krok <em>Commit</em>), autorizace v AD již proběhla. Příkaz níže stav bezpečně potvrdí a ověření přes <code>Get-DhcpServerInDC</code> zkontroluje správnost záznamu v doméně.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Zjištění FQDN řadiče a domény (přiřazení do proměnné a výpis):\n$DnsName = "$env:COMPUTERNAME.$((Get-ADDomain).DNSRoot)"\n$DnsName\n\n# 2. Autorizace DHCP serveru v Active Directory:\nAdd-DhcpServerInDC -DnsName $DnsName -IPAddress "192.168.${x}.10"`;
    },
    verify: () => {
      return `Get-DhcpServerInDC | Select-Object DnsName, IPAddress`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `DnsName                                 IPAddress\n-------                                 ---------\nSRV1-DC.<prijmeni>.cyberschool.internal 192.168.${x}.10`;
    }
  },
  {
    id: "create-dhcp-scope",
    title: "5. Vytvoření a aktivace DHCP Scope (rozsahu)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <div class="params-table-wrapper">
          <table class="params-table">
            <thead>
              <tr>
                <th>Parametr Scope</th>
                <th class="active-col">Hodnota pro pracoviště č. ${x}</th>
                <th>Popis / Účel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Název (Name)</strong></td>
                <td class="active-col"><code>Ucebna</code></td>
                <td>Pojmenování DHCP oboru pro novou učebnu</td>
              </tr>
              <tr>
                <td><strong>ID podsítě (ScopeId)</strong></td>
                <td class="active-col"><code>192.168.${x}.0</code></td>
                <td>Síť interního labu</td>
              </tr>
              <tr>
                <td><strong>Počáteční IP adresa</strong></td>
                <td class="active-col"><code>192.168.${x}.100</code></td>
                <td>Začátek dynamického klientského rozsahu</td>
              </tr>
              <tr>
                <td><strong>Koncová IP adresa</strong></td>
                <td class="active-col"><code>192.168.${x}.200</code></td>
                <td>Konec dynamického klientského rozsahu</td>
              </tr>
              <tr>
                <td><strong>Maska podsítě</strong></td>
                <td class="active-col"><code>255.255.255.0</code> (/24)</td>
                <td>Maska sítě třídy C</td>
              </tr>
              <tr>
                <td><strong>Stav (State)</strong></td>
                <td class="active-col"><code>Active</code></td>
                <td>Scope je ihned aktivní pro přidělování adres</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Vytvořte DHCP obor (Scope) s názvem <code>Ucebna</code> pokrývající rozsah <code>192.168.${x}.100</code> až <code>192.168.${x}.200</code>. Adresy <code>.1</code> až <code>.99</code> zůstávají vyhrazené pro síťové prvky a servery s pevnými adresami (brána <code>.1</code>, servery <code>.10</code>, <code>.20</code>, <code>.30</code>).</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# Vytvoření a okamžitá aktivace DHCP oboru pro učebnu:\nAdd-DhcpServerv4Scope -Name "Ucebna" -StartRange "192.168.${x}.100" -EndRange "192.168.${x}.200" -SubnetMask "255.255.255.0" -State Active`;
    },
    verify: (vm, wsX) => {
      return `Get-DhcpServerv4Scope | Select-Object ScopeId, Name, StartRange, EndRange, State`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `ScopeId        Name    StartRange        EndRange          State\n-------        ----    ----------        --------          -----\n192.168.${x}.0  Ucebna  192.168.${x}.100   192.168.${x}.200   Active`;
    }
  },
  {
    id: "configure-scope-options",
    title: "6. Konfigurace DHCP voleb (Router, DNS, Domain)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <div class="params-table-wrapper">
          <table class="params-table">
            <thead>
              <tr>
                <th>Volba (Option)</th>
                <th>Kód</th>
                <th class="active-col">Hodnota pro pracoviště č. ${x}</th>
                <th>Účel pro klienta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Router (Default Gateway)</strong></td>
                <td>Option 003</td>
                <td class="active-col"><code>192.168.${x}.1</code></td>
                <td>Směrování do ostatních sítí a k internetu</td>
              </tr>
              <tr>
                <td><strong>DNS Server</strong></td>
                <td>Option 006</td>
                <td class="active-col"><code>192.168.${x}.10</code></td>
                <td>Překlad jmen přes doménový řadič SRV1-DC</td>
              </tr>
              <tr>
                <td><strong>DNS Domain Name</strong></td>
                <td>Option 015</td>
                <td class="active-col"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
                <td>Primární doménový suffix pro hledání v síti</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Kromě samotné IP adresy a masky musí DHCP server klientům poskytnout také výchozí bránu, DNS server a název domény. Nakonfigurujte tyto volby pro vytvořený scope <code>192.168.${x}.0</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Zjištění názvu domény (přiřazení do proměnné a výpis):\n$DomainName = (Get-ADDomain).DNSRoot\n$DomainName\n\n# 2. Nastavení voleb oboru (Router, DNS Server, DNS Domain Name):\nSet-DhcpServerv4OptionValue -ScopeId "192.168.${x}.0" -Router "192.168.${x}.1" -DnsServer "192.168.${x}.10" -DnsDomain $DomainName`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `Get-DhcpServerv4OptionValue -ScopeId "192.168.${x}.0" | Select-Object OptionId, Name, Value`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `OptionId Name            Value\n-------- ----            -----\n      51 Lease           {691200}\n      15 DNS Domain Name {<prijmeni>.cyberschool.internal}\n       3 Router          {192.168.${x}.1}\n       6 DNS Servers     {192.168.${x}.10}\n\n(Option 51 Lease je automatická výchozí doba zápůjčky 8 dní = 691200 s)`;
    }
  },
  {
    id: "client-dhcp-config",
    title: "7. Aktivace DHCP klienta na PC1-WIN",
    forVMs: ["SRV1-DC", "PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      const nicBanner = `
        <div class="nic-warning-banner">
          <div class="nic-warning-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>POZOR: KONFIGURUJTE VÝHRADNĚ ADAPTÉR Ethernet1</span>
          </div>
          <div class="nic-warning-text">
            Příkazy spouštějte na klientském stroji <strong>PC1-WIN</strong>. Ujistěte se, že adaptér <strong>Ethernet1 (NIC 2)</strong> je zapnutý a připojený do stejné interní sítě jako SRV1-DC.
          </div>
        </div>
      `;

      if (vm === "SRV1-DC") {
        return `
          <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 8px; padding: 18px 20px; margin: 8px 0 16px 0;">
            <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: #60a5fa; font-size: 1.05rem; margin-bottom: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Tento úkol proveďte na virtuálním stroji PC1-WIN</span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin: 0 0 12px 0;">
              Serverová konfigurace DHCP na <strong>SRV1-DC</strong> je kompletní. Tento krok slouží k otestování přidělování adres a provádí se <strong>výhradně na klientské stanici PC1-WIN</strong>:
            </p>
            <ol style="color: #e2e8f0; font-size: 0.92rem; line-height: 1.6; margin: 0 0 16px 22px; padding: 0;">
              <li>V horní liště přepněte na záložku <strong>PC1-WIN</strong> (nebo klikněte na tlačítko níže).</li>
              <li>Na stanici <strong>PC1-WIN</strong> proveďte Úkol 7 (zapnutí DHCP na adaptéru <code>Ethernet1</code> a vyžádání nové adresy).</li>
              <li>Jakmile klient obdrží IP adresu z rozsahu <code>192.168.${x}.100</code>–<code>.200</code>, <strong>vraťte se zpět sem na SRV1-DC</strong> k <strong>Úkolu 8</strong> (kontrola aktivních zápůjček v databázi DHCP).</li>
            </ol>
            <button class="nav-step-btn" onclick="switchVM('PC1-WIN')" style="cursor: pointer; background: #2563eb; color: #fff; border: 1px solid #3b82f6; font-weight: 600; padding: 8px 16px; border-radius: 6px;">
              Přepnout na záložku PC1-WIN
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 6px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        `;
      }

      return `
        ${nicBanner}
        <p>Na klientské stanici <strong>PC1-WIN</strong> nastavte adaptér <code>Ethernet1</code> na automatické získávání IP adresy i DNS serveru z DHCP serveru (režim <em>Obtain an IP address automatically</em>). Následně uvolněte starou konfiguraci a vyžádejte si novou zápůjčku.</p>
        <p>Klient musí obdržet IP adresu z dynamického rozsahu <code>192.168.${x}.100</code> až <code>.200</code>, bránu <code>192.168.${x}.1</code> a DNS <code>192.168.${x}.10</code>.</p>
        <p><strong>Následující krok:</strong> Po úspěšném získání IP adresy se <strong>vraťte na záložku SRV1-DC</strong> a pokračujte Úkolem 8 (kontrola aktivních zápůjček v databázi DHCP).</p>
      `;
    },
    how: (vm, wsX) => {
      if (vm === "SRV1-DC") return "";
      return `# 1. Povolení DHCP pro IP adresu i automatického získání DNS na rozhraní Ethernet1:\nSet-NetIPInterface -InterfaceAlias "Ethernet1" -Dhcp Enabled\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet1" -ResetServerAddresses\n\n# 2. Uvolnění staré konfigurace a obnovení zápůjčky z DHCP:\nipconfig /release Ethernet1\nipconfig /renew Ethernet1`;
    },
    verify: (vm, wsX) => {
      if (vm === "SRV1-DC") return "";
      return `Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength, PrefixOrigin\nGet-NetIPConfiguration -InterfaceAlias Ethernet1 | Select-Object -ExpandProperty IPv4DefaultGateway\nGet-DnsClientServerAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object ServerAddresses`;
    },
    expected: (vm, wsX) => {
      if (vm === "SRV1-DC") return "";
      const x = wsX || 2;
      return `IPAddress     PrefixLength PrefixOrigin\n---------     ------------ ------------\n192.168.${x}.100           24 Dhcp\n\nNextHop: 192.168.${x}.1\nServerAddresses: {192.168.${x}.10}`;
    }
  },
  {
    id: "verify-dhcp-leases",
    title: "8. Kontrola aktivních zápůjček (Address Leases) na SRV1-DC",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Přejděte zpět na server <strong>SRV1-DC</strong> a ověřte v databázi DHCP serveru, že klient <strong>PC1-WIN</strong> úspěšně obdržel zápůjčku (lease).</p>
        <p>V seznamu zápůjček musí být viditelná přidělená IP adresa, hostname klienta <code>PC1-WIN</code>, unikátní MAC adresa (ClientId) a stav <code>Active</code>. Nesmí zde existovat žádné duplicity ani konflikty.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# Zobrazení aktivních zápůjček v DHCP oboru učebny:\nGet-DhcpServerv4Lease -ScopeId "192.168.${x}.0" | Select-Object IPAddress, HostName, ClientId, AddressState, LeaseExpiryTime`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `Get-DhcpServerv4Lease -ScopeId "192.168.${x}.0" | Select-Object IPAddress, HostName, AddressState`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `IPAddress        HostName AddressState\n---------        -------- ------------\n192.168.${x}.100  PC1-WIN  Active`;
    }
  },
  {
    id: "client-connectivity-test",
    title: "9. Test obnovení zápůjčky a síťové konektivity (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Ověřte stabilitu a správnost síťového nastavení na klientském počítači <strong>PC1-WIN</strong>:</p>
        <ul>
          <li>Otestujte, že příkazy <code>ipconfig /release</code> a <code>ipconfig /renew</code> proběhnou bez chyb a klient znovu obdrží platnou adresu ze scope.</li>
          <li>Vyzkoušejte spojení (ping) na výchozí bránu <code>192.168.${x}.1</code> i na řadič domény / DHCP server <code>192.168.${x}.10</code>.</li>
          <li>Ověřte překlad doménového jména serveru přes DNS příkazem <code>Resolve-DnsName</code>.</li>
        </ul>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Test uvolnění a nového vyžádání adresy:\nipconfig /release Ethernet1\nipconfig /renew Ethernet1\n\n# 2. Test konektivity na SRV1-DC:\nTest-NetConnection -ComputerName "192.168.${x}.10" -InformationLevel Detailed\n\n# 3. Test překladu doménového FQDN jména serveru přes DNS:\nResolve-DnsName -Name "srv1-dc.<prijmeni>.cyberschool.internal"`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `Test-NetConnection -ComputerName "192.168.${x}.10"\nResolve-DnsName -Name "srv1-dc.<prijmeni>.cyberschool.internal"`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `PingSucceeded : True\n\nName                                           IP4Address\n----                                           ----------\nsrv1-dc.<prijmeni>.cyberschool.internal        192.168.${x}.10`;
    }
  },
  {
    id: "quick-verification-srv1",
    title: "10. (Nepovinné) Rychlé ověření stroje SRV1-DC",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Pro komplexní a automatické ověření celé konfigurace DHCP Serveru na <strong>SRV1-DC</strong> můžete spustit ověřovací skript přímo z repozitáře.</p>
        <div style="background: rgba(85, 255, 170, 0.08); border: 1px solid rgba(85, 255, 170, 0.3); border-left: 4px solid #55ffaa; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 0.88rem;">
          <strong>Vlastnosti skriptu:</strong>
          <ul style="margin: 6px 0 0 18px; padding: 0;">
            <li><strong>Univerzální spuštění:</strong> Příkaz můžete vložit do PowerShellu, CMD i Terminálu – vždy automaticky běží v prostředí PowerShell.</li>
            <li><strong>Průběh stahování:</strong> Zobrazuje vizuální progress bar při stahování skriptu z GitHubu.</li>
            <li><strong>Striktně Read-Only:</strong> Pouze čte konfiguraci, žádná nastavení neupravuje.</li>
            <li><strong>Neukládá se na disk:</strong> Po dokončení testu se automaticky smaže ze systému.</li>
            <li><strong>3-úrovňový souhrn:</strong> Zeleně <code>[ OK ]</code> pro splněné body, žlutě <code>[KONTROLA]</code> pro položky vyžadující ruční kontrolu a červeně <code>[CHYBA]</code> s nápovědou pro opravu.</li>
          </ul>
        </div>
      `;
    },
    how: (vm, wsX) => {
      return `# Spusťte v PowerShellu, CMD nebo Terminálu na SRV1-DC:\npowershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `######################################################################## 100.0%\n\n============================================================\n  WELL_OPS :: Overeni SRV1-DC - DHCP Server (Modul 02)\n============================================================\nZadejte cislo vaseho pracoviste (X) [vychozi: ${x}]: ${x}\n\n--- 1. Predpoklady: System a sitova konfigurace ---\n  [ OK ]       Hostname serveru je 'SRV1-DC'\n  [ OK ]       Adapter 'Ethernet1' (NIC 2) je ve stavu Up\n  [ OK ]       Staticka IPv4 adresa na Ethernet1 je 192.168.${x}.10/24\n\n--- 2. Instalace role DHCP Server a RSAT nastroju ---\n  [ OK ]       Windows Feature 'DHCP' je nainstalovana\n  [ OK ]       Administracni nastroje 'RSAT-DHCP' jsou nainstalovany\n\n--- 3. Sluzba DHCPServer a bezpecnostni skupiny ---\n  [ OK ]       Sluzba 'DHCPServer' bezi (Running)\n  [ OK ]       Bezpecnostni skupiny 'DHCP Users' a 'DHCP Administrators' existuji\n\n--- 4. Autorizace DHCP serveru v Active Directory ---\n  [ OK ]       DHCP Server je autorizovan v Active Directory (192.168.${x}.10)\n\n--- 5. Konfigurace DHCP oboru (Scope) a rozsahu ---\n  [ OK ]       DHCP Scope 'Ucebna' pro podsyt 192.168.${x}.0 existuje\n  [ OK ]       Rozsah adres oboru je spravny: 192.168.${x}.100 az 192.168.${x}.200\n  [ OK ]       Maska podsiti je 255.255.255.0 (/24)\n  [ OK ]       Stav DHCP Scope je 'Active'\n\n--- 6. Konfigurace DHCP voleb (Options) ---\n  [ OK ]       Option 003 (Router / Default Gateway): 192.168.${x}.1\n  [ OK ]       Option 006 (DNS Servers): 192.168.${x}.10\n  [ OK ]       Option 015 (DNS Domain Name): <prijmeni>.cyberschool.internal\n  [KONTROLA]   Overte vizualne: Odpovida nazev domeny v Option 015 tvaru '<prijmeni>.cyberschool.internal'?\n\n--- 7. Kontrola evidovanych zapujcek (Address Leases) ---\n  [ OK ]       Aktivni zapujcka pro klienta PC1 nalezena: IP 192.168.${x}.100\n\n--- 8. Vizuální kontrola v grafické konzoli ---\n  [KONTROLA]   Graficka konzole DHCP Manager (dhcpmgmt.msc): Overte zelenou ikonu aktivniho a autorizovaneho serveru\n\n============================================================\n                    VYSLEDNY SOUHRN                         \n============================================================\n  Pocet uspesnych kontrol [ OK ]:       13\n  Pocet k rucni kontrole  [KONTROLA]:    2\n  Pocet nalezenych chyb   [CHYBA]:       0\n------------------------------------------------------------\n\nVYSLEDEK: VSE V PORADKU! DHCP Server na SRV1-DC splnuje pozadavky Modulu 02.\nMuzete pokracovat overenim na klientovi PC1-WIN.\n============================================================`;
    }
  },
  {
    id: "quick-verification-pc1",
    title: "11. (Nepovinné) Rychlé ověření stroje PC1-WIN",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Pro komplexní a automatické ověření nastavení DHCP klienta na stanici <strong>PC1-WIN</strong> můžete spustit ověřovací skript přímo z repozitáře.</p>
        <div style="background: rgba(85, 255, 170, 0.08); border: 1px solid rgba(85, 255, 170, 0.3); border-left: 4px solid #55ffaa; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 0.88rem;">
          <strong>Vlastnosti skriptu:</strong>
          <ul style="margin: 6px 0 0 18px; padding: 0;">
            <li><strong>Univerzální spuštění:</strong> Příkaz můžete vložit do PowerShellu, CMD i Terminálu – vždy automaticky běží v prostředí PowerShell.</li>
            <li><strong>Průběh stahování:</strong> Zobrazuje vizuální progress bar při stahování skriptu z GitHubu.</li>
            <li><strong>Striktně Read-Only:</strong> Pouze čte konfiguraci, žádná nastavení neupravuje.</li>
            <li><strong>Neukládá se na disk:</strong> Po dokončení testu se automaticky smaže ze systému.</li>
            <li><strong>3-úrovňový souhrn:</strong> Zeleně <code>[ OK ]</code> pro splněné body, žlutě <code>[KONTROLA]</code> pro položky vyžadující ruční kontrolu a červeně <code>[CHYBA]</code> s nápovědou pro opravu.</li>
          </ul>
        </div>
      `;
    },
    how: (vm, wsX) => {
      return `# Spusťte v PowerShellu, CMD nebo Terminálu na PC1-WIN:\npowershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/02_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `######################################################################## 100.0%\n\n============================================================\n  WELL_OPS :: Overeni PC1-WIN - DHCP Klient (Modul 02)\n============================================================\nZadejte cislo vaseho pracoviste (X) [vychozi: ${x}]: ${x}\n\n--- 1. Identifikace stanice a adapteru ---\n  [ OK ]       Hostname klientske stanice je 'PC1-WIN'\n  [ OK ]       Adapter 'Ethernet1' (NIC 2 v CyLabu) existuje a je pripojen (Status: Up)\n\n--- 2. Nastaveni DHCP klienta na Ethernet1 ---\n  [ OK ]       Rozhrani Ethernet1 ma aktivni rezim DHCP klienta (Dhcp: Enabled)\n\n--- 3. Pridelena IPv4 adresa ---\n  [ OK ]       IPv4 adresa je uspesne pridelena z DHCP rozsahu: 192.168.${x}.100/24\n  [ OK ]       Puvod adresy je potvrzen z DHCP (PrefixOrigin: Dhcp)\n\n--- 4. Prevzate parametry site (DHCP Options) ---\n  [ OK ]       Vychozi brana byla prevzata spravne: 192.168.${x}.1\n  [ OK ]       DNS server byl prevzat spravne: 192.168.${x}.10\n  [ OK ]       Domenovy suffix pripojeni byl prevzat: <prijmeni>.cyberschool.internal\n  [KONTROLA]   Overte vizualne: Odpovida predpona suffixu '<prijmeni>' vasemu prijmeni?\n\n--- 5. Test spojeni a rozlisovani jmen ---\n  [ OK ]       Spojeni na vychozi branu (192.168.${x}.1) je funkcni (ICMP Ping OK)\n  [ OK ]       Spojeni na server SRV1-DC (192.168.${x}.10) je funkcni\n  [ OK ]       Preklad domenovych jmen pres DNS server funguje\n\n--- 6. Doporucena prakticka zkouska ---\n  [KONTROLA]   Prakticky test obnoveni: Vyzkousejte 'ipconfig /release Ethernet1' nasledovane 'ipconfig /renew Ethernet1'\n\n============================================================\n                    VYSLEDNY SOUHRN                         \n============================================================\n  Pocet uspesnych kontrol [ OK ]:       10\n  Pocet k rucni kontrole  [KONTROLA]:    2\n  Pocet nalezenych chyb   [CHYBA]:       0\n------------------------------------------------------------\n\nVYSLEDEK: VSE V PORADKU! Klient PC1-WIN je korektne obsluhovan DHCP serverem.\nModul 02 byl na tomto stroji uspesne dokoncen.\n============================================================`;
    }
  }
];
