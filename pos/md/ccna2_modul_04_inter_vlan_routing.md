# ccna2-module-04 (Inter-VLAN Routing #1)

Pro komunikaci mezi různými VLAN sítěmi nebo mimo lokální síť je vyžadováno směrování na **3. vrstvě (L3)** pomocí routeru nebo L3 přepínače. Bez L3 zařízení nemohou hostitelé v různých VLAN komunikovat.

## Možnosti směrování mezi VLAN

1. **Tradiční směrování mezi VLAN (Legacy Inter-VLAN)**
2. **Router-on-a-Stick**
3. **Přepínač vrstvy 3 (L3 Switch)** s využitím SVI (Switched Virtual Interfaces)

---

## 2. Router-on-a-Stick

Metoda využívající **jediné fyzické ethernetové rozhraní** routeru připojené k **trunk portu (802.1Q)** na přepínači L2.

* Na rozhraní routeru se konfigurují softwarová podrozhraní (**sub-interfaces**).
* Každé podrozhraní funguje nezávisle, má vlastní IP adresu a je přiřazeno konkrétní VLAN.
* Tagovaný rámec vstoupí do rozhraní routeru a je přesměrován podle cílové VLAN.

### Příkazová konfigurace podrozhraní (Sub-interface)

Vstup do režimu konfigurace podrozhraní (např. `interface g0/0/0.10`):

* `encapsulation dot1q vlan_id [native]` – nastaví 802.1Q encapsulaci pro danou VLAN (volitelně označí jako nativní)
* `ip address ip-address subnet-mask` – přiřadí IP adresu a masku
* `no shutdown` – aktivuje fyzické rozhraní (provádí se na hlavním rozhraní)

### Přehled podrozhraní (Příklad):

| Subinterface | VLAN | IP Address |
| :--- | :--- | :--- |
| **G0/0/1.10** | 10 | 192.168.10.1/24 |
| **G0/0/1.20** | 20 | 192.168.20.1/24 |
| **G0/0/1.99** | 99 | 192.168.99.1/24 |

---

## Verifikační příkazy

* `show ip route` – zobrazení směrovací tabulky
* `show ip interface brief` – stručný přehled stavu rozhraní a IP adres
* `show interfaces` – podrobné informace o rozhraních
* `show interfaces trunk` – kontrola stavu trunkových linek na přepínači
