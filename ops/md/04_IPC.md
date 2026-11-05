---
aliases: [Interprocess Communication, IPC, Meziprocesová komunikace]
---

# IPC – meziprocesová komunikace

**[[proces|Procesy]]** běžící souběžně v systému jsou buď **nezávislé** (neovlivňují jiné procesy, nesdílí s nimi data), nebo **spolupracující** (ovlivňují se a sdílí data). Spolupracující procesy potřebují mechanismus **IPC (Interprocess Communication)** pro výměnu dat.

## Proč procesy spolupracují

- **Sdílení informací** – víc uživatelů může chtít pracovat se stejnými daty (sdílený soubor)
- **Zrychlení výpočtu** – rozdělení úlohy na podúlohy běžící paralelně (funguje jen na víc jádrech CPU)
- **Modularita** – rozdělení systému na samostatné procesy/vlákna
- **Pohodlí** – i jeden uživatel dělá víc věcí zároveň (edituje, poslouchá hudbu, kompiluje)

## Dva základní modely IPC

![Modely meziprocesové komunikace IPC](img/ipc-models.svg)


| Model | Princip |
| :-- | :-- |
| **Sdílená paměť** | oblast paměti sdílená spolupracujícími procesy, komunikace čtením/zápisem dat |
| **Message passing** | komunikace přes zprávy posílané mezi procesy |

### Srovnání

- **Message passing** – lepší pro malé objemy dat (žádné konflikty), snazší implementace v distribuovaném systému, ale pomalejší (typicky přes systémová volání → zásah jádra)
- **Sdílená paměť** – rychlejší (jen počáteční systémové volání pro vytvoření oblasti, pak běžný přístup do paměti bez zásahu jádra), ale trpí problémy s koherencí cache na systémech s víc jádry

Na systémech s víc procesorovými jádry proto novější výzkumy ukazují lepší výkon u message passing.

## Sdílená paměť

Procesy musí souhlasit se zrušením běžné ochrany paměti a vytvořit **sdílenou oblast** – ostatní procesy si ji připojí do svého adresního prostoru. Formát dat a jejich umístění určují **procesy samy**, ne OS. Procesy taky samy zodpovídají za to, že nezapisují na stejné místo současně.

### Producer–consumer problém

Klasický vzor spolupracujících procesů – **producer** vyrábí data, **consumer** je spotřebovává (např. kompilátor produkuje assembler kód, který spotřebovává assembler). Řešení sdílenou pamětí potřebuje **buffer**:

- **Neomezený buffer (unbounded)** – žádný praktický limit velikosti, consumer možná čeká na nová data, producer může vždy vyrábět
- **Omezený buffer (bounded)** – pevná velikost, consumer čeká, když je buffer prázdný, producer čeká, když je plný

## Message-passing systémy

Umožňuje komunikaci a synchronizaci **bez sdílení adresního prostoru** – hodí se hlavně v distribuovaném prostředí (procesy na různých počítačích). Základní operace: **`send(message)`**, **`receive(message)`**.

### Komunikační spoj (link)

Fyzicky může jít o sdílenou paměť, hardwarovou sběrnici nebo síť. Logicky se řeší třemi otázkami:

1. **Přímá vs. nepřímá komunikace**
2. **Synchronní vs. asynchronní**
3. **Automatické vs. explicitní bufferování**

### Přímá komunikace (Direct)

Procesy musí explicitně jmenovat druhou stranu: `send(P, message)`, `receive(Q, message)`.

- Spoj vzniká automaticky mezi každou dvojicí procesů, které spolu chtějí komunikovat
- Váže se přesně na jeden pár procesů, mezi dvojicí existuje přesně jeden spoj
- Obvykle obousměrný

### Nepřímá komunikace (Indirect)

Zprávy se posílají do/z **poštovních schránek (mailbox, port)** s unikátním ID: `send(A, message)`, `receive(A, message)`.

- Spoj vzniká, jen když oba procesy sdílí stejnou schránku
- Jedna schránka může sloužit víc procesům, mezi dvojicí může existovat víc spojů (víc schránek)
- Schránku může vlastnit **proces** (zanikne s ním) nebo **operační systém** (existuje nezávisle, OS umožňuje vytvoření/mazání schránky a předání vlastnictví)
- Když víc procesů čte ze stejné schránky, o tom, kdo zprávu dostane, rozhoduje systém (max. 1 příjemce najednou, round-robin, náhodný výběr…)

### Synchronizace

| Typ | Chování |
| :-- | :-- |
| **Blocking send** | odesílatel čeká, dokud zprávu nepřevezme příjemce/schránka |
| **Nonblocking send** | odešle a pokračuje dál |
| **Blocking receive** | příjemce čeká, dokud zpráva nedorazí |
| **Nonblocking receive** | vrátí zprávu, nebo prázdno (null) |

Když jsou **obě** operace blokující, jde o tzv. **rendezvous** – producer–consumer problém se s tím řeší triviálně.

### Bufferování front zpráv

- **Nulová kapacita** – žádné čekající zprávy, odesílatel musí čekat na příjemce
- **Omezená kapacita** – fronta délky n, odesílatel čeká, jen když je fronta plná
- **Neomezená kapacita** – odesílatel nikdy nečeká

![Klient–server komunikace přes síťové sockety](img/socket-communication.svg)

## Client–server komunikace

### Socket

**Koncový bod komunikace** – identifikovaný kombinací IP adresy a čísla portu (viz [[port]]). Server naslouchá na známém portu (Telnet 23, FTP 21, HTTP 80 – porty pod 1024 jsou "well-known"), klient dostane náhodný port nad 1024. Spojení = dvojice socketů (IP:port na obou stranách), musí být unikátní.

### Remote Procedure Call (RPC)

Abstrahuje volání procedury přes síť – **strukturované zprávy** (ne jen packety dat) adresované RPC démonu na portu vzdáleného systému. Zpráva obsahuje identifikátor funkce a parametry; výsledek se pošle zpátky samostatnou zprávou.

### Roury (Pipes)

Jeden z prvních IPC mechanismů raného UNIXu – spojka mezi dvěma procesy.

**Klíčové otázky při implementaci:** obousměrná vs. jednosměrná komunikace? half-duplex vs. full-duplex? nutný vztah rodič–potomek? funguje přes síť?

#### Obyčejné roury (Ordinary Pipes)

- Producer/consumer model – zápis na jeden konec, čtení z druhého
- **Jednosměrné** (pro obousměrnou komunikaci potřeba dvě roury)
- Vyžadují vztah **rodič–potomek**, existují jen po dobu jejich komunikace
- Windows jim říká "anonymní roury"

#### Pojmenované roury (Named Pipes) – FIFO

- **Obousměrné**, žádný vztah rodič–potomek není potřeba
- Víc procesů může používat stejnou pojmenovanou rouru, existuje i po skončení komunikujících procesů

| | UNIX (FIFO) | Windows |
| :-- | :-- | :-- |
| Vytvoření | `mkfifo()` | `CreateNamedPipe()` |
| Duplex | jen half-duplex (na obousměrnost 2 FIFO) | full-duplex |
| Umístění | jen stejný stroj (síť → sockety) | i mezi různými stroji |
| Data | jen bajtově orientovaná | bajtově i zprávově orientovaná |

**Souvisí:** [[proces]], [[port]], [[socket]], [[systémové volání]], [[proces synchronizace]]
