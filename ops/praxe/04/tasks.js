/**
 * Modul 04: Active Directory (OU, skupiny, účty, domovské složky, kočovné profily, klient v doméně)
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["04"] = [
  {
    id: "prerequisites",
    title: "1. Kontrola předpokladů a síťových parametrů (SRV1-DC a PC1-WIN)",
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
            Virtuální stroje mají více síťových rozhraní. <strong>Na rozhraní NIC 1 (Ethernet0 / NAT) nikdy nesahejte!</strong><br>
            Veškerá školní síťová komunikace (AD DS, DNS, SMB sdílení) probíhá <strong>výhradně na rozhraní NIC 2 (v systému Ethernet1)</strong>.
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
                <th class="${vm === 'SRV1-DC' ? 'active-col' : ''}">SRV1-DC (Řadič domény)</th>
                <th class="${vm === 'PC1-WIN' ? 'active-col' : ''}">PC1-WIN (Klientská stanice)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Stav z minulých modulů</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">AD DS, DNS a DHCP běží (Moduly 01–03)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Windows 11 v WORKGROUP (připojí se v kroku 6)</td>
              </tr>
              <tr>
                <td><strong>Interní rozhraní (NIC 2)</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>Ethernet1</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>Ethernet1</code> (prioritní metrika <code>10</code>)</td>
              </tr>
              <tr>
                <td><strong>IPv4 adresa</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>192.168.${x}.10 / 24</code> (statická)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.100</code>–<code>.200</code> (DHCP / statická)</td>
              </tr>
              <tr>
                <td><strong>DNS Server</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>127.0.0.1</code> / <code>192.168.${x}.10</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>192.168.${x}.10</code></td>
              </tr>
              <tr>
                <td><strong>Správcovský účet</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">Vestavěný <code>Administrator</code> (<code>Pa55w.rd</code>)</td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">Místní správce před připojením / doménový po připojení</td>
              </tr>
              <tr>
                <td><strong>Doména školy</strong></td>
                <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
                <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}"><code>&lt;prijmeni&gt;.cyberschool.internal</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    },
    how: (vm, wsX) => {
      if (vm === "SRV1-DC") {
        return `# 1. Kontrola klicovych sluzeb AD DS a DNS na SRV1-DC:
Get-Service -Name ADWS, NTDS, DNS, Netlogon, LanmanServer | Select-Object Name, Status, StartType

# 2. Kontrola domeny a IP adresy na rozhrani Ethernet1:
(Get-ADDomain).DNSRoot
Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength`;
      } else {
        return `# 1. Kontrola site na rozhrani Ethernet1 a DNS serveru:
Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength
Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 | Select-Object ServerAddresses

# 2. Nastaveni priority Ethernet1 nad Ethernet0 (aby DNS dotazy na domenu nesly do internetu):
Set-NetIPInterface -InterfaceAlias "Ethernet1" -InterfaceMetric 10
if (Get-NetAdapter -Name "Ethernet0" -ErrorAction SilentlyContinue) {
    Set-NetIPInterface -InterfaceAlias "Ethernet0" -InterfaceMetric 50
}`;
      }
    },
    verify: (vm, wsX) => {
      if (vm === "SRV1-DC") {
        return `Get-Service -Name NTDS, DNS, ADWS | Select-Object Name, Status`;
      } else {
        return `(Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4).ServerAddresses`;
      }
    },
    expected: (vm, wsX) => {
      const x = wsX || 2;
      if (vm === "SRV1-DC") {
        return `Name  Status\n----  ------\nADWS  Running\nDNS   Running\nNTDS  Running`;
      } else {
        return `192.168.${x}.10`;
      }
    }
  },
  {
    id: "ad-ou-structure",
    title: "2. Založení kompletní struktury organizačních jednotek (OU) pod Skola (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Vytvořte v Active Directory čistou hierarchii organizačních jednotek (OU) pro školu <strong>CyberSchool</strong> podle zásad správy a GPO (nikoli podle ročníků, protože třídy se každý rok mění).</p>
        <p>Pod kořenem domény vytvořte OU <code>Skola</code> a pod ní přesně 15 podřízených OU (celkem <strong>16 OU pod Skola</strong> + výchozí <code>Domain Controllers</code> = <strong>17 OU</strong>), všechny s aktivní ochranou proti nechtěnému smazání (<code>ProtectedFromAccidentalDeletion = True</code>):</p>
        <ul>
          <li><code>Skola &rarr; Zamestnanci</code>: <code>Ucitele</code>, <code>Vedeni</code>, <code>THP</code></li>
          <li><code>Skola &rarr; Studenti</code>: <code>Gymnazium-8lete</code>, <code>Gymnazium-4lete</code>, <code>Elektrotechnika</code>, <code>Informatika</code></li>
          <li><code>Skola &rarr; Pocitace</code>: <code>Servery</code>, <code>Klienti-Ucebny</code>, <code>Klienti-Kancelare</code></li>
          <li><code>Skola &rarr; Skupiny</code> a <code>Skola &rarr; Sluzebni-ucty</code></li>
        </ul>
      `;
    },
    how: (vm, wsX) => {
      return `# Idempotentni vytvoreni cele hierarchie OU (GUI alternativa: dsa.msc -> View -> Advanced Features):
$baseDN = (Get-ADDomain).DistinguishedName
$skolaDN = "OU=Skola,$baseDN"

if (-not (Get-ADOrganizationalUnit -Filter "Name -eq 'Skola'" -SearchBase $baseDN -SearchScope OneLevel -ErrorAction SilentlyContinue)) {
    New-ADOrganizationalUnit -Name "Skola" -Path $baseDN -ProtectedFromAccidentalDeletion $true
}

@("Zamestnanci", "Studenti", "Pocitace", "Skupiny", "Sluzebni-ucty") | ForEach-Object {
    $ouName = $_
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$ouName'" -SearchBase $skolaDN -SearchScope OneLevel -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $ouName -Path $skolaDN -ProtectedFromAccidentalDeletion $true
    }
}

$zamDN = "OU=Zamestnanci,$skolaDN"
@("Ucitele", "Vedeni", "THP") | ForEach-Object {
    $ouName = $_
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$ouName'" -SearchBase $zamDN -SearchScope OneLevel -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $ouName -Path $zamDN -ProtectedFromAccidentalDeletion $true
    }
}

$stuDN = "OU=Studenti,$skolaDN"
@("Gymnazium-8lete", "Gymnazium-4lete", "Elektrotechnika", "Informatika") | ForEach-Object {
    $ouName = $_
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$ouName'" -SearchBase $stuDN -SearchScope OneLevel -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $ouName -Path $stuDN -ProtectedFromAccidentalDeletion $true
    }
}

$pcDN = "OU=Pocitace,$skolaDN"
@("Servery", "Klienti-Ucebny", "Klienti-Kancelare") | ForEach-Object {
    $ouName = $_
    if (-not (Get-ADOrganizationalUnit -Filter "Name -eq '$ouName'" -SearchBase $pcDN -SearchScope OneLevel -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $ouName -Path $pcDN -ProtectedFromAccidentalDeletion $true
    }
}`;
    },
    verify: (vm, wsX) => {
      return `$ous = Get-ADOrganizationalUnit -Filter * | Select-Object Name, ProtectedFromAccidentalDeletion | Sort-Object Name; $ous; "Celkem OU: $($ous.Count)"`;
    },
    expected: (vm, wsX) => {
      return `(Všech 17 OU včetně Skola, 15 podřízených OU a Domain Controllers, všude ProtectedFromAccidentalDeletion : True)\nCelkem OU: 17`;
    }
  },
  {
    id: "ad-security-groups",
    title: "3. Vytvoření 14 globálních bezpečnostních skupin a vnoření (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>V OU <code>Skola\\Skupiny</code> založte všech <strong>14 bezpečnostních skupin</strong> s rozsahem <strong>Global</strong> (<code>GroupScope = Global</code>, <code>GroupCategory = Security</code>) podle modelu AGDLP:</p>
        <ul>
          <li><strong>Žáci a obory:</strong> <code>GG_Studenti</code>, <code>GG_Studenti_G8</code>, <code>GG_Studenti_G4</code>, <code>GG_Studenti_EL</code>, <code>GG_Studenti_IT</code></li>
          <li><strong>Zaměstnanci a vedení:</strong> <code>GG_Zamestnanci</code>, <code>GG_Ucitele</code>, <code>GG_Vedeni</code>, <code>GG_THP</code>, <code>GG_Sekretariat</code></li>
          <li><strong>Předmětové komise a IT:</strong> <code>GG_PK_Matematika</code>, <code>GG_PK_Informatika</code>, <code>GG_PK_Jazyky</code>, <code>GG_IT-Sprava</code></li>
        </ul>
        <p>Vnořte oborové skupiny žáků do <code>GG_Studenti</code> a skupiny <code>GG_Ucitele</code>, <code>GG_THP</code>, <code>GG_Vedeni</code> do souhrnné skupiny <code>GG_Zamestnanci</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `$baseDN = (Get-ADDomain).DistinguishedName
$skupinyDN = "OU=Skupiny,OU=Skola,$baseDN"

$groups = @(
    "GG_Studenti", "GG_Studenti_G8", "GG_Studenti_G4", "GG_Studenti_EL", "GG_Studenti_IT",
    "GG_Ucitele", "GG_Zamestnanci", "GG_Vedeni", "GG_THP", "GG_Sekretariat",
    "GG_PK_Matematika", "GG_PK_Informatika", "GG_PK_Jazyky", "GG_IT-Sprava"
)

foreach ($g in $groups) {
    if (-not (Get-ADGroup -Filter "Name -eq '$g'" -ErrorAction SilentlyContinue)) {
        New-ADGroup -Name $g -SamAccountName $g -GroupScope Global -GroupCategory Security -Path $skupinyDN
    }
}

# Vnoreni skupin do souhrnnych skupin (idempotentne)
$curStu = @(Get-ADGroupMember -Identity "GG_Studenti" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty SamAccountName)
foreach ($sub in @("GG_Studenti_G8", "GG_Studenti_G4", "GG_Studenti_EL", "GG_Studenti_IT")) {
    if ($curStu -notcontains $sub) { Add-ADGroupMember -Identity "GG_Studenti" -Members $sub }
}
$curZam = @(Get-ADGroupMember -Identity "GG_Zamestnanci" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty SamAccountName)
foreach ($sub in @("GG_Ucitele", "GG_THP", "GG_Vedeni")) {
    if ($curZam -notcontains $sub) { Add-ADGroupMember -Identity "GG_Zamestnanci" -Members $sub }
}`;
    },
    verify: (vm, wsX) => {
      return `$baseDN = (Get-ADDomain).DistinguishedName
$grp = Get-ADGroup -Filter * -SearchBase "OU=Skupiny,OU=Skola,$baseDN" | Select-Object Name, GroupScope, GroupCategory | Sort-Object Name
$grp
"Celkem skupin: $($grp.Count)"
Get-ADGroupMember -Identity "GG_Studenti" | Select-Object Name, objectClass
Get-ADGroupMember -Identity "GG_Zamestnanci" | Select-Object Name, objectClass`;
    },
    expected: (vm, wsX) => {
      return `Celkem skupin: 14 (všechny Global Security)\nGG_Studenti obsahuje: GG_Studenti_G8, GG_Studenti_G4, GG_Studenti_EL, GG_Studenti_IT (objectClass: group)\nGG_Zamestnanci obsahuje: GG_Ucitele, GG_THP, GG_Vedeni (objectClass: group)`;
    }
  },
  {
    id: "ad-users-and-membership",
    title: "4. Vytvoření 10 uživatelských účtů a zařazení do skupin (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Založte všech <strong>10 školních uživatelských účtů</strong> do příslušných OU, s heslem <code>Pa55w.rd</code>, povoleným účtem (<code>Enabled = $true</code>) a <strong>odškrtnutou</strong> volbou změny hesla při prvním přihlášení (<code>ChangePasswordAtLogon = $false</code>).</p>
        <p>Každého uživatele zařaďte pouze do nejmenší příslušné skupiny (žáky jen do oborové skupiny; do <code>GG_Studenti</code> a <code>GG_Zamestnanci</code> spadají automaticky díky vnoření).</p>
        <p><strong>Pravidlo administrace:</strong> Veškerá správa probíhá přes vestavěný účet <code>Administrator</code> — nevytvářejte žádný personalizovaný admin účet typu <code>*juchelka*</code> ani <code>*peclivy*</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `$adDomain = Get-ADDomain
$baseDN = $adDomain.DistinguishedName
$dnsRoot = $adDomain.DNSRoot
$pass = ConvertTo-SecureString "Pa55w.rd" -AsPlainText -Force

$users = @(
    @{ Sam="jana.teacher";      Given="Jana";   Sur="Nováková";  OU="OU=Ucitele,OU=Zamestnanci,OU=Skola,$baseDN";      Groups=@("GG_Ucitele", "GG_PK_Informatika") },
    @{ Sam="petr.teacher";      Given="Petr";   Sur="Dvořák";    OU="OU=Ucitele,OU=Zamestnanci,OU=Skola,$baseDN";      Groups=@("GG_Ucitele", "GG_PK_Matematika") },
    @{ Sam="karel.zamestnanec"; Given="Karel";  Sur="Dlouhý";    OU="OU=Vedeni,OU=Zamestnanci,OU=Skola,$baseDN";       Groups=@("GG_Vedeni") },
    @{ Sam="marie.zamestnanec"; Given="Marie";  Sur="Kučerová";  OU="OU=THP,OU=Zamestnanci,OU=Skola,$baseDN";          Groups=@("GG_THP", "GG_Sekretariat") },
    @{ Sam="lucie.student";     Given="Lucie";  Sur="Horáková";  OU="OU=Gymnazium-8lete,OU=Studenti,OU=Skola,$baseDN"; Groups=@("GG_Studenti_G8") },
    @{ Sam="ondrej.student";    Given="Ondřej"; Sur="Malý";      OU="OU=Gymnazium-8lete,OU=Studenti,OU=Skola,$baseDN"; Groups=@("GG_Studenti_G8") },
    @{ Sam="adam.student";      Given="Adam";   Sur="Beneš";     OU="OU=Gymnazium-4lete,OU=Studenti,OU=Skola,$baseDN"; Groups=@("GG_Studenti_G4") },
    @{ Sam="klara.student";     Given="Klára";  Sur="Veselá";    OU="OU=Gymnazium-4lete,OU=Studenti,OU=Skola,$baseDN"; Groups=@("GG_Studenti_G4") },
    @{ Sam="tomas.student";     Given="Tomáš";  Sur="Král";      OU="OU=Elektrotechnika,OU=Studenti,OU=Skola,$baseDN"; Groups=@("GG_Studenti_EL") },
    @{ Sam="eva.student";       Given="Eva";    Sur="Svobodová"; OU="OU=Informatika,OU=Studenti,OU=Skola,$baseDN";     Groups=@("GG_Studenti_IT") }
)

foreach ($u in $users) {
    if (-not (Get-ADUser -Filter "SamAccountName -eq '$($u.Sam)'" -ErrorAction SilentlyContinue)) {
        New-ADUser -Name $u.Sam \`
            -SamAccountName $u.Sam \`
            -UserPrincipalName "$($u.Sam)@$dnsRoot" \`
            -GivenName $u.Given \`
            -Surname $u.Sur \`
            -DisplayName "$($u.Given) $($u.Sur)" \`
            -Path $u.OU \`
            -AccountPassword $pass \`
            -ChangePasswordAtLogon $false \`
            -Enabled $true
    }
    foreach ($g in $u.Groups) {
        $curMembers = @(Get-ADGroupMember -Identity $g -ErrorAction SilentlyContinue | Select-Object -ExpandProperty SamAccountName)
        if ($curMembers -notcontains $u.Sam) {
            Add-ADGroupMember -Identity $g -Members $u.Sam
        }
    }
}`;
    },
    verify: (vm, wsX) => {
      return `$baseDN = (Get-ADDomain).DistinguishedName
$adUsers = Get-ADUser -Filter * -SearchBase "OU=Skola,$baseDN" -Properties Enabled | Select-Object Name, Enabled, DistinguishedName | Sort-Object Name
$adUsers
"Celkem uzivatelu v OU Skola: $($adUsers.Count)"
Get-ADGroupMember -Identity "GG_Studenti" -Recursive | Select-Object Name
Get-ADUser -Filter "SamAccountName -like '*juchelka*' -or SamAccountName -like '*peclivy*'"`;
    },
    expected: (vm, wsX) => {
      return `Celkem uzivatelu v OU Skola: 10 (všichni Enabled : True)\nRekurzivně v GG_Studenti: 6 žáků (adam, eva, klara, lucie, ondrej, tomas)\nDotaz na *juchelka* / *peclivy* vrátí prázdný výstup`;
    }
  },
  {
    id: "ad-home-and-roaming-profiles",
    title: "5. Nastavení provizorních domovských složek (home$) a kočovných profilů (profiles$) (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Připravte na <strong>SRV1-DC</strong> provizorní úložiště (v Modulu 07 se přesunou na odolný server SRV2-FS):</p>
        <ul>
          <li><code>C:\\home</code> sdílená jako skryté sdílení <code>home$</code>: každému z 10 uživatelů vytvořte vlastní podsložku s izolovanými NTFS právy (vlastník/uživatel plný přístup, ostatní žáci bez přístupu) a nastavte na účtu disk <code>H:</code> &rarr; <code>\\\\SRV1-DC\\home$\\%username%</code>.</li>
          <li><code>C:\\profiles</code> sdílená jako skryté sdílení <code>profiles$</code>: nastavte přesná kořenová NTFS práva (<code>SYSTEM</code> a <code>Administrators</code> Full Control, <code>CREATOR OWNER</code> Full Control na podsložky a soubory, <code>Authenticated Users</code> pouze výpis a vytvoření vlastní složky v kořeni bez dědění) a nastavte <code>ProfilePath</code> na <code>\\\\SRV1-DC\\profiles$\\%username%</code>.</li>
        </ul>
        <p><strong>Důležité:</strong> Podsložky profilů (např. <code>eva.student.V6</code>) v <code>C:\\profiles</code> <strong>nevytvářejte ručně</strong> — systém Windows je vytvoří sám při prvním odhlášení uživatele z PC1-WIN.</p>
      `;
    },
    how: (vm, wsX) => {
      return `$baseDN = (Get-ADDomain).DistinguishedName

# 1. Vytvoreni korenovych slozek a skrytych SMB sdileni
New-Item -Path "C:\\home" -ItemType Directory -Force | Out-Null
New-Item -Path "C:\\profiles" -ItemType Directory -Force | Out-Null

if (-not (Get-SmbShare -Name "home$" -ErrorAction SilentlyContinue)) {
    New-SmbShare -Name "home$" -Path "C:\\home" -FullAccess "Authenticated Users"
}
if (-not (Get-SmbShare -Name "profiles$" -ErrorAction SilentlyContinue)) {
    New-SmbShare -Name "profiles$" -Path "C:\\profiles" -FullAccess "Authenticated Users"
}

# 2. NTFS opravneni pro koren C:\\home (Authenticated Users jen pruchod touto slozkou, zadne dedeni)
icacls "C:\\home" /inheritance:r /grant:r "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F" "*S-1-5-11:(RX)"

# 3. NTFS opravneni pro koren C:\\profiles (CREATOR OWNER izoluje profily uzivatelu mezi sebou)
icacls "C:\\profiles" /inheritance:r /grant:r "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F" "*S-1-3-0:(OI)(CI)(IO)F" "*S-1-5-11:(RD,AD,X,RA,REA,RC)"

# 4. Vytvoreni osobnich podslozek v C:\\home a nastaveni HomeDrive / HomeDirectory / ProfilePath vsem 10 uzivatelum
$adUsers = Get-ADUser -Filter * -SearchBase "OU=Skola,$baseDN"
foreach ($u in $adUsers) {
    $sam = $u.SamAccountName
    $userSid = "*$($u.SID.Value)"
    $homeLocal = "C:\\home\\$sam"

    New-Item -Path $homeLocal -ItemType Directory -Force | Out-Null
    icacls $homeLocal /inheritance:r /grant:r "*S-1-5-18:(OI)(CI)F" "*S-1-5-32-544:(OI)(CI)F" "\${userSid}:(OI)(CI)F"

    Set-ADUser -Identity $sam \`
        -HomeDrive "H:" \`
        -HomeDirectory ('\\\\SRV1-DC\\home$\\' + $sam) \`
        -ProfilePath ('\\\\SRV1-DC\\profiles$\\' + $sam)
}`;
    },
    verify: (vm, wsX) => {
      return `Get-SmbShare -Name "home$", "profiles$" | Select-Object Name, Path
Get-ADUser -Identity "eva.student" -Properties HomeDrive, HomeDirectory, ProfilePath | Select-Object SamAccountName, HomeDrive, HomeDirectory, ProfilePath
icacls "C:\\profiles"
icacls "C:\\home\\eva.student"`;
    },
    expected: (vm, wsX) => {
      return `home$     C:\\home\nprofiles$ C:\\profiles\neva.student H: \\\\SRV1-DC\\home$\\eva.student \\\\SRV1-DC\\profiles$\\eva.student\nicacls C:\\profiles zobrazuje SYSTEM, Administrators, CREATOR OWNER (OI)(CI)(IO)(F) a Authenticated Users pouze na korenovou slozku`;
    }
  },
  {
    id: "domain-join-pc1",
    title: "6. Připojení stanice PC1-WIN do domény a restart (PC1-WIN)",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `
        <p>Připojte klientskou stanici <strong>PC1-WIN</strong> do domény <code>&lt;prijmeni&gt;.cyberschool.internal</code>. Před připojením musí na rozhraní <code>Ethernet1</code> směřovat DNS na <code>192.168.${x}.10</code> a rozdíl času oproti SRV1-DC nesmí přesáhnout 5 minut (Kerberos).</p>
        <p>K ověření připojení použijte doménový účet <code>Administrator</code> (<code>Pa55w.rd</code>). Po dokončení se počítač automaticky restartuje.</p>
      `;
    },
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Kontrola, ze DNS na Ethernet1 miri na SRV1-DC (192.168.${x}.10) a ze rozhrani ma prioritu:
Set-NetIPInterface -InterfaceAlias "Ethernet1" -InterfaceMetric 10
if (Get-NetAdapter -Name "Ethernet0" -ErrorAction SilentlyContinue) {
    Set-NetIPInterface -InterfaceAlias "Ethernet0" -InterfaceMetric 50
}
Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4

# 2. Dosadte sve prijmeni bez diakritiky a overte SRV zaznam radice domeny:
$domain = "<prijmeni>.cyberschool.internal"
Resolve-DnsName -Name "_ldap._tcp.dc._msdcs.$domain" -Type SRV

# 3. Pripojeni do domeny a restart (po vyzve zadejte Administrator / Pa55w.rd):
if (-not (Get-CimInstance Win32_ComputerSystem).PartOfDomain) {
    $cred = Get-Credential "$domain\\Administrator"
    Add-Computer -DomainName $domain -Credential $cred -Restart
} else {
    Write-Host "PC1-WIN jiz je v domene."
}`;
    },
    verify: (vm, wsX) => {
      return `Get-CimInstance Win32_ComputerSystem | Select-Object Name, Domain, PartOfDomain`;
    },
    expected: (vm, wsX) => {
      return `Name    Domain                          PartOfDomain\n----    ------                          ------------\nPC1-WIN <prijmeni>.cyberschool.internal         True`;
    }
  },
  {
    id: "ad-move-pc1-ou",
    title: "7. Přesun počítačového objektu PC1-WIN do OU Klienti-Ucebny (SRV1-DC)",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Nově připojený počítač se ve výchozím nastavení vždy objeví v obecném kontejneru <code>Computers</code>. Na kontejnery ale nelze přímo navázat GPO.</p>
        <p>Přesuňte počítačový objekt <code>PC1-WIN</code> z <code>CN=Computers</code> do cílové organizační jednotky <code>Skola\\Pocitace\\Klienti-Ucebny</code>.</p>
      `;
    },
    how: (vm, wsX) => {
      return `$baseDN = (Get-ADDomain).DistinguishedName
$targetOU = "OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,$baseDN"
$pc = Get-ADComputer -Identity "PC1-WIN"
if ($pc.DistinguishedName -ine "CN=PC1-WIN,$targetOU") {
    $pc | Move-ADObject -TargetPath $targetOU
}`;
    },
    verify: (vm, wsX) => {
      return `Get-ADComputer -Identity "PC1-WIN" | Select-Object Name, DistinguishedName`;
    },
    expected: (vm, wsX) => {
      return `Name    DistinguishedName\n----    -----------------\nPC1-WIN CN=PC1-WIN,OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,DC=<prijmeni>,DC=cyberschool,DC=internal`;
    }
  },
  {
    id: "verify-logons-home-roaming",
    title: "8. Ověření přihlášení postav, disku H: a kočovného profilu (PC1-WIN + SRV1-DC)",
    forVMs: ["PC1-WIN", "SRV1-DC"],
    what: (vm, wsX) => {
      if (vm === "PC1-WIN") {
        return `
          <p>Po restartu stanice <strong>PC1-WIN</strong> otestujte interaktivní přihlášení různých rolí (klávesa <em>Jiný uživatel / Other user</em>, heslo vždy <code>Pa55w.rd</code>):</p>
          <ol>
            <li>Přihlaste se jako <code>eva.student@&lt;prijmeni&gt;.cyberschool.internal</code> &rarr; v Průzkumníku ověřte připojený síťový disk <code>H:</code>, zkuste do něj zapsat textový soubor a poté se <strong>řádně odhlaste (Sign out)</strong>, aby se na server SRV1-DC zapsal kočovný profil <code>eva.student.V6</code>!</li>
            <li>Postupně se přihlaste jako <code>lucie.student</code>, <code>jana.teacher</code> a <code>karel.zamestnanec</code> (vždy ověřte <code>whoami</code>).</li>
            <li>Přihlaste se jako <code>tomas.student</code> a pokuste se otevřít cestu <code>\\\\SRV1-DC\\home$\\eva.student</code> &rarr; musí skončit chybou <strong>Přístup odepřen (Access is denied)</strong>.</li>
            <li>Nakonec se přihlaste jako doménový <code>Administrator@&lt;prijmeni&gt;.cyberschool.internal</code> a ověřte účet <code>eva.student</code>.</li>
          </ol>
        `;
      } else {
        return `
          <p>Poté, co se uživatelka <code>eva.student</code> alespoň jednou přihlásila na <strong>PC1-WIN</strong> a <strong>odhlásila (Sign out)</strong>, ověřte na serveru <strong>SRV1-DC</strong>, že Windows automaticky vytvořil její složku kočovného profilu v <code>C:\\profiles</code> (např. <code>eva.student.V6</code>).</p>
        `;
      }
    },
    how: (vm, wsX) => {
      if (vm === "PC1-WIN") {
        return `# 1. Po prihlaseni jako Eva zkontrolujte identitu a zapis na disk H::
whoami
New-Item -Path "H:\\test-eva.txt" -ItemType File -Value "Test zapisu" -Force
Get-Content "H:\\test-eva.txt"
# Pote se z PC1-WIN odhlaste (Sign out), aby vznikl kocovny profil eva.student.V6!

# 2. Jako Tomas vyzkousejte cteni cizi domovské slozky (musi selhat s Access denied):
Get-ChildItem "\\\\SRV1-DC\\home$\\eva.student"

# 3. Jako Administrator overte profilovy atribut a ucty:
net user eva.student /domain`;
      } else {
        return `# Na SRV1-DC (az po odhlaseni eva.student z PC1-WIN!):
Get-ChildItem -Path "C:\\profiles" | Select-Object Name, LastWriteTime`;
      }
    },
    verify: (vm, wsX) => {
      if (vm === "PC1-WIN") {
        return `cmd.exe /c "net user eva.student /domain" | Select-String -Pattern "User name|Home directory|User profile"`;
      } else {
        return `Get-ChildItem -Path "C:\\profiles" | Select-Object Name`;
      }
    },
    expected: (vm, wsX) => {
      if (vm === "PC1-WIN") {
        return `User name                    eva.student\nUser profile                 \\\\SRV1-DC\\profiles$\\eva.student\nHome directory               \\\\SRV1-DC\\home$\\eva.student`;
      } else {
        return `Name\n----\neva.student.V6`;
      }
    }
  },
  {
    id: "check-srv1-dc",
    title: "9. (Nepovinné) Rychlé ověření celého stroje SRV1-DC",
    forVMs: ["SRV1-DC"],
    what: (vm, wsX) => {
      return `
        <p>Interaktivní auditovací skript pro automatické prověření kompletní struktury Active Directory, všech 17 OU, 14 skupin a vnoření, 10 účtů, sdílení <code>home$</code>/<code>profiles$</code>, NTFS oprávnění i umístění <code>PC1-WIN</code> na <strong>SRV1-DC</strong>. Skript je <strong>striktně read-only</strong>, nic v systému nemění a po dokončení se sám uklidí.</p>
        <p>Příkaz lze spustit v <strong>PowerShellu, CMD i Terminálu</strong>:</p>
      `;
    },
    how: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/04_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/04_check_SRV1-DC.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      return `Všechny testované položky zakončeny stavem [ OK ] bez chyb.`;
    }
  },
  {
    id: "check-pc1-win",
    title: "10. (Nepovinné) Rychlé ověření celého stroje PC1-WIN",
    forVMs: ["PC1-WIN"],
    what: (vm, wsX) => {
      return `
        <p>Interaktivní auditovací skript pro automatické prověření členství v doméně, DNS nastavení na <code>Ethernet1</code>, lokálních důkazů přihlášení uživatelů, přístupu na <code>home$</code> a kočovného profilu na stanici <strong>PC1-WIN</strong>. Skript je <strong>striktně read-only</strong>, nic v systému nemění a po dokončení se sám uklidí.</p>
        <p>Příkaz lze spustit v <strong>PowerShellu, CMD i Terminálu</strong>:</p>
      `;
    },
    how: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/04_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    verify: (vm, wsX) => {
      return `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/04_check_PC1-WIN.bat -o check.bat; .\\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`;
    },
    expected: (vm, wsX) => {
      return `Všechny testované položky zakončeny stavem [ OK ] bez chyb.`;
    }
  }
];
