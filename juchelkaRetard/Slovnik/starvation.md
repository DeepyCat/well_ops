---
aliases: [starvation, vyhladovění]
tags: [slovnik]
---

# starvation

**Vyhladovění** – proces nekonečně dlouho čeká na přidělení prostředků, a ty mu nejsou nikdy přiděleny (např. protože pořád přicházejí procesy s vyšší prioritou).

---

## Podrobně

### Typický příklad

Plánování disku algoritmem **Shortest Seek Time First** – přednostně se vyřizují požadavky na sektory blízko aktuální poloze hlavy. Požadavek daleko od hlavy může čekat "v řadě" donekonečna, pokud pořád přibývají bližší požadavky.

Podobně u [[proces synchronizace|čtenářů a písařů]]: priorita čtenářů může nechat písaře vyhladovět (a naopak).

### Jak se předchází

- **Omezené čekání** jako jedna z podmínek správné [[kritická sekce|kritické sekce]] – rozhodnutí o vstupu se nesmí odkládat donekonečna
- **Stárnutí (aging)** – postupné zvyšování priority dlouho čekajícího procesu, až se nakonec dostane na řadu

**Souvisí:** [[kritická sekce]], [[uváznutí]], [[plánování procesů]], [[proces]]
