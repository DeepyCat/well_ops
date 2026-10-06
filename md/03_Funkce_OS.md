---
aliases: [Funkce operačního systému]
---

# Funkce OS

![Přehled funkcí operačního systému](img/os-functions.svg)

## Správa procesů

- Evidence spuštěných [[proces|procesů]]
- Plánování přidělování [[CPU|procesoru]] (viz [[plánování procesů]])
- Přidělování/odebírání zdrojů procesům
- Sledování stavu procesů
- Zajišťování komunikace mezi procesy

## Správa paměti

- Evidence vnitřní paměti
- Přidělování a odebírání paměti procesům
- Ochrana paměti
- Sdílení paměti mezi procesy
- Řešení situací při nedostatku paměti
- Správa [[virtuální paměť|virtuální paměti]]

## Správa periferií (I/O)

- Vytváření rozhraní mezi I/O periferiemi a procesy
- Sledování stavu zařízení
- Přidělování I/O procesům
- Řešení kolizí
- Řízení [[přerušení]]

## Správa systému (správa sebe samého)

- **Režim jádra** vs. **uživatelský režim**
- Bezpečnost

## Správa souborů

- Rozhraní pro přístup k souborům
- Udržování informací o struktuře souborů na discích
- Řízení přístupu k souborům
- Žurnálování transakcí se soubory
- Šifrování souborů
- Komprimace souborů

## Správa uživatelů

- Uživatelské účty
- Uživatelské profily
- Přihlašování/odhlašování
- Logování činnosti uživatelů

## Uživatelské rozhraní

Sada programů pro komunikaci s uživatelem:

- **[[GUI]]** – grafické uživatelské rozhraní
- **[[CLI]]** – textové/příkazové rozhraní

## Aplikační rozhraní

- **[[API]]** – rozhraní mezi výpočetním systémem a aplikací
- Sada knihoven, které může program využívat pro svou práci: dialogová okna, prvky grafického rozhraní, funkce OS, ovladače zařízení, rozhraní časovače
