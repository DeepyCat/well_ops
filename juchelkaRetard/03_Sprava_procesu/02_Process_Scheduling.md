---
aliases: [Process Scheduling, Plánování procesů podrobně]
---

# Plánování procesů (podrobně)

Cíl **multiprogramování** – mít vždy nějaký proces běžící, maximalizovat využití CPU. Cíl **sdílení času (time sharing)** – přepínat procesor mezi procesy tak často, aby s nimi uživatel mohl interaktivně pracovat. **[[plánování procesů|Plánovač procesů]]** vybírá dostupný proces pro spuštění na CPU. Na jednoprocesorovém systému běží vždy nejvýš jeden proces, ostatní čekají.

## Plánovací fronty

- **Job queue** – všechny procesy v systému
- **Ready queue** – procesy v hlavní paměti, připravené a čekající na spuštění (obvykle jako [[spojový seznam]] – hlavička fronty ukazuje na první a poslední [[PCB]])
- **Device queue** – fronta procesů čekajících na konkrétní V/V zařízení (každé zařízení má vlastní frontu)

![[ca5ac492116f812ecf62ce379603b06045dac1b3fd4e0f24a1f91b860cbf1ecf.png]]

## Fronta ve schématu (queueing diagram)

Nový proces jde nejdřív do **ready queue**, čeká na výběr (dispatch). Po přidělení CPU může nastat:

- proces vyžádá V/V → jde do V/V fronty
- proces vytvoří potomka a čeká na jeho ukončení
- proces je násilně odebrán z CPU (kvůli [[přerušení]]) → zpátky do ready queue

V prvních dvou případech se proces nakonec přepne ze stavu waiting do ready a vrací se do ready queue. Cyklus se opakuje, dokud proces neskončí – pak se odstraní ze všech front a uvolní se jeho [[PCB]] a zdroje.

![[9a644713a05fe2a094c1ae13071c42b080e16a277bc3d3a2eff98b4c4614a188.png]]

## Plánovače (Schedulers)

Proces během své existence prochází různými plánovacími frontami – vybírá ho příslušný plánovač.

### Long-term scheduler (Job scheduler)

- Vybírá, které procesy se dostanou do ready queue (z fronty na disku – spooling)
- Volá se **zřídka** (sekundy až minuty) – může si dovolit být pomalejší
- Řídí **stupeň multiprogramování** (počet procesů v paměti)
- Musí vybírat vyváženou směs procesů – viz níže

### Short-term scheduler (CPU scheduler)

- Vybírá, který proces se spustí na CPU jako další
- Volá se **velmi často** (desítky až stovky milisekund) – musí být rychlý
- Na některých systémech je to jediný plánovač, co existuje

Kdyby výběr trval 10 ms a proces pak běžel 100 ms, plánování by "zabralo" 10/(100+10) ≈ 9 % výkonu CPU zbytečně.

### Medium-term scheduler

Volitelná mezivrstva, používaná hlavně u systémů se sdílením času. Dočasně odebere proces z paměti (a tím i z boje o CPU), uloží ho na disk a později vrátí zpátky, kde skončil – tomuto mechanismu se říká **swapping**. Používá se ke zlepšení směsi procesů, nebo když dojde paměť.

![[28d8392ddb64e0a910f1af4d5aea6e2e254f0646fbbe9ed37e7904c942e20d4d.png]]

## CPU-bound vs. I/O-bound procesy

- **I/O-bound proces** – tráví víc času čekáním na V/V než počítáním, hodně krátkých "výbuchů" práce CPU
- **CPU-bound proces** – tráví víc času počítáním, málo, ale dlouhých "výbuchů" práce CPU

Long-term scheduler by měl vybírat **dobrou směs** obou typů – samé I/O-bound procesy = prázdná ready queue, samé CPU-bound = nevyužitá V/V zařízení. Nejlepší výkon má systém s vyváženou kombinací.

## Přepnutí kontextu (Context Switch)

[[přerušení|Přerušení]] donutí OS přepnout CPU z aktuálního úkolu na rutinu jádra. Při tom se musí uložit aktuální kontext běžícího procesu (do jeho [[PCB]]), aby šel později obnovit – kontext zahrnuje hodnoty [[registr|CPU registrů]], stav procesu a info o správě paměti.

**Context switch** = uložení stavu starého procesu + načtení stavu nového. Je to čistá režie ("pure overhead") – systém během přepínání nedělá žádnou užitečnou práci. Typická rychlost: pár milisekund, závisí na:

- rychlosti paměti a počtu registrů k překopírování
- existenci speciálních instrukcí (např. jedna instrukce pro uložení/načtení všech registrů)
- hardwarové podpoře (některé procesory mají víc sad registrů – stačí přepnout ukazatel, ne kopírovat data)
- složitosti [[PCB]] a operačního systému

![[6c9fade4fee92377f108cb2f3ca3222d36175e575a2dc9e56a24d8e0da08025a.png]]

## Multitasking na mobilních zařízeních

### iOS

Starší verze iOS neumožňovaly multitasking uživatelských aplikací – běžela jen jedna aplikace v popředí, ostatní byly pozastavené. Od **iOS 4** je omezený multitasking na pozadí, jen pro vybrané typy úloh:

- jednorázová úloha konečné délky (dokončení stahování)
- notifikace o události (nová zpráva)
- dlouhoběžící úlohy na pozadí (přehrávač zvuku)

Apple multitasking záměrně omezuje kvůli výdrži baterie a spotřebě paměti.

### Android

Nemá takové restrikce na typy aplikací běžících na pozadí. Aplikace potřebující zpracování na pozadí použije **službu (service)** – samostatnou komponentu bez uživatelského rozhraní, s malou pamětní stopou, která běží i po pozastavení hlavní aplikace (např. streamovací hudební přehrávač na pozadí dál posílá zvuk zvukovému ovladači).

**Souvisí:** [[proces]], [[PCB]], [[plánování procesů]], [[přerušení]], [[spojový seznam]]
