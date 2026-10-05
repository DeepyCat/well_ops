# [Co má být na konci modulu a jak to vypadá?]

**Přibližný potřebný čas**: 1 vyučovací hodina na stroj — postup se v projektu opakuje **třikrát**: pro **SRV1-DC**, **SRV2-FS** a klienta **PC1-WIN**.

## Kontext (proč to děláme)

Než začneme řešit role (doména, DHCP, souborové služby...), potřebuje každý stroj — servery i klient — stejný, pečlivě připravený základ: správné jméno v síti, funkční síťové nastavení, bezpečný přístup administrátora, aktivovaný Windows a **lokalizaci** (jazyk, časové pásmo, formát data/času/měny), aby se dalo rozumně administrovat v českém prostředí a zároveň se studenti naučili anglickou terminologii, se kterou se v praxi i na certifikacích setkají. Tento modul je "nulový" — dělá se **před** Modulem 1 (na SRV1-DC), znovu **před** Modulem 6 (na SRV2-FS) a znovu pro klienta **PC1-WIN** (než začnete Modul 2 — DHCP), vždy se stejnými principy lokalizace, jen jiným typem OS a jinými síťovými hodnotami.

## Cílový stav

Na konci tohoto modulu jsou nainstalované a připravené tři virtuální stroje s těmito **konkrétními** parametry:

### Parametry virtuálního stroje

| Parametr | SRV1-DC | SRV2-FS | PC1-WIN |
|---|---|---|---|
| vCPU | 2 jádra | 2 jádra | 2 jádra |
| RAM | 8 GB | 8 GB | 8 GB |
| Systémový disk | 100 GB | 100 GB | 60 GB |
| Další disky | — | **5× 10 GB** (pro Storage Pool a simulaci výpadku disku v Modulu 6) | — |

Všech 5 dodatečných disků u SRV2-FS se přidává do VM **už v tomto modulu**, spolu s vytvořením virtuálního stroje — v Modulu 6 se pak jen inicializují a poskládají do Storage Pool.

### Instalační edice

| Stroj | Edice |
|---|---|
| SRV1-DC, SRV2-FS | **Windows Server 2025 Datacenter (Desktop Experience)** — vždy s grafickým rozhraním, nikdy varianta Server Core. Datacenter edice je zvolena kvůli neomezenému počtu virtualizovaných instancí a plné sadě funkcí (Storage Spaces, atd.), i když si škola vystačí i se Standard — v projektu záměrně používáme Datacenter, aby žádná funkce z probíraných modulů nebyla licenčně omezená. |
| PC1-WIN | **Windows 11 Education N** — edice Education je určená přímo pro nasazení ve školách (obsahuje stejné funkce jako Enterprise, včetně doménového joinu a centrální správy přes GPO/Intune); varianta **N** neobsahuje přeinstalované mediální technologie (Windows Media Player, Zprávy, kamera...) — v souladu s požadavky EU, dodávají se/instalují se zvlášť, pokud jsou potřeba. |

Jazyk instalačního média je u všech tří strojů **English (United States)**.

### Účet administrátora

| Položka | Hodnota | Poznámka |
|---|---|---|
| Účet (SRV1-DC, SRV2-FS) | vestavěný `Administrator` | vytváří ho přímo instalace serveru |
| Účet (PC1-WIN) | `Administrator` | u Windows 11 je vestavěný účet `Administrator` ve výchozím stavu **vypnutý** a OOBE nedovolí založit nový účet pod tímto jménem — musí se **ručně povolit** po instalaci (viz `cast2.md`, Krok 4) |
| Heslo | `Pa55w.rd` (u všech tří strojů stejné) | |

Ani na jednom ze tří strojů se nevytváří žádný jiný/personalizovaný administrátorský účet.

### Jméno počítače a síť

| Parametr               | SRV1-DC                        | SRV2-FS                    | PC1-WIN                                                                                                                                  |
| ---------------------- | ------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Hostname               | `SRV1-DC`                      | `SRV2-FS`                  | `PC1-WIN`                                                                                                                                |
| Způsob přidělení IP    | statická                       | statická                   | **automaticky přes DHCP** (viz Modul 2 — v tomto modulu se síť u klienta neřeší, necháváme výchozí "Obtain an IP address automatically") |
| IP adresa              | `192.168.200.10`               | `192.168.200.20`           | přidělena DHCP serverem z rozsahu `192.168.200.100`–`.200`                                                                               |
| Maska podsítě          | `255.255.255.0`                | `255.255.255.0`            | přidělena DHCP                                                                                                                           |
| Výchozí brána          | `192.168.200.1`                | `192.168.200.1`            | přidělena DHCP                                                                                                                           |
| Preferovaný DNS server | `192.168.200.10` (sám na sebe) | `192.168.200.10` (SRV1-DC) | přidělen DHCP                                                                                                                            |

> PC1-WIN v tomto modulu ještě nemá funkční síť se zbytkem infrastruktury (DHCP server ještě neexistuje) — připojení k internetu/síti během vlastní instalace Windows 11 řešíme jen kvůli aktivaci a případnému stažení aktualizací, viz níže.

### Aktivace Windows (LAB KEY)

Všechny tři instalace se aktivují školními produktovými klíči **LAB KEY**.

> **Produktové klíče:** Konkrétní produktové klíče pro servery (Windows Server 2025 Datacenter) i klienta (Windows 11 Education N) si **zkopírujte přímo ze zadání v Microsoft Teams**.

- Klíč lze zadat **buď přímo během instalace** (obrazovka "Product Key" v instalačním průvodci), **nebo až po instalaci** přes **Settings → System → Activation → Change product key** (GUI), případně příkazy v příkazové řádce či PowerShellu:
  ```powershell
  slmgr.vbs /ipk <LAB-KEY-Z-TEAMS>
  slmgr.vbs /ato
  ```
- Pokud instalační médium nabídne možnost **"I don't have a product key"** / **"Skip"**, lze pokračovat bez aktivace a doplnit klíč později (Windows běží v neaktivovaném/evaluačním režimu s časovým omezením a vodoznakem "Activate Windows") — pro účely výuky to nevadí, ale **cílový stav modulu je aktivovaný Windows** na všech třech strojích.
- Ověření aktivace: **Settings → System → Activation** ukazuje "Windows is activated" (server), resp. "Windows is activated with a digital license" nebo obdobu u klienta po zadání LAB KEY — případně `slmgr.vbs /xpr` (Windows) vypíše "The machine is permanently activated" nebo datum příští kontroly u KMS aktivace.

### Jazyk, region a lokalizace

Tato část je pro všechny tři stroje **stejná** (nezávisí na roli):

| Parametr | Hodnota |
|---|---|
| Windows display language (jazyk rozhraní) | **English (United States)** — konzole, chybové hlášky i menu zůstávají anglicky, protože terminologie v angličtině je to, co se objeví na certifikátech a v anglické dokumentaci Microsoftu |
| Formát regionu (Region format) | **Czech (Czech Republic)** — datum, čas, měna a čísla se zobrazují podle českých zvyklostí |
| Časové pásmo | **(UTC+01:00) Praha, Bratislava, Budapešť, Lublaň** (Windows time zone ID: `Central Europe Standard Time`) |
| Formát data | `d.M.yyyy` (např. `20.9.2026`) |
| Formát času | `H:mm:ss` (24hodinový formát, např. `13:45:02`) |
| Formát měny | Kč (koruna česká), např. `1 234,56 Kč` |
| Rozložení klávesnice | **US i Czech (QWERTZ) zároveň**, s možností přepínání mezi nimi (`Win + mezerník`, nebo přes jazykovou ikonu na hlavním panelu) — US zůstává jako výchozí (odpovídá anglickému rozhraní), CZ se přidává jako druhá metoda vstupu pro psaní diakritiky |
| Home location (poloha pro geograficky citlivé funkce Windows) | **Czech Republic** |

> Proč takto: v anglickém prostředí studenti trénují termíny, se kterými se setkají u zkoušek a v mezinárodní dokumentaci, ale formáty data/času/měny a klávesnice odpovídají reálnému nasazení v české škole — přesně to je běžná praxe i v komerčních nasazeních (anglický Windows, česká lokalizace regionu).

### Soukromí a telemetrie

Instalace Windows Serveru **nenabízí přihlášení Microsoft účtem** — vestavěný účet `Administrator` je jediný účet, který instalace vytváří. Instalace **Windows 11** naopak přihlášení Microsoft účtem standardně **vynucuje** v OOBE, pokud počítač vidí síť — proto je pro PC1-WIN součástí `cast2.md` i konkrétní postup, jak vytvořit **lokální** účet místo Microsoft účtu. Na všech třech strojích navíc zkontrolujte/vypněte:

| Nastavení | Požadovaná hodnota |
|---|---|
| Přihlášení Microsoft účtem | nepoužívá se nikde — jen lokální/vestavěný účet `Administrator` |
| Diagnostická data (telemetrie) | **Required diagnostic data** (minimální úroveň, ne "Optional"/"Send optional diagnostic data") |
| Vylepšování psaní rukou a psaní (inking & typing) | vypnuto |
| Přizpůsobené (tailored) zážitky na základě diagnostických dat | vypnuto |
| Služby určování polohy (Location services) | **vypnuto** |
| Reklamní ID (Advertising ID) | vypnuto |
| Find My Device (jen PC1-WIN) | vypnuto |

## Ověření (shrnutí, detaily viz `_vysledek.md`)

- Server/klient odpovídá na `ping` a hostname sedí přesně podle tabulky výše.
- Přihlášení jako `Administrator` / `Pa55w.rd` funguje na všech třech strojích (u PC1-WIN jako lokální účet).
- `Get-TimeZone`, `Get-Culture` / `Get-WinSystemLocale` a `Get-WinHomeLocation` v PowerShellu vrací hodnoty odpovídající tabulce.
- Datum a čas (nebo výstup `Get-Date`) je ve formátu `d.M.yyyy H:mm:ss`.
- **Settings → System → Activation** ukazuje aktivovaný Windows na všech třech strojích.
