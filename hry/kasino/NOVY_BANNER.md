# Bannery v náboru učitelů

Vždy jsou **dva**:

1. **Klasický** je stálý a je tu pořád. Nemá featured učitele, takže každý S-rank je stejně pravděpodobný a nehraje se 50/50.
2. **Limitovaný** má featured učitele a **střídá se sám** podle rozvrhu (výchozí je jednou týdně).

Všechno se nastavuje v souboru **`gacha.js`**, nahoře v bloku `BANNERY`. HTML ani CSS upravovat nemusíš.

## Jak přidat nový limitovaný banner

1. V `ROTATION.banners` zkopíruj celý jeden blok od `{` po `}` včetně čárky a vlož ho pod poslední.
2. Změň texty, barvu a hlavně `featured`.
3. Ulož a obnov stránku (Ctrl+F5). Do střídání se zařadí sám, v pořadí, v jakém je v seznamu.

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

Mezi bannery musí být čárka, za posledním být nemusí.

| Řádek | Význam |
|---|---|
| `id` | unikátní jméno, malá písmena bez mezer a diakritiky |
| `name` | krátký text na záložce |
| `tag` | malý štítek nad nadpisem |
| `title` | velký nadpis, `<br>` udělá nový řádek |
| `text` | popisek |
| `featured` | `id` učitele **S-ranku** z pole `agents` (teď `nova`, `riven`, `vesper`) |
| `accent` | barva (hex) |
| `letter` | velké písmeno v pozadí (nepovinné) |
| `pills` | nepovinné vlastní štítky dole |

## Jak funguje střídání

Nastavuje se v `ROTATION`:

| Nastavení | Význam |
|---|---|
| `startDate` | od kdy se počítá, formát `"RRRR-MM-DD"` (nejlépe pondělí) |
| `days` | jak dlouho trvá jeden limitovaný banner (ve dnech) |
| `pin` | `null` = střídá se. Napíšeš-li `id` banneru, zobrazí se napevno (dobré na zkoušku) |

Příklad: se `startDate` `2026-10-26` a `days: 7` se banner mění každé pondělí. Na banneru je štítek „Změna za X dní“.
Ruční změna bez čekání: dej `pin: "hodina-matiky"` a stránku obnov.

## Úprava klasického banneru

Je to blok `STANDARD_BANNER` nad rotací. Můžeš měnit texty a barvu. Když tam dáš `featured`, bude se chovat jako limitovaný (50/50).

## Nový učitel

Přidej ho do pole `agents` a obrázek dej do `img/` ve tvaru `Rank-Soubor.png`. Jako featured jde jen S-rank.

## Pravidla, ať nejsi překvapený

- Šance (Z 0,1 %, S 0,6 %) a pity jsou **společné pro oba bannery**.
- Záruka 50/50 se týká jen limitovaného banneru. Klasický ji nemění ani nepoužívá.
- Střídání se řídí datem v počítači hráče.
- Hráč si poslední vybranou záložku pamatuje v prohlížeči.
- Chybné nastavení (špatné `featured`, `pin` nebo datum) hru nerozbije. Banner se přeskočí a do konzole (F12) se napíše, co je špatně.
