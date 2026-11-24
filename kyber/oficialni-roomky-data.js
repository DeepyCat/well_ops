// Obsah stránky Oficiální roomky TryHackMe. Nahraď tímto souborem oficialni-roomky-data.js ve složce stránky.
window.ZAPISNIK_DATA = {
  "zadani": [
    {
      "id": "z077",
      "title": "Module 2 – Computer Fundamentals",
      "desc": "Oficiální roomky TryHackMe, druhý modul. Computer Types, Client-Server Basics, Virtualisation Basics a Cloud Computing Fundamentals jsou podle stránek TryHackMe Premium. Mystery Chest a Recap with Echo tu nejsou. Odpovědi z VM a dashboardů pocházejí z veřejných návodů, před sdílením je proto ověř.",
      "links": [
        {
          "id": "r033",
          "label": "Inside a Computer System",
          "url": "https://tryhackme.com/room/insideacomputer",
          "tasks": [
            {
              "id": "t030",
              "title": "Inside a Computer System",
              "note": "",
              "items": [
                {
                  "id": "q029",
                  "q": "Zadej flag, který získáš po dokončení cvičení na statické stránce.",
                  "a": "THM{4llpccomp0n3nts1d3nt1f13d}",
                  "sol": "Otevři přiloženou statickou stránku („View Site\") a projdi cvičení se součástmi počítače, dokud nejsou všechny správně určené. Podle znění flagu jde o identifikaci všech komponent. Po dokončení se flag zobrazí."
                }
              ]
            },
            {
              "id": "t032",
              "title": "What Happens When You Press the Start Button?",
              "note": "",
              "items": [
                {
                  "id": "q031",
                  "q": "Jaký flag získáš po dokončení cvičení?",
                  "a": "THM{pc5ucce55fully5t4rt3d}",
                  "sol": "Na statické stránce projdi cvičení s bootovací sekvencí (5 kroků, než se načte operační systém) až do konce. Počítač se úspěšně nastartuje a zobrazí se flag."
                }
              ]
            }
          ]
        },
        {
          "id": "r047",
          "label": "Computer Types",
          "url": "https://tryhackme.com/room/computertypes",
          "tasks": [
            {
              "id": "t036",
              "title": "Sophia's Summer of Hidden Computers – Month 1",
              "note": "",
              "items": [
                {
                  "id": "q034",
                  "q": "Jaký typ počítače obvykle běží bez vlastní obrazovky a klávesnice?",
                  "a": "Server",
                  "sol": "Server běží nepřetržitě bez obrazovky a klávesnice a poskytuje služby více uživatelům přes síť."
                },
                {
                  "id": "q035",
                  "q": "Jaký počítač se specializovanými komponentami si koupíš na přesnou práci?",
                  "a": "Workstation",
                  "sol": "Workstation je určená pro přesnou a spolehlivou práci v profesionálním nasazení."
                }
              ]
            },
            {
              "id": "t039",
              "title": "Sophia's Summer of Hidden Computers – Month 2",
              "note": "",
              "items": [
                {
                  "id": "q037",
                  "q": "Jaký je v současnosti nejoblíbenější počítač kapesní velikosti?",
                  "a": "Smartphone",
                  "sol": "Chytrý telefon je nejrozšířenější počítač do kapsy."
                },
                {
                  "id": "q038",
                  "q": "Jaký typ počítače čekáš v kávovaru?",
                  "a": "Embedded computer",
                  "sol": "Vestavěný (embedded) počítač pracuje uvnitř zařízení a často se nikdy nepřipojí k internetu. IoT zařízení se naopak připojují k síti."
                }
              ]
            },
            {
              "id": "t046",
              "title": "Why Computers Come in Different Flavors",
              "note": "Projdi statickou stránku, získej flag a odpověz na krátký kvíz.",
              "items": [
                {
                  "id": "q040",
                  "q": "Proč notebooky při zátěži zpomalují (throttle) víc než stolní počítače?",
                  "a": "Less cooling space",
                  "sol": "Notebook má méně místa na chlazení, takže snáz omezí výkon."
                },
                {
                  "id": "q041",
                  "q": "Čemu zabraňuje redundance serveru?",
                  "a": "Single point of failure",
                  "sol": "Redundance (záložní zdroje, disky) znamená, že výpadek jedné části nezastaví celý systém."
                },
                {
                  "id": "q042",
                  "q": "Proč smartphony vydrží na baterii déle než notebooky?",
                  "a": "Optimized for efficiency"
                },
                {
                  "id": "q043",
                  "q": "Která vlastnost je běžnější u workstation?",
                  "a": "ECC RAM and certified drivers"
                },
                {
                  "id": "q044",
                  "q": "Co v chytré domácnosti koordinuje zařízení?",
                  "a": "Hub or cloud service"
                },
                {
                  "id": "q045",
                  "q": "Zadej flag ze statické stránky.",
                  "a": "THM{8_computer_types}",
                  "sol": "Projdi přiloženou statickou stránku a spoj tři situace se správným typem počítače: Workstation (střih 4K videa), Server (web 24/7), Embedded (zvonek po stisku tlačítka). Pak se zobrazí flag."
                }
              ]
            }
          ]
        },
        {
          "id": "r054",
          "label": "Client-Server Basics",
          "url": "https://tryhackme.com/room/clientserverbasics",
          "tasks": [
            {
              "id": "t050",
              "title": "Pizza Delivery",
              "note": "",
              "items": [
                {
                  "id": "q048",
                  "q": "Čím identifikujeme konkrétní službu běžící na serveru?",
                  "a": "port",
                  "sol": "Port určuje službu na serveru (jako různé dveře pro různé služby)."
                },
                {
                  "id": "q049",
                  "q": "Jak se nazývá adresa serveru?",
                  "a": "Internet Protocol address",
                  "sol": "Takto je odpověď uvedená v dostupných řešeních (zkráceně IP adresa). Kdyby ji systém nepřijal, zkus „IP address\". DNS překládá jméno na tuto adresu."
                }
              ]
            },
            {
              "id": "t053",
              "title": "Web Communication in Practice",
              "note": "",
              "items": [
                {
                  "id": "q051",
                  "q": "Jaký je host v URL https://www.iamlearning.thm/contact?",
                  "a": "www.iamlearning.thm",
                  "sol": "URL má tvar schéma://host/cesta. Host je část mezi „://\" a další lomítkem."
                },
                {
                  "id": "q052",
                  "q": "Jaké je schéma (scheme) téže URL?",
                  "a": "https",
                  "sol": "Schéma je část před „://\"."
                }
              ]
            }
          ]
        },
        {
          "id": "r066",
          "label": "Virtualisation Basics",
          "url": "https://tryhackme.com/room/virtualisationbasics",
          "tasks": [
            {
              "id": "t057",
              "title": "Virtualization Overview",
              "note": "",
              "items": [
                {
                  "id": "q055",
                  "q": "Co virtualizace umožňuje sdílet více aplikacím?",
                  "a": "Physical Server"
                },
                {
                  "id": "q056",
                  "q": "Jak se jmenuje software, který spravuje zdroje jednotlivých virtuálních strojů?",
                  "a": "Hypervisor"
                }
              ]
            },
            {
              "id": "t060",
              "title": "Virtualization Components",
              "note": "",
              "items": [
                {
                  "id": "q058",
                  "q": "Uživatel chce na svém počítači vytvořit studijní laboratoř pro přípravu na certifikaci. Jaký typ hypervizoru použije?",
                  "a": "Type 2",
                  "sol": "Type 2 běží nad existujícím operačním systémem (VirtualBox, VMware Workstation) a hodí se pro učení a testování. Type 1 běží přímo na hardwaru a patří na servery."
                },
                {
                  "id": "q059",
                  "q": "Firma chce provozovat víc malých aplikací v jednom virtuálním stroji. Co má použít?",
                  "a": "Containers",
                  "sol": "Kontejnery sdílejí jádro hostitelského systému, jsou lehčí a startují rychleji než virtuální stroje."
                }
              ]
            },
            {
              "id": "t065",
              "title": "Managing Virtual Machines",
              "note": "Praktická část se dělá ve „Virtualization Manager\" (View Site). Nejdřív oprav problém: v sekci Virtual Machines najdi VM Mail-SERVER, je ve stavu Error. Restartuj ho modrým čtvercovým tlačítkem.",
              "items": [
                {
                  "id": "q061",
                  "q": "Který virtuální stroj běží nejdéle?",
                  "a": "Monitoring-SYS",
                  "sol": "V sekci Virtual Machines porovnej dobu běhu jednotlivých strojů a vyber ten s nejvyšší hodnotou."
                },
                {
                  "id": "q062",
                  "q": "Který virtuální stroj používá nejvíc paměti?",
                  "a": "DB-Cluster-01",
                  "sol": "V seznamu virtuálních strojů porovnej sloupec s využitím paměti."
                },
                {
                  "id": "q063",
                  "q": "Kolik VM je ve stavu running po vyřešení problému na Mail-SERVER?",
                  "a": "8",
                  "sol": "Napřed oprav Mail-SERVER (viz pokyn nahoře), pak spočítej stroje ve stavu running."
                },
                {
                  "id": "q064",
                  "q": "Jak se jmenuje fyzický stroj, který hostuje nejvíc VM?",
                  "a": "HV-PROD-02",
                  "sol": "V přehledu hostitelů (fyzických strojů) porovnej počty VM na každém. HV-PROD-02 je nejvytíženější."
                }
              ]
            }
          ]
        },
        {
          "id": "r076",
          "label": "Cloud Computing Fundamentals",
          "url": "https://tryhackme.com/room/cloudcomputingfundamentals",
          "tasks": [
            {
              "id": "t070",
              "title": "Cloud Computing Overview",
              "note": "",
              "items": [
                {
                  "id": "q067",
                  "q": "Jaká vlastnost cloudu umožňuje zvládnout nečekaný nárůst přístupů k aplikaci?",
                  "a": "Scalability",
                  "sol": "Škálovatelnost: aplikace se dokáže zvětšit hned, jakmile přijde víc uživatelů."
                },
                {
                  "id": "q068",
                  "q": "Jaký typ nasazení cloudu se používá nejčastěji?",
                  "a": "Public Cloud",
                  "sol": "Veřejný cloud je levný, snadno se škáluje a nevyžaduje správu hardwaru. Private cloud je pro jednu firmu, hybrid je kombinace obou."
                },
                {
                  "id": "q069",
                  "q": "Chceš nasadit aplikaci na internet, soustředit se jen na vývoj a infrastrukturu nechat na jiných. Jaký typ cloudové služby je nejlepší?",
                  "a": "PaaS",
                  "sol": "PaaS: poskytovatel spravuje servery i operační systém, ty řešíš jen aplikaci. IaaS pronajímá jen základní zdroje, SaaS je hotová aplikace."
                }
              ]
            },
            {
              "id": "t075",
              "title": "Deploying a Cloud Instance",
              "note": "Praktická část je v TryHackMe Cloud Console (View Site). Prostředí už má web-1 a db-1 (t3.micro). Vytvoř application-interface (t3.micro), study-machine-1 a study-machine-2 (m5.large), pak v Billing zjisti náklady a nakonec zastav obě study-machine a podívej se znovu.",
              "items": [
                {
                  "id": "q071",
                  "q": "Jaký je celkový počet kreditů celého prostředí, pokud jsou study-machine-1 a study-machine-2 zastavené?",
                  "a": "30",
                  "sol": "Zastavený stroj stojí 0. Zbývají tři t3.micro (web-1, db-1, application-interface): 3 × 10 = 30."
                },
                {
                  "id": "q072",
                  "q": "Kolik kreditů měsíčně stojí instance m5.large?",
                  "a": "70",
                  "sol": "Ceny v konzoli (kreditů za měsíc): t3.micro 10, t3.small 18, m5.large 70, zastavený stroj 0."
                },
                {
                  "id": "q073",
                  "q": "Jaký je celkový počet kreditů, pokud běží jen nové instance, které jsme vytvořili?",
                  "a": "150",
                  "sol": "Vytvořili jsme application-interface (10), study-machine-1 (70) a study-machine-2 (70): 10 + 70 + 70 = 150."
                },
                {
                  "id": "q074",
                  "q": "Jaké by bylo celkové běžící prostředí, kdybys přidal třetí studijní stroj t3a.small?",
                  "a": "188",
                  "sol": "Celé prostředí má 170 kreditů (3 × 10 + 2 × 70). Stroj t3a.small stojí stejně jako t3.small, tedy 18: 170 + 18 = 188."
                }
              ]
            }
          ]
        }
      ],
      "done": false
    },
    {
      "id": "z028",
      "title": "Module 1 – Introduction to Cyber Security",
      "desc": "Oficiální roomky TryHackMe, první modul. Mystery Chest a Recap with Echo tu nejsou, nemají otázky s odpovědí. Odpovědi pocházejí z veřejných návodů a z textu místností. Tam, kde jsem aktuální odpověď neověřil, je pole prázdné a v postupu je napsáno, jak ji zjistit.",
      "links": [
        {
          "id": "r009",
          "label": "Defensive Security Intro",
          "url": "https://tryhackme.com/room/defensivesecurityintro",
          "tasks": [
            {
              "id": "t002",
              "title": "You're the First Line of Defence",
              "note": "",
              "items": [
                {
                  "id": "q001",
                  "q": "Co dělá obránce (defender), když je odhalen útok? (výběr ze dvou možností)",
                  "a": "Investigate and stop the hackers",
                  "sol": "Správná je možnost, kde obránce útok vyšetří a zastaví. Druhá možnost („Start hacking back\") je protiútok, což obránce nedělá. Obránci útok sledují, vyšetřují a zastavují."
                }
              ]
            },
            {
              "id": "t004",
              "title": "Something Looks Wrong...",
              "note": "Spusť dashboard tlačítkem „View Site\" (simulovaný bezpečnostní dashboard).",
              "items": [
                {
                  "id": "q003",
                  "q": "Z jaké IP adresy útok přichází?",
                  "a": "32.122.195.63",
                  "sol": "Klikni na zelené „View Site\", otevře se simulovaný bezpečnostní dashboard. Projdi poslední alerty a najdi ten nejpodezřelejší (hacker ho právě vyvolal). Je v něm uvedená IP útočníka. Stejnou IP uvádí zadání v Task 4 jako tu, kterou je třeba zablokovat."
                }
              ]
            },
            {
              "id": "t006",
              "title": "What are Hackers Looking For?",
              "note": "",
              "items": [
                {
                  "id": "q005",
                  "q": "Jaká je nejnovější URL, kterou hacker našel?",
                  "a": "",
                  "sol": "Na dashboardu klikni na „Investigate\", projdi seznam stránek, které se hacker pokoušel navštívit, a opiš tu nejnovější nalezenou. Odpověď nemám pro aktuální verzi místnosti ověřenou. V dřívější verzi (se stejným dashboardem a IP) byla odpověď https://fakebank.com/admin, ale zkontroluj ji na dashboardu."
                }
              ]
            },
            {
              "id": "t008",
              "title": "Stop The Hack",
              "note": "",
              "items": [
                {
                  "id": "q007",
                  "q": "Zkopíruj flag, který se zobrazí po zastavení hackera.",
                  "a": "",
                  "sol": "Na dashboardu zapni všechny tři ochrany: 1) zablokuj spojení a IP adresu 32.122.195.63, 2) zpomal aktivitu (omezení počtu přístupů), 3) zapni ochranu proti opakování útoku. Po zapnutí všech tří dashboard zobrazí flag. Flag aktuální verze nemám ověřený. V dřívější verzi byl THM{FAKEBANK-SECURED}, ale opiš ho z dashboardu."
                }
              ]
            }
          ]
        },
        {
          "id": "r018",
          "label": "Offensive Security Intro",
          "url": "https://tryhackme.com/room/offensivesecurityintro",
          "tasks": [
            {
              "id": "t011",
              "title": "Think like a Hacker!",
              "note": "",
              "items": [
                {
                  "id": "q010",
                  "q": "Který pojem popisuje simulování hackerových kroků za účelem nalezení slabin systému?",
                  "a": "Offensive Security",
                  "sol": "Offensive security je simulování útoku (etické hackování, penetrační testování), aby se slabiny našly dřív než útočník. Defensive security je opačná strana. V některých verzích místnosti je otázka zadaná jako výběr osoby; logika zůstává stejná, vyber toho, kdo systém záměrně napadá, aby našel slabiny."
                }
              ]
            },
            {
              "id": "t013",
              "title": "Starting the Lab",
              "note": "",
              "items": [
                {
                  "id": "q012",
                  "q": "Jaké je číslo bankovního účtu zobrazené v aplikaci FakeBank?",
                  "a": "8881",
                  "sol": "Klikni na zelené „View Site\". Číslo účtu je vidět v levém horním rohu aplikace FakeBank."
                }
              ]
            },
            {
              "id": "t015",
              "title": "Find Hidden Pages",
              "note": "V terminálu na pravé straně spusť: dirb http://fakebank.thm",
              "items": [
                {
                  "id": "q014",
                  "q": "Dirb našel URL http://fakebank.thm/images. Jaká je ta druhá skrytá URL?",
                  "a": "http://fakebank.thm/bank-transfer",
                  "sol": "V terminálu spusť dirb http://fakebank.thm a počkej, až skončí. Najde dvě stránky: /images a /bank-transfer. Druhá je hledaná. Starší verze místnosti používala místo dirb nástroj gobuster: gobuster -u http://fakebank.thm -w wordlist.txt dir."
                }
              ]
            },
            {
              "id": "t017",
              "title": "Attack the Admin Page",
              "note": "",
              "items": [
                {
                  "id": "q016",
                  "q": "Když se zůstatek účtu změní na kladný, objeví se vyskakovací okno se zeleným textem. Napiš ho VELKÝMI PÍSMENY.",
                  "a": "BANK HACKED",
                  "sol": "Do adresního řádku prohlížeče ve FakeBank přidej /bank-transfer (tedy http://fakebank.thm/bank-transfer). Vyber svůj účet 8881 a vlož částku alespoň 2000. Pak se vrať na stránku svého účtu: zůstatek je kladný a objeví se zelený text. Starší verze místnosti chtěla odpověď ve tvaru BANK-HACKED (s pomlčkou). Kdyby tvar bez pomlčky neprošel, zkus ji."
                }
              ]
            }
          ]
        },
        {
          "id": "r027",
          "label": "Careers in Cyber",
          "url": "https://tryhackme.com/room/careersincyber",
          "tasks": [
            {
              "id": "t026",
              "title": "Role guides",
              "note": "Podle starší verze místnosti jsou všechny úkoly jen ke čtení a odpověď se nezadává. Počet rolí se v aktuální verzi může lišit.",
              "items": [
                {
                  "id": "q019",
                  "q": "Přečti si úvod do kariér v kyberbezpečnosti.",
                  "a": "No answer needed"
                },
                {
                  "id": "q020",
                  "q": "Přečti si, co dělá security analyst.",
                  "a": "No answer needed"
                },
                {
                  "id": "q021",
                  "q": "Přečti si, co dělá security engineer.",
                  "a": "No answer needed"
                },
                {
                  "id": "q022",
                  "q": "Přečti si, co dělá incident responder.",
                  "a": "No answer needed"
                },
                {
                  "id": "q023",
                  "q": "Přečti si, co dělá digital forensics examiner.",
                  "a": "No answer needed"
                },
                {
                  "id": "q024",
                  "q": "Přečti si, co dělá malware analyst.",
                  "a": "No answer needed"
                },
                {
                  "id": "q025",
                  "q": "Přečti si, co dělá penetration tester.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        }
      ],
      "done": false
    }
  ]
};