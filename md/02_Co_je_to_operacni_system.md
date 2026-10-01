---
aliases: [Co je to operační systém]
---

# Co je to operační systém

## Základní pojmy

- **Výpočetní systém** – stroj na zpracování dat, provádějící samočinně předem zadané operace. Například počítač.
- **Zakázka** – pokyn, který má výpočetní systém provést.
- **Instrukce** – nejkratší, dále nedělitelný povel. Instrukcím rozumí procesor.

## Fyzické prostředky výpočetního systému

- **[[CPU|Procesor]]** – vykonává zadané instrukce, určuje hardwarovou platformu systému (Intel x86, x86-64, AMD, PowerPC, Alpha, MIPS…). Předpokládá se existence alespoň jednoho.
- **Vícejádrový procesor** – jediný integrovaný obvod s více jádry. Rozdíl oproti víceprocesorovému systému: tam má každé "jádro" vlastní integrovaný obvod.
- **Vnitřní paměť (operační paměť)** – rychlá, obvykle chip. Rozlišujeme [[RAM]], [[ROM]], DRAM, SDRAM atd. Používá se během výpočtu, po jeho dokončení se adresy paměti uvolní.
- **Vnější paměť** – stálé uložení dat a programů, které zrovna nejsou zpracovávány: pevné disky, flash disky, BD, magnetické pásky, cloudová uložiště.
- **Vstupně-výstupní systém (V/V, I/O)** – souhrn zařízení pro komunikaci výpočetního systému s okolím (monitor, klávesnice, tiskárna…).

## Logické prostředky výpočetního systému

- **Uživatel** – kdokoli, kdo zadává zakázku výpočetnímu systému
- **Úloha (JOB)** – posloupnost činností potřebných ke splnění zakázky
- **Krok úlohy** – část úlohy, prvek posloupnosti provedení úlohy. Úloha může být posloupností více programů, krok úlohy obvykle představuje spuštění konkrétního programu.
- **[[proces|Proces]]** – instance kroku úlohy ve vnitřní paměti. "Kopie" programu a jeho dat ve vnitřní paměti = proces je běžící program a jeho data.

## Paměťový prostor

Určuje množství dostupné paměti pro danou entitu (výpočetní systém, zakázku, úlohu, krok úlohy, proces, vlákno procesu).

- **Paměťový prostor výpočetního systému** – souhrn všech pamětí systému (vnitřní + vnější)
- **Paměťový prostor procesu** – množství paměti přidělené procesu a jeho datům
- **Adresový prostor procesu** – paměťový prostor ve vnitřní paměti vyhrazený procesu, na kterém je zavedena metrika (adresa každého bajtu – každý bajt je očíslován)

## Holý počítač

Výpočetní systém s nejzákladnějším programovým vybavením, které se obvykle nazývá **[[BIOS]]**.

## Operační systém – definice

> Operační systém výpočetního systému je **správce fyzických prostředků** daného systému, který zpracovává pomocí logických prostředků úlohy zadané uživatelem.

Pod pojmem "softwarová platforma systému" obvykle chápeme právě operační systém daného výpočetního systému.

## Přehled operačních systémů (k zapamatování)

UNIX, LINUX, WINDOWS, DOS, Apple OS, Android OS, OS/2, NEXT, OpenVMS, ChromeOS, CloudOS.
