---
aliases: [RAID Structure, Stable Storage, Struktura RAID, Stabilní úložiště]
---

# RAID a stabilní úložiště

## Proč RAID vzniká

Disky jsou čím dál menší a levnější, takže je ekonomicky výhodné připojit jich k systému víc najednou. Provozem víc disků paralelně lze zlepšit jak **rychlost** čtení/zápisu, tak **spolehlivost** (uložením redundantních dat). "I" v [[RAID]] dřív znamenalo "inexpensive" (levné), dnes "independent" (nezávislé) – RAID se dnes používá hlavně kvůli spolehlivosti a rychlosti, ne kvůli úspoře.

## Zlepšení spolehlivosti redundancí

![Úrovně diskových polí RAID](img/raid-levels.svg)


Pravděpodobnost poruchy **nějakého** disku z N disků je mnohem vyšší než porucha jednoho konkrétního disku. Příklad: střední doba do poruchy (MTTF) jednoho disku 100 000 hodin → u pole 100 disků klesne na 100 000/100 = 1000 hodin (~42 dní)!

Řešení: **redundance** – uložit navíc informace, ze kterých lze při výpadku disku obnovit ztracená data.

### Mirroring (zrcadlení)

Nejjednodušší (ale nejdražší) přístup – každý disk se duplikuje, každý zápis jde na oba. Při výpadku jednoho disku se čte z druhého. Ztráta dat nastane jen, pokud selže i druhý disk dřív, než se první opraví.

Výpočet: MTTF jednoho disku 100 000 h, střední doba opravy (MTTR) 10 h → střední doba do **ztráty dat** zrcadleného páru = 100 000² / (2×10) = 500×10⁶ hodin (~57 000 let)! (za předpokladu nezávislých poruch – ve skutečnosti výpadek proudu nebo přírodní katastrofa může poškodit oba disky najednou)

## Zlepšení výkonu paralelismem

### Data striping (prokládání dat)

- **Bit-level striping** – bity jednoho bajtu se rozloží přes víc disků (např. 8 disků = bit i bajtu na disk i)
- **Block-level striping** – bloky souboru se rozkládají přes disky (blok i souboru → disk (i mod n) + 1); nejběžnější varianta

Cíl: zvýšit propustnost malých přístupů (load balancing) a zkrátit odezvu velkých přístupů.

## Úrovně RAID (podrobně)

| Úroveň | Princip | Poznámka |
| :-- | :-- | :-- |
| **RAID 0** | block striping, žádná redundance | jen výkon, žádná ochrana |
| **RAID 1** | mirroring (zrcadlení) | vysoká spolehlivost, drahé (2× kapacita) |
| **RAID 2** | memory-style ECC – bity rozprostřené přes disky + samostatné disky pro chybové kódy | teoretický, prakticky se nepoužívá |
| **RAID 3** | bit-interleaved parity – jeden paritní disk (řadiče disků umí detekovat vadný sektor, stačí 1 paritní bit) | levnější než RAID 2 (1 disk overhead místo 3), ale nižší počet V/V za sekundu (každý přístup zapojí všechny disky) |
| **RAID 4** | block-interleaved parity – block striping + 1 samostatný paritní disk | paralelní čtení z víc disků najednou, ale malý zápis vyžaduje "read-modify-write" cyklus (4 přístupy na disk) |
| **RAID 5** | block-interleaved **distributed** parity – parita rozprostřená přes všechny disky, ne na jednom | nejběžnější paritní RAID, řeší přetížení jednoho paritního disku z RAID 4 |
| **RAID 6** | P+Q redundance – dva nezávislé kódy (např. Reed-Solomon) místo jedné parity | přežije výpadek **2** disků současně |
| **RAID 0+1** | RAID 0 pole zrcadlené na druhé RAID 0 pole | výkon i spolehlivost, ale drahé (2× kapacita); výpadek 1 disku vyřadí celý pruh (stripe) |
| **RAID 1+0** | disky zrcadlené po párech, páry pak stripovány | teoreticky lepší než 0+1 – výpadek 1 disku ovlivní jen jeho zrcadlo, ne celý pruh |

Výpočetní zátěž počítání parity se často řeší dedikovaným hardwarovým řadičem s **NVRAM cache** (nonvolatile RAM) – cache uchová data, než se spočítá parita, chrání proti výpadku napájení.

## Stabilní úložiště (Stable Storage)

Informace ve **stabilním úložišti** se (podle definice) nikdy neztratí – zajišťuje se replikací na víc zařízeních s nezávislým módem poruchy.

### Tři možné výsledky zápisu na disk

1. **Úspěšné dokončení** – data zapsána správně
2. **Částečné selhání** – selhání uprostřed přenosu, jen některé sektory zapsány (poškozené)
3. **Úplné selhání** – selhání před začátkem zápisu, staré hodnoty zůstávají

### Jak se implementuje

Pro každý logický blok se udržují **dva fyzické bloky**:

1. Zápis do prvního fyzického bloku
2. Po úspěchu zápis do druhého fyzického bloku
3. Operace se považuje za dokončenou až po úspěchu druhého zápisu

Při obnově po havárii se porovnají oba bloky – pokud se liší (nebo jeden má detekovatelnou chybu), nahradí se obsahem toho druhého. Tím zápis do stabilního úložiště buď **plně uspěje, nebo nezmění nic** – žádný "napůl hotový" stav.

Mnoho úložných polí přidává **NVRAM cache**, aby se nemuselo čekat na (pomalý) synchronní zápis na disk – zápis do NVRAM je považován za bezpečně dokončený.

**Souvisí:** [[RAID]], [[HDD]], [[SSD]], [[žurnálování]], [[cache]]
