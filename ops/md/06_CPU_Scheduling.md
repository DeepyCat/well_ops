---
aliases: [CPU Scheduling, Plánování CPU]
---

# Plánování CPU

![Algoritmy plánování CPU — FCFS, SJF, Round Robin a Priority Scheduling](img/cpu-scheduling-algorithms.svg)

Plánování CPU je základ multiprogramovaných systémů – přepínáním procesoru mezi procesy dělá OS počítač produktivnější.

## Základní koncept

Na jednoprocesorovém systému běží vždy jen jeden proces, ostatní čekají. Cíl multiprogramování: **mít vždy nějaký proces běžící**, maximalizovat využití CPU. Proces se vykonává, dokud nemusí čekat (typicky na V/V) – bez multiprogramování by CPU v tu chvíli nečinně čekal. S multiprogramováním OS v takovém okamžiku přidělí CPU jinému procesu.

### Cyklus CPU-I/O burst

Běh procesu se skládá ze střídání **CPU burst** (úsek počítání) a **I/O burst** (čekání na V/V) – proces mezi nimi přepíná, dokud nezavolá ukončení.

- Rozložení délky CPU burstů je typicky **exponenciální** – hodně krátkých burstů, málo dlouhých
- **I/O-bound proces** – hodně krátkých CPU burstů
- **CPU-bound proces** – málo, ale dlouhých CPU burstů

Tohle rozložení ovlivňuje volbu vhodného plánovacího algoritmu.

### CPU scheduler

Kdykoli je CPU volné, OS musí vybrat proces z **ready queue** – to dělá **short-term (CPU) scheduler**. Fronta nemusí být FIFO – může jít o frontu s prioritou, strom, nebo neuspořádaný spojový seznam. Záznamy ve frontě jsou [[PCB]] procesů.

### Preemptivní plánování

Rozhodnutí o plánování CPU nastává ve čtyřech situacích:

1. Proces přejde z **running** do **waiting** (V/V požadavek, čeká na potomka)
2. Proces přejde z **running** do **ready** (kvůli [[přerušení]])
3. Proces přejde z **waiting** do **ready** (V/V dokončeno)
4. Proces **skončí**

Situace 1 a 4 jsou **nepreemptivní** (proces sám uvolní CPU); situace 2 a 3 jsou **preemptivní** (OS může proces násilně odebrat).

### Dispatcher

Modul, který předá kontrolu CPU procesu vybranému schedulerem:

- [[přepnutí kontextu|přepnutí kontextu]]
- přepnutí do uživatelského režimu
- skok na správné místo v programu (obnovení běhu)

Musí být **co nejrychlejší**, protože se volá při každém přepnutí procesu. Doba, za kterou dispatcher zastaví jeden proces a spustí druhý, se nazývá **dispatch latency**.

![Kritéria a metriky plánování CPU](img/scheduling-criteria.svg)

## Kritéria plánování

| Kritérium | Popis | Cíl |
| :-- | :-- | :-- |
| **CPU utilization** | jak moc je CPU vytížené (0–100 %, reálně 40–90 %) | maximalizovat |
| **Throughput** | počet dokončených procesů za jednotku času | maximalizovat |
| **Turnaround time** | čas od zadání do dokončení procesu (čekání v paměti + ready queue + běh na CPU + V/V) | minimalizovat |
| **Waiting time** | součet času stráveného čekáním v ready queue | minimalizovat |
| **Response time** | čas od zadání do **prvního** výstupu (u interaktivních systémů lepší metrika než turnaround time) | minimalizovat |

## Plánovací algoritmy

### FCFS (First-Come, First-Served)

Nejjednodušší algoritmus – kdo požádá o CPU první, dostane ho první. Implementace přes FIFO frontu. **Nevýhoda:** průměrná doba čekání bývá dost dlouhá (efekt "konvoje" – krátký proces čeká za dlouhým).

### SJF (Shortest Job First)

Přesněji "shortest-next-CPU-burst" – CPU se přidělí procesu s **nejkratším příštím CPU burstem** (ne celkovou délkou procesu). Při shodě se rozhoduje podle FCFS.

### PS (Priority Scheduling)

SJF je speciální případ obecného plánování podle priority – CPU dostane proces s **nejvyšší prioritou**. Procesy se stejnou prioritou se řadí podle FCFS. SJF je vlastně priorita = převrácená hodnota očekávaného CPU burstu (delší burst = nižší priorita).

### RR (Round Robin)

Navrženo speciálně pro systémy se sdílením času – podobné FCFS, ale s **preempcí**. Definuje se malá jednotka času – **time quantum** (typicky 10–100 ms). Ready queue se chová jako **kruhová fronta** – plánovač postupně obchází procesy a každému přidělí CPU max. na dobu jednoho time quanta.

- Příliš krátké quantum = časté přepínání kontextu, zbytečná režie
- Příliš dlouhé quantum = RR se chová jako FCFS
- Doporučení: **80 % CPU burstů by mělo být kratších** než zvolené time quantum

**Souvisí:** [[plánování procesů]], [[PCB]], [[přerušení]], [[přepnutí kontextu]]
