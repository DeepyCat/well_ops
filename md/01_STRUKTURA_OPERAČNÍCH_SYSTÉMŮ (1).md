---
aliases: [Struktura operačních systémů, Struktura OS, Architektura OS, Linux, Architektury jader, Windows NT, Windows NT architektura, Struktura Windows NT, MS-DOS a Windows 9x, Struktura MS-DOS, UNIX a Linux, Struktura UNIX, Architektura Linux, Apple a Android, macOS architektura, iOS architektura, Android architektura]
tags: [os]
---

# ARCHITEKTURA OS , LINUX

> Přepis xmind mapy **01_STRUKTURA_OPERAČNÍCH_SYSTÉMŮ** (Teams) – stejná struktura a texty jako v mapě, jen přehledněji rozdělené do odrážek a se zvýrazněnými pojmy. Obrázky se zobrazí, když složku `resources` z xmindu zkopíruješ do vaultu.

## STRUKTURA OS

- Abychom mohli porozumět tomu, jak pracují operační systémy, uveďme si alespoň základní informace o jejich **struktuře** a s tím související pojmy.
- U moderních OS je struktura vytvářena především s ohledem na ==bezpečnost a stabilitu== celého systému.

### Hardwarová ochrana prostředků
![Protection Rings — Ring 0/1/2/3](img/rings.svg)


- Moderní operační systémy využívají **hardwarovou ochranu prostředků**.
- Na procesorech řady x86 je tato ochrana implementována ve formě ==čtyř okruhů (RING 0 až RING 3)==.
- Každý proces běží v režimu některého z těchto okruhů a to určuje jeho možnosti v přístupu k chráněným prostředkům (přímý přístup k hardware = paměť, I/O, procesor = využívání některých strojových instrukcí).
- Většina OS používá pouze **2 okruhy**: **RING 0** pro jádro systému a **RING 3** pro ostatní procesy.
- **RING1 a RING2** lze využít pro další škálování přístupových oprávnění a můžeme se s tím setkat u některých virtualizačních technik, zejména na serverech.

![[Pasted image 20261001123504.png]]


### Režimy běhu procesů

- Abychom mohli porozumět tomu, jak pracují operační systémy, uveďme si alespoň základní informace o jejich struktuře a s tím související pojmy.
- U moderních OS je struktura vytvářena především s ohledem na bezpečnost a stabilitu celého systému.
- Vždy najdeme rozdělení běhu procesů na **privilegovaný režim** (režim jádra, kernel mode) a **neprivilegovaný režim** (uživatelský režim, user mode).
- V privilegovaném režimu běži procesy **jádra** operačního systému a v uživatelském režimu běží **aplikace**.
- Procesy běžící v uživatelském režimu nemají možnost jakkoliv zasahovat do privilegované části.

![[Pasted image 20261001123532.png|245]]

- **Privilegovaný režim** = Režim jádra
- **Uživatelský režim** = Režim aplikací

**Poznámka z hodiny (OPS)**

> [!abstract] Operační systém
> Co potřebujeme:
>
> - ==správce CPU== – `ring 0`
> - ==správce paměti== – `ring 0`
> - ==správce I/O== – `ring 0`
> - ==grafické rozhraní== **GUI** nebo **CLI** – stačí `ring 3`
> - ==souborový systém==

> [!tip] Ring 0 a Ring 3
> - Programy v `ring 0` říkáme ==kernel==
> - **Ring 0** = ==jádro==
> - **Ring 3** = ==aplikace==

### A jak to spolu souvisí

- Většina OS používá pouze 2 okruhy, **RING 0** pro jádro systému a **RING 3** pro ostatní procesy.
- RING1 a RING2 lze využít pro další škálování přístupových oprávnění a můžeme se s tím setkat u některých virtualizačních technik, zejména na serverech.
- **Procesor** je hlavním nástrojem operačního systému, který tento malý čip využívá k různým vlastním výpočtům a dává jej k dispozici i aplikacím, jež vy jako uživatel spouštíte.
- Procesor v sobě implementuje řadu mechanismů, kterých operační systém využívá například pro zaručení ochrany hardwaru před zneužitím zákeřným programem či pro ochranu kódu svého jádra před nežádoucími modifikacemi.
- Mezi tyto mechanismy patří možnost vykonávat kód programu na **několika úrovních oprávnění**, přičemž každá z nich přesně definuje, které operace jsou povoleny a které zakázány.
- Omezení se vztahuje například na druhy instrukcí, jež lze na jednotlivých úrovních použít.
- Například procesory Intel kompatibilní s architekturou x86 mají v sobě zabudovány čtyři různé úrovně oprávnění.
- Tyto úrovně se často označují jako **ring módy (rings)** a obvykle se číslují od 0 do 3.
- ==Čím nižší číslo, tím větší volnost== má kód běžící na dané úrovni.
- Program vykonávaný na úrovni **Ring 0** má dovoleno využít veškeré možnosti, které mu instrukční sada procesoru nabízí – může přímo komunikovat s hardware, ovládat chování procesoru či měnit obsah důležitých systémových datových struktur, jako je tabulka vektorů přerušení či globální tabulka segmentů.
- Úrovně **Ring 1 a Ring 2** již některé instrukce vykonávat nepovolují a kódu běžícímu na úrovni **Ring 3** procesor neumožňuje žádným způsobem přímo měnit nastavení, která by mohla ovlivnit chování operačního systému.
- Úroveň Ring 3 například nedovoluje přímou komunikaci s hardware.
- Z historických důvodů **Windows používají pouze úrovně Ring 0**, na které běží veškerý kód jádra a ovladačů, **a Ring 3**, která slouží pro vykonávání kódu normálních aplikací (též označovaných jako procesy).
- Obecně se úroveň, která poskytuje nejvyšší možná oprávnění, označuje jako **režim jádra (kernel mode)**.
- Naopak úroveň kladoucí nejvyšší omezení na vykonávaný kód se nazývá **uživatelský režim (user mode)**.

![[Pasted image 20261001123708.png]]



### VYUŽITÍ RING 1 PŘI VIRTUALIZACI

- RING1 a RING2 lze využít pro další škálování přístupových oprávnění a můžeme se s tím setkat u některých virtualizačních technik, zejména na serverech.
- Implementace virtualizace spočívá v tom, že na HW počítače se nainstaluje vrstva software ==HYPERVISOR== a teprve nad tento HYPERVISOR se instalují operační systémy.
- **Hypervisor** představuje rozhraní mezi HW a hostovanými operačními systémy.
- Ve směru k HW zajišťuje jeho management a optimální vytěžování (load ballancing).
- Operačním systémům poskytuje abstrakci HW a iluzi, že OS běží na určité HW konfiguraci dle nastavení virtuálního počítače izolovaně od ostatních OS.

![[Pasted image 20261001123623.png]]

#### PRINCIP VIRTUALIZACE

![[Pasted image 20261001123739.png]]

### ZÁKLADNÍ TYPY ARCHITEKTUR

- Následující typy struktur jsou obecně používány pro výpočetní systémy jako celek i pro jejich jednotlivé součásti (strukturu jádra, vrstev v jádře, ovladačů I/O, služeb OS, funkcí OS).

![[Pasted image 20261001123754.png]]

#### MONOLITICKÁ
![Typy jádra OS — Monolithic vs Microkernel](img/kernel-types.svg)


- Monolitická struktura je **nejjednodušší** struktura používaná v jádrech operačních systémů nebo v zařízeních.
- Systém se skládá z **jádra** a **rozhraní**, které zprostředkovává komunikaci mezi jádrem a okolím.
- Samotné jádro je představováno obvykle **jedním souborem** (při startu systému se jádro načítá z jediného souboru). Například u Linuxu je to soubor s názvem `/boot/vmlinuz`.
- Funkcionalita je rozšiřována za běhu připojovanými **moduly** (knihovnami, např. DLL ve Windows).
- Jádra **UNIXOVÝCH** a **WINDOWS S NT** systémů jsou monolitická jádra (i když mají přesně rozvrženou vnitřní strukturu).



##### MS DOS

![[Pasted image 20261001124053.png]]

##### TRADIČNÍ UNIX

![[Pasted image 20261001124146.png]]

#### MICROKERNEL

- Jak již název napovídá, systémy založené na mikrojádru (**mikrokernel**), obsahují velmi **malé jádro**, které implementuje pouze některé základní mechanismy jako **virtuální paměť, plánování vláken, obsluhu výjimek a komunikaci mezi procesy**.
- Ostatní komponenty (souborové systémy, síťová komunikace, správce procesů, správce paměti, I/O) běží v **uživatelském režimu** jako aplikace.
- Mezi **výhody** architektury založené na mikrojádru patří ==vyšší stabilita== a menší nároky na programátorské schopnosti vývojářů systému.
- Protože většina součástí běží v uživatelském režimu, selhání jedné z nich nemusí znamenat pád celého systému – například není možné narušit integritu jádra nechtěným přepsáním jeho datových struktur v ovladači souborového systému.
- Při případné chybě v součásti systému často stačí příslušnou komponentu restartovat a systém může pokračovat ve své činnosti.
- Malé jádro tedy znamená méně kritického kódu (kódu, který může způsobit selhání celého systému)

![[fba5ffd0d5c60f803acd8e23d938bd2bf80316df154a54c4cecd7c175f9a31b2.png]]

##### MACH

![[8e1bf37924d04cb1b6a6c1dc6dd37914895c040c5bdc60848bcd6ad84cacf8df.jpg]]

##### HURD

![[2376707942dad8c18d26f0f01b09dfb853a353c58f4e34e3a99afeee2a3871a2.png]]

- https://www.gnu.org/software/hurd/

##### OS X

![[6df8bc3fc3c2887ebd6feedff10dc94ac4f39e96f591ae68bd0f07b870b3dc95.gif]]

###### OS X DETAILNĚJI

![[61ba59654d93358a6531fe3b580abbfb28b277790157378d29b77d9c88758e44.svg]]

#### VRSTVENÁ/HIERARCHICKÁ

- Části systému jsou uspořádány do **vrstev**.
- Každá vrstva využívá služeb **nižších** vrstev, ne naopak.
- Každá vrstva komunikuje právě jen s okolními vrstvami.
- Systém je budován od vnitřních vrstev k vnějším, proto vnitřní vrstvy, které jsou nejdůležitější z hlediska výkonu, stability a bezpečnosti, bývají nejlépe otestovány.
- V IT se s touto architekturou setkáváme například u počítačových sítí (model ISO/OSI, TCP/IP).
- V oblasti operačních systémů je takto obvykle reprezentován OS jako celek.
- Rozlišujeme především dvě hlavní vrstvy: ==VRSTVU JÁDRA== a ==UŽIVATELSKOU VRSTVU==.

![[336722f12d976223721595688249346fd0f2af494c432b115dcdd4d1e5495403.png]]

#### MODULÁRNÍ

- Jádro poskytuje **základní služby** jako plánování a řízení procesů, paměti, obsluhu vyjímek, přerušení a ostatní služby jsou do jádra nahrávány ==dynamicky== při startu nebo při běhu systému (v okamžiku, kdy jsou poprvé použity).
- Tak je do jádra dynamicky nahrána například podpora různých souborových systémů, ovladače, síťové protokoly, bez nutnosti překompilovat jádro.
- Tento přístup předpokládá precizně definované a unifikované rozhraní modulů, přes které může jádro komunikovat i s takovým modulem, který v době vzniku jádra ještě neexistoval.
- Výhoda oproti MIKROKERNEL architektury je v tom, že tím, že se moduly stanou **součástí jádra**, mohou spolu komunikovat přímo, aniž by si museli posílat zprávy prostřednictvím jádra.
- Tato architektura je stále více využívána v moderních OS jako **SOLARIS, LINUX, MAC OS X, WINDOWS**.

![[96f61bd631f92fe473edb29c022d26110cb020b283705683042f4dedcc8c79ab.png]]

#### HYBRIDNÍ

- V praxi je jen velmi málo operačních systémů založeno na jedné, striktně definované struktuře.
- Velmi často **kombinují více přístupů**, aby dosáhli co nejlepší kombinace výkonu, bezpečnosti a použitelnosti.
- **LINUX** i **Solaris** jsou monolitické systémy, protože systém běží v jediném adresovém prostoru a poskytuje tak vysoký výkon. Jsou také modulární a nová funkcionalita je do jádra připojována dynamicky.
- **Windows** jsou také hlavně monolitický systém (primárně z důvodu výkonnosti) ale zůstává v nich i chování typické pro mikrokernel systém včetně podpory různých subsystémů, které běží v uživatelském režimu a současně Windows podporují také dynamicky připojované moduly jádra.

![[434b903d4fae000fff60782340b6ae74476742f793cd8725985c423b068559ae.png]]

##### WINDOWS S NT JÁDREM

![[3f54fb54a230b50c1ee0b6af61be5ce8119b2bd950701c9e440d138494f8a9c6.png]]

##### GNU/LINUX

![[a60c2df2756acd3c915c9b76efcb81261fdcb21224856c6cb650f051a0689565.png]]

#### POROVNÁNÍ MONOLITIC-MICROKERNEL-HYBRID

![[2dd4f64029e8f74bf190689014312e626596b3eebcf64e8806fd67a60d14e9f4.png]]

## MS DOS A WINDOWS

- Řada **MS-DOS + Windows** zahrnuje operační systém DOS s grafickou nadstavbou Windows. Jedná se o verze od Windows 1 až do verze Windows 3.x
- Řada **Windows s DOS jádrem** vznikla úpravou původního samostatného operačního systému MS-DOS a jeho včleněním jako jádra do Windows, které se tímto staly samostatným operačním systémem. Tato řada zahrnuje **Windows 95, 98 a ME**.
- **Windows s NT jádrem** mají zcela přepracované jádro a přes značnou kompatibilitu se vlastně jedná o jiný typ operačního systému. Patří zde Windows NT 3.x, Windows NT 4.x, Windows 2000, Windows XP, Windows Vista, Windows 7, Windows 8, Windows 10, Windows NT Server, Windows 2000 Server, Windows 2008 Server, Windows 2012 Server, Windows 2016 Server.

### MS DOS+WINDOWS

![[e7944b5c5d33b57f087bfcaa5e0b36ecdd01fd22896310a4ec1d681384a875e6.png]]

#### MS-DOS

- MS-DOS je **jednoprocesorový, jednouživatelský, jednoúlohový** operační systém. Samotný DOS bez spuštěné nástavby Windows má velmi jednoduchou **vrstvenou strukturu**.
- Nejblíže hardwaru je **BIOS** a dále soubor **IO.sys**, který se stará o obsluhu periferií.hardwaru (například klávesnice, monitoru
- BIOS poskytuje programátorům základní ovládání hardwaru (například klávesnice, monitoru) přes hardwarová a softwarová přerušení.
- Pokud programátor potřebuje komunikovat s určitým zařízením, vyvolá příslušné přerušení (k tomu jsou v programovacích jazycích speciální příkazy).
- Nad vrstvou ovládání hardware je vrstva samotného jádra systému představovaná souborem **MSDOS.SYS**. MS-DOS má tedy monolitické jádro složené z jediného souboru.
- Jádro poskytuje další softwarová přerušení, například pro přístup k souborům nebo práci s grafikou.
- Následující vrstva, tvořená souborem **COMMAND.COM** je textové rozhraní mezi uživatelem a systémem.
- Uživatel zadává příkazy a rozhraní na ně reaguje a vypisuje výsledky nebo chybová hlášení.
- Samotný COMMAND.COM obsahuje sadu **vnitřních příkazů**. Ostatní příkazy se nazývají **vnější příkazy** a jsou implementovány jako programy s příponou .exe nebo .com.
- V podlední vrstvě pak běží programy představující vnější příkazy a patří sem také konfigurační soubory:
  - **CONFIG.SYS** pro nastavení hardwaru (například spuštění ovladače monitoru s českou znakovou sadou)
  - **AUTOEXEC.BAT** pro nastavení softwaru (například spuštění sekvence vnitřních a vnějších příkazů a spuštění programu po startu systému.

![[b96b2145b05ea27abbe84df81c1455504e1c10d0235a5d0eacb19775ab295e96.png]]

#### MS-DOS + WINDOWS

- Když v MS-DOS 6.22 spustíme windows 3.x v **rozšířeném módu**, struktura celého systému se v horní části změní.
- Na obrázku je spodní část trochu shrnura (BIOS, MSDOS.SYS). K nim je přidán soubor **WIN.COM**, který slouží ke spuštění celých Windows a dále ovladače.
- Windows přidávají **multitasking**, 16bitové knihovny a ve verzi Windows 3.11 for Workgroups základní podporu sítě peer-to-peer.
- Zatímco MS-DOS pracuje v **reálném módu**, kdy lze využít paměť pouze do 1MB. Windows 3.x pracují v **rozšířeném módu**, dostupném až od procesorů i386, kde lze kromě rozšířené paměti využívat také chráněný mód procesoru pro ochranu paměti.
- Řadiče (ovladače, drivery) ovládají I/O zařízení pro Windows. Jsou spouštěny v souboru SYSTÉM.INI.
- **DOS EXTENDER** je modul pro podporu využití rozšířené paměti (Extended Memory). Je představován souborem **Win386.exe**.
- Součástí tohoto souboru je také **Správce virtuálních zařízení (VMM = Virtual Machine Manager)**, který ovládá možnosti Windows pro souběh s programy DOS.
- **Řadiče virtuálních zařízení (VxD)** jsou řadiče, které VMM potřebuje pro manipulaci s I/O zařízeními pro programy DOS v rozšířeném módu.
- V další vrstvě je jádro Windows (jádrem OS zústává MSDOS.SYS), které funguje jako správce prostředků vzhledem k programům běžícím pod Windows (i DOS programům spuštěným z Windows). Skládá se ze **3 souborů**:
  - **KRNL386.EXE** – správce paměti, správce procesů
  - **GDI.EXE** – grafické rozhraní (kurzor, ikony, písmo, …), cokoli co souvisí se základními funkcemi pro grafický výstup na obrazovku, tiskárnu, apod.
  - **USER.EXE** – prvky uživatelského rozhraní, které nepatří do GDI (menu, okna, tlačítka, …)
- V další vrstvě najdeme konfigurační soubory s příponou **.INI**.
  - **WIN.INI** – konfigurace software a uživatelské nastavení.
  - **SYSTÉM.INI** – konfigurace hardware.
- Následuje vrstva, která je rozhraním mezi uživatelem, programy a samotným systémem.
- Soubor **PROGMAN.EXE** je správce programů, **SHELL** je grafické a textové rozhraní mezi uživatelem a systémem.
- Zde bychom také mohli zařadit část **API** rozhraní (Application Programming Interface) reprezentovaného dynamicky linkovanými knihovnami.
- Většina knihoven má příponu .DLL, některé mají příponu .exe, přípona knihoven fontů závisí na typu fontů (např. ttf pro true type fonty).
- ==DOS programy== nevědí nic o existenci jádra windows a ini souborů, proto horní „Windows“ vrstvy nevyužívají.
- DOS programy jsou napsány pro jednouživatelský, jednoúlohový systém DOS, bez jakýchkoliv ohledů na možnost sdílení prostředků s jinými procesy.
- Proto je nutné je separovat do ==„virtuálních počítačů“==, které programům vytvoří iluzi výlučné existence v systému a znemožní jim zásahy do prostředků jiných procesů.

![[f7c37e99e742f1abb550cfa42045d9e78f1cf51a6f67a674ec336870b12a2066.png]]

### WINDOWS S DOS JÁDREM

![[f3b623e9c6d8af33eacebb1a0d748cec6290c467dbbc6ab10b6e20db389c8d47.png]]

#### Struktura Windows 9.x/Me

- Od verze 4.x (Windows 95) jsou Windows již plnohodnotným operačním systémem se samostatným jádrem. Je to **32birový systém** (ale některé knihovny zůstávají 16bitové).
- Spodní vrstva (BIOS a ovladače) slouží k přístupu systému k zařízením.
- Následující vrstva se také vztahuje k hardwaru, ale již na abstraktnější úrovni. Skládá se z následujících modulů:
  - **VMM** – Virtual Machine Manager, vytváří a udržuje prostředí virtuálních počítačů.
  - **IFSM** – Installable File Systems Manager, spravuje různé typy souborových systémů, FAT16, VFAT, FAT32, CDFS, UDF, atd. Přes IFSM se komunikuje s paměťovými zařízeními typu mass storage (blokové zařízení).
  - **Správce konfigurace** – spravuje ovladače hardware, včetně funkce Plug&Play.
- Jádro se skládá ze **tří modulů**, každý z nich má dvě dynamicky linkované knihovny (jednu pro 16bitové aplikace s příponou .exe, druhou pro 32bitové aplikace s příponou .dll:
  - **KERNEL** – multithreading, multitasking, správa paměti,
  - **GDI** (Graphics Device Interface) – rozhraní grafických zařízení (obrazovka, tiskárna, plotter, …), grafický výstup, správce tisku, spooler.
  - **USER** – uživatelské rozhraní, vstupy z klávesnice, myši, výstupy do GUI, okna, menu, ikony.
  - **REGISTR (Windows Registry)** – centrální konfigurační databáze systému. Najdeme zde většinu z toho, co v předchozích verzích bylo v .INI souborech (ty jsou i v této verzi zachovány z důvodů zpětné kompatibility). Registr je uložen v souborech SYSTÉM.DAT a USER.DAT

**Jak běží procesy:**

- **Win32 aplikace** běží všechny ve společném virtuálním stroji, každá ve svém vlastním paměťovém prostoru.
- **Win16 aplikace** běží ve společném virtuálním stroji a sdílejí jeden společný paměťový prostor.
- **DOS aplikace** beží každá ve svém vlastním virtuálním stroji, v něm má svůj vlastní paměťový prostor.

![[a9bbf97ede353be060e830390328614ac762f786dce243b503388c26629110ff.png]]

### WINDOWS S NT JÁDREM

![[1085677959e5608792d9971ca116fdd25f8a08645dc08499a6e4afe14bc8dfbf.png]]

#### WINDOWS S NT JÁDREM DO VERZE XP

- Jádro systému **Windows NT (New Technology)** vznikalo nezávisle na systému MS-DOS.
- Už při jeho návrhu bylo projektováno pro typické použití tohoto systému jako serveru nebo klienta v síti (Windows NT Server, Windows NT Workstation).
- Hlavním hlediskem při návrhu NT je ==stabilita a možnost zabezpečení==.
- Na celém konceptu je vidět inspirace UNIX systémy.
- Hlavním architektem NT byl XXXXXXX, architekt UNIX systému OPEN VMS, kterého Microsoft „přetáhl“ ze společnosti DIGITAL (DEC = Digital Equipment Corporation, která v té době byla technologickým leadrem například v oblasti mikroprocesorů, se svými 64bitovými procesory Alpha. Digital byl později pohlcen společností COMPAQ a ta společností Hewlett Packard).
- Windows NT jsou **víceprocesorový (SMP – symetrický multiprocessing), víceuživatelský, víceúlohový, síťový** operační systém.
- Zjednodušení struktura systému je na obrázku.
- Důležité je především rozdělení do dvou základních režimů – ==REŽIM JÁDRA== (privilegovaný režim) a ==UŽIVATELSKÝ REŽIM==.
- **HAL** – Hardware Abstraction Layer – vrstva abstrakce hardware je rozhraní mezi hardwarem a zbytkem jádra systému a zajišťuje „nezávislost“ na hardwarové platformě.
  - Na jedné straně zajišťuje komunikaci s konkrétní ardwarovou platformou a na druhé straně unifikované rozraní pro další vrstvy operačního systému.
  - Ovladače komunikují s hardwarem pouze sprostředkovaně přes tuto vrstvu.
  - Načítá se ze souboru **HAL.DLL** a je oddělena od ostatních částí systému – právě z důvodu přenositelnosti mezi hardwarovými platformami (stačí vyměnit soubor HAL.DLL).
- **KERNEL** (tvrdé jádro) a exekutiva jsou fyzicky uloženy v souboru **NTOSKRNL.EXE**.
  - Jediný soubor, tedy monolitické jádro.
  - Kernel zachytává a obsluhuje přerušení, provádí správu procesorů, procesů, a podobně.
  - Ostatní součásti jádra jsou k jádru linkovány z dynamických knihoven (soubory .DLL) nebo modulů (soubory .SYS) – tedy modulární struktura jádra.
- **HLAVNÍ SYSTÉMOVÝ PROCES** – v aplikaci pro správu procesů je vidět pod názvem **SYSTEM**, je obrazem toho co běží v jádru. Jedná se o kontejner pro prováděcí vlákna jádra.
- **OVLADAČE** nesouvisejí jen se zařízeními, jsou obecné, jedná se o moduly jádra, které mohou sloužit jak pro přístup k zařízením, sběrnicím a podobně, ale mohou to být také filtry, přes které procházejí data (komprimace, šifrování, třídění, …).
- Nad ovladači souborovýc systémů je systém pro jejich správu **IFSM**, který zajišťuje přístup k předem určeným souborovým systémům (NTFS, FAT32, UDF, atd.). Je využíván správcem I/O a vyrovnávací paměti.
- **SPRÁVCE KONFIGURACE** například zajišťuje funkce Plug&Play a HotPlug. Neustále sleduje stav sběrnice a hlídá připojování zařízení, u nových provádí instalační proceduru.
- Moduly pro správu oken a grafiky beží v režimu jádra, z důvodu urychlení práce aplikací. Tato část jádra se načítá ze souboru **win32k.sys**.
  - ==Nevýhodou== umístění grafického rozhraní do režimu jádra je bezpečnostní riziko, riziko porušení stability systému v případě chybových stavů tohoto modulu (pracuje v režimu jádra = má přístup do paměti systémových procesů).
  - Další nevýhodou je náročnost výměny grafického rozhraní za alternativní.
  - Ve Windows Server od verze 2008 je možnost instalovat systém bez GUI a bez dalších součástí, které GUI vyžadují – instalace **SERVER CORE**.
  - Grafické rozhraní je reprezentováno modulem GDI, GDI+ a dynamicky linkovanými knihovnami gdi*.dll
- **Bezpečnostní subsystém** souvisí především s modulem **LSASS** (Local Security Authority SubSystem). Provádí autentizaci uživatelů, kteří se přilašují lokálně a podle databáze v klíči registru **SAM** určují přístupová oprávnění.
- **SCM** (Service Control Manager), správce služeb, načítaný ze souboru **services.exe**, zajišťuje běh služeb a komunikaci s nimi. Samostné služby běží v uživatelském prostoru, ale s vyššími oprávněními a bez vazby na konkrétního uživatele (v kontextu nějakého systémového účtu).
- Komunikace procesů s jádrem probíhá pomocí volání funkcí nebo procedur dokumentovaných rozhraní (**dokumentovaná API**) nebo nedokumentovaných rozhraní (**nedokumentovaná API**), které pak spustí systémová volání v režimu jádra, která jsou jádrem obsloužena.
  - Dokumentovaná rozhraní jsou objekty v systémových knihovnách **USER32.DLL, GDI32.DLL** a další.
  - Nedokumentované API je v souboru **NTDLL.DLL** a může již přímo spouštět systémová volání.
- **Podsystémy prostředí** jsou rozhraní zajišťující správný běh různých typů procesů.
  - Běží v nich aplikace, které nemusí být kompatibilní s Windows NT.
  - Jedná se o podsystém pro aplikace psané pro starší verze Windows a DOS (WIN32), podsystém pro OS/2, POSIX, atd.
  - Tyto podsystémy jsou spouštěny až při spuštění aplikace patřící danému podsystému.
- Součástí podsystému Win32/Windows je mechanismus virtuálních počítačů. Běh virtuálních počítačů je spuštěn aplikací v souboru **ntvdm.exe** (NT Virtual DOS Machine).

**Jak je vidět z obrázku, Windows NT kombinují více různých architektur pro své různé části:**

1. Jádro je generováno z jediného souboru NTOSKRNL.EXE, je ==MONOLITICKÉ==.
2. ==VRSTVENÁ== architektura se uplatňuje v rozdělení na uživatelský režim a režim jádra.
3. ==MODULÁRNÍ== architektura se uplatňuje v připojování uzavřených modulů, které poskytují služby přes nadefinované rozhraní a komunikace probíhá volně mezi různými moduly (správce procesů, správce paměti, I/O, správce ovladačů).
4. Architektura ==KLIENT-SERVER== se uplatňuje v API, což je sada dynamicky linkovaných knihoven, které se chovají jako servery (poskytují služby) pro procesy z vyšších vrstev systému (klienti), kteří přes knihovnu NTDLL.DLL tyto služby využívají.

**Jak běží procesy:**

- **Win32 aplikace** beží všechny ve společném virtuálním stroji, každá má svůj vlastní paměťový prostor.
- **DOS a Win16 aplikace** mají každá svůj vlastní virtuální stroj a v rámci tohoto stroje svůj vlastní paměťový prostor.
- **32bitové aplikace** běží v prostředí **WoW64** (Windows On Windows), které je překládá na 64bitové.

![[7a5868e2d6cee0f142c894d07987cb5c13f8eb0a76a2fa97a97857d9e8bc8e34.png]]

#### WINDOWS S NT JÁDREM OD VERZE VISTA A SERVER 2008

**Popíšeme jen rozdíly oproti předchozí verzi:**

- Modulární, zcela přepracované jádro
- IPv6
- Podpora sítě přesunita do režimu jádra
- Část implementace GUI přesunuto do uživatelského režimu.
- Samostatný modul pro národní prostředí.
- Ostatní moduly (= i opravné balíčky) jsou nezávislé na národním prostředí.
- Podpora **UEFI** - od Vista SP1
- Grafické prostředí na **WPF** (Windows Presentation Foundation) - Grafický podsystém inspirovaný X-Windows ze světa UNIXu.
- **DWM** - Desktop Windows Manager - správce oken.
- **ASLR** - Adress Space Load Randomisation - DLL knihovny se do paměti nahrávají na náhodné adresy (bezpečnostní opatření).
- **MinWin** (od Windows 7) - co nejmenší základní jádro a vše ostatní, co běží v režimu jádra jsou dynamicky připojované moduly - rychlejší start systému (po načtení tvrdého jádra je již možné pracovat a ostatní části systému se načítají paralelně).
- **XP Mode** - pro spouštění starších aplikací.
- Od Windows 8 **METRO APPS** a nový grafický subsystém **WinRT API**
- Od Windows 10 **UNIVERSAL APPS** a nový grafický subsystém **Universal Windows Platform**.
- **Windows Subsystem for Linux** - součást jádra, umožňuje spouštět LINUX aplikace.
- Nástroj **NASTAVENÍ** - postupně nahradí Ovládací Panely.

![[2f34431b2a441078a128af8fcad834bddb0367c56095d0d5670abb2f0ab4838d.png]]

#### WINDOWS NT PODROBNĚJI

- Většina pokročilých funkcí Windows NT (souborové systémy, síťová komunikace, správa paměti a procesů) běží v ==režimu jádra==.
- Systém pro svoji plnohodnotnou činnost vyžaduje běh pouze několika málo procesů, které zajišťují správu služeb či dovolují přihlášení uživatele přes grafické rozhraní.
- Všechny součásti jádra a ovladače zařízení sdílí stejný virtuální adresový prostor.

![[f3d80ef1d0e5b94e8105a044d1a1c5b6b4fedb341055c596da4a85211a76e2c8.png]]

##### HAL

- Windows jsou psány tak, aby nebylo obtížné upravit celý systém pro běh na dalších platformách – například na nových procesorech či základních deskách.
- **Přenositelnost** patří mezi důvody, proč je celé jádro naprogramováno převážně v jazyce **C**, kterému někteří přezdívají „přenositelný Assembler“.
- Pouze velmi malou část kódu psali vývojáři v Assembleru, jazyku striktně závislém na konkrétním procesoru či rodině procesorů.
- Pro přenesení Windows na novu architekturu tedy stačí přepsat některé části jádra a systémových knihoven DLL, které zapouzdřují mechanismy, jejichž implementace závisí na konkrétním druhu procesoru (přepínání kontextu vláken, obsluha stránkovacích tabulek, systémová volání).
- Jedním z cílů při navrhování nového operačního systému bezesporu je usnadnit programátorům psaní aplikací a ovladačů.
- Programátoři běžných aplikací by například neměli řešit odlišnosti různých typů procesorů. To platí i o většině ovladačů jádra.
- Z tohoto důvodu se architektura Windows dělí do několika vrstev. Každá vrstva v sobě skrývá některé specifické vlastnosti a problémy a vrstvám vyšší úrovně poskytuje obecná rozhraní.
- **HAL** se v architektuře Windows nachází na ==nejnižší úrovni== a jejím úkolem je odstínit ostatní části operačního systému a aplikace od specifik hardware, jako jsou různé modely procesorů.
- Odtud také pochází název **Vrstva abstrakce hardware (Hardware Abstraction Layer)**.
- Vyšším vrstvám poskytuje například rutiny pro komunikaci s periferními zařízeními.
- Kód HAL se nachází v souboru **hal.dll** v systémovém adresáři.

##### TVRDÉ JÁDRO

- Nad HAL se nachází tenká vrstva, jež implementuje relativně jednoduché mechanismy, kterých využívají vyšší vrstvy jádra operačního systému pro stavbu složitějších struktur.
- Kód tvrdého jádra je pomocí vrstvy HAL odstíněn od většiny specifik hardware, a tudíž zde Assembleru najdete jen málo.
- **Mezi mechanismy implementované v této součásti patří:**
  - Algoritmus **plánování vláken** na procesoru.
  - Odložené volání procedur (**Deferred Procedure Call – DPC**).
  - Základní **synchronizační primitiva** jako událost (event), spinlock, semafor či pushlock.
  - Práce s hardwarovými přerušeními.
  - Část obsluhy systémových volání.

##### OVLADAČE

- Ovladače umožňují správci vstupně/výstupních zařízení, který spolu s dalšími komponentami tvoří vrstvu označovanou jako **exekutiva**, komunikovat s různými typy hardware.
- Jedná se o spustitelné soubory formátu **PE** a jejich jméno většinou obsahuje koncovku **.sys**.

##### EXEKUTIVA

- Exekutiva využívá tvrdého jádra k realizaci mnohem složitějších mechanismů, kterých mohou přes systémová volání nepřímo využívat obyčejné aplikace běžící v uživatelském režimu.
- Obsahuje ještě méně platformně specifického kódu než tvrdé jádro.
- Exekutiva se skládá z několika navzájem oddělených částí (viz obráze).
- Ačkoliv se všechny nachází ve stejném adresovém prostoru, a tudíž by například správce objektů mohl přímo manipulovat s interními datovými strukturami, které náleží správci paměti, komunikují spolu pomocí ==přesně definovaných rozhraní==.
- Každá komponenta dává k dispozici sadu rutin, které může volat libovolný kód běžící v režimu jádra.
- Názvy některých funkcí a způsob realizace některých mechanismů připomínají techniky používané v objektově orientovaném programování.

![[9e2aa9d42dc408a203173254ffa7efc8c348b36d0fa0f236426088e9a24e938f.png]]

###### SPRÁVCE OBJEKTŮ (OBJECT MANAGER)

- **Správce objektů (Object Manager)** umožňuje vývojářům psát kód jádra podobně, jako by programovali v jazyce podporujícím konstrukty OOP.
- Správce objektů například umožňuje jednotným způsobem objekty (otevřené soubory, klíče registru, paměťově mapované soubory) vytvářet a odstraňovat a obsahuje jednotný mechanismus řízení přístupu.
- Zjednodušeně lze říci, že správce objektů v sobě zapouzdřuje všechny principy, které platí pro většinu druhů objektů (při odstraňování objektu dochází k uvolnění paměti nezávisle na jeho typu, při vytváření nového objektu zase dochází k alokaci paměti, ať už se jedná o otevřený soubor, nebo klíč registru).

###### SPRÁVCE PAMĚTI (MEMORY MANAGER)

- **Správce paměti (Memory Manager)** se stará o všechny činnosti, které nějak souvisí s virtuální a fyzickou pamětí.
- Přiděluje volné rámce fyzické paměti, zajišťuje správné mapování mezi virtuálními a fyzickými adresami a obsluhuje výpadky stránky.
- Vyřizování požadavků na přidělování a uvolňování bloků virtuální paměti o proměnlivé velikosti patří též do jeho kompetencí.
- Dále obsahuje bezpečnostní mechanismy jako **ASLR** (Address Space Layout Randomization).

###### SPRÁVCE PROCESŮ (PROCESS MANAGER)

- **Správce procesů (Process Manager)** má na starosti spouštění, běh a ukončení procesů a vláken.
- Umožňuje ostatním součástím systému a běžným aplikacím zjistit informace o právě běžících procesech, měnit jejich prioritu, násilně je ukončovat a provádět další zajímavé akce.

###### SPRÁVCE VSTUPNĚ/VÝSTUPNÍCH ZAŘÍZENÍ (I/O MANAGER)

- **Správce vstupně/výstupních zařízení (I/O Manager)** zajišťuje většinu funkcí kolem ovladačů jádra a zařízení, ať už fyzických nebo virtuálních.
- Díky této součástí může jádro za běhu načítat nové ovladače do svého paměťového prostoru a uvolňovat ty, které aktuálně nepotřebuje.
- Správce vstupně/výstupních zařízení též dovoluje ovladačům komunikovat mezi sebou.
- Komunikace probíhá přes objekty zvané zařízení (device), které si pro jednoduchost můžete představit jako kanály nebo roury mezi jednotlivými ovladači.

###### SPRÁVCE KONFIGURACÍ (CONFIGURATION MANAGER)

- Windows patří mezi operační systémy, jejichž cílem je plnit co největší množství různorodých úkolů a přizpůsobit své chování co nejvíce požadavkům uživatele.
- Nastavení různých aspektů systému musí být někde uloženo a systém k němu musí mít snadný přístup.
- A způsob ukládání a práce s konfiguracemi je parketa pro součást exekutivy s názvem **správce konfigurací (Configuration Manager)**.
- Na rozdíl od operačních systémů založených na Unixu, které většinu nastavení ukládají do textových souborů, Windows své konfigurace ukládá v ==binární podobě== – do tzv. **registru**.
- Registr funguje jako malá databáze, rychle se v něm vyhledává a manipuluje s jednotlivými položkami.
- Na rozdíl od textových souborů, dobře čitelných pro obyčejného člověka, pro prohlížení obsahu registru potřebujete speciální programy. Jedním z nich je **Editor registru (regedit.exe)**.
- Vývojáři Windows se pro binární formu ukládání konfigurací rozhodli pravděpodobně z toho důvodu, že textové soubory se hůře a pomaleji počítačově zpracovávají a zabírají více místa.
- Logická struktura registru je téměř totožná s adresářovou strukturou na pevném disku.
- Adresáře se v této terminologii registru nazývají ==klíče== a souborům se říká ==hodnoty==.
- Každý klíč může obsahovat libovolné množství dalších klíčů (podadresářů) a hodnot (souborů). Pouze hodnoty mohou obsahovat data.

**EDITOR REGISTRU**

![[af1aaecdb371b32182af05d3b8f6c5371a7b06009a33cbfdab67878bbcd3290b.png]]

###### BEZPEČNOSTNÍ MODEL

- Operační systém také musí zajistit, aby každý mohl provádět jen operace, na které má dostatečná oprávnění.
- To je úkolem **bezpečnostního modelu (security model)**, který umožňuje pro každého uživatele nastavit, jaké činnosti smí a nesmí provádět.
- Díky bezpečnostnímu modelu může administrátor systému určit, k jakým objektům mají jednotliví uživatelé přístup.
- Množina objektů přitom není omezena jenom na soubory a klíče registru; oprávnění lze nastavit i u procesů, vláken, nebo třeba synchronizačních primitiv.
- Bezpečnostní model Windows dále definuje sadu oprávnění, které uživatel potřebuje, aby mohl vykonávat určitou činnost.
- Do této kategorie patří například oprávnění vytvořit stránkovací soubor či povolení načíst ovladač do jádra.

##### SUBSYSTÉMY

- Nad ntdll.dll se nachází vrstva knihoven, která tvoří součást prostředí pro obyčejné aplikace – tzv. **subsystému**.
- Rozhraní exportované touto vrstvou je již dobře dokumentováno, což znamená, že i v budoucích verzích Windows bude pravděpodobně fungovat stejně a maximálně jej Microsoft rozšíří. Vývojáři jej mohou používat ve svých aplikacích.
- Windows obsahuje **dva subsystémy** – ==Windows== a ==POSIX==.
- Každý z nich dává programátorům aplikací k dispozici trochu odlišnou množinu funkcí obsažených v ntdll.dll.
- Například POSIX umožňuje vytvářet nové procesy pomocí rutiny **fork**, dobře známé z prostředí Unixu. Subsystém Windows takový způsob vytváření procesů neposkytuje.
- Nutnost implementovat POSIX také donutila vývojáře zavést do souborového systému NTFS **hardlinky**.

###### POSIX

- **POSIX** je zkratka z anglického sousloví portable operating system interface based on Unix (přenositelná systémová rozhraní založená na Unixu) a označuje sadu mezinárodních standardů, které popisují aplikační rozhraní v operačních systémech založených na Unixu.
- Pokud by výrobci operačních systémů tyto standardy implementovali, rozhraní různých operačních systémů by byla definována stejně a stejně by se také chovala, což by ušetřilo práci programátorům aplikací, kteří by neměli tolik problémů s přenositelností na jiné platformy.
- Z historických důvodů Windows původně ze všech těchto standardů implementovaly pouze **POSIX 1**.
- Windows Vista a Windows Server 2008 s sebou přináší implementaci standardů POSIX v podobně **SUA** (Subsystem for Unix–based Application – subsystém pro aplikace založené na operačním systému Unix).
- Tato rozšířená varianta subsystému POSIX implementuje kolem **2 000 funkcí** různých unixových aplikačních rozhraní a obsahuje kolem **tří set unixových programů**. Subsystém SUA je dostupný na Windows Server 2008 a v Ultimate a Enterprise edicích Windows Vista.
- Na rozdíl od subsystému Windows, bez kterého celý operační systém nemůže fungovat, ==POSIX se spouští jenom tehdy==, pokud si uživatel přeje spustit proces určený pro tento subsystém.
- Konfigurace obou subsystémů je uložena v registru pod klíčem
- `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Subsystems` jehož obsah vidíte na obrázku 2.6.
- Z obrázku je patrné, že hlavním procesem subsystému POSIX je **psxss.exe**, který se nachází v systémovém adresáři.
- Také vidíte, že hlavní proces subsystému Windows nese název **csrss.exe** a že subsystémy mají i komponentu běžící v režimu jádra. Jedná se o ovladač **win32k.sys**, který se stará o správu grafického uživatelského rozhraní a grafiky vůbec.
- Na tomto místě může vyvstat otázka, proč každý subsystém nemá svůj vlastní ovladač jádra. Důvodem je vysoká duplicita kódu.
- Vývojáři Windows se rozhodli tomuto nebezpečí předejít, a proto subsystém POSIX využívá funkcí (a knihoven DLL) poskytovaných subsystémem Windows včetně ovladače win32k.sys. Situaci znázorňuje obrázek 2.7.
- Kdyby tomu tak nebylo, musely by existovat dvě sady knihoven DLL a dva různé ovladače pro obsluhu grafického uživatelského rozhraní.
- Kód obou sad knihoven a ovladačů by však byl na mnoha místech totožný, což je v programování nežádoucí, protože dochází ke zvýšení rizika vzniku chyb.

###### WINDOWS

- Struktura subsystému Windows je složitější než v případě POSIXu. **Skládá se z následujících komponent:**
  - Hlavní proces subsystému **csrss.exe** a knihovny DLL, které používá.
  - Ovladač jádra **win32k.sys** a drivery grafické karty a videa.
  - Vrstva knihoven DLL zajišťující překlad volání dokumentovaných funkcí Windows API na volání nativních (a často nedokumentovaných) rutin z knihovny **ntdll.dll**, která je zodpovědná za volání jádra. Mezi tyto knihovny patří kernel32.dll, user32.dll, gid32.dll či advapi32.dll.
- Mezi úkoly hlavního procesu subsystému patří vykreslování oken konzolových aplikací a podpora 16bitových programů určených původně pro operační systém MS–DOS.
- Csrss.exe také dostane oznámení, kdykoliv dojde k spuštění nového či ukončení již běžícího procesu nebo vlákna. Ve svém adresovém prostoru si uchovává vlastní kopii seznamu všech běžících procesů a vláken, aby pro ně mohl vyřizovat požadavky, jež mohou vzniknout při volání některých funkcí Windows API.
- V dobách předcházejících Windows NT 4 do hlavního procesu subsystému patřily i moduly, které se starají o grafické uživatelské rozhraní a grafické kreslení vůbec.
- Vývojáři se tímto uspořádáním pravděpodobně chtěli přiblížit elegantní struktuře operačních systémů založených na mikrojádru.
- Taková struktura však vyžadovala velmi častá systémová volání a přepínání kontextu procesů.
- Ovladače grafické karty a obrazovky totiž běžely v režimu jádra, takže pokud nějaká aplikace chtěla například překreslit okno, bylo nutné přepnout kontext na hlavní proces subsystému, kde sídlil správce grafického uživatelského rozhraní, a následně se přepnout do režimu jádra, aby ten mohl doručit požadavek na překreslení ovladači grafické karty.
- Systémová volání a přepínání kontextu mezi procesy patří mezi časově náročné operace, což mělo negativní dopad na výkon systému jako celku.
- Situace se výrazně nezlepšila ani po provedení mnoha optimalizací (byl upraven plánovač procesů a csrss.exe dokonce mohl číst některé oblasti paměti jádra, aby se ušetřilo kopírování).
- Vývojáři proto ve Windows NT 4 přesunuli správce grafického uživatelského rozhraní a ostatní grafické funkce do ovladače **win32k.sys**, čímž se snížil počet systémových volání a přepínání procesů.
- Jak již víte, jádro systému sdílí společný paměťový prostor a může komunikovat s ovladači grafické karty bez použití systémových volání.
- Ovladač win32k.sys se tedy stará o grafické uživatelské rozhraní; spravuje okna, tlačítka, textová pole, obsluhuje myš a klávesnici.
- Umožňuje také kreslení různých grafických útvarů, jako jsou body, přímky či křivky.
- Ovladač se postará, aby se požadavky na vykreslování dostaly k správným ovladačům grafiky, tudíž aplikace, jež využívají GUI, vůbec nemusí (a většinou ani nepotřebují) vědět, jakou grafickou kartou počítač disponuje a jak se s ní zachází.
- Win32k.sys se chová podobně jako **HAL** – smazává rozdíly mezi různými kusy hardware.
- Bránu k ovladači win32k.sys tvoří knihovny **gdi32.dll** a **user32.dll**. První z nich obsahuje rutiny pro kreslení různých grafických útvarů (body, čáry, křivky) a druhá exportuje funkce pro práci s prvky uživatelského rozhraní, jako jsou okna, menu či ikony.
- Mezi velmi důležité knihovny DLL také patří **kernel32.dll**, jenž exportuje vybrané části exekutivy (práce s procesy a vlákny, správa paměti, synchronizace), a **advapi32.dll**, která obsahuje rozhraní pro práci se službami a bezpečnostním modelem.

###### REGISTR

![[2a7a088d496e4285ab6c9599c9bf160424fe8f8ff33abfd4aa11d98c92abe4b2.png]]

###### ZÁVISLOST SUBSYSTÉMU POSIX NA SUBSYSTÉMU WINDOWS

![[c11b1667ac0d818a31e5bfa6372be9fdfb5f043b53b8e35baab1965861a41c8c.png]]

**PRO HACKERY**

> [!warning] Pro hackery
> - Správce úloh vám nedovolí systémové procesy násilně ukončit. Pokud se o to pokusíte, program zareaguje hláškou „Přístup odepřen“.
> - Zajímavá je zde metoda, jakou Správce úloh rozhoduje, zda cílový proces je systémový.
> - Až do Windows Vista totiž nejsou tyto procesy chráněny žádným bezpečnostním mechanismem, který by bránil jinému procesu, jenž disponuje administrátorským oprávněním, je ukončit.
> - Správce úloh má v sobě „natvrdo“ zakódovány názvy procesů, které považuje za systémové.
> - Tohoto faktu mohou snadno zneužít tvůrci malware.
> - Zkuste si například pojmenovat nějaký program winlogon.exe, spustit jej a následně se jej pokuste násilně ukončit pomocí Správce úloh.

##### SYSTÉMOVÉ PROCESY

- Windows patří mezi **monolitické** operační systémy, které se vyznačují velmi velkým a složitým jádrem, jež disponuje řadou pokročilých funkcí.
- Přesto běh systému závisí na několika procesech, jejichž ukončení (ať je způsobeno úmyslně, nebo v důsledku softwarové chyby) znamená ==restartování počítače==.
- Tyto kritické procesy se obvykle nazývají jako **systémové**.
- Seznam právě běžících procesů můžete vidět v programu Správce úloh, který spustíte například pomocí známé klávesové zkratky **Ctrl+Alt+Del**.

![[5b8c434a0c98691cdd501acd37e872fb463bc7fc902d8806f0388a7862242934.png]]

###### PRO HACKERY

> [!warning] Pro hackery
> - Správce úloh vám nedovolí systémové procesy násilně ukončit. Pokud se o to pokusíte, program zareaguje hláškou „Přístup odepřen“.
> - Zajímavá je zde metoda, jakou Správce úloh rozhoduje, zda cílový proces je systémový.
> - Až do Windows Vista totiž nejsou tyto procesy chráněny žádným bezpečnostním mechanismem, který by bránil jinému procesu, jenž disponuje administrátorským oprávněním, je ukončit.
> - Správce úloh má v sobě „natvrdo“ zakódovány názvy procesů, které považuje za systémové.
> - Tohoto faktu mohou snadno zneužít tvůrci malware.
> - Zkuste si například pojmenovat nějaký program winlogon.exe, spustit jej a následně se jej pokuste násilně ukončit pomocí Správce úloh.

###### NEČINNÉ PROCESY (SYSTEM IDLE PROCESSES

- **Nečinné procesy (System Idle Processes)**
- Jedná se pouze o **pseudoproces**, který nevykonává žádnou činnost v uživatelském režimu.
- Na disku nenajdete žádný soubor, který by obsahoval jeho kód a data, ani žádné knihovny DLL, jenž by využíval.
- Úkolem Nečinných procesů je spotřebovávat čas procesoru, když žádná součást operačního systému ani žádná aplikace nemá co na práci.
- Jádro vytvoří tento proces během raných fází inicializace operačního systému.
- ==PID== Nečinných procesů je vždy roven ==nule==.

###### PROCES SYSTEM

- **Proces System**
- Proces System také nevykonává žádný kód v uživatelském režimu, a tudíž nepoužívá žádné knihovny DLL a nenajdete žádný soubor s příponou .exe, který by jej reprezentoval.
- Už ale nejde čistě o pseudoproces; v jeho kontextu běží skupina vláken známá pod označením **pracovní vlákna (worker threads)**.
- Jádro tato vlákna vytvoří během bootovacího procesu a jejich úkolem je vykonávat činnosti, jenž jim někdo zadá.
- Pracovní vlákna stráví většinu času čekáním, až jim nějaká součást jádra (nebo ovladač) určí, co mají vykonat. Jakmile práci dokončí, čekají na další zadání.
- Jádro využije služeb pracovních vláken ve chvíli, kdy potřebuje vykonat úkol, který je časově náročný (a tudíž by mohl brzdit výkon systému, kdyby nebyl proveden asynchronně), nebo nemůže být splněn za aktuálních podmínek.
- V takovém případě jádro předá úkol na bedra této speciální skupině vláken.
- Vlákna většinou dokončují zpracování požadavků od hardware, které nebylo možné provést při obsluze přerušení.
- Dále je využívá například správce paměti pro zapisování „špinavých“ (dirty) stránek z vyrovnávací paměti na disk.
- Spolu s Nečinnými procesy je System jediným procesem s pevně daným číslem **PID**.
- Toto číslo má v jeho případě od Windows 2000 hodnotu ==4==. V předcházejících verzích neslo hodnotu ==1==.

###### SPRÁVCE RELACÍ (SESSION MANAGER)

- **Správce relací (Session Manager, Smss.exe)**
- Smss.exe je spuštěn v poslední fázi startu jádra a jedná se o ==první proces==, který vykonává kód v uživatelském režimu.
- Provede poslední fázi inicializace operačního systému, který je pak připraven na přihlášení uživatelů.
- Jak název napovídá, hlavním úkolem tohoto procesu je vytváření **relací**.
- Relaci si můžete představit jako ohradu, ze které ten, kdo je v ní uzavřen, nevidí ven a zároveň nikdo nevidí dovnitř.
- Tyto ohrady se využívají pro oddělení prostoru jednotlivých uživatelů. Díky nim například každý uživatel může mít namapované disky pod jinými písmeny.
- Jednotlivé relace se označují číslem.
- Smss.exe nejprve vytvoří **relaci 0**, která se též označuje jako **konzolová relace**. V rámci ní běží systémové procesy, služby a všechny procesy uživatele, který se přihlásí jako první.
- Pro každého dalšího uživatele vytvoří správce další relaci.
- Pro každou novou relaci správce spustí jednu kopii procesu **winlogon.exe**.
- Smss.exe je též zodpovědný za inicializaci hlavního procesu subsystému Windows – **csrss.exe**. Pro relaci 0 se místo Winlogonu spouští **wininit.exe**.
- Jakmile dokončí svoji práci, správce relací navždy hlídá hlavní proces subsystému Windows a všechny kopie programu winlogon.exe.
- Pokud zjistí, že některý z těchto procesů byl neočekávaně ukončen, vyvolá modrou obrazovku smrti s kódem `STATUS_CRITICAL_SYSTEM_ PROCESS_DIED`

###### PROCESY PODÍLEJÍCÍ SE NA PŘIHLÁŠENÍ UŽIVATELE (WINLOGON.EXE, LSASS.EXE)

- **Procesy podílející se na přihlašování uživatele (winlogon.exe, LSASS.exe)**
- Úkolem procesu **winlogon.exe** je umožnit uživateli přihlášení pomocí grafického uživatelského rozhraní.
- Může autentizovat uživatele různými způsoby, nejčastěji se ale stále používá zadání uživatelského jména (login) a hesla. Jednotlivé metody autentizace jsou implementovány v oddělených knihovnách DLL.
- Winlogon v sobě má zabudovanou jednoduchou metodu ==ochrany proti programům==, které se snaží zachytit údaje, jež uživatel zadal při pokusu o přihlášení.
- Většinou se jedná o tzv. **keyloggery** – programy, které zaznamenávají stisky jednotlivých kláves.
- Aby takový program nemohl přesně určit, kdy uživatel zadává přihlašovací údaje, může být Winlogon nastaven takovým způsobem, že před zobrazením přihlašovací obrazovky (viz obrázek) je třeba stisknout speciální kombinaci kláves.
- Obrazovku, která uživatele vyzývá k stisku této kombinace kláves, vidíte na obrázku; její podoba se může mírně lišit v závislosti na verzi operačního systému.
- Jako výchozí kombinace je nastaven známý „trojhmat“ **Ctrl+Alt+Del**.
- Trik spočívá v tom, že jakmile Winlogon zjistí, že tato kombinace byla stisknuta, tuto informaci pohltí a zobrazí okno, kam uživatel vyplní přihlašovací údaje.
- Přesněji, o stisku aktivační kombinace se dozví okno s názvem **SAS Window**, které je též zodpovědné za její pohlcení.
- Pokud tedy keylogger neoperuje v samotném jádře systému nebo neinfiltroval do adresového prostoru procesu winlogon.exe (například v podobě knihovny DLL), nemůže stisk aktivační kombinace přímo detekovat, a tedy přesně zjistit, kdy uživatel zadává přihlašovací údaje.
- Jakmile uživatel zadá login a heslo, Winlogon tyto údaje odešle procesu **lsass.exe**, kde proběhne jejich ověření.
- Pokud vše dopadne dobře (uživatel zadal správné jméno a heslo), lsass.exe zjistí, jakými oprávněními uživatel disponuje, a vytvoří tzv. **token**. Jedná se o objekt, kterým se pak uživatel prokazuje, potřebuje-li doložit, že má oprávnění k provedení určité operace.
- Pokud má uživatel administrátorská práva a je-li zapnut mechanismus **UAC** (User Account Control), lsass.exe vytvoří ==tokeny dva==.
  - První z nich v sobě obsahuje všechna oprávnění, kterými uživatel disponuje.
  - Druhý obsahuje jenom vybraná z nich.
  - S pomocí druhého tokenu pak Winlogon vytvoří procesy, které provedou inicializaci prostředí.
  - Token s omezenými právy se použije, kdykoliv uživatel spustí nějakou aplikaci, jež nevyžaduje administrátorská práva.
- Pokud se uživatel pokusí spustit program vyžadující oprávnění administrátora, UAC se může dotázat (záleží na nastavení systému), zda chce daný program, který vyžaduje administrátorská práva, a tudíž by mohl být pro systém nebezpečný, spustit.
- Pokud dá uživatel spuštění zelenou, použije se pro daný program token, který obsahuje všechna uživatelova oprávnění.
- Winlogon zůstává aktivní i po úspěšném přihlášení uživatele.
- Kromě toho, že je jeho povinností zajistit i odhlášení, stále čeká na onu aktivační klávesovou kombinaci a v případě, že zjistí její stisknutí, zobrazí dialog, který vidíte na obrázku. Winlogon také může být nakonfigurován tak, že spustí rovnou Správce úloh.
- Jakmile Winlogon obdrží tokeny od LSASS, může být zahájena inicializace pracovního prostředí uživatele.
- Tato činnost již nespadá do pravomocí tohoto procesu, ale do kompetence procesů, jejichž názvy jsou uvedeny v hodnotě **Userinit** v klíči
- `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\Current Version\Winlogon`.
- Winlogon přečte obsah této hodnoty a pokusí se všechny nalezené procesy spustit.
- Inicializace pracovního prostředí spočívá v podstatě jen ve spuštění startovacích skriptů a předání řízení shellu, jehož název **userinit.exe** nalezne pod hodnotou **Shell** ve stejném klíči, jako Winlogon hledal hodnotu Userinit.
- Výchozím shellem pro všechny uživatele je **Průzkumník Windows (explorer.exe)**, který zodpovídá za zobrazení pracovní plochy a umožňuje uživateli mimo jiné procházet adresářovou strukturu a spouštět další programy.

**PŘIHLAŠOVACÍ OBRAZOVKA**

![[4eb84a308f44c47665b1119b0fa6d9375998fff79aeb0269500a19e31c80e78f.png]]

**VÝZVA KE STISKU AKTIVAČNÍ KOMBINACE KLÁVES**

![[2e1563bf79f72e28af6101c4c249e7cb7a6fdf4efe8634289d2adbeb7b18982b.png]]

**DIALOG WINLOGON**

![[6b7fa5477c79daf85ca99990fb51da73f92a81756e818fab611f9e75495e6e35.png]]

**PRO HACKERY**

> [!warning] Pro hackery
> - Jediný proces, který by se měl za všech okolností starat o inicializaci pracovního prostředí uživatele, je userinit.exe v systémovém adresáři.
> - Pokud hodnota obsahuje i názvy dalších procesů, jedná se pravděpodobně o malware.

###### PROCESY PRO PODBORU SLUŽEB (SERVICES.EXE., SVCHOST.EXE)

- **Procesy pro podporu služeb (services.exe, svchost.exe)**
- Mnoho součástí Windows je implementováno jako **služby** – programy běžící na pozadí, které ve většině případů nepotřebují (a ani nevyhledávají) interakci s uživatelem a jejichž běh nezávisí na tom, zda je přihlášen či nikoliv.
- Interně systém Windows mezi služby řadí i ovladače jádra, ačkoliv ty nepatří mezi entity, o které se správce služeb (Service Control Manager – SCM), reprezentovaný procesem services.exe, příliš stará.
- Jeho hlavním úkolem je instalovat, spouštět a zastavovat služby určené pro běh v uživatelském režimu a posílat jim další druhy příkazů.
- Službu tvoří obyčejný spustitelný soubor formátu **PE** s příponou .exe, který navíc obsahuje speciální kód pro komunikaci se správcem.
- Na rozdíl od normálních aplikací, více služeb může sdílet virtuální adresový prostor jednoho procesu. Vše záleží na nastavení konkrétní entity.
- Kód služeb, které nemají vlastní proces, je vykonáván v kontextu instancí procesu **svchost.exe**, který je pro jejich „hostování“ přímo určen.
- Pro pohodlnou kontrolu služeb je připravena aplikace **services.msc**, která nejen zobrazí seznam všech nainstalovaných služeb a jejich aktuální stav, ale umožňuji s nimi i manipulovat. Uživatelské rozhraní tohoto programu vidíte na obrázku.
- Konfigurace všech služeb se nachází v registru pod klíčem
- `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services`.

**SLUŽBY**

![[c32c8077b73ebb39e9aa65ef86428af4063793647be2aa29e64c35e442aa2a34.png]]

**NASTAVEN´SLUŽBY TCPIP V REGISTRU**

- Hodnoty **Description** a **DisplayName** mají pouze informativní charakter. Jejich obsah zobrazuje snap-in services.msc ve sloupcích Název a Popis. Pokud je hodnota DisplayName prázdná, nebo vůbec neexistuje, utilita zobrazí ve sloupci Název interní jméno.
- Položka **ErrorControl** určuje, jak se má správce zachovat, když při spouštění služby dojde k chybě. Možné hodnoty a popis chování správce naleznete v tabulce
- Hodnota **ImagePath** v sobě uchovává název souboru služby. Pokud není hodnota přítomna, SCM předpokládá, že soubor služby se nachází v systémovém adresáři a jmenuje se X.exe, nebo X.sys, kde X je interní název služby.
- Podle hodnoty **Start** se SCM rozhodne, kdy může být služba spuštěna.
- Položka **Type** určuje, zda se jedná o službu běžící v uživatelském režimu, nebo o ovladač jádra. Možné hodnoty vidíte v tabulce.
- Způsob a čas spuštění služby lze tedy ovlivnit hodnotou položky Start v jejím registrovém klíči.
- Toto nastavení lze zjemnit přiřazením služby do určité **skupiny**. Výčet všech dostupných skupin včetně pořadí, v jakém budou procházeny při spouštění jednotlivých služeb, se nachází v klíči
- `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\ServiceGroupOrder`.
- Pro ovladače je možné určit i pořadí spouštění jednotlivých entit ve skupině. Slouží k tomu hodnota **Tag**. Pořadí spouštění jednotlivých entit v jedné skupině na základě jejich tagu je uloženo v klíči
- `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\GroupOrderList`
- Některé služby mohou svoji činnost vykonávat pouze za předpokladu, že běží služby jiné.
- Například služba Zvuk systému Windows je závislá na službách Koncové vytváření služby Windows Audio, Vzdálené volání procedur a Služba Plánovač multimédií. Pokud nějaká z nich není aktivní, nelze spustit ani Zvuk Systému Windows.
- Služby mohou být závislé nejen na jiných službách, ale i na celých skupinách. Systém může spustit službu závislou na skupině, pokud je alespoň jedna entita z této skupiny aktivní.

![[e361a865ed678a5f0ca967900c5c712b551514c20f55a79028e4a2cbbaea60a8.png]]

**ERROR**

![[63d4edcb9c60fafe2eb818e43a8ec401d1c3c7bba994982fd995be14585f9979.png]]

**START**

![[8d610b25c4cbec28d83cb04e2a297b5dbff4fab7c17418ab4942336105e3f937.png]]

**TYPE**

![[793d867f7298f742d244b243aec1f4dac96c1215af3ee3714dfc844c0490959b.png]]

#### SERVEROVÉ EDICE

- Serverové edice používají totéž jádro jako desktopové edice a jsou k dispozici další nástroje (**DHCP server, DNS Server, Active Directory**, ...).

![[6ec1a6fb8def4315e0d84f3de39c75061b414bed4ab5b82fa28a5114fd34da0e.png]]

## UNIX a UNIX LIKE SYSTÉMY

- Většina UNIX a UNIX LIKE systémů má podobnou strukturu (kromně těch upravených pro RealTimový provoz - RT).
- Jádro běží v privilegovaném režimu, je tvořeno ==jediným souborem== a využívá jediný souvislý adresový prostor, proto je nazýváno **monolitické**, i když má bohatou vnitřní strukturu. U linuxu je to soubor `/boot/vmlinuz`.
- UNIXové systémy jsou **víceprocesorové, víceuživatelské, víceúlohové, síťové** systémy od svého počátku (1970).
- Na to byl brán zřetel už při navrhování těchto systému a proto za dlouhá desetiletí jejich existence nebylo potřeba jejich strukturu výrazněji měnit.
- Staly se taky vzorem pro návrh struktury WINDOWS NT systémů.
- Jádro systému se skládá ze dvou oddělených částí. **HAL** (Hardware Abstraction Layer) závislé na hardware a **kernelu** nezávislého na hardware.
- Jádro je typicky monolitické, načítá se z jednoho souboru do jednoho souvislého adresního prostoru.
- Vrstva **HAL** (Hardware Abstraction Layer) slouží jako základní rozhraní k zařízením, které je také využíváno ovladači ke komunikaci se zařízeními.
- Hlavním úkolem HAL je skrýt technické detaily zařízení patřících do různých tříd (skupin s charakteristickými vlastnostmi).
- HAL zajišťuje načítání ovladačů, vytváření a odstraňování přípojných bodů pro bloková zařízení a také provozování abstraktního modelu hardware.
- Důležitými moduly jádra jsou **ovladače**. Existují ovladače znakových zařízení, blokových zařízení, síťových zařízení a další specializované ovladače. Také souborové systémy jsou implementovány jako ovladače.
- **Souborový systém** je v Unixových systémech vlastně rozhraní mezi ovladačem vnějšího paměťového média a vyššími vrstvami jádra.
- V UNIXu platí, že ==„všechno je soubor“== a jako souborový systém je implementován například přístup k informacím o stavu systému, stavu jádra, konfiguraci, které běží v paměti a nejedná se o žádný soubor (v linuxu například adresář proc).
- Souborové systémy, které nenáležejí k žádnému konkrétnímu paměťovému médiu, ale přesto s nimi zacházíme, jako by se jednalo o soubory a systémy souborů nazýváme **virtuální souborové systémy**.
- **VFS** (Virtual File System) je nejdůležitějším souborovým systémem. Představuje jednotné rozhraní pro podobný přístup k různým souborovým systémům.
- Všechny souborové systémy sdružuje v jediné stromové struktuře. Pokud uživatel chce s konkrétním souborovým systémem pracovat, připojí ho na stanovené místo do této struktury a tím ho zpřístupní.
- **FUSE** (FileSystem in User Space) je mechanismus, který umožňuje běh souborových systémů v uživatelském prostoru (běžné souborové systémy musí být součástí jádra).
- Spočívá v rozdělení souborového systému do dvou částí, spodní část – modul FUSE – je pro všechny souborové systémy tohoto typu společná a běží v režimu jádra. Horní část běží v uživatelském režimu a využívá služeb modulu FUSE.
- **Síťové protokolové zásobníky** (např. TCP/IP) jsou implementovány jako součást jádra.
- **Podsystémů** existuje poměrně hodně a každý má svou specifickou funkci. Například šifrovací subsystém, multimediální subsystém, IPC (inter proces communication) subsystém, bezpečnostní moduly, atd.
- **Rozhraní systémových volání** je rozhraní mezi jádrem a čímkoli, co může přímo ovlivnit uživatel (programy, příkazy shellu, skripty).
- S touto vrstvou lze komunikovat přes knihovny obsahující definice API funkcí, která mohou generovat systémová volání.
- Hlavní úlohou je zajištění bezpečnosti a stability systému a znemožnění zásahu uživatele (aplikace bežící v kontextu uživatele) do jádra. Systémová volání jsou vlastně funkce, kterými lze komunikovat s jádrem.
- V systému je velké množství knihoven, z nicž v LINUXU je nejdůležitější knihovna **glibc** (GNU C LINRARY) v UNIX systémech je to **libc**.
- Tato knihovna zprostředkovává komunikaci procesů z uživatelského prostoru s rozhraním systémových volání (procesy zasílají systémová volání této knihovně).
- **Shell** je rozhraní pro komunikaci s uživatelem. Unixové systémy obvykle nabízejí více druhů Shellů. V Linuxu máme většinou **Bash** (Bourne Again Shell).
- Komunikace probíhá v textové formě. Uživatel zadává příkazy, systém reaguje textovými výpisy), ale současně UNIX systémy mají také propracované grafické rozhraní (obvykle založené na **X WINDOW**).

![[298f6c92b5c164b55f990a8d0f915b29f09896f4e26d4367e9934851187fe18b.png]]

### STANDARDY

#### POSIX

- **Portable Operating System Interface**
- UNIX LIKE

#### SUS

- **SINGLE UNIX SPECIFICATION**
- UNIX CERTIFYIED

## JÁDRO LINUX

- Obrázek je cíleně vytvořen tak, aby ve sloupcích byly nad sebou ty součásti, které spolu významově souvisejí, včetně vazby na konkrétní kus hardwaru.
- Některé součásti souvisejí se dvěma hardwarovými komponentami, například **SWAP** (odkládací oblast) souvisí s operační pamětí (protože stránky z ní se odkládají na disk) a zároveň s paměťovými médii (protože na ta se odkládá).
- Síťová úložiště souvisejí se sítí (protože se k nim přistupuje přes síť) a zároveň s paměťovými médii (protože z nich se čte a na ně se zapisuje).
- Modely zařízení se vztahují jak k síťovým rozhraním, tak i k dalším I/O zařízením, protože jejich strukturu popisují.

![[df9c8730a6735815966377c53dcec7d0a11a7b16995636f952de976d42fe71b4.png]]

### CHARAKTERISTIKA

- **UNIX LIKE OS**

#### GNU/GPL licence

- Uveď co tato licence umožňuje

- ==LINUX== = Jádro OS
- ==GNU/LINUX== = celý OS = jádro + všechno "okolo"

#### LINUS TORVALDS

- 21 let - studentský projekt

#### VLASTNOSTI

##### LINUX tvoří malé, nenáročné programy a příkazy

- Složitější úlohy se poskládají z více jednoduchých

- Propracovaná komunikace mezi procesy
- Všechno je "SOUBOR"
- Běží na jakémkoliv HW
- Nenáročný na zdroje
- Stabilita

#### ZDROJE

- http://www.linux.org
- http://www.linux.cz

### ARCHITEKTURA LINUX DISTRIBUCE

#### LINUXOVÁ DISTRIBUCE =

- **LINUX** = jádro (KERNEL) operačního systému

##### INSTALÁTOR

- Instalační rutina, průvodce instalací

- **DETEKTOR HW**
- **SYSTÉMOVÉ KNIHOVNY**
- **KONFIGURAČNÍ NÁSTROJE**

##### GRAFICKÉ PROSTŘEDÍ

###### DESKTOP ENVIRONMENT

**X WINDOW**

- Doplňte co je X WINDOW a jakou funkcionalitu zajišťuje

**WIDGET TOOLKIT**

- Doplňte co je WIDGET

**WINDOW MANAGER**

**Window Maker**

- http://www.windowmaker.info/

**AfterStep**

- http://www.afterstep.org/

**FluxBox**

- http://www.fluxbox.org/

**OpenBox**

- http://icculus.org/openbox/index.php/Main Page

**Xmonad**

- http://xmonad.org/

**IceWM**

- http://www.icewm.org/

**fvwm**

- http://www.fvwm.org/

**SawFish**

- http://sawfish.wikia.com/wiki/Main Page

- Vyberte si některého správce oken a doplňte jeho stručnou charakteristiku

**Přehled Desktopových prostředí**

**CDE**

- http://www.opengroup.org/tech/desktop/cde/

**KDE**

- http://www.kde.org/

**GNOME**

- http://www.gnome.org/

**CINNAMON**

- http://developer.linuxmint.com/reference/index.html
- http://www.zdnet.com/article/how-tocustomise-your-linux-desktop-cinnamon/

**MATE**

- http://mate-desktop.com/

**LXDE**

- ttp://lxde.org/

**ENLIGHTMENT**

- ttp://www.enlightenment.org/

**XFCE**

- http://www.xfce.org,

**3D PROSTŘEDÍ**

**Compiz Fusion**

- https://www.youtube.com/watch?v=4QokOwvPxrE
- http://wiki.compiz-fusion.org/
- http://wiki.compiz-fusion.org/

**Looking Glass**

- https://www.youtube.com/watch?v=EjQ4Nza34ak
- http://www.sun.com/software/looking glass/
- https://lg3d-livecd.dev.java.net/Web-Site/Welcome.html

**Croquet**

- http://www.opencroquet.org/
- http://www.linuxexpres.cz/modules/marwel/index.php?article=1856
- http://www.root.cz/serialy/squeak-navrat-do-budoucnosti/
- http://www.squeak.org/, http://laptop.org/en/

- Ke každému desktopovému prostředí doplňte screenshoty pr ilustraci jeho vzhledu

- Vyberte si jedno z uvedených desktopových prostředí a doplňte jeho stručnou charakteristiku

###### DALŠÍ ZDROJE

- http://xwinman.org/
- http://en.wikipedia.org/wiki/Comparison of X window managers
- http://en.wikipedia.org/wiki/Comparison of X Window System desktop environments

- APLIKACE

##### DOKUMENTACE

- Linux Dokumentační Projekt
- HOW TO
- Manuálové stránky
- Doplňte internetové odkazy na výše uvedenou dokumentaci

#### NEJZNÁMĚJŠÍ DISTRIBUCE

##### Komerční

- RedHat
- RedHat Enterprice Server
- SuSe

##### Komunitní

- Debian
- Ubuntu
- Fedora
- OpenSuSe
- Mandriva
- Mint
- SlackWare
- Gentoo
- RT Linux
- PartedMagic

- Ke každé z uvedených linuxových distribucí doplňte: 0. Charakteristiku distribuce 1. Odkaz na původní a českou verzi stránek distribuce 2. Aktuální stabilní verze 3. Podporované HW Platformy 4. Používaná grafická prostředí 5. Typ instalačních balíčů (DEB, RPM, SRT, ...) 6. Odkaz na ISO obraz instalačního CD 7. Odkaz na uživatelskou dokumentaci 8. Odkaz na Diskusní fórum

#### ZDROJE

##### www stránky jednotlivých distribucí

- www.debian.org
- www.debian.cz
- www.ubuntu.cz

- http://distrowatch.com
- http://livecdlist.com/

- Zde uveďte aktuální stabilní verzi jádra LINUX

### SOUBOROVÝ SYSTÉM

- Vyjmenujte souborové systémy používané v distribucích UBUNTU, DEBIAN, MINT

#### Správce souborů

- Vložte Printscreen prostředí správce souborů v UBUNTU
- Vložte Printscreen prostředí správce souborů v DEBIAN
- Vložte Printscreen prostředí správce souborů v MINT

#### Sooborová struktura

##### VŠECHNO JE SOUBOR

- SOUBOR
- ADRESÁŘ
- BD, CD, DVD
- PRINTER
- SCANNER
- ZAŘÍZENÍ
- ATD

##### STROMOVÁ STRUKTURA

###### ADRESÁŘ

- JE SOUBOR Se seznamem svého obsahu

###### PODADRESÁŘ

- JE SOUBOR Se seznamem svého obsahu

###### SOUBOR

- JE SOUBOR Se svým obsahem

#### TYPY SOUBOROVÝCH SYSTÉMŮ

##### EXTn

- EXT2
- EXT3
- EXT4

- REISERFS
- XFS
- JFS
- NFS
- SMB
- Doplňte krátkou charakteristiku každého uvedeného FS

### ZKOUMÁME SOUBOROVÝ SYSTÉM

#### NÁZVY SOUBORŮ

- Délka názvu obvykle do **255 znaků**
- Mohou a nemusí mít příponu
- Přípona může být jakkoliv dlouhá
- Přípona je součástí názvu včetně oddělující tečky
- Spustitelné soubory příponu nemají
- Název skrytých souborů začíná **TEČKOU**

##### Názvy adresářů končí ".d"

- Název.d
- Home.d
- etc.d

#### /

##### /bin: Essential user command binaries (for use by all users)

- Základní příkazy pro textový režim (jejich spustitelné soubory) pro různé účely (název bin je od „binary"), mohou být používány i krátce po startu systému, tyto příkazy může obvykle spouštět i běžný uživatel, je tu například **cp** pro kopírování (ve Windows máme copy) nebo **ls** pro výpis obsahu adresáře (ve Windows máme dir)

##### /boot : Static files of the boot loader

- Soubory zaváděče operačního systému

##### /dev : Device files

- Zařízení - soubory reprezentující zařízení a přístupové body k nim = realizují nízkoúrovňovou komunikaci se zařízením, které reprezentují.

##### /etc : Host-specific system configuration

- Konfigurační soubory pro systém i mnohé aplikace (aplikace si zde pro vlastní potřeby vytvářejí podadresáře)

##### /home : User home directories

- Radim
- Petra
- Martin
- Hana
- Domovské adresáře uživatelů

##### /lib : Essential shared libraries and kernel modules

- Sdílené knihovny využívané při startu systému nebo pro programy z /bin a /sbin, v podadresáři modules najdeme moduly jádra

##### /media : Mount point for removeable media

- usb
- diskC
- eth0

- /mnt : Mount point for a temporarily mounted
- /opt : Add-on application software packages

##### /root : Home directory for the root user

- Domovský adresář uživatele root (správce systému)

##### /sbin : System binaries

- Různé utility pro správu systému vyžadující pro své spuštění oprávnění **superuser**

##### /proc : Kernel and process information virtual filesystem

- Najdeme zde běhové informace o systému a procesech, tj. informace, které se dynamicky mění za běhu systému (proto běhové)

- /tmp : Temporary files

##### /usr

- Statické (málo se měnící) části instalace aplikací, například spustitelné soubory, knihovny, konfigurační soubory, případně zdrojové soubory, dokumentace, nápověda,

##### /var

- Často se měnící části instalace aplikací (variable), například logy, dočasné soubory, tiskové fronty apod.

- /proc : Kernel and process information virtual filesystem

#### Odkazování na některé adresáře

##### /

- Kořenový adresář

##### .

- Aktuální adreář

##### ..

- Nadřazený adresář

##### ~

#### ODKAZY NA SOUBOR

- **HARDLINK**
- **SOFTLINK**
- Dopňte, co j e HARDLINK, CO JE SOFTLINK a jaký je mezi nimi rozdíl

- http://www.pathname.com/fhs/pub/fhs-2.3.pdf
- http://www.pathname.com/fhs/

## APPLE

### MAC OS

- The Apple **Mac OS X** operating system uses a ==hybrid structure==. As shown in Figure2.16, it is a layeredsystem.
- The top layersinclude the **Aqua** user interface (Figure 2.4) and a set of application environments and services.
- Notably, the **Cocoa** environment specifies an API for the Objective-C programming language, which is used for writing Mac OS X applications.
- Below these layers is the **kernel environment**, which consists primarily of the **Mach microkernel** and the **BSD UNIX kernel**.
- **Mach** provides memory management; support for remote procedure calls (RPCs) and interprocess communication (IPC) facilities, including message passing; and thread scheduling.
- The **BSD** component provides a BSD command-line interface, support for networking and file systems, and an implementation of POSIX APIs, including Pthreads.
- In addition to Mach and BSD, the kernel environment provides an **I/O kit** for development of device drivers and dynamically loadable modules (which Mac OS X refers to as kernel extensions).
- As shown in Figure 2.16, the BSD application environment can make use of BSD facilities directly.

![[95e067ca5d46cd55733468acacba09ed5fc7d5d54af9a8a142c3325496d7133b.png]]

### iOS

- **iOS** is a mobile operating system designed by Apple to run its smartphone, the iPhone, as well as its tablet computer, the iPad.
- iOS is structured on the Mac OS X operating system, with added functionality pertinent to mobile devices, but does not directly run Mac OS X applications.
- The structure of iOS appears in Figure
- **CocoaTouch** is an API for Objective-C that provides several frameworks for developing applications that run on iOS devices.
- The fundamental difference between Cocoa, mentioned earlier, and Cocoa Touch is that the latter provides support for hardware features unique to mobile devices, such as touch screens.
- The **media services layer** provides services for graphics, audio, and video.
- The **core services layer** provides a variety of features, including support for cloud computing and databases.
- The bottom layer represents the **core operating system**, which is based on the Mac OS X kernel environment .

![[63f44043e37eaafa022113cb0f7b8e6ea3ae124adba4066fb9de7d7e8074fa06.png]]

## ANDROID

- The **Android** operating system was designed by the **Open Handset Alliance** (led primarily by Google) and was developed for Android smartphones and tablet computers.
- Whereas iOS is designed to run on Apple mobile devices and is close-sourced, Android runs on a variety of mobile platforms and is ==open-sourced==, partly explaining its rapid rise in popularity.
- The structure of
- Android appears in Figure 2.18.
- Android is similar to iOS in that it is a ==layered stack of software== that
- provides a rich set of frameworks for developing mobile applications.
- At the
- bottom of this software stack is the **Linux kernel**, although it has been modified by Google and is currently outside the normal distribution of Linux releases.
- Linux is used primarily for process, memory, and device-driver support for hardware and has been expanded to include power management.
- The Android runtime environment includes a core set of libraries as well as the **Dalvik virtual machine**.
- Software designers for Android devices develop applications in the **Java** language. However, rather than using the standard Java API, Google has designed a separate **Android API** for Java development.
- The Java class files are first compiled to Java bytecode and then translated into an executable file that runs on the Dalvik virtual machine.
- The Dalvik virtual machine was designed for Android and is optimized for mobile devices with limited memory and CPU processing capabilities.
- The set of libraries available for Android applications includes frameworks for developing web browsers (**webkit**), database support (**SQLite**), and multimedia.
- The **libc** library is similar to the standard C library but is much smaller and has been designed for the slower CPUs that characterize mobile devices.

![[bd46721679550f458057b2f42f477625bea0e47b994c94599dd5125e6abbd76a.jpg]]

- https://www.theandroid-mania.com/android-architecture/

## ZDROJE

- http://www.vmware.com/download/player/
- https://www.osboxes.org/vmware-images/
- http://www.vmware.com/appliances/
