---
aliases: [pipes, roura, FIFO, pojmenovaná roura, named pipe]
tags: [slovnik]
---

# pipe

**Roura** – jednoduchý [[IPC]] mechanismus, spojka umožňující dvěma procesům komunikovat. Jeden z prvních IPC mechanismů raného UNIXu.

---

## Podrobně

### Obyčejná roura (ordinary pipe)

- **Producer/consumer** model – jeden proces zapisuje na jeden konec, druhý čte z druhého
- **Jednosměrná** – pro obousměrnou komunikaci potřeba dvě roury
- Vyžaduje vztah **rodič–potomek** mezi procesy
- Existuje jen po dobu jejich komunikace (Windows: "anonymní roura")

### Pojmenovaná roura (named pipe, FIFO)

- **Obousměrná**, nevyžaduje vztah rodič–potomek
- Víc procesů ji může používat zároveň, existuje i po skončení komunikujících procesů
- V UNIXu se jí říká **FIFO**, po vytvoření (`mkfifo()`) se chová jako obyčejný soubor
- Ve Windows umí i **full-duplex** komunikaci a i mezi různými stroji (UNIX FIFO jen na jednom stroji)

**Souvisí:** [[IPC]], [[proces]], [[fork-exec]]
