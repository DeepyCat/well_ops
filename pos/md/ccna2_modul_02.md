# ccna2-module-02 (Koncepty přepínání)

* **Vstup:** Popisuje port, kudy rámec vstupuje do zařízení.
* **Výstup:** Popisuje port, který rámec použije při opouštění zařízení.

## Tabulka MAC adres (CAM tabulka)
LAN přepínač směruje provoz na základě vstupního portu a cílové MAC adresy ethernetového rámce.
* Tabulka MAC adres je uložena v paměti **CAM** (Content Addressable Memory).
* Popisuje striktní asociaci mezi MAC adresami a porty.

### Zpracování příchozích rámců
Každý rámec je kontrolován na nové informace zkoumáním zdrojové MAC adresy a čísla vstupního portu:
* **Neznámá zdrojová MAC:** Přidá se do tabulky spolu s číslem příchozího portu.
* **Existující zdrojová MAC:** Aktualizuje se časovač obnovení (výchozí doba uchování je 5 minut). Pokud dorazí ze 

### Zpracování cílové MAC adresy
Pokud je cílová MAC adresa **unicastová**, přepínač hledá shodu:
* **Shoda existuje:** Rámec je přeplán ven ze zadaného portu.
* **Shoda neexistuje (neznámý unicast):** Switch přepošle rámec na všechny porty kromě příchozího.
* **Broadcast nebo Multicast:** Rámec je odeslán na všech portech kromě příchozího.

## Metody přepínání rámců (Vrstva 2)
1. **Store-and-forward switching**
2. **Cut-through switching**

## Kolizní a Broadcast domény
* **Kolizní domény:** Ve starších ethernetových segmentech založených na rozbočovačích sdílelo médium více zařízení. Pokud komunikují současně, dojde ke kolizi.
* **Broadcast domény:** Soubor propojených přepínačů tvoří jednu broadcast doménu vrstvy 2. Lze ji rozdělit pouze zařízením síťové vrstvy (routerem), které segmentuje jak broadcast, tak kolizní domény.

### Duplexní režim
* Vzájemné propojení portů v **plném duplexu** (full-duplex) eliminuje kolizní domény a umožňuje plnou šířku pásma oběma směry, což dramaticky zvyšuje výkon sítě (vyžadováno pro 1 Gb/s a vyšší).