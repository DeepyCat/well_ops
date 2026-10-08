---
aliases: [System Calls, Systémová volání]
---

# Systémová volání

![[2fb3a57dafb3f9b316770a923986a3eb25cd0f2ef42b125ff4a97fb52a9baf10.png]]

**[[systémové volání|Systémová volání]]** poskytují rozhraní ke službám operačního systému. Obvykle jsou dostupná jako funkce v jazyce C/C++, ale některé nízkoúrovňové úlohy (přímý přístup k hardwaru) je nutné psát v assembleru.

## Příklad – kopírování souboru

I jednoduchý program (zkopíruj soubor A do B) využívá spoustu systémových volání:

1. Zjištění jmen souborů (výzva uživateli → I/O volání pro výpis a čtení)
2. Otevření vstupního souboru (systémové volání) – ošetření chyb (soubor neexistuje, chráněný přístup)
3. Vytvoření výstupního souboru (systémové volání) – ošetření kolize (existující soubor se přepíše/smaže/vytvoří nový)
4. Cyklus čtení ze vstupu (volání) → zápis na výstup (volání), s ošetřením chyb (konec souboru, chyba čtení, plný disk…)
5. Zavření obou souborů, výpis zprávy, normální ukončení programu (další volání)

Běžné systémy vykonávají **tisíce systémových volání za sekundu** – programátor ale tuhle úroveň detailu obvykle vůbec nevidí.

![[f0a76a98a4d9f4d860232e994584b72f082a13f940efa945aa82fbbc1f946f07.png]]

## API a systémová volání

Aplikace se obvykle navrhují podle **[[API]]** – sady funkcí dostupných programátorovi (parametry, návratové hodnoty). Nejběžnější API:

| API | Platforma |
| :-- | :-- |
| **Windows API** | Windows – `Kernel32`, `AdvAPI32`, `User32`, `GDI32` |
| **[[POSIX]] API** | UNIX, Linux, BSD, macOS – přes knihovnu `libc`/`glibc` |
| **Java API** | programy běžící na Java Virtual Machine |

![[7463b001b1d7d8c1519934947a6e11e91047fdbf1fcabda72dc14d948ab3fa09.png]]

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

![[bc934425576241d7882e90fd157805f87b58c34a27b58ebd7dc2e9bf6db1831b.png]]

### Předávání parametrů systémovému volání

| Způsob | Popis |
| :-- | :-- |
| **Do registrů** | nejjednodušší, ale omezený počet registrů |
| **Přes adresu v paměti** | parametry v bloku/tabulce v paměti, adresa bloku se předá v registru (Linux, Solaris) |
| **Přes zásobník** | parametry se odloží (push) na [[zásobník]] programem a odeberou (pop) operačním systémem |

Blok/zásobník se preferuje tam, kde nechceme omezovat počet nebo délku předávaných parametrů.

### Standard C Library

U mnoha verzí UNIXu a Linuxu poskytuje část rozhraní systémových volání **standardní C knihovna**. Např. `printf()` v C knihovně zavolá potřebné systémové volání (v tomto případě `write()`), vezme jeho návratovou hodnotu a předá ji zpátky aplikaci.

![[8d67b41a9bb9c4d77ff86da3d56dfbe1748ae1be93d510cbd91d56ccf0b3be3a.png]]

## Typy systémových volání

![[7f8d1e836546c36655d75caf274799bce21873b78ef1ce748824373257596a84.png]]

- **Process control** – vytváření/ukončování procesů, řízení jejich běhu

  ![[2811069d0aa815fb3868c76bd60d7e5117751cef5cfdeef126bcb09ab1491c85.png]]
- **File management** – vytváření, čtení, zápis, mazání souborů

  ![[37a5a6f52594bdb0c40462d82af2edd57d918631dc29a2c7fa44795a6b824a2b.png]]
- **Device management** – požadavky na zařízení, uvolnění, čtení/zápis

  ![[21f76fad30be122b3b1b59f6fa301edaf7224d368aee29a97d6717d2cf7f70f6.png]]
- **Information maintenance** – získávání/nastavování systémových dat (čas, info o procesu…)

  ![[ae3c373f78764df6d8a86a6a989f84dd157f04b932ecdce59cad480c98836eda.png]]
- **Communications** – komunikace mezi procesy (i mezi počítači)

  ![[86ed4b5e78d3d46211a5f3e559d7726e46fc22eac96468ebcc2f29c80a4b0e31.png]]
- **Protection** – řízení přístupu ke zdrojům

  ![[d833d6e0ad3c71ba63789a2ad4ac3e9f286fd2831a5f7ef369c5295cba59a406.png]]

**Souvisí:** [[API]], [[POSIX]], [[proces]], [[kernel]], [[zásobník]], [[registr]]
