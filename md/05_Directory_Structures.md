---
aliases: [Directory Structure, Adresářová struktura, File Sharing, File System Mounting, Protection]
---

# Adresářové struktury, mountování, sdílení a ochrana

## Operace s adresářem

Hledání souboru, vytvoření, smazání, výpis obsahu, přejmenování, průchod celou strukturou (např. pro zálohu).

![Jednoúrovňové, dvouúrovňové a stromové adresáře](img/directory-structures-tree.svg)

## Typy adresářové struktury

![Adresářový strom a vnitřní struktura Unix Inode](img/directory-tree-inode.svg)


### Jednoúrovňový adresář (Single-Level)

Všechny soubory v jednom adresáři. Jednoduché, ale **jména musí být unikátní** pro celý systém – nepraktické u víc uživatelů nebo velkého počtu souborů.

### Dvouúrovňový adresář (Two-Level)

Každý uživatel má vlastní **UFD** (User File Directory), index všech UFD je **MFD** (Master File Directory). Jména musí být unikátní jen v rámci jednoho UFD. Řeší kolize jmen, ale **izoluje uživatele** od sebe – pro přístup k cizímu souboru je nutná **cesta (path name)** typu `/uzivatel/soubor`.

**Search path** – posloupnost adresářů, kde se hledá spustitelný soubor (nejdřív lokální UFD, pak systémový adresář).

### Stromová struktura (Tree-Structured)

Generalizace dvouúrovňové na libovolnou hloubku – uživatelé si vytváří vlastní podadresáře. **Kořenový adresář**, každý soubor má unikátní cestu. Adresář je vlastně speciální soubor (bit v záznamu rozlišuje soubor/podadresář).

- Každý proces má **aktuální adresář (current directory)**
- **Absolutní cesta** – od kořene; **relativní cesta** – od aktuálního adresáře
- Mazání neprázdného adresáře: buď zakázat (musí se smazat obsah nejdřív), nebo smazat rekurzivně i s obsahem (UNIX `rm -r`)

### Acyklický graf (Acyclic-Graph)

Umožňuje **sdílení** souborů/podadresářů mezi víc uživateli/adresáři zároveň (na rozdíl od stromu) – typicky pro týmovou spolupráci. Sdílený soubor **není totéž co kopie** – změna od jednoho uživatele je vidět i u druhého (existuje jen jeden skutečný soubor).

**Implementace sdílení:**
- **Link (odkaz)** – nový typ záznamu v adresáři, ukazuje (absolutní/relativní cestou) na skutečný soubor jinde
- **Duplicitní záznam** – stejné info na dvou místech, ale hůř se udržuje konzistence

**Problém s mazáním sdíleného souboru:** UNIX u hardlinků řeší **počítadlem referencí (reference count)** – přidání odkazu ho zvýší, smazání odkazu sníží; soubor se fyzicky smaže až při počtu 0. U symbolických odkazů zůstává "visící" odkaz (dangling link), který při použití prostě selže jako neplatné jméno.

### Obecný graf (General Graph)

Když odkazy vytvoří **cyklus**, vzniká obecný graf – riziko nekonečné smyčky při procházení a problém s určením, kdy je soubor opravdu nedosažitelný (reference count nemusí spadnout na 0 kvůli cyklu odkazujícímu sám na sebe). Řeší se buď **garbage collection** (drahé, časově náročné), nebo jednodušeji – **odkazy (linky) se při procházení adresářové struktury přeskakují**, čímž se cyklům předchází.

## Mountování souborového systému (File-System Mounting)

Souborový systém musí být před použitím **připojen (mounted)** – zadá se zařízení a **mount point** (obvykle prázdný adresář v existující struktuře). OS ověří, že zařízení obsahuje platný souborový systém (kontrola formátu adresáře), a poznamená si v adresářové struktuře, kde je nový systém připojen.

- **UNIX/Linux** – lze připojit na libovolné místo ve stromu
- **Windows** – historicky přiděluje **písmena disků** (C:, D:...), novější verze umí mountovat i do libovolného bodu stromu jako UNIX
- **macOS** – automaticky mountuje pod `/Volumes`

## Sdílení souborů (File Sharing)

### Víc uživatelů

Systémy obvykle rozlišují tři úrovně vlastnictví: **owner** (vlastník, mění atributy a práva), **group** (skupina sdílející podobná práva), **universe** (všichni ostatní).

### Vzdálené souborové systémy

- Ruční přenos (FTP)
- **DFS** (Distributed File System) – vzdálené adresáře vidět jako lokální (NFS, CIFS)
- WWW – v podstatě obal nad přenosem souborů

### Klient-server model

Server zpřístupňuje soubory, klient k nim přistupuje po síti. **NFS** (UNIX) obvykle ověřuje jen podle síťové identity klienta (ID uživatele musí sedět na klientovi i serveru – nešifrované, snadno zneužitelné). Bezpečnější alternativy: šifrované klíče, **LDAP** (Lightweight Directory Access Protocol – dnešní standard pro distribuovanou správu identit, na něm stojí i Microsoft **Active Directory**).

### Distribuované informační systémy

- **DNS** – překlad jmen hostitelů na síťové adresy pro celý internet
- **NIS** (Network Information Service, dřív "yellow pages") – centralizace uživatelských jmen, hesel; nešifrované, dnes zastaralé
- **Active Directory / LDAP** – bezpečné jednotné přihlašování (single sign-on) napříč organizací

## Ochrana (Protection)

### Typy přístupu, které lze řídit

Read, Write, Execute, Append, Delete, List (a odvozené operace jako přejmenování, kopírování).

### Řízení přístupu (Access Control)

- **ACL** (Access Control List) – seznam konkrétních uživatelů a jejich oprávnění k souboru; flexibilní, ale může být dlouhý a paměťově náročný
- **Zjednodušené schéma owner/group/universe** – např. UNIXová práva **rwx** (3 bity × 3 kategorie = 9 bitů na soubor)
- Kombinace obou (Solaris) – základní owner/group/universe + volitelné ACL pro jemnější řízení

### Jiné přístupy k ochraně

- **Heslo na soubor/adresář** – jednoduché, ale nepraktické (moc hesel k pamatování, nebo jedno heslo = "všechno, nebo nic")
- Ochrana adresářových operací (vytvoření, smazání, výpis obsahu) je stejně důležitá jako ochrana samotných souborů

**Souvisí:** [[04_File_Concept_Access]], [[06_File_System_Implementation]], [[proces]]
