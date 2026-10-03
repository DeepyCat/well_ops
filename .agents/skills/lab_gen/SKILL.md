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
5. Síťová nastavení dynamicky važ na `workstationX` (`192.168.X.0/24`, Gateway `.1`, servery `.10`/`.20`, klienti `.100+`).
6. Dodržuj pravidla síťových rozhraní (NIC 1 = NAT / nesahat, NIC 2 = interní síť pro VM / sem patří IP, NIC 3 = třída) a zobrazuj `.nic-warning-banner`.
7. Příkazy a ověření renderuj v autentickém terminálovém boxu `.terminal-box` (PowerShell console).
8. Zachovej tmavý motiv a třídy v `praxe.html`.
