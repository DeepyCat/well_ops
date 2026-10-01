---
aliases: [Multitasking, Multithreading]
---

# Multitasking a multithreading

## Algoritmus – vlastnosti

- **Hromadnost** – řeší celou třídu úloh, ne jen jeden konkrétní případ
- **Předvídatelnost** – pro stejný vstup vždy stejný výsledek
- **Opakovatelnost** – lze spustit znovu se stejným výsledkem
- **Konečnost** – musí se v konečném čase zastavit

## Program vs. proces

- **Program** – algoritmus zapsaný v programovacím jazyce (**zdrojový kód**), který se buď **interpretuje** (Interpreter – vykonává řádek po řádku za běhu) nebo **kompiluje** (Kompilátor – přeloží předem do strojového kódu)
- **[[proces|Proces]]** – spuštěný program nebo běžící služba; spotřebovává (konzumuje) [[CPU|procesor]], [[RAM|paměť]] a V/V operace

## Multitasking

Schopnost systému zdánlivě vykonávat víc úloh zároveň, přepínáním [[CPU]] mezi procesy po **časových kvantech**.

- **Kooperativní multitasking** – proces sám dobrovolně předává řízení jinému procesu (starší přístup, riziko: nekorektní proces nikdy nepředá řízení a zablokuje celý systém)
- **Preemptivní multitasking** – OS násilně odebírá CPU procesu po uplynutí časového kvanta nebo kvůli [[přerušení]] (dnešní standard)

### Atomické operace a příklad souběhu

**Atomická operace** – nedělitelná operace, buď proběhne celá, nebo vůbec (nemůže ji přerušit [[přepnutí kontextu]] uprostřed).

Příklad, proč na tom záleží (analogie se semaforem na trati):

1. Proces zkontroluje, že je na semaforu signál "volno"
2. Zjistí, že ano, chystá se nastavit "stůj" a vpustit vlak
3. V tu chvíli dojde k [[přepnutí kontextu|přepnutí]] na jinou úlohu
4. Druhá úloha taky zkontroluje "volno", nastaví "stůj" a vpustí vlak z druhé strany
5. Přepnutí zpátky na první úlohu
6. Ta dokončí nastavení na "stůj" a vpustí vlak – **kolize**

Kdyby byla celá sekvence "zkontroluj → nastav → vpusť" **atomická** (neděliteľná), ke kolizi by nedošlo – proto se podobné operace chrání [[semafor|semafory]] nebo [[mutex]]em.

## Multithreading

- **[[vlákno|Vlákno]]** – nejmenší jednotka vykonávání v rámci procesu
- **Multitasking na úrovni programu** – paralelní programování, víc vláken jednoho procesu běží (zdánlivě nebo skutečně) zároveň
- **Sdílení paměti vlákny** – na rozdíl od procesů (izolovaných) vlákna jednoho procesu sdílejí stejný adresní prostor – rychlejší komunikace, ale riziko [[proces synchronizace|souběhu]]

## Ochrana paměti

- Každý proces běží ve **vlastním adresním prostoru**
- Adresní prostor procesu přiděluje **jádro OS**
- Hardwarovou podporu zajišťuje **modul správy paměti (MMU)** v procesoru

## Nástroje Windows 10

- **Správce úloh (Task Manager)** – přehled běžících procesů, využití zdrojů
- **Sledování prostředků (Resource Monitor)**
- **Process Monitor** – detailní sledování aktivity procesů (souborový systém, registr, síť)
- **`systeminfo`** – textový výpis informací o systému
- **`msinfo32`** – grafický nástroj se systémovými informacemi
- **Služby (Services)** – správa systémových služeb

**Souvisí:** [[proces]], [[vlákno]], [[CPU]], [[přerušení]], [[proces synchronizace]], [[semafor]]
