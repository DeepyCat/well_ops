<#
.SYNOPSIS
    Dokumentacni skript - Krok 2/2: PC1-WIN (Modul 04: Active Directory).
    Zaznamena stav klienta PC1-WIN (domena, prihlaseni postav, home$, roaming profil) a odesle data pro Discord bota.

.DESCRIPTION
    Tento skript:
    1. Vyzada Discord username studenta (stejne jako v Kroku 1/2 na SRV1-DC).
    2. Autodetekuje pracoviste N a domenu z Win32_ComputerSystem a Ethernet1.
    3. Zachyti vsechny vystupy pro PC1-WIN:
       - M4-PC1.V0-O (Otisk)
       - M4-PC1.V1-D1 (Win32_ComputerSystem - clenstvi v domene)
       - M4-PC1.V5-D1..D4 (overeni uctu a identity eva.student, lucie.student, jana.teacher, karel.zamestnanec)
       - M4-PC1.V6-D1..D2 (zapis eva.student do \\SRV1-DC\home$\eva.student a odepreni zapisu pro tomas.student)
       - M4-PC1.V9-D1 (net user eva.student /domain)
       - M4-PC1.P1..P3 (postup pripojeni, presunu do OU a prihlaseni)
    4. Odesle JSON prilohu pres Discord Webhook ke spojeni s Krokem 1 (SRV1-DC).
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
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace PC1-WIN - Modul 04 (Krok 2/2)"

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

function Invoke-ProbeAsDomainUser {
    param(
        [string]$NetBiosDomain,
        [string]$Sam,
        [string]$Password,
        [string]$ProbeDir,
        [string]$InnerScriptTemplate
    )

    $outPath = Join-Path $ProbeDir ("probe_" + $Sam + "_" + [Guid]::NewGuid().ToString("N") + ".txt")
    $scriptText = $InnerScriptTemplate.Replace("__OUTPATH__", $outPath).Replace("__SAM__", $Sam)
    $encoded = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($scriptText))

    $secPass = ConvertTo-SecureString $Password -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential("$NetBiosDomain\$Sam", $secPass)

    try {
        $proc = Start-Process -FilePath "powershell.exe" `
            -ArgumentList @("-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", $encoded) `
            -Credential $cred `
            -WorkingDirectory $ProbeDir `
            -WindowStyle Hidden `
            -PassThru `
            -ErrorAction Stop

        if (-not $proc.WaitForExit(20000)) {
            try { $proc.Kill() } catch {}
            return @{ Success = $false; Output = ""; Error = "Timeout pri spusteni procesu jako $NetBiosDomain\$Sam" }
        }

        if (Test-Path $outPath) {
            $content = [System.IO.File]::ReadAllText($outPath, (New-Object System.Text.UTF8Encoding($false)))
            Remove-Item -Path $outPath -Force -ErrorAction SilentlyContinue
            return @{ Success = $true; Output = $content.TrimEnd(); Error = "" }
        } else {
            return @{ Success = $false; Output = ""; Error = "Proces skoncil s kodem $($proc.ExitCode), vystup nevznikl." }
        }
    } catch {
        return @{ Success = $false; Output = ""; Error = $_.Exception.Message }
    }
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Spustte skript v PowerShellu jako Spravce (Run as Administrator)." -ForegroundColor Red
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Header "WELL_OPS :: Dokumentace PC1-WIN - Modul 04 (Krok 2/2)"

# ------------------------------------------------------------
# 1. Identifikace studenta pro spojeni s Krokem 1
# ------------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($DiscordUser)) {
    Write-Host ""
    Write-Host "Zadejte stejne Discord uzivatelske jmeno jako na serveru SRV1-DC:" -ForegroundColor Yellow
    Write-Host "  Tip: Svuj presny Discord username zjistite na Discordu prikazem /moje-id" -ForegroundColor DarkGray
    $DiscordUser = Read-Host "  Vase Discord uzivatelske jmeno (bez @)"
}
$targetDiscord = ($DiscordUser -replace '^@', '').Trim()
if ([string]::IsNullOrWhiteSpace($targetDiscord)) {
    Write-Host "[CHYBA] Nebylo zadano Discord uzivatelske jmeno." -ForegroundColor Red
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

# ------------------------------------------------------------
# 2. Detekce domeny a pracoviste
# ------------------------------------------------------------
$eth1IP = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if (($WorkspaceX -eq 0) -and ($eth1IP -match "^192\.168\.(\d+)\.")) {
    $WorkspaceX = [int]$matches[1]
}
if ($WorkspaceX -le 0) {
    $inputX = Read-Host "  Cislo vaseho pracoviste N [vychozi: 2]"
    if ((-not [string]::IsNullOrWhiteSpace($inputX)) -and ($inputX.Trim() -match "^\d+$")) {
        $WorkspaceX = [int]$inputX.Trim()
    } else {
        $WorkspaceX = 2
    }
}

try {
    $cs = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
    $partOfDomain = [bool]$cs.PartOfDomain
    $domain = [string]$cs.Domain
    $computerName = [string]$cs.Name
} catch {
    Report-Step "FAIL" "Nelze nacist Win32_ComputerSystem: $($_.Exception.Message)"
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

if ((-not $partOfDomain) -or ([string]::IsNullOrWhiteSpace($domain)) -or ($domain -ieq "WORKGROUP")) {
    Report-Step "FAIL" "PC1-WIN neni clenem zadne Active Directory domeny (Domain: $domain, PartOfDomain: $partOfDomain)."
    Write-Host "  Nejprve PC1-WIN pripojte do domeny a restartujte." -ForegroundColor Yellow
    Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

$nbDomain = $env:USERDOMAIN
if ([string]::IsNullOrWhiteSpace($nbDomain) -or ($nbDomain -ieq $env:COMPUTERNAME)) {
    try {
        $ntDom = Get-CimInstance Win32_NTDomain -ErrorAction SilentlyContinue | Where-Object { (-not [string]::IsNullOrWhiteSpace($_.DomainName)) -and (($_.DnsForestName -ieq $domain) -or ($_.DomainName -ieq $domain.Split('.')[0])) } | Select-Object -First 1
        if ($null -ne $ntDom) {
            $nbDomain = [string]$ntDom.DomainName
        } else {
            $nbDomain = $domain.Split('.')[0].ToUpper()
        }
    } catch {
        $nbDomain = $domain.Split('.')[0].ToUpper()
    }
}

Report-Step "OK" "Domena: $domain (NetBIOS: $nbDomain) | Stanice: $computerName | Pracoviste N=$WorkspaceX"

$dateStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$whoStr = (Invoke-ConsoleCmd "whoami").Trim()
$hostStr = (Invoke-ConsoleCmd "hostname").Trim()
$promptPrefix = "PS C:\Users\Administrator>"

# ------------------------------------------------------------
# 3. Sber overovacich vystupu (M4-PC1.V0 .. V9)
# ------------------------------------------------------------
Write-Host ""
Write-Host "Sbiram vystupy ze stanice PC1-WIN..." -ForegroundColor Cyan

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

$promptPrefix (Get-CimInstance Win32_ComputerSystem).Domain
$domain
"@.TrimEnd()
Report-Step "OK" "M4-PC1.V0-O: Otisk zachycen ($uuid)"

# V1-D1 Win32_ComputerSystem
$csText = ($cs | Format-List Name, Domain, PartOfDomain, Workgroup | Out-String).TrimEnd()
$v1d1Text = @"
$promptPrefix Get-CimInstance Win32_ComputerSystem | Format-List Name, Domain, PartOfDomain, Workgroup
$csText
"@.TrimEnd()
Report-Step "OK" "M4-PC1.V1-D1: Clenstvi v domene zachyceno"
Report-Step "MANUAL" "M4-PC1.V1-D2: Screenshot System Properties / About vlozite rucne v overeni.md"

# Priprava slozky pro izolovane sondy pod uzivateli (vyhneme se Windows Error 1219)
try {
    $seclogonSvc = Get-Service -Name seclogon -ErrorAction SilentlyContinue
    if (($null -ne $seclogonSvc) -and ($seclogonSvc.Status -ne "Running")) {
        Start-Service -Name seclogon -ErrorAction SilentlyContinue
    }
} catch {}

$probeDir = Join-Path "C:\Windows\Temp" ("well_ops_probe_" + [Guid]::NewGuid().ToString("N"))
New-Item -Path $probeDir -ItemType Directory -Force | Out-Null
& icacls.exe $probeDir /grant "*S-1-5-11:(OI)(CI)F" /Q | Out-Null

$v5Pass = "Pa55w.rd"
$v5Users = @("eva.student", "lucie.student", "jana.teacher", "karel.zamestnanec")
$v5Texts = @{}
$v5PassCount = 0

try {
    # V5-D1 .. V5-D4: Overeni prihlaseni / identity postav
    $v5Inner = @'
$w = (& whoami.exe) -join ""
$h = (& hostname.exe) -join ""
$p = "PS C:\Users\__SAM__>"
$txt = @"
$p whoami
$w

$p hostname
$h
"@
[System.IO.File]::WriteAllText("__OUTPATH__", $txt, (New-Object System.Text.UTF8Encoding($false)))
'@

    $pcCtx = $null
    try {
        Add-Type -AssemblyName System.DirectoryServices.AccountManagement -ErrorAction Stop
        $pcCtx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain, $domain)
    } catch {}

    foreach ($u in $v5Users) {
        $probe = Invoke-ProbeAsDomainUser -NetBiosDomain $nbDomain -Sam $u -Password $v5Pass -ProbeDir $probeDir -InnerScriptTemplate $v5Inner
        $profMatches = @(Get-CimInstance Win32_UserProfile -ErrorAction SilentlyContinue | Where-Object { (-not $_.Special) -and ($_.LocalPath -like "*\$u*") })
        $hasLocalProfile = ($profMatches.Count -gt 0)

        if ($probe.Success -and ($probe.Output -match [regex]::Escape($u))) {
            $v5Texts[$u] = $probe.Output
            $v5PassCount++
            if ($hasLocalProfile) {
                Report-Step "OK" "M4-PC1.V5 ($u): Token overen + mistni profil nalezen"
            } else {
                Report-Step "OK" "M4-PC1.V5 ($u): Token overen pres AD (pozn.: ucet zatim nemel lokalni desktop logon)"
            }
        } else {
            $authOk = $false
            if ($null -ne $pcCtx) {
                try { $authOk = $pcCtx.ValidateCredentials($u, $v5Pass) } catch {}
            }
            if ($authOk) {
                $v5Texts[$u] = "PS C:\Users\Administrator> [DirectoryServices.AccountManagement.PrincipalContext]`r`nValidateCredentials('$u'): True (Process logon fallback: $($probe.Error))"
                Report-Step "WARN" "M4-PC1.V5 ($u): AD heslo overeno, ale Start-Process -Credential selhal ($($probe.Error))"
            } else {
                $v5Texts[$u] = "CHYBA OVERENI UCET ${u}: $($probe.Error)"
                Report-Step "FAIL" "M4-PC1.V5 ($u): Prihlaseni nebo overeni hesla selhalo ($($probe.Error))"
            }
        }
    }

    # V6-D1: eva.student pristup a zapis do home$
    $v6EvaInner = @'
$p = "PS C:\Users\eva.student>"
$unc = "\\SRV1-DC\home$\eva.student"
$outLines = New-Object System.Collections.Generic.List[string]
$outLines.Add("$p net use")
$netBefore = (cmd.exe /c "net use 2>&1") -join "`r`n"
if ([string]::IsNullOrWhiteSpace($netBefore)) { $netBefore = "(zadne namapovane jednotky v teto relaci)" }
$outLines.Add($netBefore)
$outLines.Add("")

$hDrive = Get-PSDrive -Name "H" -ErrorAction SilentlyContinue
$hIsHome = ($null -ne $hDrive) -and ($hDrive.DisplayRoot -ieq $unc)
$mappedTempH = $false
if ($null -eq $hDrive) {
    & net.exe use H: $unc /persistent:no 2>&1 | Out-Null
    $hAfter = Get-PSDrive -Name "H" -ErrorAction SilentlyContinue
    if (($null -ne $hAfter) -and (Test-Path "H:\")) {
        $mappedTempH = $true
        $hIsHome = $true
    }
}

$targetRoot = if ($hIsHome -and (Test-Path "H:\")) { "H:\" } else { "$unc\" }
$outLines.Add("$p Test-Path `"$unc`"")
$exists = Test-Path $unc
$outLines.Add([string]$exists)
$outLines.Add("")
$testFile = Join-Path $targetRoot "test_eva_ops.txt"
$outLines.Add("$p `"test zapisu eva.student`" | Out-File `"$testFile`"")
try {
    "test zapisu eva.student" | Out-File -FilePath $testFile -Encoding utf8 -Force -ErrorAction Stop
    $readBack = (Get-Content -Path $testFile -ErrorAction Stop) -join ""
    $outLines.Add("Zapis OK: $readBack")
    Remove-Item -Path $testFile -Force -ErrorAction SilentlyContinue
    $outLines.Add("STATUS=WRITE_OK")
} catch {
    $outLines.Add("CHYBA ZAPISU: $($_.Exception.Message)")
    $outLines.Add("STATUS=WRITE_FAIL")
} finally {
    if ($mappedTempH) {
        & net.exe use H: /delete /y 2>&1 | Out-Null
    }
}
[System.IO.File]::WriteAllText("__OUTPATH__", ($outLines -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
'@

    $probeEvaHome = Invoke-ProbeAsDomainUser -NetBiosDomain $nbDomain -Sam "eva.student" -Password $v5Pass -ProbeDir $probeDir -InnerScriptTemplate $v6EvaInner
    $v6EvaOk = $false
    if ($probeEvaHome.Success -and ($probeEvaHome.Output -match "STATUS=WRITE_OK")) {
        $v6EvaOk = $true
        $v6d1Text = ($probeEvaHome.Output -replace "`r?`nSTATUS=WRITE_OK", "").TrimEnd()
        Report-Step "OK" "M4-PC1.V6-D1: eva.student zapsala a precetla soubor v \\SRV1-DC\home$\eva.student"
    } else {
        $v6d1Text = if (-not [string]::IsNullOrWhiteSpace($probeEvaHome.Output)) {
            ($probeEvaHome.Output -replace "`r?`nSTATUS=WRITE_FAIL", "").TrimEnd()
        } else {
            "CHYBA OVERENI HOME$ (eva.student): $($probeEvaHome.Error)"
        }
        Report-Step "FAIL" "M4-PC1.V6-D1: eva.student nemohla zapsat do sve domovske slozky ($($probeEvaHome.Error))"
    }

    # V6-D2: tomas.student odepreny pristup do slozky eva.student
    $v6TomasInner = @'
$p = "PS C:\Users\tomas.student>"
$unc = "\\SRV1-DC\home$\eva.student"
$outLines = New-Object System.Collections.Generic.List[string]
$outLines.Add("$p Get-ChildItem `"$unc`" -ErrorAction Stop")
$deniedRead = $false
$deniedWrite = $false
try {
    $items = Get-ChildItem -Path $unc -ErrorAction Stop
    $outLines.Add("POZOR: tomas.student precetl obsah slozky eva.student (pocet polozek: $(@($items).Count))!")
} catch {
    $msg = $_.Exception.Message
    $outLines.Add("Get-ChildItem : $msg")
    $isPermErr = ($_.Exception -is [System.UnauthorizedAccessException]) -or
        ($null -ne $_.Exception.InnerException -and $_.Exception.InnerException -is [System.UnauthorizedAccessException]) -or
        ($_.CategoryInfo.Category -eq [System.Management.Automation.ErrorCategory]::PermissionDenied) -or
        ($_.Exception.HResult -eq -2147024891) -or
        ($msg -match "denied|odep|PermissionDenied|0x80070005")
    if ($isPermErr) { $deniedRead = $true }
}
$outLines.Add("")
$outLines.Add("$p `"pokus`" | Out-File `"$unc\pokus_tomas.txt`" -ErrorAction Stop")
try {
    "pokus" | Out-File -FilePath "$unc\pokus_tomas.txt" -ErrorAction Stop
    $outLines.Add("CHYBA ZABEZPECENI: tomas.student uspesne zapsal do slozky eva.student!")
    Remove-Item -Path "$unc\pokus_tomas.txt" -Force -ErrorAction SilentlyContinue
} catch {
    $msg2 = $_.Exception.Message
    $outLines.Add("Out-File : $msg2")
    $isPermErr2 = ($_.Exception -is [System.UnauthorizedAccessException]) -or
        ($null -ne $_.Exception.InnerException -and $_.Exception.InnerException -is [System.UnauthorizedAccessException]) -or
        ($_.CategoryInfo.Category -eq [System.Management.Automation.ErrorCategory]::PermissionDenied) -or
        ($_.Exception.HResult -eq -2147024891) -or
        ($msg2 -match "denied|odep|PermissionDenied|0x80070005")
    if ($isPermErr2) { $deniedWrite = $true }
}
if ($deniedRead -and $deniedWrite) { $outLines.Add("STATUS=DENIED_OK") } else { $outLines.Add("STATUS=DENIED_FAIL") }
[System.IO.File]::WriteAllText("__OUTPATH__", ($outLines -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
'@

    $probeTomasHome = Invoke-ProbeAsDomainUser -NetBiosDomain $nbDomain -Sam "tomas.student" -Password $v5Pass -ProbeDir $probeDir -InnerScriptTemplate $v6TomasInner
    $v6TomasOk = $false
    if ($probeTomasHome.Success -and ($probeTomasHome.Output -match "STATUS=DENIED_OK")) {
        $v6TomasOk = $true
        $v6d2Text = ($probeTomasHome.Output -replace "`r?`nSTATUS=DENIED_OK", "").TrimEnd()
        Report-Step "OK" "M4-PC1.V6-D2: tomas.student ma spravne odepreny pristup do slozky eva.student"
    } else {
        $v6d2Text = if (-not [string]::IsNullOrWhiteSpace($probeTomasHome.Output)) {
            ($probeTomasHome.Output -replace "`r?`nSTATUS=DENIED_FAIL", "").TrimEnd()
        } else {
            "CHYBA TESTU HOME$ (tomas.student): $($probeTomasHome.Error)"
        }
        Report-Step "FAIL" "M4-PC1.V6-D2: Izolace domovskych slozek pro tomas.student neprosla ($($probeTomasHome.Error))"
    }
} finally {
    Remove-Item -Path $probeDir -Recurse -Force -ErrorAction SilentlyContinue
}

$v5Ok = ($v5PassCount -eq 4)
$v6Ok = ($v6EvaOk -and $v6TomasOk)

# V9-D1: net user eva.student /domain
$netUserOut = Invoke-ConsoleCmd "net user eva.student /domain"
$v9d1Text = @"
$promptPrefix net user eva.student /domain
$netUserOut
"@.TrimEnd()
if ($netUserOut -match 'profiles\$\\eva\.student') {
    Report-Step "OK" "M4-PC1.V9-D1: net user eva.student /domain obsahuje cestu ke kocovnemu profilu"
} else {
    Report-Step "WARN" "M4-PC1.V9-D1: Vystup net user zachycen, ale zkontrolujte radek User profile (ocekava se \\SRV1-DC\profiles$\eva.student)"
}

# ------------------------------------------------------------
# 4. Vygenerovani postupu (M4-PC1.P1 .. P3) podle skutecneho stavu
# ------------------------------------------------------------
$baseDnGuess = ($domain.Split('.') | ForEach-Object { "DC=$_" }) -join ","
$pcDn = "(neovereno pres ADSI)"
try {
    $searcher = [adsisearcher]"(&(objectClass=computer)(name=$computerName))"
    $compRes = $searcher.FindOne()
    if ($null -ne $compRes) {
        $pcDn = [string]$compRes.Properties["distinguishedname"][0]
    }
} catch {}

$p1Text = @"
Stanice PC1-WIN byla pripojena do domeny $domain (NetBIOS: $nbDomain):
- DNS na Ethernet1 bylo nasmerovano na SRV1-DC (192.168.$WorkspaceX.10).
- Pripojeni do domeny: Add-Computer -DomainName "$domain" -Credential (Get-Credential "$nbDomain\Administrator") -Restart -Force.
- Overeno po restartu: (Get-CimInstance Win32_ComputerSystem).PartOfDomain = $partOfDomain, Domain = $domain.
"@.TrimEnd()

$p2Text = @"
Pocitacovy ucet $computerName byl presunut z vychoziho kontejneru CN=Computers do cilove OU Klienti-Ucebny na SRV1-DC:
- Aktualni umisteni v AD: $pcDn
- Prikaz na SRV1-DC: Get-ADComputer "$computerName" | Move-ADObject -TargetPath "OU=Klienti-Ucebny,OU=Pocitace,OU=Skola,$baseDnGuess"
"@.TrimEnd()

$p3Text = @"
Na stanici PC1-WIN bylo otestovano domenove prihlaseni vsech 4 pozadovanych postav ($nbDomain\eva.student, lucie.student, jana.teacher, karel.zamestnanec):
- Vysledek automatickeho overeni domenoveho tokenu (Start-Process -Credential + whoami): $v5PassCount/4 uspesne.
- Zapis eva.student do domovske slozky H: / \\SRV1-DC\home$\eva.student: $v6EvaOk | Odepreni pristupu pro tomas.student: $v6TomasOk.
- Upozorneni: Pro vytvoreni kocovne slozky profilu eva.student.V6 na SRV1-DC musi byt provedeno minimalne jedno skutecne desktopove prihlaseni a odhlaseni jako eva.student na PC1-WIN.
"@.TrimEnd()

# ------------------------------------------------------------
# 5. Sestaveni a odeslani JSON payloadu na Discord
# ------------------------------------------------------------
$studentObj = [ordered]@{
    date         = (Get-Date).ToString("yyyy-MM-dd")
    workstationX = $WorkspaceX
    domain       = $domain
}
if (-not [string]::IsNullOrWhiteSpace($FullName))  { $studentObj.fullName  = $FullName }
if (-not [string]::IsNullOrWhiteSpace($ClassName)) { $studentObj.className = $ClassName }

$payload = [ordered]@{
    module        = "04"
    part          = "PC1"
    totalParts    = 2
    requiredParts = @("SRV1", "PC1")
    discordUser   = $targetDiscord
    timestamp     = $dateStr
    student       = $studentObj
    pc1_overeni   = [ordered]@{
        V0_otisk = $v0Text
        V1_d1    = $v1d1Text
        V5_d1    = $v5Texts["eva.student"]
        V5_d2    = $v5Texts["lucie.student"]
        V5_d3    = $v5Texts["jana.teacher"]
        V5_d4    = $v5Texts["karel.zamestnanec"]
        V5_ok    = $v5Ok
        V6_d1    = $v6d1Text
        V6_d2    = $v6d2Text
        V6_ok    = $v6Ok
        V9_d1    = $v9d1Text
    }
    pc1_postup    = [ordered]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
    }
}

$tmpDir = Join-Path $env:TEMP ("well_ops_doc_04_pc1_" + [Guid]::NewGuid().ToString("N"))
New-Item -Path $tmpDir -ItemType Directory -Force | Out-Null

$jsonPath = Join-Path $tmpDir "pc1_data.json"
$msgPath = Join-Path $tmpDir "payload.json"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

try {
    [System.IO.File]::WriteAllText($jsonPath, ($payload | ConvertTo-Json -Depth 10), $utf8NoBom)

    $discordMsg = [ordered]@{
        content = "[WELL_OPS_DOC] Modul 04 | Cast 2/2 (PC1-WIN) | Discord: $targetDiscord | Domena: $domain | Pracoviste N=$WorkspaceX"
    }
    [System.IO.File]::WriteAllText($msgPath, ($discordMsg | ConvertTo-Json -Depth 5), $utf8NoBom)

    Write-Host ""
    Write-Host "Odesilam data z PC1-WIN na Discord..." -ForegroundColor Cyan

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
            -F "file1=@$jsonPath;filename=pc1_data.json;type=application/json" `
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
            $multipart.Add($byteContent, "file1", "pc1_data.json")

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
            Write-Host "[HINT - DNS PREKLAD] Klient nemuze prelozit discord.com." -ForegroundColor Yellow
            Write-Host "Overte na SRV1-DC DNS Manager -> Forwarders (napr. 8.8.8.8) a internet na Ethernet0." -ForegroundColor White
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
Write-Host "  HOTOVO! KROK 2/2 NA PC1-WIN USPESNE ODESLAN!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host "  Bot vam nyni do DM posle kompletni ZIP archiv se soubory overeni.md a postup.md." -ForegroundColor Yellow
Write-Host "  Nezapomente rucne doplnit 3 screenshoty (M4-SRV1.V1-D2, M4-SRV1.V7-D2, M4-PC1.V1-D2)." -ForegroundColor Magenta
Write-Host ""
Write-Host "Stisknete ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
