/**
 * Modul 03: DNS Server (Domain Name System)
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["03"] = [
  {
    id: "prerequisites",
    title: "1. Kontrola předpokladů a role DNS (SRV1-DC a PC1-WIN)",
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
            Veškerá síťová komunikace interní sítě probíhá <strong>výhradně na rozhraní NIC 2 (v systému Ethernet1)</strong>.
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
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">Řadič domény (DC) s DNS z Modulu 01</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Windows 11 s DHCP klientem z Modulu 02</td>
              </tr>
              <tr>
                <td><strong>Interní rozhraní (NIC 2)</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>Ethernet1</code> (zapnuto v CyLabu)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>Ethernet1</code> (zapnuto v CyLabu)</td>
              </tr>
              <tr>
                <td><strong>IPv4 adresa</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>192.168.${x}.10 / 24</code> (statická)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.100</code> – <code>.200</code> (DHCP)</td>
              </tr>
              <tr>
                <td><strong>Výchozí brána (Router)</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>192.168.${x}.1</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.1</code></td>
              </tr>
              <tr>
                <td><strong>DNS Server</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>127.0.0.1</code> / <code>192.168.${x}.10</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.10</code></td>
              </tr>
              <tr>
                <td><strong>Doménový suffix</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `# 1. Kontrola běhu služby DNS na serveru SRV1-DC:
Get-Service -Name DNS | Select-Object Name, Status, StartType

# 2. Kontrola statické IP adresy na rozhraní Ethernet1:
Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength`;
      } else {
        return `# 1. Kontrola přiřazeného DNS serveru a IP adresy na PC1-WIN:
Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength
Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object ServerAddresses`;
      }
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `Get-Service -Name DNS | Select-Object Status, StartType`;
      } else {
        return `(Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).ServerAddresses`;
      }
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `Status  StartType\n------  ---------\nRunning Automatic`;
      } else {
        return `192.168.${x}.10`;
      }
    }
  },
  {
    id: "dns-forward-zone-check",
    title: "2. Kontrola dopředné vyhledávací zóny (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Dopředná zóna (Forward Lookup Zone) <code>&lt;prijmeni&gt;.cyberschool.internal</code> vznikla automaticky při povýšení řadiče domény v Modulu 01. Je uložena přímo v databázi Active Directory (AD-integrovaná), replikuje se mezi řadiči v doméně a má aktivní bezpečné dynamické aktualizace (<em>Secure only</em>).</p>
        <p>Ověřte existenci zóny a přítomnost A záznamu pro řadič <code>SRV1-DC</code> s adresou <code>192.168.${x}.10</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# 1. Zjištění zón na DNS serveru:
$domain = (Get-ADDomain).DNSRoot
Get-DnsServerZone -Name $domain | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate

# 2. Kontrola existence A záznamu pro řadič SRV1-DC:
Get-DnsServerResourceRecord -ZoneName $domain -RRType A -Name "srv1-dc"`;
    },
    verify: (vm, wsX) => {
      return `Get-DnsServerZone -Name "$((Get-ADDomain).DNSRoot)" | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate`;
    },
    expected: (vm, wsX) => {
      return `ZoneName                        ZoneType ReplicationScope DynamicUpdate\n--------                        -------- ---------------- -------------\n<prijmeni>.cyberschool.internal Primary  Domain           Secure`;
    }
  },
  {
    id: "dns-reverse-zone-create",
    title: "3. Vytvoření AD-integrované reverzní zóny pro síť (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Reverzní zóna (Reverse Lookup Zone) překládá IP adresu zpět na doménové jméno (záznamy typu PTR). <strong>Reverzní zóna nevzniká automaticky</strong> — správce ji musí vytvořit ručně.</p>
        <p>Vytvořte novou zónu integrovanou s Active Directory pro síť pracoviště <code>192.168.${x}.0/24</code>. Zóna se automaticky pojmenuje <code>${x}.168.192.in-addr.arpa</code>. Zabezpečení aktualizací nastavte na <strong>Secure only</strong>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Zjištění čísla pracoviště z interního adaptéru:
$wsX = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).IPAddress.Split('.')[2]

# 2. Vytvoření reverzní zóny integrované v Active Directory:
Add-DnsServerPrimaryZone -NetworkId "192.168.$wsX.0/24" -ReplicationScope "Domain" -DynamicUpdate "Secure"`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `$wsX = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).IPAddress.Split('.')[2]; Get-DnsServerZone -Name "$wsX.168.192.in-addr.arpa" | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `ZoneName                 ZoneType ReplicationScope DynamicUpdate\n--------                 -------- ---------------- -------------\n${x}.168.192.in-addr.arpa   Primary  Domain           Secure`;
    }
  },
  {
    id: "dns-record-srv2-fs",
    title: "4. Založení statického záznamu A a PTR pro SRV2-FS (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>V budoucích cvičeních (Modul 7) bude spuštěn server <code>SRV2-FS</code> se statickou adresou <code>192.168.${x}.20</code>. Protože tento server zatím neběží a nezapíše se dynamicky, správce pro něj vytvoří statický záznam <strong>A</strong>.</p>
        <p>Díky existující reverzní zóně přepínač <code>-CreatePtr</code> zajistí automatické vytvoření odpovídajícího <strong>PTR</strong> ukazatele v zóně <code>${x}.168.192.in-addr.arpa</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Zjištění domény a podsítě:
$domain = (Get-ADDomain).DNSRoot
$wsX = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).IPAddress.Split('.')[2]

# 2. Vytvoření A záznamu s automatickým ukazatelem PTR:
Add-DnsServerResourceRecordA -Name "srv2-fs" -ZoneName $domain -IPv4Address "192.168.$wsX.20" -CreatePtr`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `$domain = (Get-ADDomain).DNSRoot; Get-DnsServerResourceRecord -ZoneName $domain -Name "srv2-fs" | Select-Object HostName, RecordType, @{N='IP';E={$_.RecordData.IPv4Address}}`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `HostName RecordType IP\n-------- ---------- --\nsrv2-fs  A          192.168.${x}.20`;
    }
  },
  {
    id: "dns-record-cname-ftp",
    title: "5. Vytvoření aliasu CNAME ftp pro službu (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Uživatelé a aplikace se k síťovým službám nemají připojovat jménem konkrétního fyzického či virtuálního serveru, ale obecným jménem služby: <code>ftp.&lt;prijmeni&gt;.cyberschool.internal</code>. Pokud se FTP služba v budoucnu přestěhuje na jiný hardware, změní se pouze tento alias.</p>
        <p>Vytvořte v dopředné zóně alias (CNAME) <code>ftp</code>, který ukazuje na kanonické jméno <code>srv2-fs.&lt;prijmeni&gt;.cyberschool.internal</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# Vytvoření aliasu CNAME pro FTP:
$domain = (Get-ADDomain).DNSRoot
Add-DnsServerResourceRecordCName -Name "ftp" -HostNameAlias "srv2-fs.$domain" -ZoneName $domain`;
    },
    verify: (vm, wsX) => {
      return `$domain = (Get-ADDomain).DNSRoot; Get-DnsServerResourceRecord -ZoneName $domain -Name "ftp" | Select-Object HostName, RecordType, @{N='HostNameAlias';E={$_.RecordData.HostNameAlias}}`;
    },
    expected: (vm, wsX) => {
      return `HostName RecordType HostNameAlias\n-------- ---------- -------------\nftp      CNAME      srv2-fs.<prijmeni>.cyberschool.internal.`;
    }
  },
  {
    id: "dns-record-ptr-srv1",
    title: "6. Doplnění chybějícího PTR záznamu pro řadič SRV1-DC (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Protože řadič <code>SRV1-DC</code> vznikl v Modulu 01 ještě před vytvořením reverzní zóny, <strong>nemá vytvořený PTR ukazatel</strong> pro svou adresu <code>192.168.${x}.10</code>. Bez tohoto záznamu by diagnostický nástroj <code>nslookup</code> hlásil při reverzním dotazu na server chybu.</p>
        <p>Doplňte chybějící záznam PTR pro <code>10</code> ukazující na <code>srv1-dc.&lt;prijmeni&gt;.cyberschool.internal</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Zjištění parametrů:
$domain = (Get-ADDomain).DNSRoot
$wsX = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).IPAddress.Split('.')[2]

# 2. Zápis PTR ukazatele do reverzní zóny:
Add-DnsServerResourceRecordPtr -Name "10" -ZoneName "$wsX.168.192.in-addr.arpa" -PtrDomainName "srv1-dc.$domain"`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `$wsX = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).IPAddress.Split('.')[2]; Get-DnsServerResourceRecord -ZoneName "$wsX.168.192.in-addr.arpa" -Name "10" | Select-Object HostName, RecordType, @{N='Ptr';E={$_.RecordData.PtrDomainName}}`;
    },
    expected: (vm, wsX) => {
      return `HostName RecordType Ptr\n-------- ---------- ---\n10       Ptr        srv1-dc.<prijmeni>.cyberschool.internal.`;
    }
  },
  {
    id: "dns-client-registration",
    title: "7. Registrace a nastavení klienta v DNS (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Na klientské stanici <strong>PC1-WIN</strong> ověřte, že adaptér <code>Ethernet1</code> (NIC 2 v CyLabu) má jako primární DNS server nastavenou adresu <code>192.168.${x}.10</code> a obdržel doménovou příponu <code>&lt;prijmeni&gt;.cyberschool.internal</code> (z DHCP nebo ručně).</p>
        <p>Příkazem <code>ipconfig /registerdns</code> vyzvěte klienta k okamžité registraci svých záznamů A i PTR na DNS serveru a příkazem <code>ipconfig /flushdns</code> promažte lokální mezipaměť překladače.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# 1. Kontrola DNS serveru na Ethernet1:
Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses

# 2. Vynucení okamžité dynamické registrace klienta do DNS:
ipconfig /registerdns

# 3. Vyčištění lokální paměti překladače (DNS cache):
ipconfig /flushdns`;
    },
    verify: (vm, wsX) => {
      return `Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `InterfaceAlias ServerAddresses\n-------------- ---------------\nEthernet1      {192.168.${x}.10}`;
    }
  },
  {
    id: "dns-test-forward",
    title: "8. Test dopředného překladu jména na IP adresu (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Ověřte, že klient dokáže přeložit jméno serveru <code>srv2-fs</code> na IP adresu <code>192.168.${x}.20</code>. Díky předané doménové příponě stačí zadat pouze krátké jméno hostitele.</p>
        <p>Výstup příkazu <code>nslookup</code> nesmí obsahovat chybovou hlášku <em>Non-existent domain</em>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# 1. Klasický nástroj nslookup:
nslookup srv2-fs

# 2. PowerShell cmdlet Resolve-DnsName:
Resolve-DnsName -Name "srv2-fs" | Select-Object Name, Type, IPAddress`;
    },
    verify: (vm, wsX) => {
      return `Resolve-DnsName -Name "srv2-fs" | Select-Object Name, Type, IPAddress`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `Name                                    Type IPAddress\n----                                    ---- ---------\nsrv2-fs.<prijmeni>.cyberschool.internal A    192.168.${x}.20`;
    }
  },
  {
    id: "dns-test-reverse",
    title: "9. Test reverzního překladu IP adresy na jméno (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Ověřte funkčnost reverzní zóny dotazem na IP adresu <code>192.168.${x}.20</code> (SRV2-FS) i <code>192.168.${x}.10</code> (SRV1-DC). DNS server musí vrátit odpovídající doménové jméno stroje.</p>
        <p>Všimněte si, že <code>nslookup</code> se nyní představí svým plným jménem <code>srv1-dc.&lt;prijmeni&gt;.cyberschool.internal</code> místo hlášky <em>Default Server: UnKnown</em>.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Reverzní dotaz na server SRV2-FS:
nslookup 192.168.${x}.20

# 2. Reverzní dotaz na řadič SRV1-DC:
nslookup 192.168.${x}.10`;
    },
    verify: (vm, wsX) => {
      const x = wsX || 2;
      return `Resolve-DnsName "192.168.${x}.20" | Select-Object Name, Type, NameHost`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `Name                        Type NameHost\n----                        ---- --------\n20.${x}.168.192.in-addr.arpa Ptr  srv2-fs.<prijmeni>.cyberschool.internal`;
    }
  },
  {
    id: "dns-test-cname",
    title: "10. Test aliasu CNAME ftp (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Ověřte překlad aliasu <code>ftp</code>. Příkaz <code>nslookup ftp</code> musí vrátit kanonické jméno serveru <code>srv2-fs.&lt;prijmeni&gt;.cyberschool.internal</code>, alias <code>ftp.&lt;prijmeni&gt;.cyberschool.internal</code> a IP adresu <code>192.168.${x}.20</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# Dotaz na alias ftp:
nslookup ftp
Resolve-DnsName -Name "ftp" | Select-Object Name, Type, NameHost, IPAddress`;
    },
    verify: (vm, wsX) => {
      return `Resolve-DnsName -Name "ftp" | Select-Object Name, Type, NameHost, IPAddress`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `Name                                 Type  NameHost                                 IPAddress\n----                                 ----  --------                                 ---------\nftp.<prijmeni>.cyberschool.internal  CNAME srv2-fs.<prijmeni>.cyberschool.internal\nsrv2-fs.<prijmeni>.cyberschool.internal A                                           192.168.${x}.20`;
    }
  },
  {
    id: "dns-test-ping",
    title: "11. Test odezvy a konektivity přes doménové jméno (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Vyzkoušejte funkčnost síťového spojení pomocí jména <code>ping srv2-fs</code>. Operační systém automaticky dotáže DNS server, získá adresu <code>192.168.${x}.20</code> a odešle ICMP pakety.</p>
      `;
    },
    how: (vm, wsX) => {
      return `# Ping na stroj přes doménové jméno:
ping srv2-fs`;
    },
    verify: (vm, wsX) => {
      return `Test-NetConnection -ComputerName "srv2-fs" -WarningAction SilentlyContinue | Select-Object ComputerName, RemoteAddress`;
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      return `ComputerName RemoteAddress\n------------ -------------\nsrv2-fs      192.168.${x}.20`;
    }
  },
  {
    id: "check-srv1-dc",
    title: "12. (Nepovinné) Rychlé ověření celého stroje SRV1-DC",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Interaktivní auditovací skript pro automatické prověření veškeré konfigurace DNS serveru na <strong>SRV1-DC</strong>. Skript je <strong>striktně read-only</strong>, nic v systému nemění a po dokončení se sám uklidí.</p>
        <p>Příkaz lze spustit v <strong>PowerShellu, CMD i Terminálu</strong>:</p>
      `;
    },
    how: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      return `Všechny testované položky zakončeny stavem [ OK ] bez chyb.`;
    }
  },
  {
    id: "check-pc1-win",
    title: "13. (Nepovinné) Rychlé ověření celého stroje PC1-WIN",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      return `
        <p>Interaktivní auditovací skript pro automatické prověření DNS klienta a síťového překladu na stanici <strong>PC1-WIN</strong>. Skript je <strong>striktně read-only</strong>, nic v systému nemění a po dokončení se sám uklidí.</p>
        <p>Příkaz lze spustit v <strong>PowerShellu, CMD i Terminálu</strong>:</p>
      `;
    },
    how: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      return `Všechny testované položky zakončeny stavem [ OK ] bez chyb.`;
    }
  },
  {
    id: "auto-documentation",
    title: "14. (Automatizace) Vyplnění dokumentace a odeslání na Discord",
    forVMs: ["SRV1-DC", "PC1-WIN"],
    what: (vm, wsX) => {
      if (vm === "SRV1-DC") {
        return `
          <div class="nic-warning-banner" style="border-left-color: #22c55e;">
            <div class="nic-warning-title" style="color: #22c55e;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>KROK 1/2: ZAZNAMENÁNÍ SERVEROVÉ DOKUMENTACE NA SRV1-DC</span>
            </div>
            <div class="nic-warning-text">
              Příkazy provádějte postupně a nepřeskakujte. Po spuštění na SRV1-DC zadejte své jméno, třídu (T3A) a Discord uživatelské jméno.
              Jakmile skript napíše <strong>HOTOVO</strong>, přejděte na PC1-WIN a spusťte Krok 2/2.
            </div>
          </div>
        `;
      } else {
        return `
          <div class="nic-warning-banner" style="border-left-color: #22c55e;">
            <div class="nic-warning-title" style="color: #22c55e;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>KROK 2/2: KLIENTSKÉ OVERENÍ A SPOJENÍ DOKUMENTACE NA DISCORDU</span>
            </div>
            <div class="nic-warning-text">
              Spusťte tento příkaz na PC1-WIN a zadejte <strong>stejné Discord jméno</strong> jako na SRV1-DC.
              Po dokončení Discord bot automaticky spojí obě části a zašle vám <code>overeni.md</code>, <code>postup.md</code> i ZIP přímo na Discord!
            </div>
          </div>
        `;
      }
    },
    how: (vm, wsX) => {
      if (vm === "SRV1-DC") {
        return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_doc_SRV1-DC.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"`;
      } else {
        return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_doc_PC1-WIN.bat -o doc.bat; .\\doc.bat; Remove-Item -Force doc.bat -ErrorAction SilentlyContinue"`;
      }
    },
    verify: (vm, wsX) => {
      return vm === "SRV1-DC"
        ? `Zkontrolujte, zda skript vypsal zelené hlášení HOTOVO a odeslal data na Discord.`
        : `Zkontrolujte svůj Discord kanál #dokumentace nebo soukromé zprávy (DM), kde bot doručil hotové soubory.`;
    },
    expected: (vm, wsX) => {
      return vm === "SRV1-DC"
        ? `[ HOTOVO ] Serverova cast SRV1-DC byla uspesne zaznamenana! Přejděte na PC1-WIN.`
        : `Dokumentace pro @uzivatel byla uspesne spojena a dorucena na Discord (overeni.md, postup.md, ZIP)!`;
    }
  }
];
