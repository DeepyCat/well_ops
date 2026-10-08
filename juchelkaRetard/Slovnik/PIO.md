---
aliases: [Programmed I/O]
tags: [slovnik]
---

# PIO

**Programmed I/O** – CPU samo obsluhuje přenos dat se zařízením po jednotlivých bajtech, sleduje stavové bity a plní registry řadiče.

---

## Podrobně

### Proč se u velkých přenosů nepoužívá

U zařízení s velkými přenosy (disky) by PIO zbytečně zatěžovalo drahý univerzální procesor otrockou prací "hlídej bit, pošli bajt, hlídej bit, pošli bajt...". Řešení: přenechat práci **[[DMA]]** řadiči, který zvládne celý blok bez zásahu CPU.

### Kdy se PIO pořád používá

U malých, nepravidelných přenosů (klávesnice, myš) – tam se DMA nevyplatí, režie nastavení by byla vyšší než samotný přenos.

**Souvisí:** [[DMA]], [[CPU]], [[řadič]], [[01_Sprava_periferii_a_preruseni]]
