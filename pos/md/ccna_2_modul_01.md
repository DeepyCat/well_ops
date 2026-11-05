# CCNA 2 – Modul 01: Základní konfigurace zařízení

## 1. Bootování a správa přepínače (Switch)

### Postup spuštění (Switch Boot Sequence)

1. **POST (Power-On Self-Test):** Test hardwaru při zapnutí.

2. **Načtení zavaděče (Boot Loader):** Inicializace CPU, paměti a flash paměti.

3. **Spuštění souboru IOS:** Vyhledání a spuštění obrazu operačního systému IOS.

4. **Načtení konfigurace:** Vyhledání konfiguračního souboru `startup-config` (uloženého jako `config.text` v adresáři flash).

### Příkaz `boot system`

* Globální konfigurační příkaz sloužící k nastavení proměnné prostředí pro bootování (např. specifikace konkrétního obrazu IOS).

* Aktuální spouštěcí soubor IOS lze ověřit příkazem `show boot`.

### Indikátory a zotavení

* **LED diody switchů:** Slouží k rychlé diagnostice portů (možnost přepínání módů jako Port Status, Power over Ethernet - PoE).

* **Zotavení po havárii systému (System Crash):** Využití konzole zavaděče (boot-loader) k základním záchranným operacím.

## 2. Konfigurace portů a vzdálený přístup

### Konfigurace portů a duplex

* **Duplexní komunikace:** Režimy přenosu dat lze na portech ručně vynutit nebo nechat v režimu auto-negotiation.

* **Ověření stavu portů:** Kromě klasických `show` příkazů je velmi užitečný příkaz `show interfaces`, který zobrazuje podrobné statistiky včetně chybovosti (errors, drops).

### Zabezpečený vzdálený přístup

* **Telnet:** Nešifrovaný protokol – **nedoporučuje se**.

* **SSH (Secure Shell):** Šifrovaný a bezpečný protokol pro vzdálenou správu zařízení (preferovaný standard).

## 3. Základní konfigurace routeru (Router Configuration)

### Loopback rozhraní

* Virtuální rozhraní v routeru používané k testování, simulaci sítí nebo stabilizaci směrovacích protokolů.

### Pokročilé filtrování výstupů (Filter Show Commands)

Pro efektivní procházení dlouhých výstupů v IOS se používá tzv. pipe (`|`):

* `show running-config | section line vty` – zobrazí pouze sekci virtuálních terminálových linek.

* `show history` – vypíše historii naposledy zadaných příkazů v relaci.