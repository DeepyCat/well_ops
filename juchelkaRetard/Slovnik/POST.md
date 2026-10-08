---
aliases: [Power On Self Test]
tags: [slovnik]
---

# POST

**Power On Self Test** – sada testů, kterými [[BIOS]] po zapnutí počítače ověří, jestli hardware funguje správně.

---

## Podrobně

### Kdy proběhne

Hned po zapnutí počítače, ještě předtím, než [[bootstrap|zavaděč]] začne nahrávat operační systém.

### Co se stane při chybě

Pokud má nějaký hardwarový prvek poruchu, POST testy se nedokončí a BIOS na to upozorní – hláškou na obrazovce, nebo (pokud grafická karta ještě nefunguje) **beep kódem** (sled pípnutí reproduktoru).

### Co se stane při úspěchu

Po úspěšném POSTu se na obrazovce objeví seznam hardwarových prvků počítače, a BIOS předá řízení zavaděči operačního systému (viz [[bootstrap]]).

**Souvisí:** [[BIOS]], [[bootstrap]], [[firmware]]
