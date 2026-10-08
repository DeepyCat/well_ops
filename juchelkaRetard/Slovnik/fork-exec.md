---
aliases: [fork, exec, fork()]
tags: [slovnik]
---

# fork/exec

**Dvojice systémových volání UNIXu/Linuxu pro vytváření procesů.** `fork()` vytvoří kopii procesu, `exec()` do ní nahraje nový program.

---

## Podrobně

### fork()

Vytvoří nový [[proces]] jako **kopii adresního prostoru** volajícího procesu. Oba procesy (rodič i potomek) pokračují hned za `fork()` – liší se jen návratovou hodnotou:

- **potomek** dostane `0`
- **rodič** dostane [[PID]] potomka (kladné číslo)

### exec()

Přepíše (přemaže) paměťový prostor procesu **novým programem** – nahraje binární soubor a spustí ho. Vrací se jen v případě chyby.

### Typický postup

```
fork()  →  vytvoří kopii procesu
exec()  →  potomek si do sebe nahraje jiný program
wait()  →  rodič počká, až potomek skončí
```

Nic ale nebrání tomu, aby potomek `exec()` nezavolal – pak pokračuje jako souběžná kopie rodiče, se stejným kódem, ale vlastními daty.

### Windows ekvivalent

`CreateProcess()` – na rozdíl od `fork()` rovnou nahraje zadaný program, nekopíruje adresní prostor rodiče, a vyžaduje min. 10 parametrů.

**Souvisí:** [[proces]], [[PID]], [[systémové volání]]
