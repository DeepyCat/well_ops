---
aliases: [Direct Memory Access]
tags: [slovnik]
---

# DMA

**Direct Memory Access** – přímý přístup do paměti. Umožňuje [[řadič|řadiči]] přenášet velký blok dat přímo do/z systémové paměti bez zatěžování [[CPU]] po celou dobu přenosu.

---

## Podrobně

### Proč je potřeba

Bez DMA by musel CPU řídit i každý jednotlivý bajt přenosu (interrupt-driven I/O) – to je v pořádku pro malá data (klávesnice), ale při přenosu velkých bloků (disky) by to CPU zbytečně zatěžovalo.

### Jak funguje

1. Ovladač nastaví řadiči buffery, ukazatele a čítače pro přenos
2. Řadič přenese celý blok dat mezi svým bufferem a pamětí **bez zásahu CPU**
3. Po dokončení celého bloku vygeneruje řadič jedno **[[přerušení]]** (místo jednoho na každý přenesený bajt)
4. CPU je po celou dobu přenosu volné pro jinou práci

### Kde se používá

Přenos dat z/na disk, síťové karty a další zařízení s velkým objemem dat.

**Souvisí:** [[řadič]], [[CPU]], [[přerušení]]
