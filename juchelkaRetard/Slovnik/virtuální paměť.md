---
aliases: [virtual memory]
tags: [slovnik]
---

# virtuální paměť

**Technika, díky které proces "vidí" víc paměti, než kolik je fyzicky nainstalované** – OS mu poskytuje iluzi souvislého adresního prostoru, i když jeho data leží roztroušená v [[RAM]] a částečně odložená na disku.

---

## Podrobně

### K čemu slouží

- Umožňuje běh procesů, jejichž paměťové nároky přesahují fyzickou [[RAM]] (nepoužívané části se dočasně odloží na disk – swap/stránkování)
- Izoluje procesy od sebe – každý má vlastní adresní prostor, nemůže (běžně) číst/psát paměť jiného procesu
- Zjednodušuje programování – programátor nemusí řešit, kde přesně v RAM data fyzicky leží

### Podrobnosti

Plné rozpracování (stránkování, segmentace, swap, algoritmy nahrazování stránek) je v kapitole **Správa paměti**.

**Souvisí:** [[RAM]], [[proces]], [[operační systém]]
