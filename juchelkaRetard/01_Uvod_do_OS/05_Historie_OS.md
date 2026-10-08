---
aliases: [Historie operačních systémů]
---

# Historie OS

## Průkopníci bez systému

Nejstarší elektromechanické počítače neměly žádný operační systém. Programy se spouštěly pomocí děrných štítků, parametry nastavovala skupina operátorů přepínači – proces byl fyzicky i duševně náročný a neefektivní. Postupně vznikaly první jednoduché systémy (obsluha V/V, dávkový režim).

## 1960 – IBM OS/360

Začátkem 60. let vyvinula IBM revoluční systém **OS/360** – první systém, který mohl běžet na různých strojích (dřív měl každý typ počítače vlastní systém napevno spojený s hardwarem). Vývoj byl komplikovaný, ale řada IBM 360 byla díky jednotnému systému komerčně velmi úspěšná – počítače této řady řídily i první let člověka na Měsíc.

## UNIX

- 1965 – Bell Telephone Laboratories (AT&T) a General Electric pracují na projektu Multics, později od spolupráce odstoupí
- **Ken Thompson** a **Dennis Ritchie** navrhli vlastní systém, název **Unix** dal **Brian Kernighan**
- 1973 – Unix kompletně přepsán do jazyka C (dřív assembler) → snadná přenositelnost ("porting")
- Konec 70. let – AT&T nesměla podnikat v počítačovém průmyslu (antimonopolní úřad) → licence na Unix levně převedena na univerzity → popularita v akademické sféře, později i komerčně

**Dvě hlavní větve:** System V (USL, dnes Novell) a **BSD** (Berkeley Software Distribution)

**Vlastnosti Unixu:** relativně jednoduchý, víceúlohový, víceuživatelský (domácí adresáře, konfigurační soubory, oprávnění), hierarchický souborový systém, vychází z něj většina současných OS.

## Linux

- Autor: **Linus Torvalds**, vývoj od roku 1991, na projektu se podíleli lidé z celého světa
- Verze Unixu pro procesory Intel 386 a další, napsaná úplně od začátku (bez účasti USL/BSD)
- Licence **GPL** (GNU General Public Licence) – zdrojové kódy musí zůstat volně dostupné
- Podporuje X Window System (MIT), splňuje standard **[[POSIX]]** (POSIX-1, POSIX-2)
- **Verzování:** první číslo = hlavní revize, druhé sudé = stabilní verze, liché = vývojová verze

## Microsoft – linie DOS

**DOS (Disk Operating System)** – 16bitový, textové rozhraní, pro procesory I8086/I8088, jednouživatelský a jednoúlohový, souborový systém FAT16.

| Verze | Rok | Poznámka |
| :-- | :-- | :-- |
| Windows 1 | 1985 | jen grafická nadstavba nad MS-DOS, okna se nemohla překrývat (dohoda s Apple) |
| Windows 2 | 1987 | okna se mohla překrývat, Word/Excel/Kalkulačka; Windows/386 běželo v chráněném režimu procesoru |
| Windows 3 | 1990 | velký komerční úspěch, poslední se 100% kompatibilitou s DOS aplikacemi |
| Windows 95/98/Me | 1995–2000 | 32bitové aplikace, ale jádro zčásti 16bitové; bez bezpečnostního modelu; FAT12/16/32 |

Souběžně vznikal **OS/2** (Microsoft + IBM), spolupráce po úspěchu Windows 3 skončila – Microsoft přejmenoval svůj OS/2 3.0 na **Windows NT**.

## Microsoft – linie NT

| Verze | Rok | Poznámka |
| :-- | :-- | :-- |
| Windows NT | 1993–1995 | hlavní návrhář Dave Cutler (dřív VMS u DEC); plně 32bitový, virtuální paměť, preemptivní plánování, NTFS |
| Windows 2000 | 2000 | EFS (šifrovaný souborový systém), obecné USB ovladače, Windows File Protection |
| Windows XP | 2001 | spojení linií 9x a NT; instrukce SYSENTER/SYSEXIT; rychlé přepínání uživatelů |
| Windows Vista | 2006 | UAC (kontrola uživatelských účtů), PatchGuard, ASLR (randomizace adres) |
| Windows 7 | 2009 | podpora až 256 procesorů, slučování časovačů, míň dotazů UAC |
| Windows 10 | 2015 | jednotné prostředí napříč platformami (PC, tablet, mobil, Xbox) |

**Serverové verze** (od Windows 2000/XP dál vydávány zvlášť): NT 3.51/4.0 Server, 2000/2003/2008/2012/2016 Server.

## Apple

System 1 → System 7 → System 8 → System 9 → Mac OS X v10.0 → Mac OS X High Sierra…

## ChromeOS (2010)

OS od Googlu zaměřený na práci s webem. Podpora x86 i ARM, open-source, základ = linuxové jádro + prohlížeč Chrome. Předpokládá trvalé připojení k internetu, jednoduché uživatelské rozhraní, využívá cloudové služby Googlu.
