---
aliases: [bootstrap program, zavaděč]
tags: [slovnik]
---

# bootstrap

**Počáteční program, který se spustí hned po zapnutí nebo restartu počítače.** Bývá jednoduchý, uložený ve [[firmware|firmwaru]] ([[ROM]]/[[EEPROM]]).

---

## Podrobně

### Co dělá

1. Inicializuje celý systém – od registrů [[CPU]] přes řadiče až po obsah paměti
2. Najde jádro operačního systému ([[kernel]]) a nahraje ho do paměti
3. Předá mu řízení

Po nahrání jádra ho můžou doplnit **systémové programy**, které se při startu nahrají do paměti jako systémové procesy nebo **démoni** (procesy běžící po celou dobu chodu jádra). Na UNIXu je prvním systémovým procesem `init`, který spustí spoustu dalších démonů.

### Kdy proces končí

Jakmile je tato fáze u konce, systém je plně nastartovaný a čeká na první událost (typicky signalizovanou [[přerušení|přerušením]]).

**Souvisí:** [[firmware]], [[kernel]], [[ROM]], [[BIOS]]
