---
aliases: [Process Concept, Pojem procesu]
---

# Pojem procesu

Staré počítače spouštěly vždy jen jeden program s plnou kontrolou nad systémem. Dnešní systémy nahrávají do paměti a spouští víc programů zároveň – to vyžaduje pevnější kontrolu a oddělení jednotlivých programů. Vznikl pojem **[[proces]]** = program v běhu, základní jednotka práce moderního časově sdíleného systému.

Systém se skládá ze **systémových procesů** (kód OS) a **uživatelských procesů** (kód uživatele) – všechny mohou běžet zdánlivě souběžně, protože se CPU mezi nimi přepíná.

## Struktura procesu v paměti

Proces je víc než jen program (ten se nazývá **text section** – jen pasivní soubor instrukcí na disku, tzv. spustitelný soubor). Proces je **aktivní entita**:

| Sekce | Obsah |
| :-- | :-- |
| **Text section** | vlastní kód programu (sdílený, jen ke čtení) |
| **[[registr|Program Counter]]** | adresa další instrukce k vykonání |
| **[[zásobník|Process Stack]]** | dočasná data – parametry funkcí, návratové adresy, lokální proměnné |
| **Data section** | globální proměnné |
| **Heap** | paměť dynamicky alokovaná za běhu procesu |

![[10ac508e4797d0d19e60645e174f249c591d85a2712ad0ebd88383b4058e8b59.png]]

Program se stane procesem, když se spustitelný soubor nahraje do paměti (dvojklikem na ikonu, nebo zadáním jména v příkazové řádce).

**Důležité:** dva procesy mohou pocházet ze stejného programu (např. víc kopií webového prohlížeče) – jde ale o dvě samostatné běžící instance. Text section mají stejný, ale data, heap a stack se liší.

### Proces jako běhové prostředí pro jiný kód

Proces může sám sloužit jako prostředí pro spuštění dalšího kódu – typický příklad je **Java Virtual Machine (JVM)**. JVM běží jako obyčejný proces, který interpretuje nahraný Java bajtkód a provádí akce (přes nativní instrukce) jeho jménem.

## Stavy procesu

Proces během svého běhu mění stav:

| Stav | Popis |
| :-- | :-- |
| **New** | proces se právě vytváří |
| **Running** | právě se vykonávají jeho instrukce |
| **Waiting** | čeká na nějakou událost (dokončení I/O, přijetí signálu) |
| **Ready** | čeká, až mu bude přidělen procesor |
| **Terminated** | běh skončil |

Názvy stavů se liší systém od systému, ale samotné stavy se vyskytují všude (některé OS je dělí ještě jemněji). **V daném okamžiku může na jednom procesoru běžet jen jeden proces** – ale procesů ve stavu Ready nebo Waiting může být víc najednou.

![[0765120d736644748f06cb0b43dce9b05f7ce4846e0db78857d927da644c4ef8.png]]

## Process Control Block (PCB)

Každý proces reprezentuje v operačním systému **PCB** (Process Control Block, taky Task Control Block) – datová struktura se všemi informacemi o daném procesu:

- **Stav procesu** (new, ready, running, waiting, halted…)
- **Program counter** – adresa další instrukce
- **[[registr|CPU registry]]** – akumulátory, indexové registry, ukazatele zásobníku, obecné registry + příznaky. Spolu s program counterem se musí uložit při [[přerušení]], aby proces mohl později pokračovat správně
- **Info pro plánování CPU** – priorita procesu, ukazatele na plánovací fronty a další parametry (viz [[plánování procesů]])
- **Info o správě paměti** – hodnoty bázových/limitních registrů, stránkovací nebo segmentové tabulky
- **Účetní informace** – využitý CPU a reálný čas, časové limity, čísla úloh/procesů
- **Info o stavu V/V** – seznam přidělených V/V zařízení, seznam otevřených souborů

![[fb728cf34a51077754f07b84ce462a374da94b34a5a6ac2123fc0a614add6fec.jpg]]

Při přepnutí CPU z jednoho procesu na jiný (**context switch**) se uloží PCB starého procesu a načte PCB nového – tím se obnoví přesně tam, kde proces skončil.

**CPU Switch from Process to Process**

![[6c9fade4fee92377f108cb2f3ca3222d36175e575a2dc9e56a24d8e0da08025a.png]]

## Vlákna (Threads)

Model popsaný výše předpokládá, že proces vykonává jen **jedno vlákno instrukcí najednou** (jedno vlákno řízení = může dělat jen jednu věc – např. nemůže psát text a zároveň kontrolovat pravopis v rámci jednoho procesu). Většina moderních OS ale umožňuje procesu mít **víc vláken (threads)** a dělat tak víc věcí najednou – výhodné hlavně na vícejádrových systémech, kde vlákna běží skutečně paralelně.

U systémů podporujících vlákna se PCB rozšiřuje o informace pro **každé vlákno zvlášť**.

![[3c8ca1f9558e193bfa957004af203bfb507bc6bf595dd03ee744ac5c5b73e65e.jpg]]

## Reprezentace procesu v Linuxu

![[aab99856603b139593c8b43b1cb1f002496809c5a0f1a27b65bb5725115895df.PNG]]

**Souvisí:** [[proces]], [[registr]], [[zásobník]], [[přerušení]], [[plánování procesů]]
