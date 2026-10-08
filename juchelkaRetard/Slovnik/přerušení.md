---
aliases: [interrupt, přerušení]
tags: [slovnik]
---

# přerušení

**Signál, kterým hardware nebo software upozorní CPU na událost, která vyžaduje reakci.** CPU okamžitě přeruší svou práci a zpracuje ji.

---

## Podrobně

### Dva zdroje

- **Hardwarové** – zařízení pošle signál po sběrnici (např. dokončení přenosu z disku)
- **Softwarové** – vyvoláno speciální instrukcí, tzv. **[[systémové volání|systémovým voláním]]** (system call, monitor call)

### Jak probíhá obsluha

1. CPU zastaví, co dělalo, a skočí na pevně danou adresu
2. Odtud se provede **obslužná rutina přerušení**
3. Po dokončení se CPU vrátí k přerušené činnosti, jako by se nic nestalo

### Vektor přerušení

Protože je počet možných přerušení předem daný, používá se **tabulka ukazatelů (vektor přerušení)** na jednotlivé obslužné rutiny – indexovaná číslem zařízení. Díky tomu je reakce rychlá, bez nutnosti generické routiny, která by přerušení nejdřív identifikovala. Takhle to dělá jak Windows, tak UNIX.

### Uložení návratové adresy

Novější architektury ukládají adresu přerušené instrukce na systémový zásobník (starší ji ukládaly na pevné místo). Pokud obslužná rutina mění stav procesoru (registry), musí ho před tím uložit a po dokončení obnovit.

**Souvisí:** [[CPU]], [[kernel]], [[řadič]], [[DMA]], [[registr]]
