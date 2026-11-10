# CCNA2 - Modul 03 (VLAN #2)

## VLAN Trunks
* **Definice:** VLAN trunk je propojení vrstvy 2 mezi dvěma přepínači, které přenáší provoz pro všechny VLAN (pokud není seznam povolených VLAN omezen ručně nebo dynamicky).

### Konfigurační příkazy
```text
interface interface-id
switchport mode trunk
switchport trunk native vlan vlan-id
switchport trunk allowed vlan vlan-list
end
```
* **Zrušení nastavení:** `no switchport trunk allowed`, `no switchport trunk native vlan`

### Verifikační příkazy
```text
show interfaces interface-ID switchport
```

---

## Dynamic Trunking Protocol (DTP)
* **Účel:** DTP může urychlit proces konfigurace pro správce sítě. Rozhraní ethernetových trunkingových sítí podporují různé režimy trunkingu. Rozhraní lze nastavit na trunking, netrunking, nebo na vyjednávání trunkingu se sousedním rozhraním. Vyjednávání trunkingu je spravováno protokolem DTP, který funguje **pouze na bázi point-to-point** mezi síťovými zařízeními.
* **Fungování:** DTP spravuje vyjednávání trunku pouze v případě, že je port na sousedním přepínači nakonfigurován v režimu trunku, který podporuje DTP. Přepínače od jiných dodavatelů DTP nepodporují.

### Konfigurační příkazy
* `switchport mode dynamic auto` – Povolení dynamického trunkingového protokolu.
* `switchport mode trunk` – Port je vždy zapnutý v režimu trunk.
* `switchport mode trunk`, `switchport nonegotiate` – Povolení trunkingu z přepínače Cisco do zařízení, které nepodporuje DTP (nebude generovat rámce DTP).
* *Poznámka:* Viz tabulka kombinací nastavení pro obě strany.

### Verifikační příkazy
```text
show dtp interfaces
```