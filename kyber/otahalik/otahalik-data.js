// Obsah předmětu Kybernetika. Nahraď tímto souborem otahalik-data.js ve složce stránky.
window.ZAPISNIK_DATA = {
  "zadani": [
    {
      "id": "lc27jaaq",
      "title": "FGP - Cyber Kill Chain",
      "desc": "Cyber Kill Chain je framework specificky navržený pro identifikaci a prevenci síťových útoků. Poskytuje náhled na systematické kroky, které útočníci podnikají v kyberprostoru za účelem přípravy a provedení kybernetického útoku.",
      "done": false,
      "links": [
        {
          "id": "ll6d05t3",
          "label": "Cyber Kill Chain",
          "url": "https://tryhackme.com/room/mtavncyberkillchain-v01-00uqz",
          "tasks": [
            {
              "id": "tzfqodl9",
              "title": "Úvod",
              "note": "",
              "items": [
                {
                  "id": "9xhn54bz",
                  "q": "Přečtěte si výše uvedený text.",
                  "a": ""
                }
              ]
            },
            {
              "id": "m6ex0u5d",
              "title": "Reconnaissance - \"Průzkum\"",
              "note": "",
              "items": [
                {
                  "id": "evtndkyg",
                  "q": "Jak se jmenuje nástroj pro sběr informací, který prostřednictvím webového rozhraní zpřístupňuje běžné nástroje a zdroje pro open-source inteligenci? [anglický výraz]",
                  "a": "OSINT Framework"
                },
                {
                  "id": "pk412uw6",
                  "q": "Jaká je definice procesu shromažďování e-mailů během fáze průzkumu?",
                  "a": "Sběr e-mailů"
                }
              ]
            },
            {
              "id": "1ev84dvz",
              "title": " Weaponization - \"Příprava\"",
              "note": "",
              "items": [
                {
                  "id": "p9epxgf8",
                  "q": "Tento termín je označován jako skupina příkazů, které provádějí konkrétní úkol. Můžete si je představit jako podprogramy nebo funkce, které obsahují kód, Uživatelé je většinou používají k automatizaci rutinních úloh. Zlomyslní útočníci je však mají tendenci používat pro škodlivé účely a zahrnout je do dokumentů Microsoft Office. Můžete uvést termín? ",
                  "a": "Makro"
                }
              ]
            },
            {
              "id": "9m725h6s",
              "title": " Delivery - \"Doručení\"",
              "note": "",
              "items": [
                {
                  "id": "ogplmp5m",
                  "q": "Jak se nazývá útok, když je prováděn proti konkrétní skupině lidí a útočník se snaží infikovat web, který zmíněná skupina lidí neustále navštěvuje. [anglický výraz]",
                  "a": "Watering hole attack"
                }
              ]
            },
            {
              "id": "pbd7w7gg",
              "title": "Exploitation - \"Zneužití\"",
              "note": "",
              "items": [
                {
                  "id": "53asw7e3",
                  "q": "Můžete uvést název kybernetického útoku zaměřeného na softwarovou zranitelnost, kterou dodavatelé antivirových programů nebo softwaru neznají? [anglický výraz]",
                  "a": "Zero-day Exploit"
                }
              ]
            },
            {
              "id": "2i6o63xx",
              "title": "Installation - \"Instalace\"",
              "note": "",
              "items": [
                {
                  "id": "zn9r1jhm",
                  "q": "Můžete uvést techniku používanou k úpravě časových atributů souboru, aby se skryly nové soubory nebo změny stávajících souborů? [anglický výraz]",
                  "a": "Timestomping"
                },
                {
                  "id": "9gmk8huw",
                  "q": "Pojmenujte  - škodlivý skript, který útočník umístí na webový server, aby udržel přístup ke kompromitovanému systému a umožnil vzdálený přístup k webovému serveru? [anglický výraz]",
                  "a": "Web shell"
                }
              ]
            },
            {
              "id": "kwf4bykz",
              "title": "Command & Control - \"Ovládání\"",
              "note": "",
              "items": [
                {
                  "id": "nzi39ops",
                  "q": "Jak se nazývá C2 komunikace, při které oběť pravidelně odesílá DNS požadavky na DNS server a doménu patřící útočníkovi? [anglický výraz]",
                  "a": "DNS Tunneling"
                }
              ]
            },
            {
              "id": "ktihl6pb",
              "title": "Actions on Objectives (Akce)",
              "note": "",
              "items": [
                {
                  "id": "cibmx2bp",
                  "q": "Uveďte technologii zahrnutou v Microsoft Windows, která dokáže vytvářet záložní kopie nebo snímky souborů nebo svazků na počítači, i když jsou právě používány? [anglický výraz]",
                  "a": "Shadow Copy"
                }
              ]
            },
            {
              "id": "pzi3u98z",
              "title": " Praktická analýza",
              "note": "",
              "items": [
                {
                  "id": "izrj2wre",
                  "q": "Jaký je příznak po dokončení statického webu?",
                  "a": "THM{7HR347_1N73L_12_4w35om3}",
                  "sol": "0. Reconnaissance - \"Průzkum\" - \"empty\"\n1. Weaponization - \"Vyzbrojení\" - powershell\n2. Delivery - \"Doručení\" - spearphishing attachment\n3. Exploitation - \"Zneužití\" - exploit public-facing application\n4. Installation - \"Instalace\" - dynamic linker hijacking\n5. Command & Control - \"Řízení a ovládání\" - fallback channels\n6. Actions on Objectives - \"Akce k dosažení cílů\" - data from local system"
                }
              ]
            },
            {
              "id": "qgq9tbg8",
              "title": "Supeer! Zvládli jsme to!",
              "note": "",
              "items": [
                {
                  "id": "70kmmaeh",
                  "q": "Supeer! Zvládli jsme to!",
                  "a": ""
                }
              ]
            }
          ]
        },
        {
          "id": "5wmr8cdc",
          "label": "MTA-Wireshark:Traffic Analysis",
          "url": "https://tryhackme.com/room/mtawiresharktrafficanalysis-v01-009hj",
          "tasks": [
            {
              "id": "qaifwkgh",
              "title": "Úvod",
              "note": "",
              "items": [
                {
                  "id": "xeoeqens",
                  "q": "Přečtěte si výše uvedený úkol.",
                  "a": ""
                }
              ]
            },
            {
              "id": "i2k12oto",
              "title": "Nmap Scans",
              "note": "",
              "items": [
                {
                  "id": "uq0ovj87",
                  "q": "Jaký je celkový počet skenů „TCP Connect“?",
                  "a": "1000"
                },
                {
                  "id": "wzibloz0",
                  "q": "Jaký typ skenování se používá ke skenování TCP portu 80?",
                  "a": "TCP Connect"
                },
                {
                  "id": "9i0g4s2g",
                  "q": "Kolik je tam zpráv \"UDP close port\"?",
                  "a": "1083"
                },
                {
                  "id": "wpzrtqbw",
                  "q": "Který port UDP v rozsahu 55–70 je otevřený?",
                  "a": "68"
                }
              ]
            },
            {
              "id": "mpz3lyek",
              "title": "ARP Poisoning/Spoofing (AKA Man In The Middle Attack)",
              "note": "",
              "items": [
                {
                  "id": "dpn07ru6",
                  "q": "Jaký je počet požadavků ARP vytvořených útočníkem?",
                  "a": "284"
                },
                {
                  "id": "zdvv4myn",
                  "q": "Jaký je počet paketů HTTP přijatých útočníkem?",
                  "a": "90"
                },
                {
                  "id": "cme9kwql",
                  "q": "Jaký je počet načtených uživatelských jmen a hesel?",
                  "a": "6"
                },
                {
                  "id": "n2ei6wkd",
                  "q": "Jaké je heslo \"Client986\"?",
                  "a": "clientnothere!"
                },
                {
                  "id": "nkxev075",
                  "q": "Jaký je komentář poskytnutý \"Client354\"?",
                  "a": "Nice work!"
                }
              ]
            },
            {
              "id": "cz61tyjz",
              "title": "Identifikace hostitelů",
              "note": "",
              "items": [
                {
                  "id": "frz6rqta",
                  "q": "Jaká je MAC adresa hostitele \"Galaxy A30\"?",
                  "a": "9a:81:41:cb:96:6c"
                },
                {
                  "id": "a4146zcs",
                  "q": "Kolik požadavků na registraci NetBIOS má pracovní stanice \"LIVALJM\"?",
                  "a": "16"
                },
                {
                  "id": "2pzo9nfy",
                  "q": "Který hostitel požadoval IP adresu „172.16.13.85“?",
                  "a": "Galaxy-A12"
                },
                {
                  "id": "4is5lzsw",
                  "q": "Jaká je IP adresa uživatele \"u5\"? (Zadejte adresu v defanged formátu.)",
                  "a": "10[.]1[.]12[.]2"
                },
                {
                  "id": "535mljmt",
                  "q": "Jaký je název hostitele dostupného hostitele v paketech Kerberos?",
                  "a": "xp1$"
                }
              ]
            },
            {
              "id": "d3xfhezf",
              "title": "Tunelování provozu: ICMP a DNS ",
              "note": "",
              "items": [
                {
                  "id": "kmtjkdy5",
                  "q": "Prozkoumejte anomální pakety. Jaký protokol se používá při tunelování ICMP?",
                  "a": "SSH"
                },
                {
                  "id": "gxz875qn",
                  "q": "Prozkoumejte anomální pakety. Jaká je podezřelá adresa hlavní domény, která přijímá anomální dotazy DNS? (Zadejte adresu v defanged formátu.) ",
                  "a": "dataexfil[.]com"
                }
              ]
            },
            {
              "id": "ydsdayvj",
              "title": "Analýza protokolu Cleartext",
              "note": "",
              "items": [
                {
                  "id": "lmuvv2f3",
                  "q": "Kolik je chybných pokusů o přihlášení?",
                  "a": "737"
                },
                {
                  "id": "ht0sabco",
                  "q": "Jaká je velikost souboru, ke kterému přistupuje účet „ftp“?",
                  "a": "39424"
                },
                {
                  "id": "z1jozzbw",
                  "q": "Protivník nahrál dokument na FTP server. Jaký je název souboru?",
                  "a": "resume.doc"
                },
                {
                  "id": "5u8dp6ko",
                  "q": "Protivník se pokusil přiřadit speciální příznaky pro změnu oprávnění k provádění nahraného souboru. Jaký příkaz používá protivník?",
                  "a": "CHMOD 777"
                }
              ]
            },
            {
              "id": "yhngnwql",
              "title": "Analýza HTTP ",
              "note": "",
              "items": [
                {
                  "id": "rz5dabde",
                  "q": "Prozkoumejte uživatelské agenty. Jaký je počet anomálních typů „user-agent“?",
                  "a": "6"
                },
                {
                  "id": "ck0d1ve0",
                  "q": "Jaké je číslo paketu s nepatrným pravopisným rozdílem v poli uživatelského agenta?",
                  "a": "52"
                },
                {
                  "id": "3yi2xhht",
                  "q": "Najděte počáteční fázi útoku \"Log4j\". Jaké je číslo paketu?",
                  "a": "444"
                },
                {
                  "id": "fbmuger1",
                  "q": "Najděte počáteční fázi útoku \"Log4j\" a dekódujte příkaz base64. Jaká je IP adresa kontaktovaná protivníkem? (Zadejte adresu v defanged formátu a vylučte „{}“.)",
                  "a": "62[.]210[.]130[.]250"
                }
              ]
            },
            {
              "id": "g8flfst6",
              "title": "Dešifrování HTTPS provozu",
              "note": "",
              "items": [
                {
                  "id": "lp7zlt8d",
                  "q": "Jaké je číslo rámce zprávy „Client Hello“ odeslané na adresu „accounts.google.com“?",
                  "a": "16"
                },
                {
                  "id": "flq23mmz",
                  "q": "Dešifrujte provoz pomocí souboru \"KeysLogFile.txt\". Jaký je počet paketů HTTP2?",
                  "a": "115"
                },
                {
                  "id": "gx70itco",
                  "q": "Přejděte na rámec 322. Jaká je hlavička oprávnění paketu HTTP2? (Zadejte adresu v defanged formátu.)",
                  "a": "safebrowsing[.]googleapis[.]com"
                },
                {
                  "id": "vsxaz5s0",
                  "q": "Prozkoumejte dešifrované pakety a najděte flag! Jaký je flag?",
                  "a": "FLAG{THM-PACKETMASTER}"
                }
              ]
            },
            {
              "id": "nl3y8rfb",
              "title": "Bonus: Vyhledejte nezašifrované přihlašovací údaje!",
              "note": "",
              "items": [
                {
                  "id": "ss29049f",
                  "q": "Jaké je číslo paketu pověření pomocí \"HTTP Basic Auth\"?",
                  "a": "237"
                },
                {
                  "id": "rffr15zx",
                  "q": "Jaké je číslo paketu, do kterého bylo odesláno „prázdné heslo“?",
                  "a": "170"
                }
              ]
            },
            {
              "id": "5w23op2o",
              "title": "Bonus: Akční výsledky!",
              "note": "",
              "items": [
                {
                  "id": "v3jh1ja0",
                  "q": "Vyberte paket číslo 99.  Vytvořte pravidlo pro \"IPFirewall (ipfw)\". Jaké je pravidlo pro „odepření zdrojové IPv4 adresy“?",
                  "a": "add deny ip from 10.121.70.151 to any in"
                },
                {
                  "id": "j6ynfunb",
                  "q": "Vyberte paket číslo 231. Vytvořte pravidla \"IPFirewall\". Jaké je pravidlo pro „povolení cílové MAC adresy“?",
                  "a": "add allow MAC 00:d0:59:aa:af:80 any in"
                }
              ]
            },
            {
              "id": "ubkzclq4",
              "title": "Závěr",
              "note": "",
              "items": [
                {
                  "id": "jeaew0yq",
                  "q": "Přečtěte si výše uvedený úkol.",
                  "a": ""
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

