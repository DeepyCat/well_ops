@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Dokumentacni skript - Krok 1/2: SRV1-DC (Modul 04: Active Directory).
    Zaznamena stav AD DS (OU, skupiny, ucty, home$, profiles$, PC1-WIN) a odesle data pro Discord bota.

.DESCRIPTION
    Tento skript:
    1. Vyzada jmeno studenta, tridu a Discord username.
    2. Autodetekuje pracoviste X a domenu z AD DS a Ethernet1.
    3. Zachyti vsechny vystupy pro SRV1-DC:
       - M4-SRV1.V0-O (Otisk)
       - M4-SRV1.V1-D1 (17 OU), M4-SRV1.V2-D1 (14 skupin)
       - M4-SRV1.V3-D1..D4 (clenstvi skupin)
       - M4-SRV1.V4-D1 (10 uzivatelu v OU Skola)
       - M4-SRV1.V6-D1..D2 (home$ + icacls + eva.student HomeDrive/HomeDirectory)
       - M4-SRV1.V7-D1 (umisteni PC1-WIN)
       - M4-SRV1.V8-D1 (zadny admin.juchelka / peclivy)
       - M4-SRV1.V9-D1..D3 (profiles$ + icacls + eva.student ProfilePath + C:\profiles)
       - M4-SRV1.P1..P8 (postup konfigurace)
    4. Odesle JSON prilohu pres Discord Webhook pro spojeni s Krokem 2 (PC1-WIN).
#>

param(
    [string]$FullName = "",
    [string]$ClassName = "",
    [string]$DiscordUser = "",
    [int]$WorkspaceX = 0,
    [string]$WebhookUrl = ""
)

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
    if (![string]::IsNullOrWhiteSpace($env:DOCS_WEBHOOK_URL)) {
        $WebhookUrl = $env:DOCS_WEBHOOK_URL
    } else {
        $hookKey = [System.Text.Encoding]::ASCII.GetBytes("well_ops_sec_2026")
        $hookBytes = [System.Convert]::FromBase64String("HxEYHCxVX1w7GhYAMEBUHFUYCEMNLwZfBDoRDQwwWUMdB0JSXFRrX0RLbkZRV2oBBgAEQEpZXQlYXQk1Qx8gCUZbV3EyIyIBKjtCRzpGIhctR2B1XEEDAj8UFzkJCDQNDh5beVVOQDUWJmpZHRYGRQklD2FgCkUDVQ==")
        for ($i = 0; $i -lt $hookBytes.Length; $i++) { $hookBytes[$i] = [byte]($hookBytes[$i] -bxor $hookKey[$i % $hookKey.Length]) }
        $WebhookUrl = [System.Text.Encoding]::ASCII.GetString($hookBytes)
    }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace SRV1-DC - Modul 04 (Krok 1/2)"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Report-Step {
    param([string]$Status, [string]$Message)
    $color = switch ($Status) {
        "OK"     { "Green" }
        "WARN"   { "Yellow" }
        "FAIL"   { "Red" }
        "MANUAL" { "Magenta" }
        default  { "Cyan" }
    }
    $tag = switch ($Status) {
        "OK"     { "[ OK ]  " }
        "WARN"   { "[KONTROLA]" }
        "FAIL"   { "[CHYBA] " }
        "MANUAL" { "[RUCNI] " }
        default  { "[INFO]  " }
    }
    Write-Host "  $tag $Message" -ForegroundColor $color
}

function Invoke-ConsoleCmd {
    param([string]$CommandLine)
    $origOut = [Console]::OutputEncoding
    try {
        $oemCP = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.OEMCodePage
        [Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding($oemCP)
    } catch {}
    try {
        $out = cmd.exe /c "$CommandLine 2>&1"
        if ($null -eq $out) { return "" }
        return (($out | ForEach-Object { $_.ToString() }) -join "`r`n").TrimEnd()
    } finally {
        [Console]::OutputEncoding = $origOut
    }
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Spustte skript v PowerShellu jako Spravce (Run as Administrator)." -ForegroundColor Red
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Header "WELL_OPS :: Dokumentace SRV1-DC - Modul 04 (Krok 1/2)"

# ------------------------------------------------------------
# 1. Udaje o studentovi
# ------------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($FullName)) {
    Write-Host ""
    Write-Host "Zadejte udaje pro hlavicku dokumentace:" -ForegroundColor Yellow
    $FullName = Read-Host "  1) Vase jmeno a prijmeni (napr. Jan Novak)"
}
if ([string]::IsNullOrWhiteSpace($FullName)) { $FullName = "Student Neznamy" }
$FullName = $FullName.Trim()

if ([string]::IsNullOrWhiteSpace($ClassName)) {
    $inputClass = Read-Host "  2) Trida [vychozi: T3A]"
    $ClassName = if (-not [string]::IsNullOrWhiteSpace($inputClass)) { $inputClass.Trim() } else { "T3A" }
}
if ([string]::IsNullOrWhiteSpace($ClassName)) { $ClassName = "T3A" }

$todayDate = (Get-Date).ToString("d. M. yyyy")
$inputDate = Read-Host "  3) Datum vypracovani [vychozi: $todayDate]"
$studentDate = if (-not [string]::IsNullOrWhiteSpace($inputDate)) { $inputDate.Trim() } else { $todayDate }

if ([string]::IsNullOrWhiteSpace($DiscordUser)) {
    Write-Host ""
    Write-Host "  Tip: Svuj presny Discord username zjistite na Discordu prikazem /moje-id" -ForegroundColor DarkGray
    $DiscordUser = Read-Host "  4) Vase Discord uzivatelske jmeno (bez @)"
}
$targetDiscord = ($DiscordUser -replace '^@', '').Trim()
if ([string]::IsNullOrWhiteSpace($targetDiscord)) {
    Write-Host "[CHYBA] Nebylo zadano Discord uzivatelske jmeno." -ForegroundColor Red
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

# ------------------------------------------------------------
# 2. Detekce pracoviste a domeny
# ------------------------------------------------------------
$detectedX = 2
$eth1IP = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if ($eth1IP -and ($eth1IP -match "^192\.168\.(\d+)\.")) {
    $detectedX = [int]$matches[1]
}
if ($WorkspaceX -le 0) {
    $inputX = Read-Host "  5) Cislo vaseho pracoviste N [vychozi: $detectedX]"
    if ((-not [string]::IsNullOrWhiteSpace($inputX)) -and ($inputX.Trim() -match "^\d+$")) {
        $WorkspaceX = [int]$inputX.Trim()
    } else {
        $WorkspaceX = $detectedX
    }
}

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    $adDomain = Get-ADDomain -ErrorAction Stop
    $baseDN = $adDomain.DistinguishedName
    $dnsRoot = $adDomain.DNSRoot
    $domainSID = $adDomain.DomainSID.Value
    Report-Step "OK" "Domena: $dnsRoot | Pracoviste N=$WorkspaceX"
} catch {
    Report-Step "FAIL" "Nelze nacist Active Directory: $($_.Exception.Message)"
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

try {
    $docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 4 Active Directory"
    if (-not (Test-Path -LiteralPath $docsDir)) {
        New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
    }
} catch {}

$dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$whoStr = (Invoke-ConsoleCmd "whoami").Trim()
$hostStr = (Invoke-ConsoleCmd "hostname").Trim()
$promptPrefix = "PS C:\Users\Administrator>"
$headerPrompt = "$promptPrefix Get-Date; whoami; hostname`r`n$dateStr`r`n$whoStr`r`n$hostStr"

# ------------------------------------------------------------
# 3. Sber overovacich vystupu (M4-SRV1.V0 .. V9)
# ------------------------------------------------------------
Write-Host ""
Write-Host "Sbiram vystupy Active Directory ze serveru SRV1-DC..." -ForegroundColor Cyan

# V0 Otisk
$uuid = (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID
$v0Text = @"
$promptPrefix Get-Date
$dateStr

$promptPrefix whoami
$whoStr

$promptPrefix hostname
$hostStr

$promptPrefix (Get-CimInstance Win32_ComputerSystemProduct).UUID
$uuid

$promptPrefix (Get-ADDomain).DNSRoot
$dnsRoot

$promptPrefix (Get-ADDomain).DomainSID.Value
$domainSID
"@
Report-Step "OK" "M4-SRV1.V0-O Otisk zachycen"

# V1-D1 OU strom
$v1Cmd = 'Get-ADOrganizationalUnit -Filter * | Select-Object Name, ProtectedFromAccidentalDeletion, DistinguishedName | Sort-Object DistinguishedName | Format-Table -AutoSize'
$v1Out = (Get-ADOrganizationalUnit -Filter * -Properties ProtectedFromAccidentalDeletion | Select-Object Name, ProtectedFromAccidentalDeletion, DistinguishedName | Sort-Object DistinguishedName | Format-Table -AutoSize | Out-String -Width 220).Trim()
$ouCount = @(Get-ADOrganizationalUnit -Filter *).Count
$v1d1Text = "$headerPrompt`r`n$promptPrefix $v1Cmd`r`n$v1Out`r`nCelkem OU: $ouCount"
Report-Step "OK" "M4-SRV1.V1-D1 Struktura OU ($ouCount OU)"
Report-Step "MANUAL" "M4-SRV1.V1-D2 Screenshot ADUC stromu OU Skola (vlozte rucne do overeni.md)"

# V2-D1 Skupiny v OU Skupiny
$skupinyDN = "OU=Skupiny,OU=Skola,$baseDN"
$v2Cmd = "Get-ADGroup -Filter * -SearchBase `"$skupinyDN`" | Select-Object Name, GroupScope, GroupCategory | Sort-Object Name | Format-Table -AutoSize"
$v2Out = (Get-ADGroup -Filter * -SearchBase $skupinyDN -ErrorAction SilentlyContinue | Select-Object Name, GroupScope, GroupCategory | Sort-Object Name | Format-Table -AutoSize | Out-String -Width 200).Trim()
$grpCount = @(Get-ADGroup -Filter * -SearchBase $skupinyDN -ErrorAction SilentlyContinue).Count
$v2d1Text = "$headerPrompt`r`n$promptPrefix $v2Cmd`r`n$v2Out`r`nCelkem skupin: $grpCount"
Report-Step "OK" "M4-SRV1.V2-D1 Skupiny v OU Skupiny ($grpCount skupin)"

# V3-D1..D4 Clenstvi
function Format-GroupMemberSection {
    param([string[]]$Names, [switch]$IncludeRecursive)
    $sb = New-Object System.Text.StringBuilder
    foreach ($gn in $Names) {
        try {
            $m = (Get-ADGroupMember -Identity $gn -ErrorAction Stop | Select-Object Name, SamAccountName, objectClass | Sort-Object Name | Format-Table -AutoSize | Out-String -Width 180).Trim()
            if ([string]::IsNullOrWhiteSpace($m)) { $m = "(zadni clenove)" }
            [void]$sb.AppendLine("$promptPrefix Get-ADGroupMember -Identity `"$gn`" | Select-Object Name, SamAccountName, objectClass")
            [void]$sb.AppendLine($m)
            [void]$sb.AppendLine("")
            if ($IncludeRecursive) {
                $mr = (Get-ADGroupMember -Identity $gn -Recursive -ErrorAction Stop | Select-Object Name, SamAccountName | Sort-Object Name | Format-Table -AutoSize | Out-String -Width 180).Trim()
                if ([string]::IsNullOrWhiteSpace($mr)) { $mr = "(zadni clenove)" }
                [void]$sb.AppendLine("$promptPrefix Get-ADGroupMember -Identity `"$gn`" -Recursive | Select-Object Name, SamAccountName")
                [void]$sb.AppendLine($mr)
                [void]$sb.AppendLine("")
            }
        } catch {
            [void]$sb.AppendLine("$promptPrefix Get-ADGroupMember -Identity `"$gn`"")
            [void]$sb.AppendLine("[CHYBA] $($_.Exception.Message)")
            [void]$sb.AppendLine("")
        }
    }
    return $sb.ToString().TrimEnd()
}

$v3d1Text = "$headerPrompt`r`n" + (Format-GroupMemberSection -Names @("GG_Ucitele", "GG_PK_Informatika", "GG_PK_Matematika"))
$v3d2Text = "$headerPrompt`r`n" + (Format-GroupMemberSection -Names @("GG_Zamestnanci") -IncludeRecursive)
$v3d3Text = "$headerPrompt`r`n" + (Format-GroupMemberSection -Names @("GG_Studenti") -IncludeRecursive)
$v3d4Text = "$headerPrompt`r`n" + (Format-GroupMemberSection -Names @("GG_Studenti_G8", "GG_Studenti_G4", "GG_Studenti_EL", "GG_Studenti_IT", "GG_Vedeni", "GG_THP", "GG_Sekretariat"))
Report-Step "OK" "M4-SRV1.V3-D1..D4 Clenstvi ve skupinach zachyceno"

# V4-D1 Ucty v OU Skola
$v4Cmd = "Get-ADUser -Filter * -SearchBase `"OU=Skola,$baseDN`" -Properties Enabled, UserPrincipalName | Select-Object Name, Enabled, DistinguishedName | Sort-Object Name | Format-Table -AutoSize"
$v4Out = (Get-ADUser -Filter * -SearchBase "OU=Skola,$baseDN" -Properties Enabled -ErrorAction SilentlyContinue | Select-Object Name, Enabled, DistinguishedName | Sort-Object Name | Format-Table -AutoSize | Out-String -Width 240).Trim()
$usrCount = @(Get-ADUser -Filter * -SearchBase "OU=Skola,$baseDN" -ErrorAction SilentlyContinue).Count
$v4d1Text = "$headerPrompt`r`n$promptPrefix $v4Cmd`r`n$v4Out`r`nCelkem uctu v OU Skola: $usrCount"
Report-Step "OK" "M4-SRV1.V4-D1 Uzivatelske ucty ($usrCount uctu)"

# V6-D1 home$ + SMB + NTFS ACL
$homeShareOut = (Get-SmbShare -Name "home$" -ErrorAction SilentlyContinue | Select-Object Name, Path, Description | Format-Table -AutoSize | Out-String -Width 180).Trim()
$homeAccessOut = (Get-SmbShareAccess -Name "home$" -ErrorAction SilentlyContinue | Select-Object Name, AccountName, AccessControlType, AccessRight | Format-Table -AutoSize | Out-String -Width 180).Trim()
$icaclsHomeRoot = Invoke-ConsoleCmd "icacls C:\home"
$icaclsEvaHome = Invoke-ConsoleCmd "icacls C:\home\eva.student"
$v6d1Text = @"
$headerPrompt
$promptPrefix Get-SmbShare -Name 'home$' | Select-Object Name, Path
$homeShareOut

$promptPrefix Get-SmbShareAccess -Name 'home$'
$homeAccessOut

$promptPrefix icacls C:\home
$icaclsHomeRoot

$promptPrefix icacls C:\home\eva.student
$icaclsEvaHome
"@

# V6-D2 eva.student HomeDrive & HomeDirectory
$v6d2Out = (Get-ADUser -Identity "eva.student" -Properties HomeDrive, HomeDirectory -ErrorAction SilentlyContinue | Select-Object SamAccountName, HomeDrive, HomeDirectory | Format-Table -AutoSize | Out-String -Width 180).Trim()
$v6d2Text = "$headerPrompt`r`n$promptPrefix Get-ADUser eva.student -Properties HomeDrive, HomeDirectory | Select-Object SamAccountName, HomeDrive, HomeDirectory`r`n$v6d2Out"
Report-Step "OK" "M4-SRV1.V6-D1..D2 Domovske slozky a ACL zachyceny"

# V7-D1 PC1-WIN umisteni v AD
$pc1Obj = Get-ADComputer -Filter "Name -eq 'PC1-WIN'" -ErrorAction SilentlyContinue
if ($null -ne $pc1Obj) {
    $v7Out = ($pc1Obj | Select-Object Name, Enabled, DistinguishedName | Format-Table -AutoSize | Out-String -Width 220).Trim()
    Report-Step "OK" "M4-SRV1.V7-D1 PC1-WIN nalezen: $($pc1Obj.DistinguishedName)"
} else {
    $v7Out = "[CHYBA] Pocitacovy objekt PC1-WIN nebyl v Active Directory nalezen."
    Report-Step "WARN" "M4-SRV1.V7-D1 PC1-WIN zatim neni v AD"
}
$v7d1Text = "$headerPrompt`r`n$promptPrefix Get-ADComputer -Identity 'PC1-WIN' | Select-Object Name, Enabled, DistinguishedName`r`n$v7Out"
Report-Step "MANUAL" "M4-SRV1.V7-D2 Screenshot ADUC s OU Klienti-Ucebny a objektem PC1-WIN (vlozte rucne do overeni.md)"

# V8-D1 Zadny personalizovany admin ucet
$badAdmins = @(Get-ADUser -Filter "SamAccountName -like '*juchelka*' -or SamAccountName -like '*peclivy*'" -ErrorAction SilentlyContinue)
if (@($badAdmins).Count -eq 0) {
    $v8Out = "(Prazdny vystup - zadny personalizovany admin ucet *juchelka* ani *peclivy* neexistuje, sprava probiha pres vestaveny Administrator.)"
    Report-Step "OK" "M4-SRV1.V8-D1 Zadny personalizovany admin ucet neexistuje"
} else {
    $v8Out = ($badAdmins | Select-Object Name, SamAccountName, DistinguishedName | Format-Table -AutoSize | Out-String -Width 200).Trim()
    Report-Step "FAIL" "M4-SRV1.V8-D1 Nalezen zakazany admin ucet!"
}
$v8d1Text = "$headerPrompt`r`n$promptPrefix Get-ADUser -Filter `"SamAccountName -like '*juchelka*' -or SamAccountName -like '*peclivy*'`"`r`n$v8Out"

# V9-D1..D3 Kocovne profily
$profShareOut = (Get-SmbShare -Name "profiles$" -ErrorAction SilentlyContinue | Select-Object Name, Path, Description | Format-Table -AutoSize | Out-String -Width 180).Trim()
$profAccessOut = (Get-SmbShareAccess -Name "profiles$" -ErrorAction SilentlyContinue | Select-Object Name, AccountName, AccessControlType, AccessRight | Format-Table -AutoSize | Out-String -Width 180).Trim()
$icaclsProfRoot = Invoke-ConsoleCmd "icacls C:\profiles"
$v9d1Text = @"
$headerPrompt
$promptPrefix Get-SmbShare -Name 'profiles$' | Select-Object Name, Path
$profShareOut

$promptPrefix Get-SmbShareAccess -Name 'profiles$'
$profAccessOut

$promptPrefix icacls C:\profiles
$icaclsProfRoot
"@

$v9d2Out = (Get-ADUser -Identity "eva.student" -Properties ProfilePath -ErrorAction SilentlyContinue | Select-Object SamAccountName, ProfilePath | Format-Table -AutoSize | Out-String -Width 180).Trim()
$v9d2Text = "$headerPrompt`r`n$promptPrefix Get-ADUser eva.student -Properties ProfilePath | Select-Object SamAccountName, ProfilePath`r`n$v9d2Out"

$profDirs = @(Get-ChildItem -Path "C:\profiles" -Directory -ErrorAction SilentlyContinue)
$evaProfExists = (@($profDirs | Where-Object { $_.Name -like "eva.student*" }).Count -gt 0)
$v9d3Out = (Get-ChildItem -Path "C:\profiles" -ErrorAction SilentlyContinue | Select-Object Name, Mode, LastWriteTime | Format-Table -AutoSize | Out-String -Width 180).Trim()
if ([string]::IsNullOrWhiteSpace($v9d3Out)) {
    $v9d3Out = "(Slozka C:\profiles je zatim prazdna - nejprve se na PC1-WIN prihlaste jako eva.student a odhlaste se!)"
}
$v9d3Text = "$headerPrompt`r`n$promptPrefix Get-ChildItem C:\profiles | Select-Object Name, Mode, LastWriteTime`r`n$v9d3Out"
if ($evaProfExists) {
    Report-Step "OK" "M4-SRV1.V9-D3 Slozka kocovneho profilu eva.student v C:\profiles existuje"
} else {
    Report-Step "WARN" "M4-SRV1.V9-D3 V C:\profiles zatim chybi eva.student.V6 (nejprve se jako eva.student odhlaste z PC1-WIN!)"
}

# ------------------------------------------------------------
# 4. Sestaveni procedur postup.md (M4-SRV1.P1 .. P8)
# ------------------------------------------------------------
$p1Text = @"
Na radici SRV1-DC v Active Directory (dsa.msc / PowerShell) zalozena korenova OU Skola pod $baseDN se zapnutou ochranou proti nechtenemu smazani (ProtectedFromAccidentalDeletion = True).
$promptPrefix Get-ADOrganizationalUnit -Identity "OU=Skola,$baseDN" | Select-Object Name, ProtectedFromAccidentalDeletion
"@

$p2Text = @"
Pod OU=Skola,$baseDN vytvoreno kompletni rozcleneni podle spravy a GPO (celkem 16 OU pod Skola + Domain Controllers = 17 OU):
- Zamestnanci (Ucitele, Vedeni, THP)
- Studenti (Gymnazium-8lete, Gymnazium-4lete, Elektrotechnika, Informatika)
- Pocitace (Servery, Klienti-Ucebny, Klienti-Kancelare)
- Skupiny, Sluzebni-ucty
Vsechny OU maji ProtectedFromAccidentalDeletion = True.
"@

$p3Text = @"
V OU=Skupiny,OU=Skola,$baseDN zalozeno vsech 14 bezpecnostnich skupin s rozsahem Global a typem Security:
GG_Studenti, GG_Studenti_G8, GG_Studenti_G4, GG_Studenti_EL, GG_Studenti_IT, GG_Ucitele, GG_Zamestnanci, GG_Vedeni, GG_THP, GG_Sekretariat, GG_PK_Matematika, GG_PK_Informatika, GG_PK_Jazyky, GG_IT-Sprava.
"@

$p4Text = @"
Provedeno vnoreni skupin podle principu AGDLP:
- Do GG_Studenti vnoreny oborove skupiny: GG_Studenti_G8, GG_Studenti_G4, GG_Studenti_EL, GG_Studenti_IT.
- Do GG_Zamestnanci vnoreny skupiny: GG_Ucitele, GG_THP, GG_Vedeni.
"@

$p5Text = @"
Vytvoreno 10 uzivatelskych uctu v odpovidajicich OU (jana.teacher, petr.teacher, karel.zamestnanec, marie.zamestnanec, lucie.student, ondrej.student, adam.student, klara.student, tomas.student, eva.student).
Vsem nastaveno UPN <ucet>@$dnsRoot, heslo Pa55w.rd, Enabled = True a ChangePasswordAtLogon = False. Zadny personalizovany admin ucet nebyl vytvoren (administrace pres Administrator).
"@

$p6Text = @"
Uzivatele zarazeni pouze do nejmensich odpovidajicich skupin:
- jana.teacher -> GG_Ucitele, GG_PK_Informatika
- petr.teacher -> GG_Ucitele, GG_PK_Matematika
- karel.zamestnanec -> GG_Vedeni
- marie.zamestnanec -> GG_THP, GG_Sekretariat
- lucie.student, ondrej.student -> GG_Studenti_G8
- adam.student, klara.student -> GG_Studenti_G4
- tomas.student -> GG_Studenti_EL
- eva.student -> GG_Studenti_IT
"@

$p7Text = @"
Na SRV1-DC vytvorena slozka C:\home a skryte sdileni home$ (Full Access pro Authenticated Users), podslozky C:\home\<ucet> s izolovanymi NTFS pravy (dedicnost vypnuta, pristup jen SYSTEM, Administrators a vlastnik). Vsem 10 uctum nastaveno HomeDrive = H: a HomeDirectory = \\SRV1-DC\home$\<ucet>.
"@

$p8Text = @"
Na SRV1-DC vytvorena slozka C:\profiles a skryte sdileni profiles$ (Full Access pro Authenticated Users). NTFS prava na korenu C:\profiles: SYSTEM a Administrators (OI)(CI)F, CREATOR OWNER (OI)(CI)(IO)F, Authenticated Users jen vypis a vytvoreni podslozky na teto slozce (bez dedeni). Vsem 10 uctum nastaveno ProfilePath = \\SRV1-DC\profiles$\<ucet>; podslozky profilu se vytvari automaticky pri prvnim odhlaseni z klienta.
"@

# ------------------------------------------------------------
# 5. Export JSON a odeslani na Discord Webhook
# ------------------------------------------------------------
$payload = [ordered]@{
    module       = "04"
    part         = "SRV1"
    totalParts   = 2
    requiredParts = @("SRV1", "PC1")
    discordUser  = $targetDiscord
    timestamp    = $dateStr
    student      = [ordered]@{
        fullName     = $FullName
        className    = $ClassName
        date         = $studentDate
        workstationX = $WorkspaceX
        domain       = $dnsRoot
    }
    srv1_overeni = [ordered]@{
        V0_otisk = $v0Text
        V1_d1    = $v1d1Text
        V2_d1    = $v2d1Text
        V3_d1    = $v3d1Text
        V3_d2    = $v3d2Text
        V3_d3    = $v3d3Text
        V3_d4    = $v3d4Text
        V4_d1    = $v4d1Text
        V6_d1    = $v6d1Text
        V6_d2    = $v6d2Text
        V7_d1    = $v7d1Text
        V8_d1    = $v8d1Text
        V9_d1    = $v9d1Text
        V9_d2    = $v9d2Text
        V9_d3    = $v9d3Text
        V9_d3_ok = $evaProfExists
    }
    srv1_postup  = [ordered]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
        P4 = $p4Text
        P5 = $p5Text
        P6 = $p6Text
        P7 = $p7Text
        P8 = $p8Text
    }
}

$tmpDir = Join-Path $env:TEMP ("well_ops_doc_04_srv1_" + [Guid]::NewGuid().ToString("N"))
New-Item -Path $tmpDir -ItemType Directory -Force | Out-Null

$jsonPath = Join-Path $tmpDir "srv1_data.json"
$msgPath = Join-Path $tmpDir "payload.json"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

try {
    [System.IO.File]::WriteAllText($jsonPath, ($payload | ConvertTo-Json -Depth 10), $utf8NoBom)

    $discordMsg = [ordered]@{
        content = "[WELL_OPS_DOC] Modul 04 | Cast 1/2 (SRV1-DC) | Student: $FullName ($ClassName) | Discord: $targetDiscord | Domena: $dnsRoot"
    }
    [System.IO.File]::WriteAllText($msgPath, ($discordMsg | ConvertTo-Json -Depth 5), $utf8NoBom)

    Write-Host ""
    Write-Host "Odesilam data ze SRV1-DC na Discord..." -ForegroundColor Cyan

    $sendOk = $false
    $httpCode = ""
    $responseBody = ""
    $curlExitCode = -1

    $curlExe = "curl.exe"
    $sys32Curl = Join-Path $env:SystemRoot "System32\curl.exe"
    if (Test-Path -LiteralPath $sys32Curl) { $curlExe = $sys32Curl }

    if (Get-Command $curlExe -ErrorAction SilentlyContinue) {
        $curlOut = & $curlExe -s -S -i -X POST `
            -F "payload_json=<$msgPath;type=application/json" `
            -F "file1=@$jsonPath;filename=srv1_data.json;type=application/json" `
            $WebhookUrl 2>&1
        $curlExitCode = $LASTEXITCODE
        $curlText = ($curlOut | ForEach-Object { $_.ToString() }) -join "`n"
        $statusMatches = [regex]::Matches($curlText, '(?m)^HTTP\/\S+\s+(\d{3})')
        if ($statusMatches.Count -gt 0) {
            $lastMatch = $statusMatches[$statusMatches.Count - 1]
            $httpCode = $lastMatch.Groups[1].Value
        }
        $responseBody = $curlText
        if (($curlExitCode -eq 0) -and ($httpCode -match "^2\d\d$")) {
            $sendOk = $true
        }
    }

    if (-not $sendOk) {
        try {
            Add-Type -AssemblyName System.Net.Http -ErrorAction Stop
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
            $handler = New-Object System.Net.Http.HttpClientHandler
            $client = New-Object System.Net.Http.HttpClient($handler)
            $client.Timeout = [TimeSpan]::FromSeconds(30)
            $multipart = New-Object System.Net.Http.MultipartFormDataContent

            $payloadJsonStr = [System.IO.File]::ReadAllText($msgPath, $utf8NoBom)
            $stringContent = New-Object System.Net.Http.StringContent($payloadJsonStr, $utf8NoBom, "application/json")
            $multipart.Add($stringContent, "payload_json")

            $fileBytes = [System.IO.File]::ReadAllBytes($jsonPath)
            $byteContent = New-Object System.Net.Http.ByteArrayContent(,$fileBytes)
            $byteContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/json")
            $multipart.Add($byteContent, "file1", "srv1_data.json")

            $resp = $client.PostAsync($WebhookUrl, $multipart).GetAwaiter().GetResult()
            $httpCode = [int]$resp.StatusCode
            $responseBody = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            if (($httpCode -ge 200) -and ($httpCode -lt 300)) {
                $sendOk = $true
            }
            $client.Dispose()
            $handler.Dispose()
        } catch {
            $responseBody = "$responseBody`nHttpClient fallback error: $($_.Exception.Message)"
        }
    }

    if (-not $sendOk) {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Red
        Write-Host "  CHYBA PRI ODESILANI NA DISCORD!" -ForegroundColor White
        Write-Host "============================================================" -ForegroundColor Red
        Write-Host "HTTP Status: $httpCode" -ForegroundColor Red
        Write-Host "Detail:      $responseBody" -ForegroundColor Red
        if ($curlExitCode -eq 6) {
            Write-Host ""
            Write-Host "[HINT - DNS PREKLAD] Server nemuze prelozit discord.com." -ForegroundColor Yellow
            Write-Host "Overte v DNS Manageru -> SRV1-DC -> Properties -> Forwarders (napr. 8.8.8.8) a internet na Ethernet0." -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
        [void][System.Console]::ReadLine()
        exit 1
    }
} finally {
    Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! KROK 1/2 NA SRV1-DC USPESNE ODESLAN!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host "  Dalsi krok:   Vyckejte v kanalu na zpravu '[KROK 1/2 PRIJAT]'" -ForegroundColor Yellow
Write-Host "                a potom spustte 04_doc_PC1-WIN na stanici PC1-WIN." -ForegroundColor White
Write-Host ""
Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
