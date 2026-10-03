---
name: lab_gen
description: Návod a metodika pro AI asistenty, jak na základě podkladů (__zadani.md, _vysledek.md) vygenerovat a integrovat nová praktická cvičení (Modul 02, 03...) do webového portálu OPS.
---

# Metodika generování praktických cvičení (LAB GEN)

Podrobná specifikace se nachází v hlavním souboru projektu: [lab_gen.md](../../../lab_gen.md).

Při generování nového cvičení:
1. Prostuduj `praxe/XX/__zadani.md` a `praxe/XX/_vysledek.md`.
2. Extrahuj kroky do pole `taskDefinitions` s klíči `id`, `title`, `forVMs`, `what`, `how`, `verify`, `expected`.
3. U parametrů instalace VŽDY vytvoř tabulku `.params-table` s dynamickým zvýrazněním (`active-col` / `active-row`).
4. U `expected` uveď přesný očekávaný výstup PowerShellu.
5. Zachovej tmavý motiv a třídy v `praxe.html`.
