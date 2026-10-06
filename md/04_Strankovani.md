---
aliases: [Paging, Stránkování paměti]
---

# Stránkování

**[[stránkování|Stránkování]]** umožňuje nesouvislý adresní prostor procesu, stejně jako [[segmentace]] – ale na rozdíl od ní se nepotýká s externí fragmentací ani potřebou kompakce. Používá se ve většině dnešních OS – od mainframů po smartphony.

## Základní princip
![Stránkování — překlad logické adresy na fyzickou](img/paging.svg)


- Fyzická paměť je rozdělena na bloky pevné velikosti – **rámce (frames)**
- Logická paměť je rozdělena na bloky **stejné velikosti** – **stránky (pages)**
- Když se proces spouští, jeho stránky se nahrají do libovolných volných rámců

Díky tomu je logický adresní prostor **úplně oddělený** od fyzického – proces může mít logicky 64bitový adresní prostor, i když má systém fyzicky mnohem méně paměti.

## Velikost stránky a adresa

Velikost stránky (i rámce) určuje hardware, vždy jako mocninu dvou (typicky 512 B až 1 GB). Díky mocnině dvou je překlad snadný:

- logický adresní prostor 2ᵐ, velikost stránky 2ⁿ bajtů
- horních **m−n bitů** adresy = číslo stránky
- spodních **n bitů** = offset (posunutí ve stránce)

Logická adresa = `<p, d>`, kde `p` je index do tabulky stránek a `d` posunutí uvnitř stránky.

### Příklad

Stránka 4 B, fyzická paměť 32 B (8 rámců), tedy n=2, m=4.

- Logická adresa 0 = stránka 0, offset 0 → tabulka říká, že stránka 0 je v rámci 5 → fyzická adresa = 5×4 + 0 = **20**
- Logická adresa 3 = stránka 0, offset 3 → 5×4 + 3 = **23**
- Logická adresa 4 = stránka 1, offset 0 → stránka 1 je v rámci 6 → 6×4 + 0 = **24**

![Hardwarová asociativní paměť TLB](img/tlb-hardware.svg)

## Hardwarová podpora – tabulka stránek

Každá adresa z CPU se rozdělí na **číslo stránky (p)** a **offset (d)**. Číslo stránky je index do **tabulky stránek (page table)**, která obsahuje bázovou adresu odpovídajícího rámce ve fyzické paměti. Tahle báze se sečte s offsetem → fyzická adresa.

## Fragmentace při stránkování

- **Žádná externí fragmentace** – kterýkoli volný rámec lze přidělit kterémukoli procesu
- **Interní fragmentace** ano – poslední přidělený rámec procesu nemusí být plně využitý. Příklad: velikost stránky 2048 B, proces potřebuje 72 766 B = 35 stránek + 1086 B → přidělí se 36 rámců, poslední má nevyužitých 2048−1086 = **962 B**. Nejhorší případ: proces potřebuje n stránek + 1 bajt → dostane n+1 rámců, skoro celý rámec je promarněný.

## Ochrana paměti při stránkování

- **Ochranný bit (protection bit)** u každého záznamu tabulky stránek – řídí read-only / read-write přístup. Pokus o zápis do read-only stránky → hardwarový trap do OS
- **Bit valid/invalid** – označuje, jestli stránka patří do logického adresního prostoru procesu (valid), nebo ne (invalid → trap při pokusu o přístup)

### Příklad s bitem valid/invalid

14bitový adresní prostor (0–16383), program používá jen adresy 0–10468, velikost stránky 2 KB. Stránky 0–5 jsou mapované normálně (valid), pokus o adresu ve stránce 6 nebo 7 → invalid → trap. Protože stránka 5 sahá až do adresy 12287, adresy 10469–12287 jsou "validní", i když je program vlastně nepoužívá – to je právě interní fragmentace stránkování.

### PTLR (Page Table Length Register)

Procesy málokdy využívají celý svůj adresní rozsah – tabulka stránek se zbytečnými záznamy by plýtvala pamětí. **PTLR** udává skutečnou délku tabulky stránek daného procesu; každá logická adresa se proti němu ověřuje, překročení → trap.

## Shrnutí – stránkování vs. segmentace

| | Stránkování | [[segmentace|Segmentace]] |
| :-- | :-- | :-- |
| Velikost bloků | pevná (stránky = rámce) | proměnná (podle segmentu) |
| Externí fragmentace | ne | ano |
| Interní fragmentace | ano | ne (nebo minimální) |
| Odpovídá logice programu | ne (mechanické dělení) | ano (kód, data, zásobník…) |

**Souvisí:** [[segmentace]], [[MMU]], [[virtuální paměť]], [[02_Hlavni_pamet]]
