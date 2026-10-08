---
aliases: [jádro]
tags: [slovnik]
---

# kernel

**Jádro** – nejnižší a nejdůvěryhodnější vrstva operačního systému. Běží v **režimu jádra** s neomezeným přístupem k hardwaru a poskytuje služby zbytku systému.

---

## Podrobně

### Co dělá

Kernel běží po celou dobu chodu systému. Zajišťuje:

- správu [[proces|procesů]] a [[CPU]] (plánování)
- správu paměti
- komunikaci s hardwarem přes [[řadič|řadiče]] a ovladače
- zpracování [[přerušení]] a [[systémové volání|systémových volání]]

### Kdo s ním komunikuje

Běžné aplikace běží v **uživatelském režimu** a nemají přímý přístup k hardwaru – o služby jádra žádají přes **[[systémové volání|systémová volání]]**. Některé služby ale poskytují i **systémové programy/procesy**, které se spouští mimo jádro, ale při startu systému (viz [[bootstrap]]).

### Mikrojádro vs. monolitické jádro

- **Monolitické jádro** – většina funkcí OS běží přímo v jádru (klasický Linux)
- **Mikrojádro** – jádro plní jen nejzákladnější funkce (správa procesů, procesoru, I/O), ostatní běží jako běžné procesy. Typické pro **realtimové OS** (QNX, RT Linux) – viz [[Rozdeleni_OS]]

**Souvisí:** [[operační systém]], [[bootstrap]], [[proces]], [[přerušení]]
