<#
.SYNOPSIS
    Overovaci skript pro Modul 04: Active Directory (SRV1-DC).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit Active Directory domeny na radici SRV1-DC:
    - Predpoklady (hostname SRV1-DC, Ethernet1 IP, sluzby NTDS/ADWS/DNS/Netlogon/LanmanServer)
    - Struktura OU: 16 OU pod Skola (s ProtectedFromAccidentalDeletion) + Domain Controllers = 17 OU
    - Skupiny: 14 Global Security skupin v OU Skupiny a vnoreni GG_Studenti / GG_Zamestnanci
    - Ucty: 10 aktivnich uzivatelu ve spravnych OU, zadne personalizovane admin ucty (juchelka/peclivy)
    - Provizorni domovske slozky: sdileni home$, NTFS opravneni, H: a HomeDirectory na uctech
    - Kocovne profily: sdileni profiles$, NTFS opravneni (CREATOR OWNER), ProfilePath, slozka eva.student.V*
    - Pocitacovy objekt PC1-WIN v OU Klienti-Ucebny
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni SRV1-DC - Active Directory (Modul 04)"

$global:okCount = 0
$global:warnCount = 0
$global:failCount = 0

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "--- $Title ---" -ForegroundColor Yellow
}

function Report-Ok {
    param([string]$Message)
    Write-Host "  [ OK ]     $Message" -ForegroundColor Green
    $global:okCount++
}

function Report-Warn {
    param([string]$Message, [string]$Hint = "")
    Write-Host "  [KONTROLA] $Message" -ForegroundColor Yellow
    if ($Hint) { Write-Host "             -> $Hint" -ForegroundColor DarkYellow }
    $global:warnCount++
}

function Report-Fail {
    param([string]$Message, [string]$FixHint = "")
    Write-Host "  [CHYBA]    $Message" -ForegroundColor Red
    if ($FixHint) { Write-Host "             -> $FixHint" -ForegroundColor DarkRed }
    $global:failCount++
}

# Overeni prav spravce
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[!] POZOR: Skript nebezi jako Administrator!" -ForegroundColor Red
    Write-Host "    Spustte PowerShell jako Spravce (Run as Administrator)." -ForegroundColor Yellow
    exit 1
}

Write-Header "WELL_OPS :: Overeni SRV1-DC - Active Directory (Modul 04)"

# ------------------------------------------------------------
# 1. Zakladni system, sit a sluzby AD DS
# ------------------------------------------------------------
Write-Section "1. Zakladni system, sit a sluzby AD DS"

$pcName = $env:COMPUTERNAME
if ($pcName -eq "SRV1-DC") {
    Report-Ok "Hostname stroje je SRV1-DC"
} else {
    Report-Warn "Hostname je '$pcName' (ocekava se 'SRV1-DC')"
}

$detectedX = 2
$eth1IP = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if ($eth1IP -and ($eth1IP -match "^192\.168\.(\d+)\.")) {
    $detectedX = [int]$matches[1]
}
if ($WorkspaceX -le 0) {
    Write-Host "Zadejte cislo vaseho pracoviste (N) [vychozi: $detectedX]: " -ForegroundColor Yellow -NoNewline
    $wsInput = Read-Host
    if ((-not [string]::IsNullOrWhiteSpace($wsInput)) -and ($wsInput.Trim() -match "^\d+$")) {
        $WorkspaceX = [int]$wsInput.Trim()
    } else {
        $WorkspaceX = $detectedX
    }
}

$expectedServerIP = "192.168.$WorkspaceX.10"
if ($eth1IP -eq $expectedServerIP) {
    Report-Ok "Rozhrani Ethernet1 ma spravnou IPv4 adresu $eth1IP (Pracoviste N=$WorkspaceX)"
} elseif ($eth1IP) {
    Report-Fail "Rozhrani Ethernet1 ma IPv4 adresu $eth1IP (ocekavano $expectedServerIP pro N=$WorkspaceX)" "Nastavte statickou IP $expectedServerIP/24 na Ethernet1"
} else {
    Report-Fail "Rozhrani Ethernet1 nema IPv4 adresu" "Zkontrolujte sitovy adapter Ethernet1 (NIC 2)"
}

$eth1Dns = @((Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue).ServerAddresses)
if (($eth1Dns -contains "127.0.0.1") -or ($eth1Dns -contains $expectedServerIP)) {
    Report-Ok "DNS server na Ethernet1 miri na lokalni radic ($($eth1Dns -join ', '))"
} else {
    Report-Warn "DNS server na Ethernet1 je $($eth1Dns -join ', ') (doporuceno 127.0.0.1 nebo $expectedServerIP)" "Zkontrolujte nastaveni DNS na rozhrani Ethernet1"
}

foreach ($svcName in @("NTDS", "ADWS", "DNS", "Netlogon", "LanmanServer")) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if (($null -ne $svc) -and ($svc.Status -eq "Running")) {
        Report-Ok "Sluzba $svcName bezi (Running)"
    } else {
        Report-Fail "Sluzba $svcName nebezi" "Overte stav sluzby ve Services.msc nebo Get-Service $svcName"
    }
}

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    $adDomain = Get-ADDomain -ErrorAction Stop
    $baseDN = $adDomain.DistinguishedName
    $dnsRoot = $adDomain.DNSRoot
    $netbios = $adDomain.NetBIOSName
    Report-Ok "Domena Active Directory dostupna: $dnsRoot ($baseDN)"
} catch {
    Report-Fail "Nelze nacist modul nebo domenu Active Directory: $($_.Exception.Message)" "Overte, zda je SRV1-DC povysen na radic domeny"
    Write-Host ""
    Write-Host "Kontrola nemuze pokracovat bez dostupne AD DS." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# 2. M4-SRV1.V1: Struktura OU (17 OU + ochrana proti smazani)
# ------------------------------------------------------------
Write-Section "2. Struktura organizacnich jednotek (M4-SRV1.V1)"

$expectedOUs = @(
    "OU=Skola,$baseDN",
    "OU=Zamestnanci,OU=Skola,$baseDN",
    "OU=Ucitele,OU=Zamestnanci,OU=Skola,$baseDN",
    "OU=Vedeni,OU=Zamestnanci,OU=Skola,$baseDN",
    "OU=THP,OU=Zamestnanci,OU=Skola,$baseDN",
    "OU=Studenti,OU=Skola,$baseDN",
    "OU=Gymnazium-8lete,OU=Studenti,OU=Skola,$baseDN",
    "OU=Gymnazium-4lete,OU=Studenti,OU=Skola,$baseDN",
    "OU=Elektrotechnika,OU=Studenti,OU=Skola,$baseDN",
    "OU=Informatika,OU=Studenti,OU=Skola,$baseDN",
    "OU=Pocitace,OU=Skola,$baseDN",
    "OU=Servery,OU=Pocitace,OU=Skola,$baseDN",
    "OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,$baseDN",
    "OU=Klienti-Kancelare,OU=Pocitace,OU=Skola,$baseDN",
    "OU=Skupiny,OU=Skola,$baseDN",
    "OU=Sluzebni-ucty,OU=Skola,$baseDN",
    "OU=Domain Controllers,$baseDN"
)

$allOUs = @(Get-ADOrganizationalUnit -Filter * -Properties ProtectedFromAccidentalDeletion -ErrorAction SilentlyContinue)
$missingOUs = @()
$unprotectedOUs = @()

foreach ($ouDN in $expectedOUs) {
    $found = $allOUs | Where-Object { $_.DistinguishedName -ieq $ouDN } | Select-Object -First 1
    if (-not $found) {
        $missingOUs += $ouDN
    } elseif (-not ($ouDN -ieq "OU=Domain Controllers,$baseDN") -and -not $found.ProtectedFromAccidentalDeletion) {
        $unprotectedOUs += $ouDN
    }
}

if (@($missingOUs).Count -eq 0) {
    Report-Ok "Vsech 16 ocekavanych OU pod Skola i Domain Controllers existuje"
} else {
    Report-Fail "Chybi nasledujici OU: $($missingOUs -join '; ')" "Doplnte chybejici OU v presne hierarchii podle zadani"
}

if (@($allOUs).Count -eq 17) {
    Report-Ok "Celkovy pocet OU v domene je presne 17"
} else {
    Report-Warn "Celkovy pocet OU v domene je $(@($allOUs).Count) (ocekavano 17)" "Zkontrolujte, zda nevznikly nadbytecne nebo preklepnute OU"
}

if ((@($unprotectedOUs).Count -eq 0) -and (@($missingOUs).Count -eq 0)) {
    Report-Ok "Vsech 16 vytvorenych OU pod Skola ma zapnutou ochranu proti smazani (ProtectedFromAccidentalDeletion = True)"
} elseif (@($unprotectedOUs).Count -gt 0) {
    Report-Fail "Nektere OU pod Skola nemaji ochranu proti smazani: $($unprotectedOUs -join '; ')" "Nastavte Set-ADOrganizationalUnit -ProtectedFromAccidentalDeletion `$true"
}

# ------------------------------------------------------------
# 3. M4-SRV1.V2 & V3: Bezpecnostni skupiny a vnoreni
# ------------------------------------------------------------
Write-Section "3. Bezpecnostni skupiny a vnoreni (M4-SRV1.V2, M4-SRV1.V3)"

$skupinyDN = "OU=Skupiny,OU=Skola,$baseDN"
$expectedGroups = @(
    "GG_Studenti", "GG_Studenti_G8", "GG_Studenti_G4", "GG_Studenti_EL", "GG_Studenti_IT",
    "GG_Ucitele", "GG_Zamestnanci", "GG_Vedeni", "GG_THP", "GG_Sekretariat",
    "GG_PK_Matematika", "GG_PK_Informatika", "GG_PK_Jazyky", "GG_IT-Sprava"
)

$foundGroups = @(Get-ADGroup -Filter * -SearchBase $skupinyDN -ErrorAction SilentlyContinue)
$missingGroups = @()
$wrongScopeGroups = @()

foreach ($gName in $expectedGroups) {
    $gObj = $foundGroups | Where-Object { $_.Name -eq $gName } | Select-Object -First 1
    if (-not $gObj) {
        $missingGroups += $gName
    } elseif (($gObj.GroupScope -ne "Global") -or ($gObj.GroupCategory -ne "Security")) {
        $wrongScopeGroups += "$gName ($($gObj.GroupScope)/$($gObj.GroupCategory))"
    }
}

if (@($missingGroups).Count -eq 0) {
    Report-Ok "Vsech 14 skupin v OU Skola\Skupiny existuje"
} else {
    Report-Fail "V OU Skupiny chybi skupiny: $($missingGroups -join ', ')" "Zalozte chybejici skupiny v OU=Skupiny,OU=Skola"
}

if ((@($wrongScopeGroups).Count -eq 0) -and (@($missingGroups).Count -eq 0)) {
    Report-Ok "Vsech 14 skupin ma rozsah Global a typ Security"
} elseif (@($wrongScopeGroups).Count -gt 0) {
    Report-Fail "Skupiny se spatnym rozsahem/typem: $($wrongScopeGroups -join ', ')" "Vsechny skupiny musi byt Global Security"
}

function Test-GroupMembersExact {
    param(
        [string]$GroupName,
        [string[]]$ExpectedMembers,
        [switch]$Recursive
    )
    try {
        if ($Recursive) {
            $actual = @(Get-ADGroupMember -Identity $GroupName -Recursive -ErrorAction Stop | Select-Object -ExpandProperty SamAccountName | Sort-Object)
        } else {
            $actual = @(Get-ADGroupMember -Identity $GroupName -ErrorAction Stop | Select-Object -ExpandProperty SamAccountName | Sort-Object)
        }
        $exp = @($ExpectedMembers | Sort-Object)
        $tag = if ($Recursive) { " (rekurzivne)" } else { "" }
        if ($null -eq $actual) { $actual = @() }
        $diff = if ((@($actual).Count -eq 0) -and (@($exp).Count -gt 0)) {
            $exp
        } else {
            Compare-Object -ReferenceObject $exp -DifferenceObject @($actual)
        }
        if ($null -eq $diff) {
            Report-Ok "Clenstvi ${GroupName}${tag} odpovida: $($exp -join ', ')"
        } else {
            Report-Fail "Clenstvi ${GroupName}${tag} neodpovida (aktualne: $($actual -join ', '); ocekavano: $($exp -join ', '))" "Upravte cleny skupiny $GroupName"
        }
    } catch {
        Report-Fail "Nelze overit clenstvi skupiny ${GroupName}: $($_.Exception.Message)"
    }
}

Test-GroupMembersExact -GroupName "GG_Studenti" -ExpectedMembers @("GG_Studenti_G8", "GG_Studenti_G4", "GG_Studenti_EL", "GG_Studenti_IT")
Test-GroupMembersExact -GroupName "GG_Studenti" -ExpectedMembers @("adam.student", "eva.student", "klara.student", "lucie.student", "ondrej.student", "tomas.student") -Recursive
Test-GroupMembersExact -GroupName "GG_Zamestnanci" -ExpectedMembers @("GG_Ucitele", "GG_THP", "GG_Vedeni")
Test-GroupMembersExact -GroupName "GG_Zamestnanci" -ExpectedMembers @("jana.teacher", "karel.zamestnanec", "marie.zamestnanec", "petr.teacher") -Recursive
Test-GroupMembersExact -GroupName "GG_Ucitele" -ExpectedMembers @("jana.teacher", "petr.teacher")
Test-GroupMembersExact -GroupName "GG_PK_Informatika" -ExpectedMembers @("jana.teacher")
Test-GroupMembersExact -GroupName "GG_PK_Matematika" -ExpectedMembers @("petr.teacher")
Test-GroupMembersExact -GroupName "GG_Vedeni" -ExpectedMembers @("karel.zamestnanec")
Test-GroupMembersExact -GroupName "GG_THP" -ExpectedMembers @("marie.zamestnanec")
Test-GroupMembersExact -GroupName "GG_Sekretariat" -ExpectedMembers @("marie.zamestnanec")
Test-GroupMembersExact -GroupName "GG_Studenti_G8" -ExpectedMembers @("lucie.student", "ondrej.student")
Test-GroupMembersExact -GroupName "GG_Studenti_G4" -ExpectedMembers @("adam.student", "klara.student")
Test-GroupMembersExact -GroupName "GG_Studenti_EL" -ExpectedMembers @("tomas.student")
Test-GroupMembersExact -GroupName "GG_Studenti_IT" -ExpectedMembers @("eva.student")

# ------------------------------------------------------------
# 4. M4-SRV1.V4 & V8: Uzivatelske ucty a zadny admin.juchelka/peclivy
# ------------------------------------------------------------
Write-Section "4. Uzivatelske ucty a kontrola admin uctu (M4-SRV1.V4, M4-SRV1.V8)"

$expectedUsers = @(
    @{ Sam="jana.teacher";      ParentOU="OU=Ucitele,OU=Zamestnanci,OU=Skola,$baseDN" },
    @{ Sam="petr.teacher";      ParentOU="OU=Ucitele,OU=Zamestnanci,OU=Skola,$baseDN" },
    @{ Sam="karel.zamestnanec"; ParentOU="OU=Vedeni,OU=Zamestnanci,OU=Skola,$baseDN" },
    @{ Sam="marie.zamestnanec"; ParentOU="OU=THP,OU=Zamestnanci,OU=Skola,$baseDN" },
    @{ Sam="lucie.student";     ParentOU="OU=Gymnazium-8lete,OU=Studenti,OU=Skola,$baseDN" },
    @{ Sam="ondrej.student";    ParentOU="OU=Gymnazium-8lete,OU=Studenti,OU=Skola,$baseDN" },
    @{ Sam="adam.student";      ParentOU="OU=Gymnazium-4lete,OU=Studenti,OU=Skola,$baseDN" },
    @{ Sam="klara.student";     ParentOU="OU=Gymnazium-4lete,OU=Studenti,OU=Skola,$baseDN" },
    @{ Sam="tomas.student";     ParentOU="OU=Elektrotechnika,OU=Studenti,OU=Skola,$baseDN" },
    @{ Sam="eva.student";       ParentOU="OU=Informatika,OU=Studenti,OU=Skola,$baseDN" }
)

$allSkolaUsers = @(Get-ADUser -Filter * -SearchBase "OU=Skola,$baseDN" -Properties Enabled, HomeDrive, HomeDirectory, ProfilePath, pwdLastSet, UserPrincipalName -ErrorAction SilentlyContinue)
if (@($allSkolaUsers).Count -eq 10) {
    Report-Ok "V OU Skola je presne 10 uzivatelskych uctu"
} else {
    Report-Warn "V OU Skola je $(@($allSkolaUsers).Count) uctu (ocekavano 10)"
}

foreach ($eu in $expectedUsers) {
    $sam = $eu.Sam
    $uObj = $allSkolaUsers | Where-Object { $_.SamAccountName -eq $sam } | Select-Object -First 1
    if (-not $uObj) {
        Report-Fail "Uzivatel '$sam' v OU Skola neexistuje" "Zalozte ucet $sam v $($eu.ParentOU)"
        continue
    }
    $inExpectedOU = $uObj.DistinguishedName -like "*,$($eu.ParentOU)"
    $pwdChangeUnchecked = ($null -ne $uObj.pwdLastSet) -and ($uObj.pwdLastSet -ne 0)
    $upnOk = ($uObj.UserPrincipalName -ieq "$sam@$dnsRoot")
    if (($uObj.Enabled -eq $true) -and $inExpectedOU -and $pwdChangeUnchecked -and $upnOk) {
        Report-Ok "Ucet $sam je aktivni, ve spravne OU, s UPN $sam@$dnsRoot a nevyzaduje zmenu hesla"
    } else {
        $issues = @()
        if ($uObj.Enabled -ne $true) { $issues += "Enabled=$($uObj.Enabled)" }
        if (-not $inExpectedOU) { $issues += "spatna OU ($($uObj.DistinguishedName))" }
        if (-not $pwdChangeUnchecked) { $issues += "zapnuta vynucena zmena hesla (pwdLastSet=0)" }
        if (-not $upnOk) { $issues += "UPN=$($uObj.UserPrincipalName) (ocekavano $sam@$dnsRoot)" }
        Report-Fail "Ucet $sam ma problem: $($issues -join '; ')"
    }
}

$badAdmins = @(Get-ADUser -Filter "SamAccountName -like '*juchelka*' -or SamAccountName -like '*peclivy*'" -ErrorAction SilentlyContinue)
if (@($badAdmins).Count -eq 0) {
    Report-Ok "Zadny personalizovany admin ucet (*juchelka* / *peclivy*) neexistuje"
} else {
    Report-Fail "Nalezen zakazany personalizovany admin ucet: $(($badAdmins | Select-Object -ExpandProperty SamAccountName) -join ', ')" "Odstrante ucet; pouzivejte vyhradne vestaveny Administrator"
}

# ------------------------------------------------------------
# 5. M4-SRV1.V6: Provizorni domovske slozky (C:\home, home$, ACL, H:)
# ------------------------------------------------------------
Write-Section "5. Provizorni domovske slozky (M4-SRV1.V6)"

if (Test-Path "C:\home") {
    Report-Ok "Slozka C:\home existuje"
} else {
    Report-Fail "Slozka C:\home neexistuje" "Vytvorte slozku C:\home a nasdilejte ji jako home$"
}

$homeShare = Get-SmbShare -Name "home$" -ErrorAction SilentlyContinue
if (($null -ne $homeShare) -and ($homeShare.Path -ieq "C:\home")) {
    Report-Ok "Skryte SMB sdileni 'home$' existuje a miri na C:\home"
} else {
    Report-Fail "Skryte SMB sdileni 'home$' chybi nebo ma spatnou cestu" "Spustte: New-SmbShare -Name 'home$' -Path 'C:\home' -FullAccess 'Authenticated Users'"
}

$homeShareAccess = @(Get-SmbShareAccess -Name "home$" -ErrorAction SilentlyContinue)
$homeShareFull = $homeShareAccess | Where-Object { ($_.AccessRight -eq "Full") -and ($_.AccessControlType -eq "Allow") -and ($_.AccountName -match "Authenticated Users|Everyone|Vsichni|Overeni|Domain Users") }
if ($homeShareFull) {
    Report-Ok "Sdileni home$ ma povolena SMB prava Full pro Authenticated Users / Everyone"
} else {
    Report-Warn "Sdileni home$ nemusi mit Full Access na urovni SMB pro Authenticated Users" "Doporuceno: Share = Authenticated Users (Full) a omezit NTFS na podslozkach"
}

function Get-RuleSidValue {
    param($AccessRule)
    try {
        return $AccessRule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value
    } catch {
        return $AccessRule.IdentityReference.Value
    }
}

$homeAttrErrors = 0
$homeFolderErrors = 0
foreach ($eu in $expectedUsers) {
    $sam = $eu.Sam
    $uObj = $allSkolaUsers | Where-Object { $_.SamAccountName -eq $sam } | Select-Object -First 1
    if ($uObj) {
        $expHomeDir = "\\SRV1-DC\home$\$sam"
        $actualHome = if ($null -ne $uObj.HomeDirectory) { $uObj.HomeDirectory.TrimEnd('\') } else { "" }
        if (($uObj.HomeDrive -ne "H:") -or ($actualHome -ine $expHomeDir)) {
            Report-Fail "Ucet $sam nema spravne HomeDrive/HomeDirectory ($($uObj.HomeDrive) / $($uObj.HomeDirectory))" "Ocekavano: H: / $expHomeDir"
            $homeAttrErrors++
        }
    }
    $localHome = "C:\home\$sam"
    if (-not (Test-Path $localHome)) {
        Report-Fail "Podslozka $localHome na disku neexistuje" "Vytvorte $localHome a nastavte izolovane NTFS ACL pro $sam"
        $homeFolderErrors++
    } else {
        $acl = Get-Acl -Path $localHome
        $hasBroadUsers = $acl.Access | Where-Object {
            $sidVal = Get-RuleSidValue $_
            ($_.AccessControlType -eq "Allow") -and (($sidVal -in @("S-1-5-32-545", "S-1-5-11", "S-1-1-0")) -or ($_.IdentityReference -match "^(BUILTIN\\)?Users$|Authenticated Users|Everyone|Vsichni"))
        }
        $userSidVal = if ($uObj -and $uObj.SID) { $uObj.SID.Value } else { "" }
        $hasOwnerAccess = $acl.Access | Where-Object {
            $sidVal = Get-RuleSidValue $_
            ($_.AccessControlType -eq "Allow") -and ((($userSidVal -ne "") -and ($sidVal -eq $userSidVal)) -or ($_.IdentityReference -like "*\$sam"))
        }
        if ((-not $acl.AreAccessRulesProtected) -or $hasBroadUsers) {
            Report-Fail "Podslozka $localHome neni izolovana (dedi prava nebo povoluje pristup ostatnim uzivatelum)" "Pouzijte icacls `"$localHome`" /inheritance:r a ponechte pouze SYSTEM, Administrators a $sam"
            $homeFolderErrors++
        } elseif (-not $hasOwnerAccess) {
            Report-Fail "Podslozka $localHome nema opravneni pro uzivatele $sam"
            $homeFolderErrors++
        }
    }
}
if ($homeAttrErrors -eq 0) {
    Report-Ok "Vsech 10 uctu ma spravne nastaveno HomeDrive = H: a HomeDirectory = \\SRV1-DC\home$\<ucet>"
}
if ($homeFolderErrors -eq 0) {
    Report-Ok "Vsech 10 podslozek v C:\home existuje a ma izolovana NTFS opravneni (cizi uzivatel nema pristup)"
}

# ------------------------------------------------------------
# 6. M4-SRV1.V9: Kocovne profily (C:\profiles, profiles$, ACL, eva.student.V6)
# ------------------------------------------------------------
Write-Section "6. Kocovne profily (M4-SRV1.V9)"

if (Test-Path "C:\profiles") {
    Report-Ok "Slozka C:\profiles existuje"
} else {
    Report-Fail "Slozka C:\profiles neexistuje" "Vytvorte slozku C:\profiles a nasdilejte ji jako profiles$"
}

$profShare = Get-SmbShare -Name "profiles$" -ErrorAction SilentlyContinue
if (($null -ne $profShare) -and ($profShare.Path -ieq "C:\profiles")) {
    Report-Ok "Skryte SMB sdileni 'profiles$' existuje a miri na C:\profiles"
} else {
    Report-Fail "Skryte SMB sdileni 'profiles$' chybi nebo ma spatnou cestu" "Spustte: New-SmbShare -Name 'profiles$' -Path 'C:\profiles' -FullAccess 'Authenticated Users'"
}

if (Test-Path "C:\profiles") {
    $profAcl = Get-Acl -Path "C:\profiles"
    $hasBroadUsersInherited = $profAcl.Access | Where-Object {
        $sidVal = Get-RuleSidValue $_
        ($_.AccessControlType -eq "Allow") -and (($sidVal -eq "S-1-5-32-545") -or ($_.IdentityReference -match "^(BUILTIN\\)?Users$"))
    }
    $hasCreatorOwner = $profAcl.Access | Where-Object {
        $sidVal = Get-RuleSidValue $_
        ($_.AccessControlType -eq "Allow") -and (($sidVal -eq "S-1-3-0") -or ($_.IdentityReference -match "CREATOR OWNER"))
    }
    $hasAuthCreate = $profAcl.Access | Where-Object {
        $sidVal = Get-RuleSidValue $_
        ($_.AccessControlType -eq "Allow") -and (($sidVal -eq "S-1-5-11") -or ($_.IdentityReference -match "Authenticated Users")) -and ($_.InheritanceFlags -eq "None")
    }
    if (($profAcl.AreAccessRulesProtected) -and (-not $hasBroadUsersInherited) -and ($null -ne $hasCreatorOwner) -and ($null -ne $hasAuthCreate)) {
        Report-Ok "NTFS opravneni na C:\profiles jsou spravne izolovana (CREATOR OWNER + Authenticated Users jen na koren)"
    } else {
        Report-Warn "NTFS opravneni na C:\profiles neodpovidaji doporucene sablone pro kocovne profily" "Overte icacls C:\profiles (bez dedene skupiny Users, CREATOR OWNER (OI)(CI)(IO)F, Authenticated Users bez dedeni)"
    }
}

$profAttrErrors = 0
foreach ($eu in $expectedUsers) {
    $sam = $eu.Sam
    $uObj = $allSkolaUsers | Where-Object { $_.SamAccountName -eq $sam } | Select-Object -First 1
    if ($uObj) {
        $expProf = "\\SRV1-DC\profiles$\$sam"
        if ($uObj.ProfilePath -ine $expProf) {
            Report-Fail "Ucet $sam nema spravnou ProfilePath ($($uObj.ProfilePath))" "Ocekavano: $expProf"
            $profAttrErrors++
        }
    }
}
if ($profAttrErrors -eq 0) {
    Report-Ok "Vsech 10 uctu ma nastaveno ProfilePath = \\SRV1-DC\profiles$\<ucet>"
}

$evaProfFolders = @(Get-ChildItem -Path "C:\profiles" -Directory -Filter "eva.student*" -ErrorAction SilentlyContinue)
if (@($evaProfFolders).Count -gt 0) {
    Report-Ok "Kocovny profil eva.student existuje v C:\profiles: $(($evaProfFolders | Select-Object -ExpandProperty Name) -join ', ')"
} else {
    Report-Warn "V C:\profiles zatim neni slozka eva.student.V6" "Na PC1-WIN se prihlaste jako eva.student a pote se radne ODHLASITE (Sign out)"
}

# ------------------------------------------------------------
# 7. M4-SRV1.V7: Pocitacovy objekt PC1-WIN v OU Klienti-Ucebny
# ------------------------------------------------------------
Write-Section "7. Klientska stanice PC1-WIN v AD (M4-SRV1.V7)"

$pc1Obj = Get-ADComputer -Filter "Name -eq 'PC1-WIN'" -ErrorAction SilentlyContinue
if ($null -eq $pc1Obj) {
    Report-Fail "Pocitacovy objekt PC1-WIN v AD neexistuje" "Pripojte stanici PC1-WIN do domeny (Add-Computer)"
} elseif ($pc1Obj.DistinguishedName -ieq "CN=PC1-WIN,OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,$baseDN") {
    Report-Ok "Pocitacovy objekt PC1-WIN je ve spravne OU: $($pc1Obj.DistinguishedName)"
} else {
    Report-Fail "PC1-WIN je v nespravnem miste: $($pc1Obj.DistinguishedName)" "Presunte objekt do OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,$baseDN"
}

# ------------------------------------------------------------
# 8. Zaverecny souhrn
# ------------------------------------------------------------
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    VYSLEDNY SOUHRN                         " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Pocet uspesnych kontrol [ OK ]:       " -NoNewline
Write-Host ("{0,2}" -f $global:okCount) -ForegroundColor Green
Write-Host "  Pocet k rucni kontrole  [KONTROLA]:   " -NoNewline
Write-Host ("{0,2}" -f $global:warnCount) -ForegroundColor Yellow
Write-Host "  Pocet nalezenych chyb   [CHYBA]:      " -NoNewline
Write-Host ("{0,2}" -f $global:failCount) -ForegroundColor Red
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan

if (($global:failCount -eq 0) -and ($global:warnCount -eq 0)) {
    Write-Host ""
    Write-Host "VYSLEDEK: VSE V PORADKU! Server SRV1-DC splnuje vsechny pozadavky Modulu 04." -ForegroundColor Green
    Write-Host "Pokud mate overene i prihlaseni na PC1-WIN, muzete spustit dokumentaci." -ForegroundColor Gray
} elseif ($global:failCount -eq 0) {
    Write-Host ""
    Write-Host "VYSLEDEK: ZADNE ZAVAZNE CHYBY, ale zkontrolujte polozky [KONTROLA] ($($global:warnCount))." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA SERVERU SRV1-DC BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Opravte cervene polozky vyse a spustte skript znovu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
