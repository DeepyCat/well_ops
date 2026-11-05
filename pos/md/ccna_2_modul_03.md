# ccna2-module-03 (VLAN #1)

* **Definice:** VLAN slouží k rozdělení sítě na menší segmenty, takže zařízení v jedné VLAN spolu komunikují a nemusí spravovat provoz z jiných sítí. Lze organizovat podle umístění, uživatelů nebo typu zařízení.
* **Výhody:** Zlepšuje výkon sítě (menší domény vysílání), zvyšuje zabezpečení a implementuje zásady přístupu.

## Typy VLAN

* **Default VLAN** (výchozí VLAN 1)
* **Data VLAN** (uživatelský provoz)
* **Native VLAN** (pro kmenové linky)
* **Management VLAN** (pro správu přepínače)
* **Voice VLAN** (pro IP telefonii)

## VLAN Trunks

* Umožňují šíření veškerého provozu mezi přepínači.
* Zařízení připojená k různým přepínačům ve stejné VLAN mohou komunikovat bez routeru.

### Identifikace VLAN pomocí tagu (IEEE 802.1Q)
Standardní záhlaví ethernetového rámce neobsahuje informace o VLAN. Pro kmenovou síť je nutné přidat 4bajtový tag (značkování/tagging) podle standardu IEEE 802.1Q.

* **Nativní VLAN:** Standard 802.1Q specifikuje nativní VLAN pro kmenové linky. Neoznačený rámec příchozí na kmenový port je přiřazen k nativní VLAN.

## Konfigurace a příkazy VLAN

* **Rozsahy VLAN:** Normální (1–1005), Rozšířený (1006–4094).
* **Uložení databáze:** Ve flash paměti v souboru `vlan.dat`.
* **Protokol VTP:** Pomocí VLAN Trunking Protocol se synchronizuje databáze VLAN mezi přepínači.

### Základní příkazy:

* `vlan vlan-id` / `name vlan-name` – vytvoření VLAN a pojmenování
* `vlan 100,102,105-107` – vytvoření více VLAN najednou
* `switchport mode access` & `switchport access vlan vlan-id` – přiřazení portu do VLAN
* `show vlan` – zobrazení nastavených VLAN
* `show interfaces fa0/18 switchport` – detaily k portu
* `no vlan vlan-id` – odstranění VLAN

## Vymazání konfigurace VLAN

* Celý soubor `vlan.dat` lze smazat příkazem `delete flash:vlan.dat` (zkráceně `delete vlan.dat`) v privilegovaném režimu EXEC.
* **Obnovení továrního nastavení Catalystu:** Odpojte kabely (kromě konzolového a napájecího), zadejte `erase startup-config` a následně `delete vlan.dat`.