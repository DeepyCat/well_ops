---
aliases: [Binary Search Tree, binární vyhledávací strom]
tags: [slovnik]
---

# BST

**Binary Search Tree** – binární vyhledávací strom. Každý vnitřní vrchol má právě dva syny; v levém podstromu jsou vždy menší prvky, v pravém větší.

---

## Podrobně

### Vlastnosti

- Každý vnitřní vrchol obsahuje jeden prvek
- Levý podstrom obsahuje jen menší, pravý jen větší prvky než vrchol
- Listy představují intervaly možných hodnot (kam by patřil další vkládaný prvek)

### Vyhledávání

Od kořene se hodnota porovnává s hledanou – podle výsledku se sestupuje doleva nebo doprava, v každém kroku se zahodí jedna celá větev. Časová složitost je **O(výška stromu)**, ne O(počet prvků) jako u [[pole|pole]] či [[spojový seznam|spojového seznamu]].

### Přidávání

Probíhá stejně jako vyhledávání – prvek se nakonec vloží na místo intervalu, kam by "hledáním" došel.

### Mazání

Tři případy podle synů mazaného vrcholu:

1. **Oba synové jsou listy** – vrchol i oba intervaly se zruší, nahradí je jeden sloučený interval
2. **Jeden syn je list, druhý vrchol** – vrchol se zruší, na jeho místo se zavěsí podstrom druhého syna
3. **Oba synové jsou vrcholy** – hodnota se nahradí nejlevějším prvkem pravého podstromu (nebo nejpravějším prvkem levého), a ten se pak smaže podle pravidla 2

### Zdegenerovaný BST

Když se prvky vkládají už seřazené (1, 2, 3, 4…), strom "zdegeneruje" na jednu dlouhou větev – v podstatě spojový seznam. Ztrácí se tím výhoda rychlého vyhledávání (O(n) místo O(log n)).

**Souvisí:** [[hašovací tabulka]], [[pole]], [[spojový seznam]]
