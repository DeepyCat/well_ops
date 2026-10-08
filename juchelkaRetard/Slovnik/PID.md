---
aliases: [Process ID]
tags: [slovnik]
---

# PID

**Process ID** – jedinečné celé číslo identifikující [[proces]] v systému. Podle PID s procesem pracují systémová volání i příkazy (`kill`, `wait`…).

---

## Podrobně

### Kde se s ním setkáš

- Linux/UNIX – proces `init` má vždy PID 1 (kořen stromu procesů)
- Windows – obdoba je "handle" procesu

### Jak ho zjistit

- Linux/UNIX: `ps -el` vypíše PID všech aktivních procesů
- Po `fork()` dostane rodič PID nově vzniklého potomka jako návratovou hodnotu

**Souvisí:** [[proces]], [[PCB]]
