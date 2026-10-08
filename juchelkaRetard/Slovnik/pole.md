---
aliases: [array]
tags: [slovnik]
---

# pole

**Datová struktura ukládající prvky stejného druhu za sebou v souvislém bloku paměti.** Umožňuje velmi rychlý (náhodný) přístup k libovolnému prvku podle indexu.

---

## Podrobně

### Náhodný přístup

Adresu N-tého prvku spočítáme přímo:

```
adresa_N = adresa_pole + N * velikost_prvku
```

Přístup k libovolnému prvku tedy trvá stejně dlouho, nezávisle na velikosti pole.

### Vyhledávání v setříděném poli

Pokud je pole setříděné, lze existenci hodnoty ověřit **půlením intervalů** (binární vyhledávání) – nejvýš log₂(n) kroků, kde n je počet prvků.

### Nevýhody

- **Přidání na konec** – když je pole plné, je nutné alokovat větší blok a celé pole do něj překopírovat
- **Přidání doprostřed** – vyžaduje posun všech navazujících prvků o jednu pozici
- **Odebrání** – buď se prvek "vyprání" (díra ve struktuře), nebo se musí posunout navazující prvky

### Kdy se pole hodí

Na data, která se často nemění (nepřidávají/nemažou), a kde je důležitý rychlý přístup podle indexu. Pole se používá i jako stavební kámen složitějších struktur ([[zásobník]], [[fronta]], hašovací tabulka).

**Souvisí:** [[spojový seznam]], [[zásobník]], [[fronta]]
