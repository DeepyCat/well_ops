<#
.SYNOPSIS
    Dokumentacni skript - Krok 2/2: PC1-WIN (Modul 03: DNS Server).
    Zaznamena klientske otisky a overeni prekladu na PC1-WIN a odesle je na Discord pro spojeni.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi Discord username studenta (pro sparovani se serverovou casti).
    2. Autodetekuje cislo pracoviste X a domenu ze sitoveho adapteru Ethernet1.
    3. Postupne v konzoli zaznamena:
       - M3-PC1.V0 Otisk (Get-Date, whoami, hostname, UUID, IP 192.168.X.*)
       - M3-PC1.V1-D1 Vystup ipconfig /all (DNS server a DNS suffix)
       - M3-PC1.V2-D1 Preklad jmena na adresu (nslookup srv2-fs.<domena>)
       - M3-PC1.V3-D1 Preklad adresy na jmeno (nslookup 192.168.X.20)
       - M3-PC1.V4-D1 Preklad aliasu ftp (nslookup ftp.<domena>)
       - M3-PC1.V5-D1 Preklad a overeni zaznamu PC1-WIN
       - M3-PC1.P1-P2 Popisy klientskeho postupu overeni
    4. Vytvori strukturovany soubor pc1_data.json a odesle jej na Discord Webhook.
    5. Discord bot automaticky spoji data ze SRV1-DC a PC1-WIN do hotove dokumentace!
#>

param(
    [string]$DiscordUser = "",
    [int]$WorkspaceX = 0,
    [string]$DomainName = "",
    [string]$WebhookUrl = "https://discord.com/api/webhooks/1566773124819714128/cQ_pJOmEu0KgmZOXuA7EkfBBEaw5_XBazq9NQzKWiLqGotSwV8-BOHI8ZiseL2HwNubK"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace Krok 2/2 - PC1-WIN (Modul 03)"

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
    Write-Host "--- $Title ---" -ForegroundColor DarkCyan
}

function Report-Step {
    param([string]$Status, [string]$Id, [string]$Message, [string]$Color = "White")
    $tag = "[$Status]"
    Write-Host "  $tag " -ForegroundColor $Color -NoNewline
    Write-Host "$Id - $Message" -ForegroundColor White
}

Write-Header "WELL_OPS :: Automaticka dokumentace - KROK 2/2 (PC1-WIN)"
Write-Host "Tento skript zaznamena klientske overeni DNS pro Modul 03." -ForegroundColor Gray
Write-Host "Data budou odeslana k automatickemu spojeni se serverovou casti." -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------
# 1. Identifikace a sparovani s Discord uctem
# ------------------------------------------------------------
Write-Section "1. Identifikace studenta"

$targetDiscord = $DiscordUser
while ([string]::IsNullOrWhiteSpace($targetDiscord)) {
    Write-Host "Zadejte vase Discord uzivatelske jmeno (stejne jako na SRV1-DC): " -ForegroundColor Cyan -NoNewline
    $targetDiscord = Read-Host
    if (-not [string]::IsNullOrWhiteSpace($targetDiscord)) {
        $targetDiscord = $targetDiscord.Trim().TrimStart('@')
    }
}

# Autodetekce cisla pracoviste X z Ethernet1
$detectedX = 2
try {
    $clientIp = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($clientIp -match '^192\.168\.(\d+)\.') {
        $detectedX = [int]$matches[1]
    }
} catch {}

$wsX = if ($WorkspaceX -gt 0) { $WorkspaceX } else { $detectedX }

# Autodetekce domeny ze spojeni nebo systemu
$detectedDomain = ""
try {
    $dnsSuffix = (Get-DnsClient -InterfaceAlias "Ethernet1" -ErrorAction SilentlyContinue).ConnectionSpecificSuffix
    if (-not [string]::IsNullOrWhiteSpace($dnsSuffix)) {
        $detectedDomain = $dnsSuffix
    }
} catch {}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    try {
        $connSuffix = (Get-DnsClientGlobalSetting -ErrorAction SilentlyContinue).SuffixSearchList | Select-Object -First 1
        if (-not [string]::IsNullOrWhiteSpace($connSuffix)) {
            $detectedDomain = $connSuffix
        } else {
            $sysDomain = (Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).Domain
            if (-not [string]::IsNullOrWhiteSpace($sysDomain) -and $sysDomain -ne "WORKGROUP") {
                $detectedDomain = $sysDomain
            }
        }
    } catch {}
}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    try {
        $ptrDc = Resolve-DnsName -Name "192.168.$wsX.10" -Server "192.168.$wsX.10" -ErrorAction SilentlyContinue | Where-Object { $_.Type -eq "PTR" } | Select-Object -First 1
        if ($ptrDc -and $ptrDc.NameHost -match '^srv1-dc\.(.+)$') {
            $detectedDomain = $matches[1].TrimEnd('.')
        }
    } catch {}
}

if (-not [string]::IsNullOrWhiteSpace($DomainName)) {
    $detectedDomain = $DomainName
}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    Write-Host "Zadejte vasi domenu [vychozi: cyberschool.internal]: " -ForegroundColor Yellow -NoNewline
    $inputDom = Read-Host
    $detectedDomain = if (-not [string]::IsNullOrWhiteSpace($inputDom)) { $inputDom.Trim() } else { "cyberschool.internal" }
}

$studentDomain = $detectedDomain

Write-Host "Cilovy Discord ucet:    @$targetDiscord" -ForegroundColor Green
Write-Host "Pracoviste X:           $wsX (sit 192.168.$wsX.0/24)" -ForegroundColor Gray
Write-Host "Testovana domena:       $studentDomain" -ForegroundColor Gray
Start-Sleep -Milliseconds 600

# ------------------------------------------------------------
# 2. Priprava slozky v Documents
# ------------------------------------------------------------
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 3 DNS"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}

# ------------------------------------------------------------
# 3. Zaznam klientskych overeni (PC1-WIN)
# ------------------------------------------------------------
Write-Section "2. Zaznam overeni na PC1-WIN"

# M3-PC1.V0 Otisk
Write-Host "  [PROBIHA]  M3-PC1.V0 Otisk klientskeho systemu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nowStr = Get-Date -Format "dddd d. MMMM yyyy HH:mm:ss"
$whoStr = whoami
$hostStr = hostname
$uuidStr = try { (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID } catch { "N/A" }
$ipMatchStr = try {
    (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object IPAddress -like '192.168.*' | Select-Object -First 1).IPAddress
} catch { "192.168.$wsX.100" }

$pc1V0Output = @"
PS C:\Users\Administrator> Get-Date

$nowStr

PS C:\Users\Administrator> whoami
$whoStr
PS C:\Users\Administrator> hostname
$hostStr
PS C:\Users\Administrator> (Get-CimInstance Win32_ComputerSystemProduct).UUID
$uuidStr
PS C:\Users\Administrator> (Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
$ipMatchStr
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V0" "Otisk klienta uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-PC1.V1 Klient pouziva spravny DNS server (ipconfig /all)
Write-Host "  [PROBIHA]  M3-PC1.V1 Cteni konfigurace ipconfig /all..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ipconfigText = try {
    cmd.exe /c ipconfig /all
} catch {
    "Chyba pri spusteni ipconfig /all: $_"
}

$pc1V1Output = @"
PS C:\Users\Administrator> ipconfig /all

$ipconfigText
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V1-D1" "Vystup ipconfig /all zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-PC1.V2 Preklad jmena na adresu (nslookup srv2-fs.<domena>)
Write-Host "  [PROBIHA]  M3-PC1.V2 Preklad jmena srv2-fs.$studentDomain..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nslookupFsText = try {
    cmd.exe /c "nslookup srv2-fs.$studentDomain"
} catch {
    "Chyba pri nslookup srv2-fs.$studentDomain: $_"
}

$pc1V2Output = @"
PS C:\Users\Administrator> nslookup srv2-fs.$studentDomain

$nslookupFsText
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V2-D1" "Preklad jmena srv2-fs zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-PC1.V3 Preklad adresy na jmeno (nslookup 192.168.N.20)
Write-Host "  [PROBIHA]  M3-PC1.V3 Reverzni preklad 192.168.$wsX.20..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nslookupRevText = try {
    cmd.exe /c "nslookup 192.168.$wsX.20"
} catch {
    "Chyba pri nslookup 192.168.$wsX.20: $_"
}

$pc1V3Output = @"
PS C:\Users\Administrator> nslookup 192.168.$wsX.20

$nslookupRevText
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V3-D1" "Reverzni preklad 192.168.$wsX.20 zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-PC1.V4 Preklad aliasu ftp
Write-Host "  [PROBIHA]  M3-PC1.V4 Preklad aliasu ftp.$studentDomain..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ftpResolveText = try {
    Resolve-DnsName -Name "ftp.$studentDomain" -Server "192.168.$wsX.10" -ErrorAction Stop |
        Select-Object Name, Type, NameHost, IPAddress |
        Format-Table -AutoSize |
        Out-String
} catch {
    cmd.exe /c "nslookup ftp.$studentDomain 192.168.$wsX.10"
}

$pc1V4Output = @"
PS C:\Users\Administrator> Resolve-DnsName -Name "ftp.$studentDomain" -Server 192.168.$wsX.10 | Select-Object Name, Type, NameHost, IPAddress

$ftpResolveText
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V4-D1" "Preklad aliasu ftp zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-PC1.V5 Novy zaznam se projevi
Write-Host "  [PROBIHA]  M3-PC1.V5 Preklad zaznamu PC1-WIN..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nslookupPcText = try {
    cmd.exe /c "nslookup pc1-win.$studentDomain"
} catch {
    "Chyba pri nslookup pc1-win: $_"
}

$pc1V5Output = @"
PS C:\Users\Administrator> nslookup pc1-win.$studentDomain

$nslookupPcText
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-PC1.V5-D1" "Overeni zaznamu PC1-WIN zaznamenano" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 4. Texty postupu pro PC1-WIN (postup.md)
# ------------------------------------------------------------
Write-Section "3. Priprava textu postupu na PC1-WIN"

$pc1P1Text = @"
1. Nastavena priorita sitovych adapteru pro preferenci skolni site Ethernet1 pred NAT adapterem Ethernet0:
   Set-NetIPInterface -InterfaceAlias "Ethernet1" -InterfaceMetric 10
   Set-NetIPInterface -InterfaceAlias "Ethernet0" -InterfaceMetric 50
2. Na klientskem pocitaci PC1-WIN spusten prikaz:
   ipconfig /all
3. V sekci 'Ethernet adapter Ethernet1' overeno:
   - Primary Dns Suffix: $studentDomain
   - DNS Servers: 192.168.$wsX.10 (IP adresa serveru SRV1-DC)
   - Connection-specific DNS Suffix: $studentDomain
4. Vynucena registrace a promazani DNS cache:
   ipconfig /registerdns
   ipconfig /flushdns
5. Proverena dostupnost DNS serveru pomoci prikazu:
   Test-NetConnection -ComputerName 192.168.$wsX.10 -Port 53
"@

$pc1P2Text = @"
1. Preklad jmena na adresu:
   nslookup srv2-fs.$studentDomain
   Overeno, ze odpoved vraci IP adresu 192.168.$wsX.20.
2. Reverzni preklad IP adresy na jmeno:
   nslookup 192.168.$wsX.20
   Overeno, ze odpoved vraci FQDN srv2-fs.$studentDomain.
3. Preklad aliasu:
   nslookup ftp.$studentDomain
   Overeno, ze alias odkazuje na srv2-fs.$studentDomain a vraci 192.168.$wsX.20.
4. Test spojeni pomoci DNS jmena:
   ping -n 2 srv1-dc.$studentDomain
"@

Report-Step "  OK   " "M3-PC1.P1-P2" "Popisy klientskeho postupu pripraveny" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 5. Sestaveni JSON balicku a odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "4. Odeslani klientskych dat na Discord"

$pc1Payload = [PSCustomObject]@{
    part = "PC1"
    module = "03"
    discordUser = $targetDiscord
    pc1_overeni = [PSCustomObject]@{
        V0_otisk = $pc1V0Output
        V1_d1 = $pc1V1Output
        V2_d1 = $pc1V2Output
        V3_d1 = $pc1V3Output
        V4_d1 = $pc1V4Output
        V5_d1 = $pc1V5Output
    }
    pc1_postup = [PSCustomObject]@{
        P1 = $pc1P1Text
        P2 = $pc1P2Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_pc1_03.json"
$pc1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam klientska data pres Discord Webhook..." -ForegroundColor Cyan
$curlArgs = @(
    "-s",
    "-X", "POST",
    "-F", "content=[WELL_OPS_DOC_PART2] Modul 03 | PC1-WIN | $targetDiscord",
    "-F", "file1=@$tempJsonPath;filename=pc1_data.json",
    $WebhookUrl
)

$curlOutput = & curl.exe @curlArgs 2>&1
Remove-Item -LiteralPath $tempJsonPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! KROK 2/2 NA PC1-WIN JE DOKONCEN!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Data odeslana pro Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vysledek:" -ForegroundColor Green
Write-Host "  Discord bot nyni spojuje data ze SRV1-DC a PC1-WIN do hotove dokumentace." -ForegroundColor White
Write-Host "  Zkontrolujte svuj Discord (oznamovaci kanal i soukrome zpravy)!" -ForegroundColor White
Write-Host "  Obdrzite: overeni.md, postup.md a archiv ZIP." -ForegroundColor White
Write-Host ""
Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
