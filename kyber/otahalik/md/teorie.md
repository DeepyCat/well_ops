# Test čtečky: teorie

Pokud vidíš tuhle stránku, **čtečka funguje**. Tohle je soubor `md/teorie.md`.

# !Takže teďka jen potřebuju tu teorie aby mi někdo poslal

## Co se tu testuje

- nadpisy, seznamy a *kurzíva*
- [odkaz ven](https://tryhackme.com) (otevře se v nové záložce)
- wiki odkaz na další soubor: [[teorie1]]
- wiki odkaz s vlastním textem: [[teorie1|přejít na druhou teorii]]

### Číslovaný seznam

1. Nahraj `.md` do složky `md/`
2. Spusť `node md-index.js`
3. Obnov stránku

## Tabulka

| Protokol | Port | Vrstva |
|----------|------|--------|
| HTTP     | 80   | Aplikační |
| HTTPS    | 443  | Aplikační |
| DNS      | 53   | Aplikační |

## Kód

```bash
nmap -sS -p 1-1000 192.168.1.1
```

> Citace: bezpečnost je proces, ne produkt.

---

Konec testovacího souboru.
