# Lab: Router-on-a-Stick (Inter-VLAN Routing) – návod

> Hostname, hesla, bannery atd. se zde neřeší. Jen VLANy, trunky a routing.

## Topologie a adresace

```
R1 (G0/0/1) ---- (F0/5) S1 (F0/1) ---- (F0/1) S2
                         |                     |
                       F0/6                  F0/18
                       PC-A                  PC-B
```

| Zařízení | Rozhraní | IP adresa | Maska | Gateway |
|---|---|---|---|---|
| R1 | G0/0/1.3 | 192.168.3.1 | 255.255.255.0 | N/A |
| R1 | G0/0/1.4 | 192.168.4.1 | 255.255.255.0 | N/A |
| R1 | G0/0/1.8 | N/A | N/A | N/A |
| S1 | VLAN 3 | 192.168.3.11 | 255.255.255.0 | 192.168.3.1 |
| S2 | VLAN 3 | 192.168.3.12 | 255.255.255.0 | 192.168.3.1 |
| PC-A | NIC | 192.168.3.3 | 255.255.255.0 | 192.168.3.1 |
| PC-B | NIC | 192.168.4.3 | 255.255.255.0 | 192.168.4.1 |

| VLAN | Název | Porty |
|---|---|---|
| 3 | Management | S1: VLAN 3, F0/6; S2: VLAN 3 |
| 4 | Operations | S2: F0/18 |
| 7 | ParkingLot | S1: F0/2-4, F0/7-24, G0/1-2; S2: F0/2-17, F0/19-24, G0/1-2 |
| 8 | Native | N/A |

---

## Část 0 – Vymazání staré konfigurace (jako první!)

### Na obou switchích (S1 i S2)

```
enable
delete flash:vlan.dat
erase startup-config
reload
```

- Na `Delete filename [vlan.dat]?` stiskni **Enter**, potvrď **Enter**.
- Na `Proceed with erase?` stiskni **Enter**.
- Na `Save? [yes/no]` napiš **no** a při reloadu potvrď **Enter**.

### Na routeru R1

```
enable
erase startup-config
reload
```

- Na `Save? [yes/no]` napiš **no**, potvrď reload **Enter**.

Po restartu zařízení začnou s prázdnou konfigurací.

---

## Část 1 – PC (IP adresy)

- **PC-A:** IP `192.168.3.3`, maska `255.255.255.0`, gateway `192.168.3.1`
- **PC-B:** IP `192.168.4.3`, maska `255.255.255.0`, gateway `192.168.4.1`

---

## Část 2 – VLANy a porty na switchích

### S1

```
enable
configure terminal

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

! Management rozhraní + default gateway
interface vlan 3
 ip address 192.168.3.11 255.255.255.0
 no shutdown
exit
ip default-gateway 192.168.3.1

! Nepoužité porty -> ParkingLot, access, vypnout
interface range f0/2-4, f0/7-24, g0/1-2
 switchport mode access
 switchport access vlan 7
 shutdown
exit

! Používaný port pro PC-A -> VLAN 3
interface f0/6
 switchport mode access
 switchport access vlan 3
 no shutdown
exit
```

### S2

```
enable
configure terminal

vlan 3
 name Management
vlan 4
 name Operations
vlan 7
 name ParkingLot
vlan 8
 name Native
exit

interface vlan 3
 ip address 192.168.3.12 255.255.255.0
 no shutdown
exit
ip default-gateway 192.168.3.1

! Nepoužité porty -> ParkingLot, access, vypnout
interface range f0/2-17, f0/19-24, g0/1-2
 switchport mode access
 switchport access vlan 7
 shutdown
exit

! Používaný port pro PC-B -> VLAN 4
interface f0/18
 switchport mode access
 switchport access vlan 4
 no shutdown
exit
```

### Kontrola (na obou switchích)

```
show vlan brief
```

---

## Část 3 – 802.1Q trunky

### Trunk mezi switchi – F0/1 (na S1 **i** S2)

```
configure terminal
interface f0/1
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
 no shutdown
exit
```

> Při nastavování native VLAN se může dočasně objevit chyba (native VLAN mismatch) – to je v pořádku, zmizí po nastavení druhé strany.

### Trunk k routeru – F0/5 (jen na S1)

```
configure terminal
interface f0/5
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
 no shutdown
exit
end
```

### Uložení (S1 i S2)

```
copy running-config startup-config
```

### Kontrola

```
show interfaces trunk
```

**Otázka: Proč se F0/5 nezobrazuje v seznamu trunků?**

> Protože rozhraní G0/0/1 na routeru ještě není zapnuté (je `shutdown`), takže port F0/5 na S1 je ve stavu down a trunk se nevytvoří. Po aktivaci G0/0/1 na R1 (Část 4) se F0/5 v seznamu objeví.

---

## Část 4 – Inter-VLAN routing na R1

```
enable
configure terminal

! Zapnutí fyzického rozhraní
interface g0/0/1
 no shutdown
exit

! Subinterface pro VLAN 3
interface g0/0/1.3
 description Management Network
 encapsulation dot1Q 3
 ip address 192.168.3.1 255.255.255.0
exit

! Subinterface pro VLAN 4
interface g0/0/1.4
 description Operations Network
 encapsulation dot1Q 4
 ip address 192.168.4.1 255.255.255.0
exit

! Subinterface pro native VLAN 8 (BEZ IP adresy)
interface g0/0/1.8
 description Native VLAN
 encapsulation dot1Q 8 native
exit
end

copy running-config startup-config
```

### Kontrola

```
show ip interface brief
```

Subinterfaces `G0/0/1.3`, `G0/0/1.4` a `G0/0/1.8` musí být ve stavu **up/up**.

> Pokud by `.8` nešlo s klíčovým slovem `native`, použij `encapsulation dot1Q 8`.

---

## Část 5 – Ověření

### Z PC-A (všechno musí projít)

```
ping 192.168.3.1      (default gateway - R1)
ping 192.168.4.3      (PC-B)
ping 192.168.3.12     (S2)
```

> Pokud pingy nejdou, vypni firewall ve Windows.

### Z PC-B

```
tracert 192.168.3.3
```

**Otázka: Jaké mezilehlé IP adresy se zobrazí?**

> **192.168.4.1** – subinterface G0/0/1.4 na R1 (default gateway PC-B). Následuje cíl 192.168.3.3 (PC-A).

---

## Rychlý souhrn kontrolních příkazů

| Příkaz | Kde | Co ukáže |
|---|---|---|
| `show vlan brief` | S1, S2 | VLANy a přiřazené porty |
| `show interfaces trunk` | S1, S2 | Trunky, native VLAN, povolené VLANy |
| `show ip interface brief` | R1 | Stav subinterfaces |
| `show running-config` | vše | Celá konfigurace |
