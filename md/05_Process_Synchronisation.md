---
aliases: [Process Synchronisation, proces synchronizace, Synchronizace procesů]
---

# Synchronizace procesů

Když víc procesů (vláken) přistupuje ke stejnému prostředku (paměť, soubor, V/V, CPU…), je nutné zajistit **konzistentní stav** tohoto prostředku. Pokud jeden proces zapisuje, jiný by neměl zapisovat ani číst, dokud zápis neskončí – jinak by mohl přečíst/zapsat jen částečně modifikovaná data. O konzistenci se starají **algoritmy synchronizace procesů**.

## Bernsteinovy podmínky

1. Je zakázáno **číst** z prostředku, pokud do něj právě **zapisuje** jiný proces
2. Je zakázáno **zapisovat** do prostředku, pokud do něj právě **zapisuje** jiný proces

## Kritická sekce

![Kritická sekce a Coffmanovy podmínky uváznutí Deadlock](img/critical-section-mutex.svg)


**Kritická sekce (critical section)** je nejmenší část kódu, kde dochází k přístupu ke sdílenému prostředku, ke kterému nesmí přistupovat víc procesů/vláken zároveň. Programy usilující o vstup musí použít **synchronizační primitivum**, které zajistí exkluzivní přístup a konečnou dobu čekání.

### Tři podmínky řízení přístupu do kritické sekce

- **Výhradní přístup** – dovnitř smí nejvýš jeden proces
- **Rozhodování o vstupu** – o vstupu rozhodují jen procesy, které o něj usilují
- **Omezené čekání** – rozhodnutí nesmí být odkládáno do nekonečna (viz [[starvation]])

Procesy čekající na vstup mohou používat **aktivní čekání** – neustále se pokoušet o vstup.

## Synchronizační primitiva

### Zámek a instrukce TSL (Test and Set Lock)

Jednoduchá metoda tvorby zámku, implementovatelná jako procesorová instrukce (většina moderních procesorů ji má). Při vyvolání nastaví proměnnou `Lock` na "zamčeno" a vrátí její předchozí hodnotu. Umístí se do čekací smyčky (aktivní čekání):

```
while TestAndSet(Lock) do { nothing };
   ...kód kritické sekce...
Lock := false;
```

Musí být **atomická** (neděliteľná – buď proběhne celá, nebo vůbec), jinak nechrání spolehlivě.

### Semafor

**Binární semafor** – dva stavy:
- **0 (červená)** – zákaz vstupu. `wait()` proces zablokuje a zařadí do fronty čekajících. `release()` probudí prvního čekajícího (nebo nastaví na 1, je-li fronta prázdná)
- **1 (zelená)** – povolení vstupu. `wait()` pustí proces dovnitř a nastaví na 0

**Obecný semafor** – čítač s libovolnou celočíselnou hodnotou:
- **záporná hodnota** = počet procesů čekajících ve frontě
- **0** = prostředek je využíván (jako červená)
- **kladná hodnota** = semafor je "předplacen", tolikrát lze projít bez čekání

`Wait()` sníží čítač o 1 (je-li výsledek < 0, proces se zablokuje); `Signal()` zvýší čítač o 1 (je-li výsledek ≤ 0, odblokuje prvního čekajícího).

### Mutex (Mutual Exclusion)

Zabraňuje současnému vykonávání dvou kritických kódů nad stejným prostředkem. Má dva stavy: **volný** a **vlastněný** (drží ho konkrétní [[PID|proces]] + počet uzamknutí).

- **Získání (lock)** – volný → proces se stává vlastníkem (počet = 1); vlastní ho už tenhle proces → počet +1; vlastní ho jiný proces → čekání
- **Uvolnění (unlock)** – vlastní aktuální proces → počet −1, při 0 se uvolní čekajícím; jiné případy jsou nedefinovaný stav

**Riziko:** špatné použití vede ke zpomalení (procesy čekají na sebe navzájem) nebo k **[[uváznutí|uváznutí (deadlocku)]]**.

## Klasické synchronizační úlohy

### Producent–konzument

Producent generuje datové položky do fronty omezené velikosti, konzument je odebírá. Konzument čeká, když je fronta prázdná; producent čeká, když je plná.

**Řešení dvěma semafory:**
- **Semafor 1** = počet volných míst (inicializován na velikost fronty) – producent ho sníží před vložením, při 0 se zablokuje
- **Semafor 2** = počet zaplněných míst (inicializován na 0) – konzument ho sníží před odebráním, při 0 se zablokuje

### Čtenáři–písaři

Víc vláken přistupuje ke sdílené paměti – **čtenáři** jen čtou, **písaři** zapisují. Souběžné čtení víc čtenářů je v pořádku, ale **zápis musí být exkluzivní** vůči čemukoli jinému (čtení i zápisu).

- **Priorita čtenářů** – čtenář nikdy nečeká, pokud zdroj nedrží písař → hrozí **stárnutí (starvation)** písařů
- **Priorita písařů** – připravený písař předbíhá čekající čtenáře → hrozí stárnutí čtenářů

### Hodující filozofové

Klasický model paralelního programování: u kulatého stolu sedí n filozofů, mezi každou dvojicí je jedna hůlka (celkem n hůlek pro n filozofů), k jídlu potřebují dvě.

- Pokud všichni najednou zvednou pravou hůlku, nikdo nemá levou → **uváznutí**
- Řešení:
  - **Jedna židle navíc** – ke stolu vpustit jen n−1 filozofů najednou, aspoň jeden se vždy najedí
  - **Přidání číšníka** – rozhoduje, kdo si smí vzít hůlky, brání uváznutí
  - **Hierarchie zdrojů** – hůlky očíslované, vždy se bere nejdřív hůlka s nižším číslem – zabraňuje cyklickému čekání

## Synchronizační rizika

### Uváznutí (Deadlock)

Procesy se navzájem zablokují křížovým čekáním na synchronizačních primitivech – dokončení první akce vyžaduje dokončení druhé, a naopak. Řeší se buď preventivně (návrh algoritmu), nebo zásahem uživatele (násilné ukončení procesu, rollback transakce).

**Příklady:**
- Proces A drží tiskárnu a chce pásku, proces B drží pásku a chce tiskárnu → oba čekají navěky
- Proces A zamkl tabulku X a čeká na Y, proces B zamkl Y a čeká na X → uváznutí

### Livelock

Procesy **aktivně** zkouší pokračovat, ale opakovaně selhávají – na rozdíl od deadlocku nejsou pasivně zablokované, ale ani se nikam neposunou (např. u filozofů: všichni zvednou levou hůlku, nikdo nemá pravou, všichni ji položí a zkusí znovu – donekonečna).

### Starvation (vyhladovění)

Proces čeká na přidělení prostředků nekonečně dlouho, protože pořád přicházejí procesy s vyšší prioritou. Příklad: algoritmus plánování disku upřednostňující nejbližší sektor (Shortest Seek Time First) může požadavek daleko od hlavy odsouvat donekonečna.

### Souběh (Race Condition)

Dva nebo víc procesů přistupuje ke stejným datům, dojde k [[přepnutí kontextu|přepnutí kontextu]] uprostřed operace a modifikace dat proběhne špatně – kdyby procesy běžely striktně po sobě, chyba by nenastala. Typický příklad: souběžný vklad a výběr z konta, souběžné vytváření souboru stejného jména.

**Souvisí:** [[proces]], [[vlákno]], [[uváznutí]], [[starvation]], [[přepnutí kontextu]], [[IPC]]
