---
aliases: [Multitasking, Multithreading]
---

# Multitasking a multithreading

![[82114d9f5ebcb9eff3852a3741835f8b51d1728b7cebde8797ffcaa2b4844d03.png]]

## Algoritmus – vlastnosti

![[aa833b03184adc5cf7dded3176bf4a8842b6e6278fa1d5b0fa8e88bab93ddf12.png]]

- **Hromadnost** – řeší celou třídu úloh, ne jen jeden konkrétní případ
- **Předvídatelnost** – pro stejný vstup vždy stejný výsledek
- **Opakovatelnost** – lze spustit znovu se stejným výsledkem
- **Konečnost** – musí se v konečném čase zastavit

## Program vs. proces

![[8f234a00279df39b73d279d5bc2481bec5325de9990c594c71caf03af82ade26.png]]

- **Program** – algoritmus zapsaný v programovacím jazyce (**zdrojový kód**), který se buď **interpretuje** (Interpreter – vykonává řádek po řádku za běhu) nebo **kompiluje** (Kompilátor – přeloží předem do strojového kódu)
- **[[proces|Proces]]** – spuštěný program nebo běžící služba; spotřebovává (konzumuje) [[CPU|procesor]], [[RAM|paměť]] a V/V operace

![[a0b3416a1ce7ec66dfc41b5cec914e8fe1da736a6a85e1ff02bfa61b356b8462.png]]

![[57d6bbda76e4efe8bdd1f59ef93f0fa4d9a74f7896b0838312a800cd045442d8.png]]

![[11f815023cda10d6c08e7d31b601ad9f30184a4b26b486671b7213abadd2cb74.png]]

## Multitasking

![[6c822233d68c9dd300c17b210cb4469a16aeaa9cf5e38509ab90d28e606b8ad1.png]]

Schopnost systému zdánlivě vykonávat víc úloh zároveň, přepínáním [[CPU]] mezi procesy po **časových kvantech**.

- **Kooperativní multitasking** – proces sám dobrovolně předává řízení jinému procesu (starší přístup, riziko: nekorektní proces nikdy nepředá řízení a zablokuje celý systém)
- **Preemptivní multitasking** – OS násilně odebírá CPU procesu po uplynutí časového kvanta nebo kvůli [[přerušení]] (dnešní standard)

### Atomické operace a příklad souběhu

**Atomická operace** – nedělitelná operace, buď proběhne celá, nebo vůbec (nemůže ji přerušit [[přepnutí kontextu]] uprostřed).

Příklad, proč na tom záleží (analogie se semaforem na trati):

1. Proces zkontroluje, že je na semaforu signál "volno"
2. Zjistí, že ano, chystá se nastavit "stůj" a vpustit vlak
3. V tu chvíli dojde k [[přepnutí kontextu|přepnutí]] na jinou úlohu
4. Druhá úloha taky zkontroluje "volno", nastaví "stůj" a vpustí vlak z druhé strany
5. Přepnutí zpátky na první úlohu
6. Ta dokončí nastavení na "stůj" a vpustí vlak – **kolize**

Kdyby byla celá sekvence "zkontroluj → nastav → vpusť" **atomická** (neděliteľná), ke kolizi by nedošlo – proto se podobné operace chrání [[semafor|semafory]] nebo [[mutex]]em.

## Multithreading

- **[[vlákno|Vlákno]]** – nejmenší jednotka vykonávání v rámci procesu
- **Multitasking na úrovni programu** – paralelní programování, víc vláken jednoho procesu běží (zdánlivě nebo skutečně) zároveň
- **Sdílení paměti vlákny** – na rozdíl od procesů (izolovaných) vlákna jednoho procesu sdílejí stejný adresní prostor – rychlejší komunikace, ale riziko [[proces synchronizace|souběhu]]

## Ochrana paměti

- Každý proces běží ve **vlastním adresním prostoru**
- Adresní prostor procesu přiděluje **jádro OS**
- Hardwarovou podporu zajišťuje **modul správy paměti (MMU)** v procesoru

## Nástroje Windows 10

![[7dd5c2efcd904e9436cd2ebd887ef5c360f30bf031431ffb3943d1533adb431d.png]]

- **Správce úloh (Task Manager)** – přehled běžících procesů, využití zdrojů

  ![[2b3c9121182df7f93ade5af0b15bfa52dcd178618c238d149b11cb94bee58ac0.png]]
- **Sledování prostředků (Resource Monitor)**

  ![[1f9ff1a2726fa8a3e9ff1a20ed757d04fa2486618c433692e55594877f6d3110.png]]
- **Process Monitor** – detailní sledování aktivity procesů (souborový systém, registr, síť)

  ![[39e9fd7e725caa94e163f617f2dc63c969012a35960c4a86a1f9db1234e13445.png]]

  ![[cfeea156bba7791e6bbc0b30c07262a7fc0d405312e0c259aaa7baf652e2c65c.png]]

**Jak vypadá můj systém?**

![[a981be8c8f95c21b62af86d11e95fdaee7ae874dcc4aeb1e189872d49cdec4db.png]]

- **`systeminfo`** – textový výpis informací o systému

  ![[c0c304d5ba6f4d1227cbb70a1318508bec2fa5911ef6ed007dc8aea88ed3f8be.png]]
- **`msinfo32`** – grafický nástroj se systémovými informacemi

  ![[0a6ce7ed652c61a005a18b11753d289ca2eb897db634c52d5032ae253319a57e.png]]
- **Služby (Services)** – správa systémových služeb

  ![[9a333d0186a4db3e1ca24db5a9479cb41a0836151af60654e72c428157ebabfe.png]]

**Souvisí:** [[proces]], [[vlákno]], [[CPU]], [[přerušení]], [[proces synchronizace]], [[semafor]]
