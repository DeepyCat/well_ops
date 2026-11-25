// Obsah stránky Oficiální roomky TryHackMe. Nahraď tímto souborem oficialni-roomky-data.js ve složce stránky.
window.ZAPISNIK_DATA = {
  "zadani": [
    {
      "id": "mz153",
      "title": "Module 4 – Software Basics",
      "desc": "Oficiální roomky TryHackMe, čtvrtý modul. Mystery Chest a Recap with Echo tu nejsou. Python: Simple Demo nemá vyplněný odkaz, protože si nejsem jistý jeho adresou. Python, JavaScript a SQL jsou podle návodů Premium. Dvě odpovědi v SQL Basics (jeden řádek tabulky a závěrečná otázka) jsou prázdné, protože je nemám ověřené. Odpovědi pocházejí z veřejných návodů, před sdílením je ověř.",
      "links": [
        {
          "id": "mr094",
          "label": "Data Representation",
          "url": "https://tryhackme.com/room/datarepresentation",
          "tasks": [
            {
              "id": "mt083",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq082",
                  "q": "Připraven prozkoumat, jak počítače reprezentují data.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt087",
              "title": "Representing Colors",
              "note": "",
              "items": [
                {
                  "id": "mq084",
                  "q": "Zobraz barvu #3BC81E. Jak bys ji jedním slovem popsal?",
                  "a": "green",
                  "sol": "Rozlož kód na RGB: 3B = 59, C8 = 200, 1E = 30. Převládá zelená složka."
                },
                {
                  "id": "mq085",
                  "q": "Jaký je binární zápis barvy #EB0037?",
                  "a": "11101011 00000000 00110111",
                  "sol": "Každou dvojici převeď na 8 bitů: EB = 11101011, 00 = 00000000, 37 = 00110111."
                },
                {
                  "id": "mq086",
                  "q": "Jaký je desítkový zápis barvy #D4D8DF?",
                  "a": "212 216 223",
                  "sol": "Každou dvojici převeď zvlášť: D4 = 212, D8 = 216, DF = 223."
                }
              ]
            },
            {
              "id": "mt091",
              "title": "Numbers: From Decimal to Hexadecimal",
              "note": "",
              "items": [
                {
                  "id": "mq088",
                  "q": "Jak se hexadecimální FF zapíše binárně?",
                  "a": "1111 1111",
                  "sol": "F = 15 = 1111, takže FF = 1111 1111."
                },
                {
                  "id": "mq089",
                  "q": "Jaká je desítková hodnota hexadecimálního AB?",
                  "a": "171",
                  "sol": "A = 10, B = 11: 10 × 16 + 11 = 171."
                },
                {
                  "id": "mq090",
                  "q": "Převeď hexadecimální FF FF FF na desítkové číslo a zaokrouhli na nejbližší milion. Kolik je to milionů?",
                  "a": "17",
                  "sol": "FFFFFF = 16 777 215, po zaokrouhlení 17 milionů."
                }
              ]
            },
            {
              "id": "mt093",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq092",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr108",
          "label": "Data Encoding",
          "url": "https://tryhackme.com/room/dataencoding",
          "tasks": [
            {
              "id": "mt096",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq095",
                  "q": "Je čas ponořit se do kódování.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt100",
              "title": "ASCII",
              "note": "",
              "items": [
                {
                  "id": "mq097",
                  "q": "Jaký je desítkový ASCII kód znaku @?",
                  "a": "64",
                  "sol": "Použij ASCII tabulku, nebo v programu funkci ord()."
                },
                {
                  "id": "mq098",
                  "q": "Který znak má desítkový ASCII kód 35?",
                  "a": "#"
                },
                {
                  "id": "mq099",
                  "q": "Jak se jmenuje znak s ASCII kódem 7?",
                  "a": "BEL",
                  "sol": "Je to řídicí znak (bell)."
                }
              ]
            },
            {
              "id": "mt105",
              "title": "Unicode",
              "note": "",
              "items": [
                {
                  "id": "mq101",
                  "q": "Jaké je kódování UTF-32 emoji 😌?",
                  "a": "U+0001F60C",
                  "sol": "Použij převodník Unicode, který je u úkolu."
                },
                {
                  "id": "mq102",
                  "q": "Jaké je kódování UTF-16 znaku シ? (ツ a シ jsou dva různé znaky.)",
                  "a": "U+30B7"
                },
                {
                  "id": "mq103",
                  "q": "Jaký znak má kódování UTF-32 U+0001F60E?",
                  "a": "😎",
                  "sol": "V některých verzích úkolu se místo toho ptají na U+2615 (je to ☕)."
                },
                {
                  "id": "mq104",
                  "q": "Jaký znak má kódování UTF-16 U+2658?",
                  "a": "♘"
                }
              ]
            },
            {
              "id": "mt107",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq106",
                  "q": "Pokud tě zajímá, jak počítače pracují s daty, pokračuj do místnosti Python Demo.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr122",
          "label": "Python: Simple Demo",
          "url": "",
          "tasks": [
            {
              "id": "mt110",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq109",
                  "q": "Připraven vyzkoušet první kousek kódu v Pythonu.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt113",
              "title": "Variables",
              "note": "",
              "items": [
                {
                  "id": "mq111",
                  "q": "Jakou funkcí se v Pythonu zobrazuje text na obrazovce?",
                  "a": "print()"
                },
                {
                  "id": "mq112",
                  "q": "Jakou funkcí se vstup od uživatele převede na celé číslo?",
                  "a": "int()",
                  "sol": "input() vrací text, int() ho převede na číslo, aby šlo porovnávat."
                }
              ]
            },
            {
              "id": "mt116",
              "title": "Conditional Statements",
              "note": "",
              "items": [
                {
                  "id": "mq114",
                  "q": "Jak se v Pythonu píše „else if\"?",
                  "a": "elif"
                },
                {
                  "id": "mq115",
                  "q": "Co program vypíše, když uživatel zadá 50?",
                  "a": "That number is out of range. Try again.",
                  "sol": "50 je větší než 20, takže platí první podmínka (guess < 1 or guess > 20) a zbytek se přeskočí."
                }
              ]
            },
            {
              "id": "mt119",
              "title": "Iterations",
              "note": "",
              "items": [
                {
                  "id": "mq117",
                  "q": "Jaký cyklus program používá?",
                  "a": "while",
                  "sol": "Podmínka je while guess != secret, tedy opakuj, dokud je tip špatný."
                },
                {
                  "id": "mq118",
                  "q": "Co program zobrazí, když uživatel uhodne napotřetí?",
                  "a": "You got it in 3 tries!",
                  "sol": "Větev else vypíše počet pokusů, tedy tries = 3."
                }
              ]
            },
            {
              "id": "mt121",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq120",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr140",
          "label": "JavaScript: Simple Demo",
          "url": "https://tryhackme.com/room/javascriptsimpledemo",
          "tasks": [
            {
              "id": "mt124",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq123",
                  "q": "Připraven vyzkoušet první kousek kódu v JavaScriptu.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt128",
              "title": "Variables",
              "note": "",
              "items": [
                {
                  "id": "mq125",
                  "q": "Jaké slovo se používá pro deklaraci proměnné?",
                  "a": "let"
                },
                {
                  "id": "mq126",
                  "q": "Jaké slovo se používá pro deklaraci konstanty?",
                  "a": "const"
                },
                {
                  "id": "mq127",
                  "q": "Jakou metodou se na obrazovku zobrazí text?",
                  "a": "console.log()"
                }
              ]
            },
            {
              "id": "mt130",
              "title": "Prompting the User for Input",
              "note": "",
              "items": [
                {
                  "id": "mq129",
                  "q": "Jakou metodou se vstup od uživatele převede na číslo?",
                  "a": "parseInt()",
                  "sol": "Vstup je text, parseInt() z něj udělá celé číslo."
                }
              ]
            },
            {
              "id": "mt133",
              "title": "Conditional Statements",
              "note": "",
              "items": [
                {
                  "id": "mq131",
                  "q": "Tajné číslo je 10. Co program zobrazí, když uživatel zadá 15?",
                  "a": "Too high, try again."
                },
                {
                  "id": "mq132",
                  "q": "Tajné číslo je 10. Co program zobrazí, když uživatel zadá 35?",
                  "a": "That number is out of range.",
                  "sol": "35 je mimo rozsah 1 až 20, takže se vypíše hláška o rozsahu."
                }
              ]
            },
            {
              "id": "mt137",
              "title": "Iterations",
              "note": "",
              "items": [
                {
                  "id": "mq134",
                  "q": "Jak se jmenuje cyklus použitý v tomto úkolu?",
                  "a": "while"
                },
                {
                  "id": "mq135",
                  "q": "Jak se jmenuje proměnná, která se zvýší o jedna při každém novém špatném tipu?",
                  "a": "tries"
                },
                {
                  "id": "mq136",
                  "q": "Jak se v JavaScriptu zapisuje operátor „není rovno\" (porovnání bez shody typu)?",
                  "a": "!==",
                  "sol": "Tuto otázku jsem našel jen v jednom návodu, zkontroluj její znění."
                }
              ]
            },
            {
              "id": "mt139",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq138",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr152",
          "label": "Database SQL Basics",
          "url": "https://tryhackme.com/room/databasesqlbasics",
          "tasks": [
            {
              "id": "mt142",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq141",
                  "q": "Připraven vyzkoušet první SQL dotazy.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt145",
              "title": "Understanding Tables, Rows, and Columns",
              "note": "",
              "items": [
                {
                  "id": "mq143",
                  "q": "Jak se v databázi nazývají „tabulky\" (spreadsheets), které ukládají informace?",
                  "a": "Table",
                  "sol": "Databáze obsahuje tabulky, tabulka řádky a sloupce. Kdyby systém odpověď nepřijal, zkus množné číslo „tables\"."
                },
                {
                  "id": "mq144",
                  "q": "V tabulce kavárny: co představuje jeden řádek?",
                  "a": "",
                  "sol": "Řádek je jeden kompletní záznam (např. jedna objednávka). Vyber možnost, která tomu odpovídá. Přesné znění odpovědi nemám ověřené."
                }
              ]
            },
            {
              "id": "mt149",
              "title": "Writing Your First SQL Query",
              "note": "",
              "items": [
                {
                  "id": "mq146",
                  "q": "Kolik řádků se vrátilo po zobrazení všech objednávek?",
                  "a": "50",
                  "sol": "Dotaz: SELECT * FROM Orders;"
                },
                {
                  "id": "mq147",
                  "q": "Který nápoj byl první po seřazení objednávek podle ceny od nejlevnějšího?",
                  "a": "Tea",
                  "sol": "Dotaz: SELECT * FROM Orders ORDER BY price ASC;"
                },
                {
                  "id": "mq148",
                  "q": "Který nápoj byl první po seřazení od nejdražšího?",
                  "a": "Latte",
                  "sol": "Dotaz: SELECT * FROM Orders ORDER BY price DESC;"
                }
              ]
            },
            {
              "id": "mt151",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq150",
                  "q": "Konceptuální otázka o tom, co by se mohlo stát, kdyby data mohl měnit nebo mazat neoprávněný uživatel.",
                  "a": "",
                  "sol": "Výběr z možností. Správná je ta, která říká, že neoprávněný uživatel by mohl data pozměnit nebo smazat a způsobit škodu. Přesné znění odpovědi nemám ověřené."
                }
              ]
            }
          ]
        }
      ],
      "done": false
    },
    {
      "id": "mz081",
      "title": "Module 3 – Operating Systems Basics",
      "desc": "Oficiální roomky TryHackMe, třetí modul. Mystery Chest a Recap with Echo tu nejsou. Operating Systems: Introduction nemá vyplněný odkaz, protože si nejsem jistý jeho adresou. Windows CLI Basics je podle stránek Premium a odpovědi k němu nemám ověřené, protože závisí na virtuálním stroji. Postup, jak je zjistit, je u každé otázky. Ostatní odpovědi pocházejí z veřejných návodů, před sdílením je ověř.",
      "links": [
        {
          "id": "mr030",
          "label": "Operating Systems: Introduction",
          "url": "",
          "tasks": [
            {
              "id": "mt018",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq017",
                  "q": "Rozumím cílům místnosti a jsem připraven.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt023",
              "title": "The Invisible Manager",
              "note": "",
              "items": [
                {
                  "id": "mq019",
                  "q": "Který prostor operačního systému má neomezený přístup k hardwaru počítače?",
                  "a": "Kernel space",
                  "sol": "Kernel space běží s nejvyššími oprávněními a komunikuje přímo s hardwarem. Běžné aplikace běží v user space a o přístup musí žádat."
                },
                {
                  "id": "mq020",
                  "q": "Která odpovědnost OS spravuje uživatelské účty, ověřování a oprávnění?",
                  "a": "User Management"
                },
                {
                  "id": "mq021",
                  "q": "Po otevření zkratky About This Computer: jakou verzi Ubuntu MATE počítač používá?",
                  "a": "1.26.2",
                  "sol": "Na ploše virtuálního stroje otevři „About This Computer\" a opiš číslo verze. Podle návodů je to 1.26.2."
                },
                {
                  "id": "mq022",
                  "q": "V sekci Hardware na záložce System: kolik paměti je přiděleno stroji?",
                  "a": "1.9 GiB",
                  "sol": "Opiš hodnotu z „About This Computer\". Tato hodnota je podle návodu z března 2026 a mohla se u novější verze změnit, tak ji zkontroluj ve VM."
                }
              ]
            },
            {
              "id": "mt027",
              "title": "OS Interaction and Landscape",
              "note": "",
              "items": [
                {
                  "id": "mq024",
                  "q": "Na záložce File Systems v System Monitoru: jaký Type je uveden u zařízení /dev/root?",
                  "a": "ext4",
                  "sol": "Otevři System Monitor a jeho kartu File Systems."
                },
                {
                  "id": "mq025",
                  "q": "Po otevření domovského adresáře na ploše: kolik tam je uživatelských adresářů?",
                  "a": "3"
                },
                {
                  "id": "mq026",
                  "q": "V domovském adresáři Alexe ve složce Documents: jaký flag je v souboru note.txt?",
                  "a": "THM{new_pc_for_free!}",
                  "sol": "Domovský adresář otevři na ploše, vstup do složky Alexe, pak Documents a otevři note.txt."
                }
              ]
            },
            {
              "id": "mt029",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq028",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr045",
          "label": "Windows Basics",
          "url": "https://tryhackme.com/room/windowsbasics",
          "tasks": [
            {
              "id": "mt032",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq031",
                  "q": "Rozumím cílům místnosti a jsem připraven.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt037",
              "title": "Exploring the Windows Workspace",
              "note": "",
              "items": [
                {
                  "id": "mq033",
                  "q": "Jaké je Device name v nastavení About your PC (Device specifications)?",
                  "a": "TryHatMe",
                  "sol": "Virtuální stroj otevři na rozdělené obrazovce (split-screen). Na ploše otevři About your PC a sekci Device specifications."
                },
                {
                  "id": "mq034",
                  "q": "Kolik RAM je nainstalováno?",
                  "a": "4.00 GB",
                  "sol": "Stejná obrazovka, pokračuj v Device specifications."
                },
                {
                  "id": "mq035",
                  "q": "Jaká verze Windows Server 2019 Datacenter je nainstalovaná?",
                  "a": "1809",
                  "sol": "Sjeď dolů do Windows specifications a opiš Version."
                },
                {
                  "id": "mq036",
                  "q": "Jaký flag je v souboru Welcome.txt ve složce TryHatMe Onboarding?",
                  "a": "THM{welcome_to_tryhatme!}",
                  "sol": "Otevři složku TryHatMe Onboarding na ploše a v ní Welcome.txt."
                }
              ]
            },
            {
              "id": "mt042",
              "title": "Configuring and Securing Windows",
              "note": "",
              "items": [
                {
                  "id": "mq038",
                  "q": "Jaký flag dostaneš po instalaci a spuštění aplikace TryHatMeWelcome?",
                  "a": "THM{welcome_to_tryhatme!}",
                  "sol": "Instalátor TryHatMeWelcome je ve složce TryHatMe Onboarding. Nainstaluj ho a spusť."
                },
                {
                  "id": "mq039",
                  "q": "Na jakou zemi nebo region je počítač nastaven (Settings, Time & Language)?",
                  "a": "United States"
                },
                {
                  "id": "mq040",
                  "q": "Který účet je přihlášený (Task Manager, záložka Users)?",
                  "a": "Administrator",
                  "sol": "Task Manager otevřeš pravým klikem na hlavní panel."
                },
                {
                  "id": "mq041",
                  "q": "Po vlastní kontrole a kliknutí na Virus:DOS/EICAR_Test_File a See details: jaký soubor je v části Affected items?",
                  "a": "tryhatmemaldoc.txt",
                  "sol": "Klikni na Start, vyhledej „Virus & threat protection\" a spusť Quick scan. Pak otevři výsledek."
                }
              ]
            },
            {
              "id": "mt044",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq043",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr058",
          "label": "Linux CLI Basics",
          "url": "https://tryhackme.com/room/linuxclibasics",
          "tasks": [
            {
              "id": "mt047",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq046",
                  "q": "Co znamená zkratka CLI?",
                  "a": "Command-Line Interface"
                }
              ]
            },
            {
              "id": "mt050",
              "title": "Navigation Mission: \"Find the Missing Notes\"",
              "note": "",
              "items": [
                {
                  "id": "mq048",
                  "q": "Jaká je úplná cesta k souboru mission_brief.txt (příkaz find)?",
                  "a": "/home/ubuntu/Documents/.research/archive/mission_brief.txt",
                  "sol": "V terminálu spusť find s názvem souboru (např. find ~ -name mission_brief.txt) a počkej na výpis cesty."
                },
                {
                  "id": "mq049",
                  "q": "Jaký flag je uvnitř souboru mission_brief.txt?",
                  "a": "MISSION-FOUND",
                  "sol": "Obsah vypiš příkazem cat s plnou cestou z předchozí otázky."
                }
              ]
            },
            {
              "id": "mt055",
              "title": "Investigating the System",
              "note": "",
              "items": [
                {
                  "id": "mq051",
                  "q": "Jaké uživatelské jméno vrací příkaz whoami?",
                  "a": "ubuntu"
                },
                {
                  "id": "mq052",
                  "q": "Jaká verze jádra se zobrazí po uname -a?",
                  "a": "6.14.0-1018-aws",
                  "sol": "Hodnota se může lišit podle instance. Zkontroluj ji ve VM."
                },
                {
                  "id": "mq053",
                  "q": "Kolik volného místa na disku zobrazí df -h?",
                  "a": "58G",
                  "sol": "Hodnota se může lišit podle instance. Zkontroluj ji ve VM."
                },
                {
                  "id": "mq054",
                  "q": "Jaká zpráva je uvnitř souboru day1_report.txt?",
                  "a": "END-OF-DAY1",
                  "sol": "Cestu najdeš příkazem find ~ -name day1_report.txt. Podle návodů je to /home/ubuntu/.logs/archive/day1_report.txt. Obsah vypiš příkazem cat."
                }
              ]
            },
            {
              "id": "mt057",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq056",
                  "q": "Pokračuj k dokončení místnosti.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr071",
          "label": "Windows CLI Basics",
          "url": "https://tryhackme.com/room/windowsclibasics",
          "tasks": [
            {
              "id": "mt060",
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "mq059",
                  "q": "Rozumím cílům místnosti a jsem připraven.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt063",
              "title": "Windows CLI: Navigating Files and Finding Your First File",
              "note": "Znění otázek je odvozeno z návodů, ověř ho v místnosti. Odpovědi závisí na virtuálním stroji, proto jsou prázdné.",
              "items": [
                {
                  "id": "mq061",
                  "q": "Jaká je úplná cesta k souboru mission_brief.txt?",
                  "a": "",
                  "sol": "Začni v domovském adresáři (C:\\Users\\Administrator). Příkaz dir /s mission_brief.txt prohledá všechny podsložky a vypíše plnou cestu. Skryté složky ukáže dir /a. V některých návodech se soubor jmenuje task_brief.txt, použij název ze zadání. Odpověď nemám ověřenou."
                },
                {
                  "id": "mq062",
                  "q": "Jaký flag je uvnitř souboru?",
                  "a": "",
                  "sol": "Přejdi do nalezené složky příkazem cd a soubor vypiš příkazem type. Flag opiš z výpisu. Odpověď nemám ověřenou."
                }
              ]
            },
            {
              "id": "mt068",
              "title": "Gathering System Information on Windows",
              "note": "Znění otázek je odvozeno z návodů, ověř ho v místnosti. Odpovědi závisí na virtuálním stroji, proto jsou prázdné.",
              "items": [
                {
                  "id": "mq064",
                  "q": "Pod jakým uživatelem jsi přihlášen?",
                  "a": "",
                  "sol": "Příkaz whoami. U Windows CLI Basics je to podle návodů účet Administrator. Zkontroluj ve VM."
                },
                {
                  "id": "mq065",
                  "q": "Jak se jmenuje počítač?",
                  "a": "",
                  "sol": "Příkaz hostname (nebo řádek Host Name ve výpisu příkazu systeminfo)."
                },
                {
                  "id": "mq066",
                  "q": "Jaká je verze Windows?",
                  "a": "",
                  "sol": "Příkaz systeminfo, řádky OS Name a OS Version. Podle návodu jsou odpovědi na Task 3 vidět ve výpisu systeminfo."
                },
                {
                  "id": "mq067",
                  "q": "Jaká je IPv4 adresa a výchozí brána?",
                  "a": "",
                  "sol": "Příkaz ipconfig, řádky IPv4 Address a Default Gateway."
                }
              ]
            },
            {
              "id": "mt070",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "mq069",
                  "q": "Dokonči místnost a pokračuj dál.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "mr080",
          "label": "Operating System Security",
          "url": "https://tryhackme.com/room/operatingsystemsecurity",
          "tasks": [
            {
              "id": "mt073",
              "title": "Introduction to Operating System Security",
              "note": "",
              "items": [
                {
                  "id": "mq072",
                  "q": "Co z nabídky (AIX, Android, Chrome OS, Solaris, Thunderbird) není operační systém?",
                  "a": "Thunderbird",
                  "sol": "Thunderbird je e-mailový klient."
                }
              ]
            },
            {
              "id": "mt075",
              "title": "Common Examples of OS Security",
              "note": "",
              "items": [
                {
                  "id": "mq074",
                  "q": "Které z hesel (iloveyou, 1q2w3e4r5t, LearnM00r, qwertyuiop) je silné?",
                  "a": "LearnM00r",
                  "sol": "Ostatní jsou snadno uhodnutelná: fráze nebo řady kláves na klávesnici."
                }
              ]
            },
            {
              "id": "mt079",
              "title": "Practical Example of OS Security",
              "note": "Tato místnost má podle stránky TryHackMe jen 3 tasky bez závěrečného.",
              "items": [
                {
                  "id": "mq076",
                  "q": "Podle seznamu 7 nejčastějších hesel: jaké je heslo uživatele johnny?",
                  "a": "abc123",
                  "sol": "Heslo je z top 7 nejčastějších hesel (sedmé v pořadí). Přihlas se jako johnny."
                },
                {
                  "id": "mq077",
                  "q": "Po přihlášení jako Johnny zkontroluj příkazem history, co psal. Jaké je heslo roota?",
                  "a": "happyHack!NG",
                  "sol": "V historii příkazů je na jednom řádku omylem napsané heslo."
                },
                {
                  "id": "mq078",
                  "q": "Přepni se na roota (su - root) a vypiš soubor flag.txt v kořenovém adresáři roota. Co obsahuje?",
                  "a": "THM{YouGotRoot}",
                  "sol": "Zadej su - root a heslo z předchozí otázky, pak cat flag.txt."
                }
              ]
            }
          ]
        }
      ],
      "done": false
    },
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
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "q029",
                  "q": "Let's get started!",
                  "a": "No answer needed",
                  "sol": ""
                }
              ]
            },
            {
              "id": "t032",
              "title": "Inside a Computer System",
              "note": "",
              "items": [
                {
                  "id": "q031",
                  "q": "Zadej flag, který získáš po dokončení cvičení na statické stránce.",
                  "a": "THM{4llpccomp0n3nts1d3nt1f13d}",
                  "sol": "Otevři přiloženou statickou stránku („View Site\") a projdi cvičení se součástmi počítače, dokud nejsou všechny správně určené. Podle znění flagu jde o identifikaci všech komponent. Po dokončení se flag zobrazí."
                }
              ]
            },
            {
              "id": "bt3qi17x",
              "title": "What Happens When You Press the Start Button?",
              "note": "",
              "items": [
                {
                  "id": "rjezhovs",
                  "q": "Jaký flag získáš po dokončení cvičení?",
                  "a": "THM{pc5ucce55fully5t4rt3d}",
                  "sol": "Na statické stránce projdi cvičení s bootovací sekvencí (5 kroků, než se načte operační systém) až do konce. Počítač se úspěšně nastartuje a zobrazí se flag."
                }
              ]
            },
            {
              "id": "w7f6y8f7",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "jzh6ut7c",
                  "q": "I am ready to discover the different types of computer systems and their function!",
                  "a": "No answer needed"
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
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "q034",
                  "q": "Ready to find the hidden computers?",
                  "a": "No answer needed",
                  "sol": ""
                }
              ]
            },
            {
              "id": "t039",
              "title": "Sophia's Summer of Hidden Computers – Month 1",
              "note": "",
              "items": [
                {
                  "id": "q037",
                  "q": "Jaký typ počítače obvykle běží bez vlastní obrazovky a klávesnice?",
                  "a": "Server",
                  "sol": "Server běží nepřetržitě bez obrazovky a klávesnice a poskytuje služby více uživatelům přes síť."
                },
                {
                  "id": "q038",
                  "q": "Jaký počítač se specializovanými komponentami si koupíš na přesnou práci?",
                  "a": "Workstation",
                  "sol": "Workstation je určená pro přesnou a spolehlivou práci v profesionálním nasazení."
                }
              ]
            },
            {
              "id": "t046",
              "title": "Sophia's Summer of Hidden Computers – Month 2",
              "note": "",
              "items": [
                {
                  "id": "q040",
                  "q": "Jaký je v současnosti nejoblíbenější počítač kapesní velikosti?",
                  "a": "Smartphone",
                  "sol": "Chytrý telefon je nejrozšířenější počítač do kapsy."
                },
                {
                  "id": "q041",
                  "q": "Jaký typ počítače čekáš v kávovaru?",
                  "a": "Embedded computer",
                  "sol": "Vestavěný (embedded) počítač pracuje uvnitř zařízení a často se nikdy nepřipojí k internetu. IoT zařízení se naopak připojují k síti."
                }
              ]
            },
            {
              "id": "odcyraaf",
              "title": "Why Computers Come in Different Flavors",
              "note": "Projdi statickou stránku, získej flag a odpověz na krátký kvíz.",
              "items": [
                {
                  "id": "qwoswocf",
                  "q": "Proč notebooky při zátěži zpomalují (throttle) víc než stolní počítače?",
                  "a": "Less cooling space",
                  "sol": "Notebook má méně místa na chlazení, takže snáz omezí výkon."
                },
                {
                  "id": "3vcek18p",
                  "q": "Čemu zabraňuje redundance serveru?",
                  "a": "Single point of failure",
                  "sol": "Redundance (záložní zdroje, disky) znamená, že výpadek jedné části nezastaví celý systém."
                },
                {
                  "id": "3b040eqv",
                  "q": "Proč smartphony vydrží na baterii déle než notebooky?",
                  "a": "Optimized for efficiency"
                },
                {
                  "id": "dd3is6db",
                  "q": "Která vlastnost je běžnější u workstation?",
                  "a": "ECC RAM and certified drivers"
                },
                {
                  "id": "zlm7wq0u",
                  "q": "Co v chytré domácnosti koordinuje zařízení?",
                  "a": "Hub or cloud service"
                },
                {
                  "id": "ucjvhqu9",
                  "q": "Zadej flag ze statické stránky.",
                  "a": "THM{8_computer_types}",
                  "sol": "Projdi přiloženou statickou stránku a spoj tři situace se správným typem počítače: Workstation (střih 4K videa), Server (web 24/7), Embedded (zvonek po stisku tlačítka). Pak se zobrazí flag."
                }
              ]
            },
            {
              "id": "i5ccpv0t",
              "title": "Summary",
              "note": "",
              "items": [
                {
                  "id": "b23gis15",
                  "q": "Room complete!",
                  "a": "No answer needed"
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
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "q048",
                  "q": "Let's go!",
                  "a": "No answer needed",
                  "sol": ""
                }
              ]
            },
            {
              "id": "t053",
              "title": "Pizza Delivery",
              "note": "",
              "items": [
                {
                  "id": "q051",
                  "q": "Čím identifikujeme konkrétní službu běžící na serveru?",
                  "a": "port",
                  "sol": "Port určuje službu na serveru (jako různé dveře pro různé služby)."
                },
                {
                  "id": "q052",
                  "q": "Jak se nazývá adresa serveru?",
                  "a": "Internet Protocol address",
                  "sol": "Takto je odpověď uvedená v dostupných řešeních (zkráceně IP adresa). Kdyby ji systém nepřijal, zkus „IP address\". DNS překládá jméno na tuto adresu."
                }
              ]
            },
            {
              "id": "m7chgo1x",
              "title": "Web Communication in Practice",
              "note": "",
              "items": [
                {
                  "id": "zr7hwih7",
                  "q": "Jaký je host v URL https://www.iamlearning.thm/contact?",
                  "a": "www.iamlearning.thm",
                  "sol": "URL má tvar schéma://host/cesta. Host je část mezi „://\" a další lomítkem."
                },
                {
                  "id": "7k493ng0",
                  "q": "Jaké je schéma (scheme) téže URL?",
                  "a": "https",
                  "sol": "Schéma je část před „://\"."
                }
              ]
            },
            {
              "id": "1rb1yjt0",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "68bx1ypo",
                  "q": "On to the next room!",
                  "a": "No answer needed"
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
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "q055",
                  "q": "Let's go!",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "t060",
              "title": "Virtualization Overview",
              "note": "",
              "items": [
                {
                  "id": "q058",
                  "q": "Co virtualizace umožňuje sdílet více aplikacím?",
                  "a": "Physical Server",
                  "sol": ""
                },
                {
                  "id": "q059",
                  "q": "Jak se jmenuje software, který spravuje zdroje jednotlivých virtuálních strojů?",
                  "a": "Hypervisor",
                  "sol": ""
                }
              ]
            },
            {
              "id": "t065",
              "title": "Virtualization Components",
              "note": "",
              "items": [
                {
                  "id": "q061",
                  "q": "Uživatel chce na svém počítači vytvořit studijní laboratoř pro přípravu na certifikaci. Jaký typ hypervizoru použije?",
                  "a": "Type 2",
                  "sol": "Type 2 běží nad existujícím operačním systémem (VirtualBox, VMware Workstation) a hodí se pro učení a testování. Type 1 běží přímo na hardwaru a patří na servery."
                },
                {
                  "id": "q062",
                  "q": "Firma chce provozovat víc malých aplikací v jednom virtuálním stroji. Co má použít?",
                  "a": "Containers",
                  "sol": "Kontejnery sdílejí jádro hostitelského systému, jsou lehčí a startují rychleji než virtuální stroje."
                }
              ]
            },
            {
              "id": "uxxufl5e",
              "title": "Managing Virtual Machines",
              "note": "Praktická část se dělá ve „Virtualization Manager\" (View Site). Nejdřív oprav problém: v sekci Virtual Machines najdi VM Mail-SERVER, je ve stavu Error. Restartuj ho modrým čtvercovým tlačítkem.",
              "items": [
                {
                  "id": "emjewhd7",
                  "q": "Který virtuální stroj běží nejdéle?",
                  "a": "Monitoring-SYS",
                  "sol": "V sekci Virtual Machines porovnej dobu běhu jednotlivých strojů a vyber ten s nejvyšší hodnotou."
                },
                {
                  "id": "u10xvszb",
                  "q": "Který virtuální stroj používá nejvíc paměti?",
                  "a": "DB-Cluster-01",
                  "sol": "V seznamu virtuálních strojů porovnej sloupec s využitím paměti."
                },
                {
                  "id": "5759rf8r",
                  "q": "Kolik VM je ve stavu running po vyřešení problému na Mail-SERVER?",
                  "a": "8",
                  "sol": "Napřed oprav Mail-SERVER (viz pokyn nahoře), pak spočítej stroje ve stavu running."
                },
                {
                  "id": "rj6iet5w",
                  "q": "Jak se jmenuje fyzický stroj, který hostuje nejvíc VM?",
                  "a": "HV-PROD-02",
                  "sol": "V přehledu hostitelů (fyzických strojů) porovnej počty VM na každém. HV-PROD-02 je nejvytíženější."
                }
              ]
            },
            {
              "id": "mp1ksyvo",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "q90s4ve5",
                  "q": "I'm ready to Cloud!",
                  "a": "No answer needed"
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
              "title": "Introduction",
              "note": "",
              "items": [
                {
                  "id": "q067",
                  "q": "Let's go!",
                  "a": "No answer needed",
                  "sol": ""
                }
              ]
            },
            {
              "id": "t075",
              "title": "Cloud Computing Overview",
              "note": "",
              "items": [
                {
                  "id": "q071",
                  "q": "Jaká vlastnost cloudu umožňuje zvládnout nečekaný nárůst přístupů k aplikaci?",
                  "a": "Scalability",
                  "sol": "Škálovatelnost: aplikace se dokáže zvětšit hned, jakmile přijde víc uživatelů."
                },
                {
                  "id": "q072",
                  "q": "Jaký typ nasazení cloudu se používá nejčastěji?",
                  "a": "Public Cloud",
                  "sol": "Veřejný cloud je levný, snadno se škáluje a nevyžaduje správu hardwaru. Private cloud je pro jednu firmu, hybrid je kombinace obou."
                },
                {
                  "id": "q073",
                  "q": "Chceš nasadit aplikaci na internet, soustředit se jen na vývoj a infrastrukturu nechat na jiných. Jaký typ cloudové služby je nejlepší?",
                  "a": "PaaS",
                  "sol": "PaaS: poskytovatel spravuje servery i operační systém, ty řešíš jen aplikaci. IaaS pronajímá jen základní zdroje, SaaS je hotová aplikace."
                }
              ]
            },
            {
              "id": "kak98sl2",
              "title": "Deploying a Cloud Instance",
              "note": "Praktická část je v TryHackMe Cloud Console (View Site). Prostředí už má web-1 a db-1 (t3.micro). Vytvoř application-interface (t3.micro), study-machine-1 a study-machine-2 (m5.large), pak v Billing zjisti náklady a nakonec zastav obě study-machine a podívej se znovu.",
              "items": [
                {
                  "id": "qdm5ewko",
                  "q": "Jaký je celkový počet kreditů celého prostředí, pokud jsou study-machine-1 a study-machine-2 zastavené?",
                  "a": "30",
                  "sol": "Zastavený stroj stojí 0. Zbývají tři t3.micro (web-1, db-1, application-interface): 3 × 10 = 30."
                },
                {
                  "id": "y49jzjrz",
                  "q": "Kolik kreditů měsíčně stojí instance m5.large?",
                  "a": "70",
                  "sol": "Ceny v konzoli (kreditů za měsíc): t3.micro 10, t3.small 18, m5.large 70, zastavený stroj 0."
                },
                {
                  "id": "0s1u4v0n",
                  "q": "Jaký je celkový počet kreditů, pokud běží jen nové instance, které jsme vytvořili?",
                  "a": "150",
                  "sol": "Vytvořili jsme application-interface (10), study-machine-1 (70) a study-machine-2 (70): 10 + 70 + 70 = 150."
                },
                {
                  "id": "3410n8re",
                  "q": "Jaké by bylo celkové běžící prostředí, kdybys přidal třetí studijní stroj t3a.small?",
                  "a": "188",
                  "sol": "Celé prostředí má 170 kreditů (3 × 10 + 2 × 70). Stroj t3a.small stojí stejně jako t3.small, tedy 18: 170 + 18 = 188."
                }
              ]
            },
            {
              "id": "97wes4tu",
              "title": "Conclusion",
              "note": "",
              "items": [
                {
                  "id": "omyi8blc",
                  "q": "I'm ready for the next module!",
                  "a": "No answer needed"
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
                  "a": "https://fakebank.thm/admin",
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
                  "a": "THM{threat_stopped}",
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
              "id": "mt002",
              "title": "Introduction",
              "note": "Číslování odpovídá klasické verzi místnosti (Task 1 až 8, jen ke čtení). Existuje i novější verze (Task 1: The Open Door … Task 6: Launch Careers Quiz) s otázkami „Which of these is true?\"; k těm odpovědi nemám. Zkontroluj, kterou verzi máš.",
              "items": [
                {
                  "id": "mq001",
                  "q": "Pojďme prozkoumat různé role v kyberbezpečnosti.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt004",
              "title": "Security Analyst",
              "note": "",
              "items": [
                {
                  "id": "mq003",
                  "q": "Přečti si, co dělá role Security Analyst.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt006",
              "title": "Security Engineer",
              "note": "",
              "items": [
                {
                  "id": "mq005",
                  "q": "Přečti si, co dělá role Security Engineer.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt008",
              "title": "Incident Responder",
              "note": "",
              "items": [
                {
                  "id": "mq007",
                  "q": "Přečti si, co dělá role Incident Responder.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt010",
              "title": "Digital Forensics Examiner",
              "note": "",
              "items": [
                {
                  "id": "mq009",
                  "q": "Přečti si, co dělá role Digital Forensics Examiner.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt012",
              "title": "Malware Analyst",
              "note": "",
              "items": [
                {
                  "id": "mq011",
                  "q": "Přečti si, co dělá role Malware Analyst.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt014",
              "title": "Penetration Tester",
              "note": "",
              "items": [
                {
                  "id": "mq013",
                  "q": "Přečti si, co dělá role Penetration Tester.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "mt016",
              "title": "Red Teamer",
              "note": "",
              "items": [
                {
                  "id": "mq015",
                  "q": "Přečti si, co dělá role Red Teamer.",
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
