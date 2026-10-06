---
aliases: [Segmentation, Segmentace paměti]
---

# Segmentace
![Segmentace paměti — tabulka segmentů a fyzická paměť](img/segmentace.svg)


Logický adresní prostor procesu je **kolekce segmentů** – každý má jméno a délku. Adresa se skládá ze **dvou složek**: čísla segmentu a offsetu (posunutí uvnitř segmentu). V praxi se segmenty číslují místo pojmenování: `<segment-number, offset>`.

## Proč segmentace vzniká přirozeně

C kompilátor typicky vytváří samostatné segmenty pro:

1. Kód (text section)
2. Globální proměnné
3. [[heap]] (dynamicky alokovaná paměť)
4. [[zásobník|Zásobníky]] jednotlivých vláken
5. Standardní C knihovnu

Knihovny linkované při kompilaci mohou dostat vlastní segmenty – loader jim pak přidělí čísla segmentů.

![Detaily segmentové tabulky a ochrana paměti](img/segmentation-table-details.svg)

## Segmentation hardware – segmentová tabulka

Fyzická paměť je pořád jednorozměrná posloupnost bajtů, takže dvourozměrnou adresu `<segment, offset>` je nutné převést na jednorozměrnou fyzickou adresu. To zajišťuje **segmentová tabulka**:

- **segment base** – počáteční fyzická adresa segmentu
- **segment limit** – délka segmentu

Postup: číslo segmentu je index do tabulky; offset musí být mezi 0 a limitem segmentu (jinak trap – přístup mimo segment); pokud je v pořádku, sečte se s base → fyzická adresa.

### Příklad

5 segmentů (0–4). Segment 2 má délku 400 B a začíná na adrese 4300. Odkaz na bajt 53 segmentu 2 → 4300 + 53 = **4353**. Odkaz na segment 3, bajt 852 (base 3200) → 3200 + 852 = **4052**. Odkaz na bajt 1222 segmentu 0 (délka jen 1000 B) → **trap** (mimo segment).

## Výhody a nevýhody

- Odpovídá přirozenému logickému členění programu (kód/data/zásobník…)
- Umožňuje **nesouvislý** adresní prostor procesu (řeší externí fragmentaci stejně jako [[stránkování]])
- Segmenty ale mají **různou velikost** – trpí stejnými problémy s hledáním vhodné díry jako [[02_Hlavni_pamet|souvislé přidělování]] (first/best/worst fit), tedy i externí fragmentací

**Souvisí:** [[stránkování]], [[MMU]], [[virtuální paměť]], [[heap]], [[zásobník]]
