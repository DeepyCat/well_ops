# [Jak se pozná, že už to mám?]

> Tento modul se ověřuje **přímo na konzoli připravovaného stroje** (SRV1-DC, SRV2-FS nebo PC1-WIN) — v tuto chvíli ještě neexistuje doména, ze které by šlo testovat vzdáleně. Body 1–10 platí pro oba servery, bod 11 navíc jen pro PC1-WIN.

> **SRV1-DC je v labu ověřený:** Všechny PowerShell příkazy a konfigurace pro stroj **SRV1-DC** byly v praxi otestovány a jsou 100% OK!

### 1. Parametry virtuálního stroje odpovídají zadání
V nastavení virtuálního stroje ve vašem hypervizoru: `SRV1-DC` i `SRV2-FS` mají přiděleny **2 vCPU**, **8 GB RAM** a **100 GB** systémový disk. U `SRV2-FS` navíc existuje **5 dalších disků po 10 GB**, viditelných uvnitř hosta:
```powershell
Get-Disk | Select-Object Number, FriendlyName, Size, PartitionStyle
```
U SRV2-FS výstup obsahuje systémový disk (~100 GB) a 5 dalších disků o velikosti ~10 GB, zatím ve stavu `RAW`/neinicializované (inicializují se až v Modulu 6).

### 2. Edice a instalace odpovídá zadání
```powershell
Get-ComputerInfo | Select-Object WindowsProductName, OsServerLevel
```
Vrátí `WindowsProductName` obsahující `Windows Server 2025 Datacenter` a `OsServerLevel` = `FullServer` (potvrzuje Desktop Experience, nikoliv `ServerCore`).

### 3. Hostname odpovídá tabulce
```powershell
hostname
```
Vrátí přesně `SRV1-DC`, resp. `SRV2-FS` — ne výchozí vygenerované jméno typu `WIN-XXXXXXXXXXX`.

### 4. TCP/IPv4 je nastavené staticky a podle tabulky
```powershell
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias Ethernet* | Select-Object IPAddress, PrefixLength
Get-NetIPConfiguration | Select-Object -ExpandProperty IPv4DefaultGateway
Get-DnsClientServerAddress -AddressFamily IPv4
```
IP adresa, prefix (`24` = maska `255.255.255.0`), brána i DNS server odpovídají hodnotám v `__zadani.md` pro daný server. Adresa **není** převzatá z DHCP (`Get-NetIPAddress ... | Select PrefixOrigin` ukazuje `Manual`, ne `Dhcp`).

### 5. Přihlášení administrátora funguje
Po odhlášení a novém přihlášení funguje přihlášení jako `Administrator` s heslem `Pa55w.rd` (lokálně — server ještě není v doméně). Žádný Microsoft účet u přihlášení nefiguruje — `Get-LocalUser` neobsahuje žádný účet typu Microsoft, jen vestavěné lokální účty.

### 6. Jazyk rozhraní a regionální formát odpovídají zadání
```powershell
Get-WinUILanguageOverride      # nebo (Get-Culture).Parent u UI jazyka dle kontextu
Get-Culture | Select-Object Name, DisplayName
Get-WinSystemLocale
Get-WinHomeLocation
```
- `Get-Culture` vrací `cs-CZ` (Czech (Czech Republic)) — určuje formáty data/času/měny.
- Rozhraní (menu, hlášky) zůstává v angličtině — display language nebyl měněn.
- `Get-WinSystemLocale` vrací `cs-CZ`.
- `Get-WinHomeLocation` vrací `Czech Republic`.

### 7. Formáty data, času a měny sedí
```powershell
Get-Date -Format "d.M.yyyy H:mm:ss"
(12345.67).ToString("C")
```
Datum/čas se vypíše ve tvaru `20.9.2026 13:45:02` a měna jako `12 345,67 Kč`.

### 8. Časové pásmo je správně
```powershell
Get-TimeZone
```
Vrátí `Id: Central Europe Standard Time`, `DisplayName` obsahující `Prague` (nebo `Bratislava`/`Budapest`), `BaseUtcOffset: 01:00:00`.

### 9. Klávesnice — US i Czech (QWERTZ), přepínatelné
```powershell
Get-WinUserLanguageList | Select-Object LanguageTag, InputMethodTips
# Alternativně kontrola rozložení přímo z registru:
Get-ItemProperty "HKCU:\Keyboard Layout\Preload"
```
Výstup obsahuje jak `en-US`, tak `cs-CZ` s příslušnou metodou vstupu (`0409:00000409` pro US, `0405:00000405` pro Czech), případně v registru `1 : 00000409` a `2 : 00000405`.
Pokud už na liště u hodin vidíte přepínač ENG / CES a funguje vám psaní českých znaků (ěščřž), máte úkol splněný.

### 10. Soukromí je nastaveno na minimum
```powershell
Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name AllowTelemetry
Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\LocationAndSensors" -Name DisableLocation
Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AdvertisingInfo" -Name DisabledByGroupPolicy
```
`AllowTelemetry = 1` (Required diagnostic data), `DisableLocation = 1` (poloha vypnutá), `DisabledByGroupPolicy = 1` (reklamní ID vypnuté). V **Settings → Privacy & security** odpovídají přepínače stejným hodnotám i vizuálně.

### 11. Aktivace je hotová (SRV1-DC, SRV2-FS i PC1-WIN)
Aktivace probíhá pomocí školních klíčů **LAB KEY**, které si **zkopírujte ze zadání v Microsoft Teams** (zvlášť pro Windows Server 2025 a zvlášť pro Windows 11 Education N).

```powershell
# 1. Zadejte klíč ze zadání na Teams:
slmgr.vbs /ipk <LAB-KEY-Z-TEAMS>
slmgr.vbs /ato

# 2. Ověření:
slmgr.vbs /xpr
```
Vypíše, že stroj je aktivovaný (trvale, nebo s datem příští kontroly u KMS/LAB KEY s omezenou platností) — ne "notification experience" upozorňující na neaktivovaný Windows. V **Settings → System → Activation** je zobrazeno **"Windows is activated"** (server), resp. **"Windows is activated with a digital license"** (klient), bez tlačítka "Activate" navíc.

### 12. PC1-WIN: lokální účet, žádný Microsoft účet (jen u klienta)
```powershell
Get-LocalUser | Select-Object Name, Enabled
```
Výstup obsahuje aktivní `Administrator` a **neobsahuje** žádný dočasný účet (`Setup` byl odstraněn). V **Settings → Accounts → Your info** je typ účtu **"Local account"**, nikoli e-mailová adresa Microsoft účtu — přihlášení do Windows nevyžaduje žádné internetové ověření.

Po úspěšném ověření pokračujte modulem, pro který jste stroj právě připravovali:
- `SRV1-DC` → [[../Modul 1 Domain Controller/__zadani|Modul 1 — Domain Controller]]
- `SRV2-FS` → [[../Modul 6 File Server a Storage/__zadani|Modul 6 — File Server a Storage]]
- `PC1-WIN` → [[../Modul 2 DHCP/__zadani|Modul 2 — DHCP]]
