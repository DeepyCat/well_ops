# Návod: Inter-VLAN Routing (S1, S2 + L3 Switch Catalyst 3560)

Tento návod obsahuje kompletní konfiguraci sítě pro plnou funkčnost a směrování mezi VLAN (Inter-VLAN Routing) s využitím L3 switche **Cisco Catalyst 3560** namísto klasického routeru.

---

## 1. Přehled IP adresace a VLAN

### Tabulka adresace
| Zařízení | Rozhraní | IP adresa | Maska podsítě | Výchozí brána |
| :--- | :--- | :--- | :--- | :--- |
| **R1 (3560)** | VLAN 3 | `192.168.3.1` | `255.255.255.0` | N/A |
| **R1 (3560)** | VLAN 4 | `192.168.4.1` | `255.255.255.0` | N/A |
| **S1** | VLAN 3 | `192.168.3.11` | `255.255.255.0` | `192.168.3.1` |
| **S2** | VLAN 3 | `192.168.3.12` | `255.255.255.0` | `192.168.3.1` |
| **PC-A** | NIC | `192.168.3.3` | `255.255.255.0` | `192.168.3.1` |
| **PC-B** | NIC | `192.168.4.3` | `255.255.255.0` | `192.168.4.1` |

### Tabulka VLAN a portů
* **VLAN 3 (Management):** S1 (`VLAN 3`, `F0/6` pro PC-A), S2 (`VLAN 3`), R1-3560 (`VLAN 3`)
* **VLAN 4 (Operations):** S2 (`F0/18` pro PC-B), R1-3560 (`VLAN 4`)
* **VLAN 7 (ParkingLot):** Nepoužívané porty
* **VLAN 8 (Native):** Nativní VLAN pro trunky (`S1 F0/1`, `S1 F0/5`, `S2 F0/1`, `R1-3560 F0/1`)

---

## 2. Konfigurace L3 Switche Catalyst 3560 (R1)

U L3 switche **Catalyst 3560** nevytváříme sub-rozhraní, ale zapínáme L3 směrování (`ip routing`) a vytváříme virtuální rozhraní **SVI** (`interface vlan X`). VLANy musí být na switchi vytvořené, aby rozhraní přešla do stavu `UP` a prošel přes ně provoz z trunku.

*(Poznámka: Návod předpokládá propojení se switchem S1 do portu `F0/1`. Pokud použiješ port `G0/1`, nahraď `interface f0/1` za `interface g0/1`.)*

```ios
enable
configure terminal
hostname R1-3560

! 1. Zapnutí L3 routování na switchi
ip routing

! 2. Vytvoření potřebných VLAN
vlan 3
 name Management
vlan 4
 name Operations
vlan 8
 name Native
exit

! 3. Konfigurace trunk portu směrem ke switchi S1 (F0/5)
interface f0/1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
 no shutdown
exit

! 4. L3 rozhraní (výchozí brány) pro jednotlivé VLAN
interface vlan 3
 ip address 192.168.3.1 255.255.255.0
 no shutdown
exit

interface vlan 4
 ip address 192.168.4.1 255.255.255.0
 no shutdown
exit

end
write memory
```

---

## 3. Konfigurace Switche S1

```ios
enable
configure terminal
hostname S1

! Vytvoření VLAN
vlan 3
 name Management
vlan 4
 name Operations
vlan 7
 name ParkingLot
vlan 8
 name Native
exit

! IP adresa pro správu (Management) a výchozí brána
interface vlan 3
 ip address 192.168.3.11 255.255.255.0
 no shutdown
exit
ip default-gateway 192.168.3.1

! Přístupový port pro PC-A (VLAN 3)
interface f0/6
 switchport mode access
 switchport access vlan 3
exit

! Trunk k S2 (F0/1) a k L3 switchi R1-3560 (F0/5)
interface range f0/1 , f0/5
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
exit

end
write memory
```

---

## 4. Konfigurace Switche S2

```ios
enable
configure terminal
hostname S2

! Vytvoření VLAN
vlan 3
 name Management
vlan 4
 name Operations
vlan 7
 name ParkingLot
vlan 8
 name Native
exit

! IP adresa pro správu (Management) a výchozí brána
interface vlan 3
 ip address 192.168.3.12 255.255.255.0
 no shutdown
exit
ip default-gateway 192.168.3.1

! Přístupový port pro PC-B (VLAN 4)
interface f0/18
 switchport mode access
 switchport access vlan 4
exit

! Trunk k S1 (F0/1)
interface f0/1
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
exit

end
write memory
```

---

## 5. Nastavení koncových stanic (PC-A a PC-B)

### Jak nastavit IP adresu na PC:
* **V Cisco Packet Traceru:** Klikni na PC $\rightarrow$ záložka **Desktop** $\rightarrow$ **IP Configuration** $\rightarrow$ přepni na **Static**.
* **Ve Windows (reálná zařízení):** *Ovládací panely $\rightarrow$ Síť a internet $\rightarrow$ Centrum síťových připojení a sdílení $\rightarrow$ Změnit nastavení adaptéru $\rightarrow$ pravý klik na Ethernet $\rightarrow$ Vlastnosti $\rightarrow$ Protokol IP verze 4 (TCP/IPv4) $\rightarrow$ Použít následující adresu IP.*

### Parametry pro PC-A
* **IPv4 Address:** `192.168.3.3`
* **Subnet Mask:** `255.255.255.0`
* **Default Gateway:** `192.168.3.1`

### Parametry pro PC-B
* **IPv4 Address:** `192.168.4.3`
* **Subnet Mask:** `255.255.255.0`
* **Default Gateway:** `192.168.4.1`

---

## 6. Ověření funkčnosti

### Testy z příkazového řádku na PC-A (Command Prompt)
1. **Ping na výchozí bránu (VLAN 3 na R1-3560):**
   ```cmd
   ping 192.168.3.1
   ```
2. **Ping na switch S2:**
   ```cmd
   ping 192.168.3.12
   ```
3. **Ping na PC-B v jiné VLAN (ověření Inter-VLAN routování):**
   ```cmd
   ping 192.168.4.3
   ```
   *(Poznámka: První paket může vypršet kvůli ARP dotazu, další 3 musí projít.)*

> **Tip pro reálné počítače s Windows:** Pokud ping mezi PC-A a PC-B neprochází, vypni na obou počítačích **Windows Defender Firewall** (pro privátní i veřejné sítě), protože ve výchozím nastavení blokuje příchozí ICMP (ping) požadavky z jiné podsítě.

### Kontrolní příkazy na L3 switchi R1-3560
* `show ip route` – musí zobrazovat přímo připojené sítě `192.168.3.0/24` (`Vlan3`) a `192.168.4.0/24` (`Vlan4`).
* `show interfaces trunk` – ověří aktivní trunk port (`F0/1`), nativní VLAN `8` a povolené VLAN `3,4,8`.
* `show ip interface brief` – ověří, že rozhraní `Vlan3` a `Vlan4` jsou ve stavu `up / up`.
