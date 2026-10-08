---
aliases: [Operations on Processes, Operace s procesy]
---

# Operace s procesy – vytváření a ukončování

Procesy v systému mohou běžet souběžně a jsou dynamicky vytvářeny a mazány. Systém musí poskytovat mechanismus pro **vytváření a ukončování procesů**.

## Strom procesů

Proces, který vytvoří jiný proces, se nazývá **rodič (parent process)**, nový proces je jeho **potomek (child process)**. Každý proces má jedinečné **PID** (Process ID).

Na Linuxu je kořenem celé hierarchie proces **`init`** (vždy PID 1) – vznikne po startu systému a vytváří další uživatelské procesy (webový server, ssh server…). Celý strom procesů (rodiče a potomky) lze zpětně vysledovat až k `init`.

![[1247f8e65fda453310b12fa724ac14372b8b7f937a7e9268922e66add2d09bba.png]]

Výpis procesů: `ps -el` (Linux/UNIX).

## Vytváření procesu (Process Creation)

Když proces vytvoří potomka, potomek potřebuje zdroje (čas CPU, paměť, soubory, V/V zařízení). Rodič může:

- nechat dítě získat zdroje přímo od OS
- omezit dítě na podmnožinu vlastních zdrojů (chrání systém před zahlcením přemírou vytvořených procesů)
- sdílet některé zdroje (paměť, soubory) mezi víc potomky
- předat potomkovi vstupní data (inicializační informace)

![[2436974c030ceb350802b6c6dd7f1e365027758209630b95e88e2511d685d373.png]]

### Dvě možnosti běhu

1. Rodič běží **souběžně** se svým potomkem
2. Rodič **čeká**, až potomek (nebo víc potomků) skončí

### Dvě možnosti adresního prostoru nového procesu

1. Potomek je **kopií** rodiče (stejný program i data)
2. Do potomka se nahraje **nový program**

![[e72a19cfc36668ed8bd42c7669e77b04f5782321ff6eabe93121fc1fb7d287ba.png]]

## Vytváření procesů v Linuxu/UNIXu

- **`fork()`** – systémové volání vytvoří nový proces jako **kopii adresního prostoru** rodiče. Oba procesy (rodič i dítě) pokračují od instrukce hned za `fork()` – liší se jen návratovou hodnotou: dítě dostane **0**, rodič dostane **PID dítěte** (kladné číslo)
- **`exec()`** – po `fork()` obvykle jeden z procesů zavolá `exec()`, který **přepíše** paměťový prostor procesu novým programem (nahraje binární soubor a spustí ho). Volání `exec()` se vrací, jen pokud nastane chyba
- **`wait()`** – rodič se odebere z ready queue, dokud potomek neskončí (nebo pokračuje souběžně a `wait()` nevolá)

Potomek dědí od rodiče **oprávnění, plánovací atributy a některé zdroje** (např. otevřené soubory). Nic ale nebrání tomu, aby potomek `exec()` nezavolal a pokračoval jako kopie rodiče (souběžné procesy se stejným kódem, ale vlastními daty).

![[87093d266fe4b22f4ccf5975b9debcce196da1e068b712f3a50f85415aaf580b.png]]

**C program – příklad**

![[cd6b85a8eea15ad08166d849d3d1674db556b05995585f6214aea389b9c7933e.png]]

## Vytváření procesů ve Windows

- **`CreateProcess()`** – funkce Windows API, podobná `fork()`, ale na rozdíl od něj **rovnou nahrává zadaný program** do nového procesu (nekopíruje adresní prostor rodiče) a vyžaduje aspoň 10 parametrů (zatímco `fork()` žádné)
- Parametry zahrnují struktury **`STARTUPINFO`** (vlastnosti nového procesu – velikost okna, standardní vstup/výstup) a **`PROCESS_INFORMATION`** (handle a identifikátory nového procesu a jeho vlákna)
- Ekvivalent `wait()` je **`WaitForSingleObject()`** – čeká na dokončení procesu podle jeho handle

![[8f2b524e574f970303b4550f3de5c3c029c19a4e9e2f76ee2f769ab332fe830c.png]]

## Ukončení procesu (Process Termination)

Proces skončí, když dokončí poslední instrukci a zavolá **`exit()`** – vrátí stavovou hodnotu rodiči (přes `wait()`). OS uvolní všechny zdroje procesu (fyzická i virtuální paměť, otevřené soubory, V/V buffery).

![[ec8dd7fea72500460d0fe99717398016695a8f05ed52e38bc646e61a111b8ad2.png]]

### Násilné ukončení

Proces může ukončit jiný proces vhodným systémovým voláním (ve Windows `TerminateProcess()`) – obvykle to smí jen **rodič** daného procesu (jinak by mohli uživatelé libovolně zabíjet cizí úlohy). Rodič proto musí znát identitu svých potomků.

**Důvody, proč rodič ukončí potomka:**
- potomek překročil povolené využití zdrojů
- úkol potomka už není potřeba
- rodič sám končí a systém nedovolí, aby potomek pokračoval po zániku rodiče

### Kaskádové ukončení (Cascading Termination)

Na některých systémech, když skončí rodič (normálně i abnormálně), **musí skončit i všichni jeho potomci**. Obvykle to iniciuje sám operační systém.

![[76fdc475c55a98cc5828f5c9a57179830a94c5a603bd450cf5c58e0b95cdebc3.png]]

### Zombie a orphan procesy

- **Zombie proces** – proces, který skončil, ale rodič ještě nezavolal `wait()`. Záznam v tabulce procesů (s exit statusem) zůstává, dokud rodič `wait()` nezavolá – pak se PID a záznam uvolní. Všechny procesy projdou krátce tímto stavem.
- **Orphan proces** – potomek, jehož rodič skončil dřív, než zavolal `wait()`. Linux/UNIX řeší tak, že novým rodičem osiřelého procesu se stane **`init`**, který periodicky volá `wait()` a uvolňuje jejich záznamy.

**wait() system call**

![[4771210454e921d9af1984792a852de1db23027f4b46246bf35d9ec0e2ce874f.png]]

**Zombie & Orphan**

![[598e27e4fec6f4167c83137a64df8227cc6b7f6c7cd7b81c1b4086e70ab12372.png]]

**Souvisí:** [[proces]], [[PCB]], [[systémové volání]], [[přerušení]]
