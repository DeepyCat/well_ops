# Lab: Inter-VLAN Routing s L3 switchem Catalyst 3560 – návod

> Originální lab používá router R1 (router-on-a-stick se subinterfaces). Tady je R1 nahrazen **L3 switchem 3560**, který routuje pomocí **SVI** (`interface vlan X`).
> Hostname, hesla, bannery atd. se zde neřeší. Jen VLANy, trunky a routing.

## Rozdíly oproti routeru

| Router (originál) | L3 switch 3560 (tento návod) |
|---|---|
| Routing je zapnutý ve výchozím stavu | Nutno zadat `ip routing` |
| Subinterfaces `G0/0/1.3`, `.4`, `.8` | SVI `interface vlan 3`, `interface vlan 4` |
| `encapsulation dot1Q X` | `switchport trunk encapsulation dot1q` na fyzickém portu |
| Native VLAN = subinterface `.8 native` | Native VLAN = `switchport trunk native vlan 8` na trunku |
| VLANy nemusí existovat | VLANy **musí** být vytvořené na 3560 |

---

## Topologie a adresace

```
3560 (port X) ---- (F0/5) S1 (F0/1) ---- (F0/1) S2
                           |                     |
                         F0/6                  F0/18
                         PC-A                  PC-B
```

> **Port X** na 3560 = port, který je zapojený do S1 F0/5. V návodu používám `g0/1`. Pokud máš jiný (např. `f0/1`), všude ho nahraď.

| Zařízení | Rozhraní | IP adresa | Maska | Gateway |
|---|---|---|---|---|
| 3560 | VLAN 3 (SVI) | 192.168.3.1 | 255.255.255.0 | N/A |
| 3560 | VLAN 4 (SVI) | 192.168.4.1 | 255.255.255.0 | N/A |
| 3560 | VLAN 8 (native) | N/A | N/A | N/A |
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

### Na obou switchích (S1 i S2) a na 3560

```
enable
delete flash:vlan.dat
erase startup-config
reload
```

- Na `Delete filename [vlan.dat]?` stiskni **Enter**, potvrď **Enter**.
- Na `Proceed with erase?` stiskni **Enter**.
- Na `Save? [yes/no]` napiš **no** a při reloadu potvrď **Enter**.

Po restartu zařízení začnou s prázdnou konfigurací.

---

## Část 1 – PC (IP adresy)

- **PC-A:** IP `192.168.3.3`, maska `255.255.255.0`, gateway `192.168.3.1`
- **PC-B:** IP `192.168.4.3`, maska `255.255.255.0`, gateway `192.168.4.1`

---

## Část 2 – VLANy a porty na switchích S1 a S2

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

## Část 3 – 802.1Q trunky na S1 a S2

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

### Trunk k 3560 – F0/5 (jen na S1)

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

> Protože port na 3560 ještě není nakonfigurovaný jako trunk / zapnutý, takže port F0/5 na S1 je ve stavu down a trunk se nevytvoří. Po konfiguraci 3560 (Část 4) se F0/5 v seznamu objeví.

---

## Část 4 – Inter-VLAN routing na 3560

```
enable
configure terminal

! Zapnutí routování (na L3 switchi je ve výchozím stavu vypnuté!)
ip routing

! VLANy musí na 3560 existovat
vlan 3
 name Management
vlan 4
 name Operations
vlan 8
 name Native
exit

! Trunk k S1 (S1 F0/5) - nahraď g0/1 svým portem
interface g0/1
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 8
 switchport trunk allowed vlan 3,4,8
 no shutdown
exit

! SVI = default gateway pro VLAN 3
interface vlan 3
 description Management Network
 ip address 192.168.3.1 255.255.255.0
 no shutdown
exit

! SVI = default gateway pro VLAN 4
interface vlan 4
 description Operations Network
 ip address 192.168.4.1 255.255.255.0
 no shutdown
exit
end

copy running-config startup-config
```

### Poznámky

- **`switchport trunk encapsulation dot1q`** musí být zadáno **před** `switchport mode trunk`, jinak 3560 příkaz odmítne (podporuje i ISL).
- **VLAN 8 (native)** nemá SVI ani IP adresu (stejně jako subinterface `.8` v zadání).
- Pokud je SVI `Vlan3` / `Vlan4` ve stavu **down/down**, zkontroluj, že trunk je aktivní, VLANy 3 a 4 existují (`show vlan brief`) a jsou povolené na trunku.

### Kontrola

```
show ip route
show ip interface brief
show interfaces trunk
```

V `show ip route` musíš vidět:

```
C  192.168.3.0/24 is directly connected, Vlan3
C  192.168.4.0/24 is directly connected, Vlan4
```

SVI `Vlan3` a `Vlan4` musí být **up/up**.

---

## Část 5 – Ověření

### Z PC-A (všechno musí projít)

```
ping 192.168.3.1      (default gateway - 3560)
ping 192.168.4.3      (PC-B)
ping 192.168.3.12     (S2)
```

> Pokud pingy nejdou, vypni firewall ve Windows.

### Z PC-B

```
tracert 192.168.3.3
```

**Otázka: Jaké mezilehlé IP adresy se zobrazí?**

> **192.168.4.1** – SVI `Vlan4` na 3560 (default gateway PC-B). Následuje cíl 192.168.3.3 (PC-A).

---

## Rychlý souhrn kontrolních příkazů

| Příkaz | Kde | Co ukáže |
|---|---|---|
| `show vlan brief` | S1, S2, 3560 | VLANy a přiřazené porty |
| `show interfaces trunk` | S1, S2, 3560 | Trunky, native VLAN, povolené VLANy |
| `show ip interface brief` | 3560 | Stav SVI rozhraní |
| `show ip route` | 3560 | Připojené sítě (routing) |
| `show running-config` | vše | Celá konfigurace |
