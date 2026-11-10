# Návod – Implementace VLAN a trunku (Cisco)

Nov 10, 2026 · @asdfghjkl;'\\

## Přehled

Cílem labu je vytvořit VLAN 10, 20, 30, 999 a 1000 na obou switchích, přiřadit porty a propojit switche ručně nastaveným 802.1Q trunkem s nativní VLAN 1000. Komunikace funguje jen uvnitř stejné VLAN – mezi VLAN by byl potřeba L3 prvek (router), který v topologii není.

**Topologie:** PC-A — F0/6 **S1** F0/1 ⟷ F0/1 **S2** F0/18 — PC-B

| Zařízení | Rozhraní | IP adresa | Maska |
| --- | --- | --- | --- |
| S1 | VLAN 10 | 192.168.10.11 | 255.255.255.0 |
| S1 | VLAN 20 | 192.168.20.11 | 255.255.255.0 |
| S1 | VLAN 30 | 192.168.30.11 | 255.255.255.0 |
| S2 | VLAN 10 | 192.168.10.12 | 255.255.255.0 |
| PC-A | NIC | 192.168.20.13 | 255.255.255.0 |
| PC-B | NIC | 192.168.30.13 | 255.255.255.0 |

| VLAN | Název | Přiřazeno |
| --- | --- | --- |
| 10 | Management | S1: SVI VLAN 10 · S2: SVI VLAN 10 |
| 20 | Sales | S1: SVI VLAN 20 a F0/6 (PC-A) |
| 30 | Operations | S1: SVI VLAN 30 · S2: F0/18 (PC-B) |
| 999 | ParkingLot | S1: F0/2-5, F0/7-24, G0/1-2 · S2: F0/2-17, F0/19-24, G0/1-2 |
| 1000 | Native | nativní VLAN trunku F0/1 |

Před začátkem musí být switche vymazané: `delete vlan.dat`, `erase startup-config`, `reload`.

## Část 1: Zapojení a základní nastavení

### Krok 1 – Zapojení

PC-A do F0/6 na S1, PC-B do F0/18 na S2, S1 F0/1 do S2 F0/1.

### Krok 2 – Základní konfigurace (S1, na S2 stejně s `hostname S2`)

```text
enable
configure terminal
hostname S1
no ip domain-lookup
enable secret class
line console 0
 password cisco
 login
 logging synchronous
line vty 0 15
 password cisco
 login
exit
service password-encryption
banner motd # Neopravneny pristup je zakazan! #
end
copy running-config startup-config
```

### Krok 3 – Nastavení PC

- PC-A: IP 192.168.20.13, maska 255.255.255.0
- PC-B: IP 192.168.30.13, maska 255.255.255.0

Výchozí brána se nevyplňuje – v topologii není router. Ve Windows případně povol ICMP ve firewallu, jinak ping neprojde.

## Část 2: VLAN a přiřazení portů

### Proč má S1 tři VLAN s IP adresou

VLAN 10, 20 a 30 u S1 v adresní tabulce nejsou porty, ale tři **virtuální rozhraní (SVI)** `interface vlan X`. Každé dává switchi jednu IP adresu v dané VLAN, takže S1 je dosažitelný ze tří sítí:

- VLAN 10 (192.168.10.11) – management, přes ni se S1 a S2 vidí navzájem.
- VLAN 20 (192.168.20.11) – ve stejné síti jako PC-A, PC-A ho tak může pingnout.
- VLAN 30 (192.168.30.11) – ve stejné síti jako PC-B, PC-B ho může pingnout přes trunk.

Switch 2960 je L2, takže mezi těmito VLAN **nesměruje** – jsou to jen tři samostatné adresy pro testování a správu. S2 má SVI jen ve VLAN 10.

### Krok 1 – Vytvoření VLAN (S1 i S2)

Všechny VLAN musí existovat na obou switchích, jinak je trunk nepřenese.

```text
configure terminal
vlan 10
 name Management
vlan 20
 name Sales
vlan 30
 name Operations
vlan 999
 name ParkingLot
vlan 1000
 name Native
exit
```

### Krok 1b – Management rozhraní (SVI)

**S1:**

```text
interface vlan 10
 ip address 192.168.10.11 255.255.255.0
 no shutdown
interface vlan 20
 ip address 192.168.20.11 255.255.255.0
 no shutdown
interface vlan 30
 ip address 192.168.30.11 255.255.255.0
 no shutdown
exit
```

**S2:**

```text
interface vlan 10
 ip address 192.168.10.12 255.255.255.0
 no shutdown
exit
```

### Krok 1c – Nepoužité porty do ParkingLot a vypnout

**S1:**

```text
interface range f0/2-5, f0/7-24, g0/1-2
 switchport mode access
 switchport access vlan 999
 shutdown
exit
```

**S2:**

```text
interface range f0/2-17, f0/19-24, g0/1-2
 switchport mode access
 switchport access vlan 999
 shutdown
exit
```

### Krok 2 – Přiřazení použitých portů

**S1** – PC-A do VLAN 20 (Sales):

```text
interface f0/6
 switchport mode access
 switchport access vlan 20
end
```

**S2** – PC-B do VLAN 30 (Operations):

```text
interface f0/18
 switchport mode access
 switchport access vlan 30
end
```

Ověření na obou switchích: `show vlan brief`. F0/6 musí být ve VLAN 20 (S1), F0/18 ve VLAN 30 (S2) a ostatní nepoužité porty ve VLAN 999.

## Část 3: 802.1Q trunk mezi switchi

### Krok 1 – Ruční trunk na F0/1 (S1 i S2, stejné příkazy)

```text
configure terminal
interface f0/1
 switchport mode trunk
 switchport trunk native vlan 1000
 switchport trunk allowed vlan 10,20,30,1000
end
copy running-config startup-config
show interfaces trunk
```

Ve výpisu `show interfaces trunk` zkontroluj: Mode `on`, Encapsulation `802.1q`, Native vlan `1000`, Vlans allowed on trunk `10,20,30,1000`.

Nativní VLAN musí být na obou koncích stejná, jinak se objeví chyba `%CDP-4-NATIVE_VLAN_MISMATCH`. Příkaz `switchport trunk encapsulation dot1q` se na 2960 nezadává – ten umí jen 802.1Q; je potřeba jen na switchích typu 3560/3650.

### Krok 2 – Ověření konektivity

| Ping | Výsledek | Proč |
| --- | --- | --- |
| PC-A → S1 (192.168.20.11) | Úspěch | Stejná VLAN 20 a síť. |
| PC-B → S1 (192.168.30.11) | Úspěch | Stejná VLAN 30, provoz jde přes trunk. |
| S1 → S2 (192.168.10.12) | Úspěch | Obě SVI ve VLAN 10, přes trunk. |
| PC-A → PC-B | Neúspěch | Různé VLAN (20 a 30), chybí router. |
| PC-B → S2 (192.168.10.12) | Neúspěch | Viz odpověď níže. |

**Byly pingy z PC-B na S2 úspěšné? Vysvětli.** Ne. PC-B je ve VLAN 30 (síť 192.168.30.0/24), ale S2 má IP adresu jen ve VLAN 10 (192.168.10.12). Jde o různé VLAN i podsítě a pro komunikaci mezi nimi je potřeba zařízení na 3. vrstvě (router nebo L3 switch), které v topologii chybí. PC-B navíc nemá nastavenou výchozí bránu.
