---
aliases: [System Calls, Systémová volání]
---

# Systémová volání

![Průběh systémového volání mezi User a Kernel módem](img/syscall-flow.svg)


**[[systémové volání|Systémová volání]]** poskytují rozhraní ke službám operačního systému. Obvykle jsou dostupná jako funkce v jazyce C/C++, ale některé nízkoúrovňové úlohy (přímý přístup k hardwaru) je nutné psát v assembleru.

## Příklad – kopírování souboru

I jednoduchý program (zkopíruj soubor A do B) využívá spoustu systémových volání:

1. Zjištění jmen souborů (výzva uživateli → I/O volání pro výpis a čtení)
2. Otevření vstupního souboru (systémové volání) – ošetření chyb (soubor neexistuje, chráněný přístup)
3. Vytvoření výstupního souboru (systémové volání) – ošetření kolize (existující soubor se přepíše/smaže/vytvoří nový)
4. Cyklus čtení ze vstupu (volání) → zápis na výstup (volání), s ošetřením chyb (konec souboru, chyba čtení, plný disk…)
5. Zavření obou souborů, výpis zprávy, normální ukončení programu (další volání)

Běžné systémy vykonávají **tisíce systémových volání za sekundu** – programátor ale tuhle úroveň detailu obvykle vůbec nevidí.

## API a systémová volání

Aplikace se obvykle navrhují podle **[[API]]** – sady funkcí dostupných programátorovi (parametry, návratové hodnoty). Nejběžnější API:

| API | Platforma |
| :-- | :-- |
| **Windows API** | Windows – `Kernel32`, `AdvAPI32`, `User32`, `GDI32` |
| **[[POSIX]] API** | UNIX, Linux, BSD, macOS – přes knihovnu `libc`/`glibc` |
| **Java API** | programy běžící na Java Virtual Machine |

API funkce **za scénou volají skutečná systémová volání** – např. Windows funkce `CreateProcess()` uvnitř volá systémové volání `NTCreateProcess()`.

### Proč se programuje přes API, ne přímo přes systémová volání

- **Přenositelnost** – program napsaný podle API by měl (teoreticky) fungovat na jakémkoli systému, který stejné API podporuje
- Skutečná systémová volání bývají detailnější a hůř se s nimi pracuje než s API
- Přesto mezi funkcí API a odpovídajícím systémovým voláním v jádru často existuje silná spojitost

## Rozhraní systémových volání (System Call Interface)

Runtime podpora (knihovny přibalené ke kompilátoru) poskytuje **rozhraní systémových volání** – propojuje volání funkce z API se skutečnými voláními v jádru OS.

- Každé systémové volání má přiřazené **číslo**
- Rozhraní udržuje tabulku indexovanou podle těchto čísel
- Zavolá odpovídající volání v jádru a vrátí stav + návratové hodnoty

Volající nemusí vědět, **jak** je volání implementováno – jen musí dodržet API a vědět, co OS v důsledku volání udělá.

### Předávání parametrů systémovému volání

| Způsob | Popis |
| :-- | :-- |
| **Do registrů** | nejjednodušší, ale omezený počet registrů |
| **Přes adresu v paměti** | parametry v bloku/tabulce v paměti, adresa bloku se předá v registru (Linux, Solaris) |
| **Přes zásobník** | parametry se odloží (push) na [[zásobník]] programem a odeberou (pop) operačním systémem |

Blok/zásobník se preferuje tam, kde nechceme omezovat počet nebo délku předávaných parametrů.

### Standard C Library

U mnoha verzí UNIXu a Linuxu poskytuje část rozhraní systémových volání **standardní C knihovna**. Např. `printf()` v C knihovně zavolá potřebné systémové volání (v tomto případě `write()`), vezme jeho návratovou hodnotu a předá ji zpátky aplikaci.

## Typy systémových volání

- **Process control** – vytváření/ukončování procesů, řízení jejich běhu
- **File management** – vytváření, čtení, zápis, mazání souborů
- **Device management** – požadavky na zařízení, uvolnění, čtení/zápis
- **Information maintenance** – získávání/nastavování systémových dat (čas, info o procesu…)
- **Communications** – komunikace mezi procesy (i mezi počítači)
- **Protection** – řízení přístupu ke zdrojům

**Souvisí:** [[API]], [[POSIX]], [[proces]], [[kernel]], [[zásobník]], [[registr]]
