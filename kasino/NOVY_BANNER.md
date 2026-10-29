# Jak přidat nový banner (nábor učitelů)

Bannery jsou v souboru **`gacha.js`**, hned nahoře, v seznamu `BANNERS`.
Nic jiného (HTML, CSS) upravovat nemusíš. Záložka se objeví sama.

## 3 kroky

1. Otevři `gacha.js` a najdi `const BANNERS = [`.
2. Zkopíruj celý jeden blok od `{` po `}` včetně čárky a vlož ho pod poslední banner.
3. Změň texty, barvu a **featured**, ulož a obnov stránku (Ctrl+F5).

## Šablona k okopírování

```js
    {
      id: "muj-banner",
      name: "Můj banner",
      tag: "LIMITED NÁBOR · FEATURED NĚCO",
      title: "Nadpis<br>banneru.",
      text: "Sem napiš popisek banneru.",
      featured: "vesper",
      accent: "#4ade80",
      letter: "S"
    },
```

Pozor na čárky: mezi dvěma bannery musí být čárka, za posledním být nemusí.

## Co která řádka znamená

| Řádek | Význam |
|---|---|
| `id` | unikátní jméno, malá písmena, bez mezer a diakritiky |
| `name` | krátký text na záložce |
| `tag` | malý štítek nad nadpisem |
| `title` | velký nadpis, `<br>` udělá nový řádek |
| `text` | popisek banneru |
| `featured` | **kdo je featured**, `id` učitele S-ranku z pole `agents` |
| `accent` | barva banneru (hex) |
| `letter` | velké písmeno v pozadí (nepovinné) |
| `pills` | nepovinné vlastní štítky dole, např. `["S-Rank · 0,6 %"]` |

## Kdo může být featured

Jen učitel s `rank:"S"` z pole `agents`. Teď to jsou:

- `nova` = Chobot
- `riven` = Juchelka
- `vesper` = Jašík

Špatné `id` banner vypne a do konzole (F12) napíše, co je špatně. Hra se nerozbije.

## Nový učitel jako featured

1. Přidej ho do pole `agents` s `rank:"S"`, například  
   `Object.freeze({id:"novak",name:"Novák",file:"Novak",rank:"S",symbol:"[S]",type:"Fyzika"}),`
2. Dej obrázek do složky `img/` pojmenovaný **`S-Novak.png`** (rank, pomlčka, `file`).
3. Do `featured` u banneru napiš `"novak"`.

## Pravidla, ať nejsi překvapený

- Šance (Z 0,1 %, S 0,6 %), pity i záruka 50/50 jsou **společné pro všechny bannery**.
  Banner mění jen to, kdo je featured.
- Banner úplně nahoře v seznamu se zobrazí jako výchozí.
- Hráč si poslední vybraný banner pamatuje v prohlížeči.
- Banner s obrázkem učitele: portrét se bere z `img/S-Soubor.png`. Když obrázek chybí, prostě se nezobrazí.
