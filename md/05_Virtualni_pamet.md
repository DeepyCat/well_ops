---
aliases: [Virtual Memory, Demand Paging, Page Fault]
---

# Virtuální paměť a demand paging

**[[virtuální paměť|Virtuální paměť]]** umožňuje spouštět procesy, které **nejsou celé** v hlavní paměti najednou. Hlavní výhody:

- program může být **větší než fyzická paměť**
- abstrahuje hlavní paměť do jednoho velkého uniformního pole úložiště, odděluje logickou paměť (pohled uživatele) od fyzické
- programátor se nemusí starat o limity fyzické paměti
- usnadňuje sdílení souborů mezi procesy a sdílenou paměť
- efektivnější vytváření procesů

Není to ale zadarmo – špatně použitá virtuální paměť může výrazně zpomalit systém.

## Demand Paging (stránkování na vyžádání)

![Demand Paging a výpadek stránky Page Fault](img/virtual-memory-page-fault.svg)


Místo nahrání **celého** programu do paměti při spuštění se stránky nahrávají **jen když jsou potřeba**. Stránky, ke kterým se program nikdy nedostane, se do paměti vůbec nenahrají.

Systém je podobný [[swapping|swappingu]], ale místo přesunu **celého procesu** pracuje s jednotlivými **stránkami** – proto se nepoužívá termín "swapper", ale **pager** ("líný swapper", lazy swapper).

### Jak se rozliší, co je v paměti

Používá se stejný **bit valid/invalid** jako u [[stránkování]] – ale s jiným významem:

- **valid** – stránka je legální **a zároveň** je v paměti
- **invalid** – stránka buď vůbec nepatří do adresního prostoru procesu, nebo patří, ale momentálně je jen **na disku**

Záznam v tabulce stránek pro stránku na disku obsahuje buď jen "invalid", nebo přímo adresu stránky na disku.

## Page Fault (výpadek stránky)

Když proces přistoupí na stránku označenou jako invalid (a přitom platnou, jen zrovna na disku), nastane **page fault** – hardware to při překladu adresy zjistí a vyvolá trap do OS.

### Postup obsluhy page faultu

1. Zkontroluje se interní tabulka (obvykle součást [[PCB]]) – byl přístup platný, nebo ne?
2. Pokud neplatný → **ukončení procesu**. Pokud platný, ale stránka není v paměti → pokračuje se k jejímu nahrání
3. Najde se **volný rámec** (např. ze seznamu volných rámců)
4. Naplánuje se **diskový přesun** – požadovaná stránka se přečte z disku do nově přiděleného rámce
5. Po dokončení čtení se aktualizuje tabulka stránek (i interní tabulka procesu) – stránka je teď **v paměti**
6. **Restartuje se instrukce**, která byla přerušena trapem – proces pokračuje, jako by stránka byla v paměti odjakživa

### Proč to funguje efektivně

Pokud OS správně odhadne, které stránky proces skutečně potřebuje, a nahraje jen ty, proces poběží prakticky stejně, jako kdyby byly nahrané všechny stránky najednou – jen s menší spotřebou paměti a rychlejším startem.

**Souvisí:** [[stránkování]], [[swapping]], [[PCB]], [[přerušení]], [[proces]]
