// Obsah předmětu Kybernetika. Nahraď tímto souborem juchelka-data.js ve složce stránky.
window.ZAPISNIK_DATA = {
  "zadani": [
    {
      "id": "t1avmft5",
      "title": "MTA-Wireshark:Traffic Analysis",
      "desc": "Naučte se základy analýzy síťového provozu s Wireshark a jak najít anomálie ve vaší síti!\n\n",
      "done": false,
      "links": [
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
