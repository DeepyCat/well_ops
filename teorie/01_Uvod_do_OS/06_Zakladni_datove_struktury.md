---
aliases: [Základní datové struktury, Datové struktury]
---

# Základní datové struktury

Operační systém si potřebuje pamatovat spoustu informací (seznam běžících procesů, ovladače, volné/alokované bloky paměti). S různými druhy informací je potřeba zacházet různě – proto existuje víc typů **datových struktur**, jednotlivé údaje v nich se nazývají **prvky**.

## [[pole|Pole]]

Prvky stejného druhu uložené za sebou v souvislém bloku paměti.

- **Výhoda:** velmi rychlý (náhodný) přístup k N-tému prvku – `adresa_N = adresa_pole + N * velikost_prvku`, nezávisle na velikosti pole
- Setříděné pole navíc umožňuje rychlé vyhledávání **půlením intervalů** – O(log₂ n) operací
- **Nevýhoda:** přidání prvku na konec může vyžadovat alokaci nového bloku a překopírování celého pole; přidání doprostřed vyžaduje posun navazujících prvků
- Hodí se na data, která se často nemění

## [[spojový seznam|Spojové seznamy]]

Každý prvek je v odděleném bloku paměti, obsahuje navíc informaci o poloze dalších prvků. Nepotřebují souvislý blok paměti jako pole, ale neumožňují rychlý náhodný přístup – k N-tému prvku je nutné projít všechny předchozí.

| Typ | Popis |
| :-- | :-- |
| **Lineární (jednosměrný)** | každý prvek zná adresu následníka; poslední má NULL |
| **Obousměrný** | prvek zná adresu následníka i předchůdce; přidávání/mazání pomalejší (mění se dva odkazy) |
| **S hlavou** | přidán speciální prázdný prvek na začátku – sjednocuje kód pro práci s prázdným i neprázdným seznamem |
| **Cyklický** | poslední prvek ukazuje na první – umožňuje rychlý přístup i na konec seznamu |

Windows používají obousměrný cyklický seznam s hlavou např. pro seznam běžících procesů a ovladačů.

## [[zásobník|Zásobník]] (LIFO)

Datová struktura podporující jen operace: **push** (vložení), **pop** (odebrání naposledy vloženého), **empty** (test prázdnosti).

Lze implementovat polem (rychlé, ale hrozí přeplnění) nebo spojovým seznamem (bez přeplnění, ale pomalejší práce s adresami).

## [[fronta|Fronta]] (FIFO)

Operace: **insert** (vložení), **removefirst** (odebrání nejstaršího prvku), **empty**.

Implementace polem vyžaduje dvě pomocné proměnné (index nejstaršího a prvního volného prvku, počítáno modulo N). Ideální implementace je **obousměrný cyklický spojový seznam** – všechny operace v konstantním čase bez rizika přeplnění.

## [[hašovací tabulka|Hašovací (haš) tabulky]]

Umožňují **vkládat, vyhledávat a mazat prvky v konstantním čase** – nezávisle na počtu prvků. Prvky se vyhledávají podle **klíče**.

### Princip

Prvky se ukládají do pole (**sloty**). **Hašovací funkce** transformuje klíč na index slotu. Musí být rychlá, pro stejný klíč vracet vždy stejný index a rozdělovat klíče na indexy co nejrovnoměrněji.

### Kolize

Když hašovací funkce namapuje víc různých klíčů na stejný slot, jde o **kolizi**. Řešení:

- **Řetězení prvků** – každý slot je spojový seznam prvků se stejným hašem (používá např. jádro Windows). Funguje rychle, dokud seznamy nejsou dlouhé.
- **Otevřené adresování** – při kolizi se hledá další volné místo předem daným způsobem (posun o 1, druhá hašovací funkce…). Kapacita je omezená velikostí pole.

Nejhorší případ (hašovací funkce vrací pořád stejný haš) degraduje tabulku na lineární seznam.

## [[BST|Binární vyhledávací strom]] (BST)

- Každý vnitřní vrchol má právě 2 syny
- Prvky v levém podstromu jsou menší, v pravém větší než prvek ve vrcholu
- V listech jsou intervaly možných hodnot

### Operace

- **Vyhledávání** – porovnávání od kořene, v každém kroku se zahodí jedna větev → časová složitost O(výška stromu)
- **Přidávání** – funguje podobně jako vyhledávání, prvek se vloží místo intervalu, kde by se nacházel
- **Mazání** – tři případy podle toho, jaké má mazaný vrchol syny (oba listy / jeden list a jeden vrchol / oba vrcholy – při mazání vrcholu s dvěma vnitřními syny se hodnota nahradí nejlevějším prvkem pravého podstromu)

### Zdegenerovaný BST

Když se prvky vkládají už seřazené (1, 2, 3, 4…), strom "zdegeneruje" prakticky na spojový seznam – ztrácí se výhoda rychlého vyhledávání.
