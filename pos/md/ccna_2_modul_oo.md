# CCNA 2 – Bezpečnost sítí a zabezpečení (Modul OO)

## 1. Hrozby a zranitelnosti v síti

### Typy útočníků a cesty průniku
Útočníci mohou získat přístup k síti prostřednictvím softwarových zranitelností, hardwarových útoků nebo uhodnutím přihlašovacích údajů někoho jiného.

Po vniknutí do sítě mohou nastat čtyři hlavní hrozby:
* **Krádež informací:** Vloupaní do počítače za účelem získání důvěrných dat (např. výzkum a vývoj).
* **Ztráta a manipulace s daty:** Útoky na data (např. viry přehomatující disk nebo pozměňující systémové záznamy – změna ceny, záznamů).
* **Krádež identity:** Odcizení osobních údajů k převzetí identity, získání právních dokumentů, půjčkám nebo neoprávněným nákupům.
* **Přerušení služby (DoS):** Bránění legitimním uživatelům v přístupu ke službám (např. útoky DoS na servery či síťová zařízení).

### Zranitelnosti
Existují tři hlavní zranitelnosti (slabiny):
1. **Technologické**
2. **Konfigurační**
3. **Bezpečnostní** (procedury, směrnice)

### Fyzické hrozby
* **Hardwarové hrozby:** Fyzické poškození serverů, routerů, přepínačů, kabelových rozvodů a pracovních stanic.
* **Environmentální hrozby:** Teplotní extrémy (příliš horko/chladno) nebo extrémy vlhkosti.
* **Elektrické hrozby:** Napěťové špičky, nedostatečné napájecí napětí (výpadky), šum a úplná ztráta výkonu.

---

## 2. Typy malwaru a síťové útoky

### Malware
* **Viry:** Šíří se vložením své kopie do jiného programu a jeho součástí.
* **Červi:** Replikují funkční kopie sebe sama a způsobují škody v síti.
* **Tρόští koně:** Škodlivý software vypadající legitimně. Uživatele oklamou a vytvářejí zadní vrátka.
* **Průzkumné útoky:** Objevování a mapování systémů, služeb nebo zranitelností.
* **Útoky na přístup a hesla:** Prováděné útoky hrubou silou (brute-force), pomocí trojských koní nebo čichačů paketů (sniffers).
* **Zneužití důvěry:** Útočník používá neoprávněné oprávnění k získání přístupu k systému.
* **Přesměrování portu & Man-in-the-Middle (MitM):** Útočník se nachází mezi dvěma entitami, může číst nebo upravovat data.
* **Útoky typu odmitnutí služby (DoS / DDoS):** Neznámější a nejtěžší eliminovatelné formy útoků přetěžující zdroje.

---

## 3. Zmírnění síťových útoků a zabezpečení

### Opatření a ochrana
* **Uchovávání záloh:** Zálohování konfigurací a dat na vyměnitelná média nebo FTP/souborové servery.
* **Aktualizace a opravy:** Využívání nejnovějších verzí antivirů, aktualizace operačních systémů a záplat zranitelností.
* **Ověřování, autorizace a účtování (AAA):** Poskytují primární rámec pro nastavení řízení přístupu k síťovým zařízením.
* **Firewally:** Blokují nežádoucí provoz. Zahrnují:
  * *Filtrování paketů* (na základě IP nebo MAC adresy)
  * *Filtrování aplikací* (na základě čísel portů)
  * *Filtrování URL adres*
  * *Stavová inspekce paketů (SPI)* – ověřuje legitimitu odpovědí na požadavky
* **Zabezpečení koncových bodů:** Ochrana notebooků, serverů, stolních počítačů a chytrých zařízení.
* **Zabezpečení zařízení (Cisco AutoSecure):**
  * Okamžitá změna výchozích uživatelských jmen a hesel.
  * Omezení přístupu k systémovým prostředkům.
  * Vypnutí a odinstalování nepotřebných služeb a aplikací.
* **Zabezpečení hesel a vzdáleného přístupu:**
  * `service password-encryption`
  * `security passwords min-length`
  * `login block-for ... attempts within ...`
  * Vynucení protokolu **Secure Shell (SSH)** namísto nešifrovaného Telnetu.
  * Nastavení automatického odhlášení neaktivní relace (`exec-timeout`).

---

## 4. Návrh malé sítě a diagnostické příkazy

### Návrh malé sítě
* Většina obchodních sítí je malých rozměrů. Návrh je obvykle jednoduchý, vyžaduje plánování a splnění požadavků uživatele (náklady, kapacita portů, rychlost propojovacích desek, rozšiřitelnost).
* **IP adresování:** Vytvořte a dodržujte konzistentní schéma IP adres, které usnadňuje identifikaci zařízení a řešení problémů.
* **Redundance a růst:** Redundance pomáhá eliminovat výpadky. Škálování sítě vyžaduje dokumentaci (inventář zařízení, rozpočet, analýzu provozu).

### Diagnostické příkazy (IOS Commands)
* `ping` / `traceroute` – testování konektivity na vrstvě 3 a zjištění trasy (hopů).
* `ipconfig` / `ipconfig /all` / `arp -a` – konfigurace a tabulky na koncových zařízeních.
* **IOS Show příkazy:**
  * `show running-config` – zobrazení aktivní konfigurace.
  * `show interfaces` / `show ip interface brief` – stav rozhraní.
  * `show cdp neighbors` – zobrazení sousedů přes Cisco Discovery Protocol (CDP).
  * `show ip route`, `show protocols`, `show version`.
* **Ladění (Debugging):**
  * `debug ip icmp` – sledování zpráv ICMP v reálném čase.
  * `terminal monitor` – zobrazení ladicích výstupů na vzdáleném konzolovém připojení.