// Obsah zápisníku. Nahraď tímto souborem data.js ve složce s index.html.
window.ZAPISNIK_DATA = {
  "cur": "kyb",
  "subjects": [
    {
      "id": "kyb",
      "name": "Kybernetika",
      "type": "links"
    },
    {
      "id": "prog",
      "name": "Programování",
      "type": "code"
    },
    {
      "id": "mpt",
      "name": "Mikroprocesorová technika",
      "type": "code"
    }
  ],
  "kyb": [
    {
      "id": "kld0clbo",
      "title": "FGP-Data, hrozba, riziko",
      "desc": "",
      "done": false,
      "links": [
        {
          "id": "flftxdki",
          "label": "Data, hrozba, riziko - teorie 01",
          "url": "https://tryhackme.com/room/mtacyberthreatintel-v01-01a79",
          "tasks": [
            {
              "id": "bxs8npkv",
              "title": "Top 15 největších úniků dat 21. století",
              "note": "",
              "items": [
                {
                  "id": "7ve50zq4",
                  "q": "Pojďme dál, ...",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "1p72smx9",
              "title": "Proč mají data hodnotu",
              "note": "",
              "items": [
                {
                  "id": "t8y0aj0y",
                  "q": "Pojďme na to!",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "xd904xem",
              "title": "Data a informace",
              "note": "",
              "items": [
                {
                  "id": "4y11asq9",
                  "q": "Jste doktor a jdete si na svém počítači načíst data o pacientovi, který přišel na prohlídku. K jakým datům přistupujete?",
                  "a": "Zdravotní informace"
                }
              ]
            },
            {
              "id": "4ek3okzr",
              "title": "Význam dat a jejich vliv na rozhodování",
              "note": "",
              "items": [
                {
                  "id": "4pmag5ac",
                  "q": "Ujistěte se, že jste si přečetli výše uvedené.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "fv7dtem6",
              "title": "Hrozba, zranitelnost a riziko",
              "note": "",
              "items": [
                {
                  "id": "v26bxix9",
                  "q": "Ujistěte se, že jste si přečetli výše uvedené.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "sxv7m14d",
              "title": "Shrnutí",
              "note": "",
              "items": [
                {
                  "id": "i6g7rfud",
                  "q": " - - -",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "8yf01xdj",
          "label": "Kybernetické hrozby - teorie 02",
          "url": "https://tryhackme.com/room/mtathreatinteltools-v01-00avk",
          "tasks": [
            {
              "id": "eoaflkdk",
              "title": "Největší hrozba současnosti?",
              "note": "",
              "items": [
                {
                  "id": "i80fakvn",
                  "q": "Co si o tom myslíte?",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "63b4otk0",
              "title": "Threat intelligence",
              "note": "",
              "items": [
                {
                  "id": "gu6mzu75",
                  "q": "Pojďme dál, ...",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "w2ikyj7y",
              "title": "Kybernetické hrozby",
              "note": "",
              "items": [
                {
                  "id": "w4bwiolx",
                  "q": "Ujistěte se, že jste si přečetli výše uvedené.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "v90d9hap",
              "title": "Zpravodajství o kybernetických hrozbách",
              "note": "",
              "items": [
                {
                  "id": "k15uptp5",
                  "q": "Co je CISCO TALOS INTELLIGENCE GROUP?",
                  "a": "CTI"
                },
                {
                  "id": "iutbnjwh",
                  "q": "Který typ CTI poskytuje detailní informace o konkrétních hrozbách, jako jsou IP adresy?",
                  "a": "Technická"
                },
                {
                  "id": "2zvctbbj",
                  "q": "Která výhoda CTI poskytuje kontext pro rychlou a efektivní reakci na bezpečnostní incidenty?",
                  "a": "Rychlá reakce"
                },
                {
                  "id": "m8j2vuvh",
                  "q": "Jaký klíčový aspekt CTI zahrnuje analýzu dat z veřejně dostupných informací, uzavřených databází, zpravodajských služeb a dalších zdrojů?",
                  "a": "Shromažďování dat"
                }
              ]
            },
            {
              "id": "39psnarg",
              "title": "OSINT",
              "note": "",
              "items": [
                {
                  "id": "3zx1x9cc",
                  "q": "Ujistěte se, že jste si přečetli výše uvedené.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "vo9e0f17",
      "title": "Písemka Wireshark a NMAP - 2026/11/04",
      "desc": "Učitel vám dal za úkol seznámit se s modulem MTA-ZÁKLADNÍ DOVEDNOSTI a naučit se používat nástroje NMAP a WIRESHARK. Je to \"starý lišák\" a určitě si bude chtít nenápadně ověřit, jak jste tyto nástroje zvládli.\n\nProto pro vás vymyslel tuto roomku a chce abyste ulovili dvě vlajky, které jsou v ní ukryté. K jedné vlajce se dostanete už díky NMAPU. Pro ulovení druhé vlajky budete potřebovat také WIRESHARK. Když vlajky ulovíte, je to důkaz, že jste tyto nástroje zvládli a že jste projevili i nápaditost a schopnost investigovat.\n\nTak se do toho dejte. Nevíte jak začít? Pusťte si připojený VM a prostě zkoušejte \"kudy voda poteče\". ",
      "done": false,
      "links": [
        {
          "id": "0p9r9ad5",
          "label": "FGP-Základní dovednosti CTF",
          "url": "https://tryhackme.com/room/mtanshark-v01-002uo",
          "tasks": [
            {
              "id": "tdyg73c5",
              "title": "Nalezněte vlajky!",
              "note": "",
              "items": [
                {
                  "id": "kurs38ze",
                  "q": "Jaká je první vlajka?",
                  "a": "MTA{e67e59c45e66fcfc416e39e81520e93c}",
                  "sol": "1. Ulovení první vlajky (Nmap a webový prohlížeč)\n   Spusťte skenování portů pomocí Nmapu pro identifikaci služeb: nmap -sV -p <IP_ADRESA_VM>.\n   Z výstupu zjistíte, že na nestandardním portu 1984 běží webový server (nginx).\n   Otevřete internetový prohlížeč a zadejte adresu http://<IP_ADRESA_VM>:1984.\n   První vlajka ve formátu THM{...} se zobrazí přímo na této webové stránce."
                },
                {
                  "id": "1a8y51m9",
                  "q": "Jaká je druhá vlajka?",
                  "a": "MTA{9d88476098f71947830a5c2b78e3280b}",
                  "sol": "2. Ulovení druhé vlajky (Investigace FTP a Wireshark)\n   Z průzkumu Nmapu víte o otevřeném portu 21 (FTP). Přihlaste se příkazem ftp <IP_ADRESA_VM> (jméno: anonymous, heslo nechte prázdné).\n   Pomocí příkazu get flag.txt stáhněte soubor. Jeho obsah (\"Hic sunt leones...\") slouží jako nápověda k použití Wiresharku na ICMP provoz.\n   Spusťte Wireshark a začněte zachytávat síťový provoz na vašem aktivním rozhraní (např. tun0 nebo ens5).\n   Do panelu pro filtrování zadejte icmp a potvrďte.\n   Otevřete terminál a vyvolejte síťovou komunikaci odesláním pingu na cílový stroj: ping -c 4 <IP_ADRESA_VM>.\n   Ve Wiresharku vyberte zachycený ICMP paket (ideálně Echo reply), v prostředním panelu rozbalte Internet Control Message Protocol a klikněte na Data (payload).\n   V textovém přepisu datové části najdete skrytou druhou vlajku ve formátu THM{...}."
                }
              ]
            }
          ]
        }
      ],
      "due": ""
    },
    {
      "id": "t1",
      "title": "FGP – Základní dovednosti – Wireshark",
      "desc": "",
      "links": [
        {
          "id": "l1",
          "label": "Wireshark 01",
          "url": "https://tryhackme.com/room/mtawiresharkthebasics-v01-00tem",
          "tasks": [
            {
              "id": "e1pa0ilv",
              "title": "Wireshark - přehled",
              "note": "K zodpovězení otázek použijte soubor \"Exercise.pcapng\".",
              "items": [
                {
                  "id": "r6yyfgzo",
                  "q": "Přečtěte si \"capture file comments\" . Jaká je zde flag?",
                  "a": "TryHackMe_Wireshark_Demo"
                },
                {
                  "id": "sbejhhbh",
                  "q": "Jaký je celkový počet paketů?",
                  "a": "58620"
                },
                {
                  "id": "7b9j24hw",
                  "q": "Jaká je hodnota hash SHA256 zachyceného souboru?",
                  "a": "f446de335565fb0b0ee5e5a3266703c778b2f3dfad7efeaeccb2da5641a6d6eb"
                }
              ]
            },
            {
              "id": "eys7nmka",
              "title": "Disekce paketů",
              "note": "K zodpovězení otázek použijte soubor \"Exercise.pcapng\".",
              "items": [
                {
                  "id": "5f18d0uv",
                  "q": "Zobrazte si paket číslo 38. Jaký značkovací jazyk se používá pod protokolem HTTP?",
                  "a": "eXtensible Markup Language"
                },
                {
                  "id": "8akjia8d",
                  "q": "Jaké je datum doručení paketu? (Formát odpovědi: měsíc/den/rok)",
                  "a": "05/13/2004"
                },
                {
                  "id": "ygim7w70",
                  "q": "Jaká je hodnota TTL?",
                  "a": "47"
                },
                {
                  "id": "5ipc4ffz",
                  "q": "Jaká je velikost \"payload\" TCP?",
                  "a": "424"
                },
                {
                  "id": "wm2qqugj",
                  "q": "Jaká je hodnota e-tag?",
                  "a": "9a01a-4696-7e354b00"
                }
              ]
            },
            {
              "id": "7d97u2lx",
              "title": "Navigace mezi pakety",
              "note": "K zodpovězení otázek použijte soubor \"Exercise.pcapng\".",
              "items": [
                {
                  "id": "mi3n565k",
                  "q": "Vyhledejte řetězec \"r4w\" v podrobnostech paketu. Jak se jmenuje artist 1?",
                  "a": "r4w8173"
                },
                {
                  "id": "wl243lzw",
                  "q": "Přejděte na balíček 12 a přečtěte si komentáře. Jaká je odpověď?",
                  "a": "911cd574a42865a956ccde2d04495ebf"
                },
                {
                  "id": "hr5mgt3h",
                  "q": "Uvnitř zachyceného souboru je soubor \".txt\" . Najděte soubor a přečtěte si jej; jak se ten \"alien\" jmenuje?",
                  "a": "PACKETMASTER"
                },
                {
                  "id": "jytz7wrf",
                  "q": "Podívejte se do sekce odborné informace. Jaký je počet varování?",
                  "a": "1636"
                }
              ]
            },
            {
              "id": "ywg6w75c",
              "title": "Filtrování paketů",
              "note": "K zodpovězení otázek použijte soubor \"Exercise.pcapng\".",
              "items": [
                {
                  "id": "2jp6tafk",
                  "q": "Přejděte na paket číslo 4. Klikněte pravým tlačítkem myši na \"Hypertext Transfer Protocol\" a použijte jej jako filtr. Nyní se podívejte na panel filtrů. Jaký je dotaz tohoto filtru?",
                  "a": "http"
                },
                {
                  "id": "kl2bphjz",
                  "q": "Jaký je počet zobrazených paketů?",
                  "a": "1089"
                },
                {
                  "id": "v9t4ro0k",
                  "q": "Přejděte na paket číslo 33790 a sledujte stream. Jaký je celkový počet umělců?",
                  "a": "3"
                },
                {
                  "id": "oneyimcp",
                  "q": "Jak se jmenuje druhý umělec?",
                  "a": "Blad3"
                }
              ]
            }
          ]
        },
        {
          "id": "l2",
          "label": "Wireshark 02",
          "url": "https://tryhackme.com/room/mtawiresharkpacketoperations-v01-00191",
          "tasks": [
            {
              "id": "ztc5bru7",
              "title": "Statistiky | Souhrn",
              "note": "",
              "items": [
                {
                  "id": "l33u1yh6",
                  "q": "Prozkoumejte rozlišené adresy. Jaká je IP adresa názvu hostitele začínajícího na „bbc“?",
                  "a": "199.232.24.81"
                },
                {
                  "id": "x1dr6qpf",
                  "q": "Jaký je počet IPv4 konverzací?",
                  "a": "435"
                },
                {
                  "id": "2dr0h2zc",
                  "q": "Kolik bytů (k) bylo přeneseno z MAC adresy \"Micro-St\"?",
                  "a": "7474"
                },
                {
                  "id": "vmd0wiiz",
                  "q": "Jaký je počet IP adres spojených s „Kansas City“?",
                  "a": "4"
                },
                {
                  "id": "no2ri5sk",
                  "q": "Která IP adresa je spojena s organizací \"Blicnet\"?",
                  "a": "188.246.82.7"
                }
              ]
            },
            {
              "id": "2mx1rd2j",
              "title": "Statistiky | Detaily protokolů",
              "note": "",
              "items": [
                {
                  "id": "eymnxuih",
                  "q": "Jaká je nejpoužívanější cílová adresa IPv4?",
                  "a": "10.100.1.33"
                },
                {
                  "id": "e119csj3",
                  "q": "Jaká je maximální doba požadavku na službu u paketů DNS?",
                  "a": "0.467897"
                },
                {
                  "id": "1r79v2oq",
                  "q": "Jaký je počet požadavků HTTP provedených \"rad[.]msn[.]com?",
                  "a": "39"
                }
              ]
            },
            {
              "id": "035ymg3s",
              "title": "Filtrování paketů | Principy",
              "note": "",
              "items": [
                {
                  "id": "k4dy9y10",
                  "q": "Přečtěte si výše uvedený úkol.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "kp8e6ehb",
              "title": "Filtrování paketů | Filtry protokolů",
              "note": "",
              "items": [
                {
                  "id": "3xcggbn6",
                  "q": "Jaký je počet IP paketů?",
                  "a": "81420"
                },
                {
                  "id": "sblgwbee",
                  "q": "Jaký je počet paketů s „hodnotou TTL menší než 10“?",
                  "a": "66"
                },
                {
                  "id": "wde7kbej",
                  "q": "Jaký je počet paketů, které používají \"TCP port 4444\"?",
                  "a": "632"
                },
                {
                  "id": "qiy9dely",
                  "q": "Jaký je počet požadavků „HTTP GET“ odeslaných na port „80“?",
                  "a": "527"
                },
                {
                  "id": "gp1xo4gn",
                  "q": "Jaký je počet „  dotazů DNS typu A  “?",
                  "a": "51"
                }
              ]
            },
            {
              "id": "7d9asdmy",
              "title": "pokročilé filtrování",
              "note": "",
              "items": [
                {
                  "id": "7aqw8aic",
                  "q": "Najděte všechny servery Microsoft IIS. Jaký je počet paketů, které nepocházejí z \"portu 80\"?",
                  "a": "21"
                },
                {
                  "id": "9jembp8q",
                  "q": "Najděte všechny servery Microsoft IIS. Jaký je počet paketů, které mají \"verzi 7.5\"?",
                  "a": "71"
                },
                {
                  "id": "rlg035x2",
                  "q": "Jaký je celkový počet paketů, které používají porty 3333, 4444 nebo 9999?",
                  "a": "2235"
                },
                {
                  "id": "6dkjv4t1",
                  "q": "Jaký je počet paketů se „sudými čísly TTL“?",
                  "a": "77289"
                },
                {
                  "id": "6zgo3cn8",
                  "q": "Změňte profil na \"Kontrola kontrolního součtu\". Jaký je počet paketů \"Bad TCP Checksum\"?",
                  "a": "34185"
                },
                {
                  "id": "j16cfayd",
                  "q": "Pro filtrování provozu použijte stávající tlačítko filtrování. Jaký je počet zobrazených paketů?",
                  "a": "261"
                }
              ]
            },
            {
              "id": "pwvcyp2y",
              "title": "Závěr",
              "note": "",
              "items": [
                {
                  "id": "mzlcpvhc",
                  "q": "Proceed to the next room and keep learning!",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        },
        {
          "id": "l3",
          "label": "Wireshark 03",
          "url": "https://tryhackme.com/room/mtawiresharktrafficanalysis-v01-004al",
          "tasks": [
            {
              "id": "u8bpzl12",
              "title": "Úvod",
              "note": "",
              "items": [
                {
                  "id": "9cyyhy3j",
                  "q": "Přečtěte si výše uvedený úkol.",
                  "a": "No answer needed"
                }
              ]
            },
            {
              "id": "51q23z8x",
              "title": "Nmap Scans",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/nmap/Exercise.pcapng\".",
              "items": [
                {
                  "id": "6tfvvvsi",
                  "q": "Jaký je celkový počet skenů „TCP Connect“?",
                  "a": "1000"
                },
                {
                  "id": "y4wr6n37",
                  "q": "Jaký typ skenování se používá ke skenování TCP portu 80?",
                  "a": "TCP Connect"
                },
                {
                  "id": "bumylnxs",
                  "q": "Kolik je tam zpráv \"UDP close port\"?",
                  "a": "1083"
                },
                {
                  "id": "mf1l33rl",
                  "q": "Který port UDP v rozsahu 55–70 je otevřený?",
                  "a": "68"
                }
              ]
            },
            {
              "id": "6phf403b",
              "title": "ARP Poisoning & Man In The Middle!",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/arp/Exercise .pcapng\".",
              "items": [
                {
                  "id": "nit65nl9",
                  "q": "Jaký je počet požadavků ARP vytvořených útočníkem?",
                  "a": "284"
                },
                {
                  "id": "kw8ttm5v",
                  "q": "Jaký je počet paketů HTTP přijatých útočníkem?",
                  "a": "90"
                },
                {
                  "id": "6ao6m607",
                  "q": "Jaký je počet načtených uživatelských jmen a hesel?",
                  "a": "6"
                },
                {
                  "id": "vltc2ik7",
                  "q": "Jaké je heslo \"Client986\"?",
                  "a": "clientnothere!"
                },
                {
                  "id": "amaby24e",
                  "q": "Jaký je komentář poskytnutý \"Client354\"?",
                  "a": "Nice work!"
                }
              ]
            },
            {
              "id": "vsb1m3be",
              "title": "Identifikace hostitelů: DHCP, NetBIOS a Kerberos",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/dhcp-netbios-kerberos/dhcp-netbios .pcap\".",
              "items": [
                {
                  "id": "cu5h9pcq",
                  "q": "Jaká je MAC adresa hostitele \"Galaxy A30\"?",
                  "a": "9a:81:41:cb:96:6c"
                },
                {
                  "id": "8jy3oxdt",
                  "q": "Kolik požadavků na registraci NetBIOS má pracovní stanice \"LIVALJM\"?",
                  "a": "16"
                },
                {
                  "id": "nxq6binh",
                  "q": "Který hostitel požadoval IP adresu „172.16.13.85“?",
                  "a": "Galaxy-A12"
                },
                {
                  "id": "8tjr2vkc",
                  "q": "Jaká je IP adresa uživatele \"u5\"? (Zadejte adresu v defanged formátu.)",
                  "a": "10[.]1[.]12[.]2",
                  "note": "Použijte soubor \"Desktop/exercise-pcaps/dhcp-netbios-kerberos/ kerberos.pcap\"."
                },
                {
                  "id": "19c5sgk8",
                  "q": "Jaký je název hostitele dostupného hostitele v paketech Kerberos?",
                  "a": "xp1$"
                }
              ]
            },
            {
              "id": "7sgd5ryl",
              "title": "Tunelování provozu: DNS a ICMP",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/dns-icmp/ icmp-tunnel .pcap \".",
              "items": [
                {
                  "id": "rvl2rzbw",
                  "q": "Prozkoumejte anomální pakety. Jaký protokol se používá při tunelování ICMP?",
                  "a": "SSH"
                },
                {
                  "id": "hfl5joww",
                  "q": "Prozkoumejte anomální pakety. Jaká je podezřelá adresa hlavní domény, která přijímá anomální dotazy DNS? (Zadejte adresu v defanged formátu.) ",
                  "a": "dataexfil[.]com",
                  "note": "Použijte soubor \"Desktop/exercise-pcaps/dns-icmp/dns .pcap \"."
                }
              ]
            },
            {
              "id": "n05xisc0",
              "title": "Analýza Cleartext Protokolu: FTP",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/ftp/ftp .pcap\".",
              "items": [
                {
                  "id": "br86wk7s",
                  "q": "Kolik je chybných pokusů o přihlášení?",
                  "a": "737"
                },
                {
                  "id": "irxdqix5",
                  "q": "Jaká je velikost souboru, ke kterému přistupuje účet „ftp“?",
                  "a": "39424"
                },
                {
                  "id": "pv9she9y",
                  "q": "Protivník nahrál dokument na FTP server. Jaký je název souboru?",
                  "a": "resume.doc"
                },
                {
                  "id": "4frxrw84",
                  "q": "Protivník se pokusil přiřadit speciální příznaky pro změnu oprávnění k provádění nahraného souboru. Jaký příkaz používá protivník?",
                  "a": "CHMOD 777"
                }
              ]
            },
            {
              "id": "2wp1okzk",
              "title": "Analýza Cleartext Protokolu: HTTP",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/http/ user-agent .cap\".",
              "items": [
                {
                  "id": "u1lj9xum",
                  "q": "Prozkoumejte uživatelské agenty. Jaký je počet anomálních typů „user-agent“?",
                  "a": "6"
                },
                {
                  "id": "1oqd351j",
                  "q": "Jaké je číslo paketu s nepatrným pravopisným rozdílem v poli uživatelského agenta?",
                  "a": "52"
                },
                {
                  "id": "ug3jtqks",
                  "q": "Najděte počáteční fázi útoku \"Log4j\". Jaké je číslo paketu?",
                  "a": "444",
                  "note": "Použijte soubor \"Desktop/exercise-pcaps/http/ http .pcapng\"."
                },
                {
                  "id": "d6higwwp",
                  "q": "Najděte počáteční fázi útoku \"Log4j\" a dekódujte příkaz base64. Jaká je IP adresa kontaktovaná protivníkem? (Zadejte adresu v defanged formátu a vylučte „{}“.)",
                  "a": "62[.]210[.]130[.]250"
                }
              ]
            },
            {
              "id": "5r97uhmh",
              "title": "Analýza šifrovaných protokolů: Dešifrování HTTPS",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/https/Exercise .pcap\".",
              "items": [
                {
                  "id": "ahqxbxkx",
                  "q": "Jaké je číslo rámce zprávy „Client Hello“ odeslané na adresu „accounts.google.com“?",
                  "a": "16"
                },
                {
                  "id": "lujcxi2p",
                  "q": "Dešifrujte provoz pomocí souboru \"KeysLogFile.txt\". Jaký je počet paketů HTTP2?",
                  "a": "115"
                },
                {
                  "id": "9lc5u9f0",
                  "q": "Přejděte na rámec 322. Jaká je hlavička oprávnění paketu HTTP2? (Zadejte adresu v defanged formátu.)",
                  "a": "safebrowsing[.]googleapis[.]com"
                },
                {
                  "id": "12zrttrl",
                  "q": "Prozkoumejte dešifrované pakety a najděte flag! Jaký je flag?",
                  "a": "FLAG{THM-PACKETMASTER}"
                }
              ]
            },
            {
              "id": "ikrio556",
              "title": "Bonus: Vyhledejte nezačifrované přihlašovací údaje!",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/bonus/Bonus-exercise .pcap\".",
              "items": [
                {
                  "id": "earmlj3a",
                  "q": "Jaké je číslo paketu pověření pomocí \"HTTP Basic Auth\"?",
                  "a": "237"
                },
                {
                  "id": "cl3ukgjg",
                  "q": "Jaké je číslo paketu, do kterého bylo odesláno „prázdné heslo“?",
                  "a": "170"
                }
              ]
            },
            {
              "id": "5uo1nju7",
              "title": "Bonus: Akční výsledky!",
              "note": "Použijte soubor \"Desktop/exercise-pcaps/bonus/Bonus-exercise .pcap\".",
              "items": [
                {
                  "id": "2e9dbwoh",
                  "q": "Vyberte paket číslo 99.  Vytvořte pravidlo pro \"IPFirewall (ipfw)\". Jaké je pravidlo pro „odepření zdrojové IPv4 adresy“?",
                  "a": "add deny ip from 10.121.70.151 to any in"
                },
                {
                  "id": "bkvhjsh4",
                  "q": "Vyberte paket číslo 231. Vytvořte pravidla \"IPFirewall\". Jaké je pravidlo pro „povolení cílové MAC adresy“?",
                  "a": "add allow MAC 00:d0:59:aa:af:80 any in"
                }
              ]
            },
            {
              "id": "iz0kg5aa",
              "title": "Závěr",
              "note": "",
              "items": [
                {
                  "id": "6prahv45",
                  "q": "Přečtěte si výše uvedený úkol.",
                  "a": "No answer needed"
                }
              ]
            }
          ]
        }
      ],
      "done": false
    }
  ],
  "prog": [
    {
      "id": "bnnc6x99",
      "title": "Písemka C# - 2026/11/03",
      "desc": "1. Vytvořte program pro\n       A – součet\n       B – součin\n       C – průměr tří čísel\n2. Uživatel zadá 3 desetinná čísla a zvolí z nabídky, co se má vypočítat. Výsledek se zobrazí.\n3. V případě, že uživatel zvolí jiné písmeno, tak vypíše se chyba a ukončí se program.   ",
      "done": false,
      "lang": "",
      "code": "using System;\n\nnamespace PrgT3aSwitch\n{\n    class Program\n    {\n        static void Main(string[] args)\n        {\n            // Načtení tří desetinných čísel od uživatele\n            Console.Write(\"Zadej první desetinné číslo: \");\n            double cislo1 = double.Parse(Console.ReadLine());\n\n            Console.Write(\"Zadej druhé desetinné číslo: \");\n            double cislo2 = double.Parse(Console.ReadLine());\n\n            Console.Write(\"Zadej třetí desetinné číslo: \");\n            double cislo3 = double.Parse(Console.ReadLine());\n\n            // Výpis menu\n            Console.WriteLine(\"\\nVyber operaci:\");\n            Console.WriteLine(\"A - součet\");\n            Console.WriteLine(\"B - součin\");\n            Console.WriteLine(\"C - průměr tří čísel\");\n            Console.Write(\"Tvoje volba: \");\n            \n            // Načtení volby přesně tak, jak ji uživatel zadá (bez úprav)\n            string volba = Console.ReadLine();\n\n            // Zpracování volby pomocí switche\n            switch (volba)\n            {\n                case \"A\":\n                    double soucet = cislo1 + cislo2 + cislo3;\n                    Console.WriteLine(\"Výsledek (součet): \" + soucet);\n                    break;\n                \n                case \"B\":\n                    double soucin = cislo1 * cislo2 * cislo3;\n                    Console.WriteLine(\"Výsledek (součin): \" + soucin);\n                    break;\n                \n                case \"C\":\n                    double prumer = (cislo1 + cislo2 + cislo3) / 3;\n                    Console.WriteLine(\"Výsledek (průměr): \" + prumer);\n                    break;\n                \n                default:\n                    // Chybová hláška při zadání jiného znaku (včetně malých písmen)\n                    Console.WriteLine(\"Chyba: Byla zadána neplatná volba.\");\n                    break;\n            }\n\n            // Aby se konzole hned nezavřela\n            Console.ReadKey();\n        }\n    }\n}"
    },
    {
      "id": "rdu958bj",
      "title": "Písemka C# - 2026/10/20",
      "desc": "1. Vytvořte program, který načte zadané číslo a rozhodne, zda je kladné, záporné nebo nula a vypíše tuto informaci.\n2. Pokud je číslo kladné, dále zjistí, zda je dělitelné 10 a vypíše tuto informaci.\n3. Pokud je číslo záporné, zjistí, zda je menší než -50 a vypíše tuto informaci.\n4. Určí, zda číslo končí číslicí 3 a zároveň je větší než 100, v případě, že ano, tak vypíše tuto informaci.   ",
      "done": false,
      "lang": "",
      "code": "using System;\n\nclass Program\n{\n    static void Main()\n    {\n        // Načtení zadaného čísla[cite: 2]\n        Console.Write(\"Zadej číslo: \");\n        int cislo = int.Parse(Console.ReadLine());\n\n        // 1. Rozhodne, zda je kladné, záporné nebo nula a vypíše tuto informaci[cite: 2]\n        if (cislo > 0)\n        {\n            Console.WriteLine(\"Číslo je kladné.\");\n\n            // 2. Pokud je číslo kladné, dále zjistí, zda je dělitelné 10 a vypíše tuto informaci[cite: 2]\n            if (cislo % 10 == 0)\n            {\n                Console.WriteLine(\"Číslo je dělitelné 10.\");\n            }\n        }\n        else if (cislo < 0)\n        {\n            Console.WriteLine(\"Číslo je záporné.\");\n\n            // 3. Pokud je číslo záporné, zjistí, zda je menší než -50 a vypíše tuto informaci[cite: 2]\n            if (cislo < -50)\n            {\n                Console.WriteLine(\"Číslo je menší než -50.\");\n            }\n        }\n        else\n        {\n            Console.WriteLine(\"Číslo je nula.\");\n        }\n\n        // 4. Určí, zda číslo končí číslicí 3 a zároveň je větší než 100[cite: 2]\n        if (cislo % 10 == 3 && cislo > 100)\n        {\n            Console.WriteLine(\"Číslo končí číslicí 3 a je větší než 100.\");\n        }\n    }\n}"
    },
    {
      "id": "msghjy60",
      "title": "Písemka C# - 2026/10/13",
      "desc": "1. Načtěte 3 celá čísla do proměnných x1, x2 a x3 zadáním z klávesnice.\n2. Vypočtěte součet těchto tří čísel a uložte ho do proměnné soucet.\n3. Vypočtěte průměr těchto tří čísel a uložte ho do proměnné průměr (float nebo double!).\n4. Vypočtěte dvojnásobek součtu těchto tří čísel a uložte ho do proměnné dvojnasobek.\n\nJak by to mělo vypadat:\n\n===================\n== TEST CISLO 1 ==\n===================\n//vynechany radek\nzadejte 1. číslo: x1\nzadejte 2. číslo: x2\nzadejte 3. číslo: x3\n(vynechany radek)\nx1 + x2 + x3 = soucet\nPrumer je prumer.\nDvojnasobek souctu cisel je dvojnasobek.\n//vynechany radek\n*** KONEC PROGRAMU ***",
      "done": false,
      "lang": "",
      "code": "using System;\n\nnamespace VstupVystupA\n{\n    class Program\n    {\n        static void Main(string[] args)\n        {\n            // Hlavička programu\n            Console.WriteLine(\"===================\");\n            Console.WriteLine(\"== TEST CISLO 1 ==\");\n            Console.WriteLine(\"===================\");\n            Console.WriteLine(); // vynechaný řádek\n\n            // 1. Načtení 3 celých čísel\n            Console.Write(\"zadejte 1. číslo: \");\n            int x1 = int.Parse(Console.ReadLine());\n\n            Console.Write(\"zadejte 2. číslo: \");\n            int x2 = int.Parse(Console.ReadLine());\n\n            Console.Write(\"zadejte 3. číslo: \");\n            int x3 = int.Parse(Console.ReadLine());\n\n            // 2. Výpočet součtu\n            int soucet = x1 + x2 + x3;\n\n            // 3. Výpočet průměru (přetypování na double pro přesné dělení)\n            double prumer = (double)soucet / 3;\n\n            // 4. Výpočet dvojnásobku součtu\n            int dvojnasobek = soucet * 2;\n\n            // Výstup výsledků podle vzoru\n            Console.WriteLine(); // vynechaný řádek\n            Console.WriteLine($\"{x1} + {x2} + {x3} = {soucet}\");\n            Console.WriteLine($\"Prumer je {prumer}.\");\n            Console.WriteLine($\"Dvojnasobek souctu cisel je {dvojnasobek}.\");\n            Console.WriteLine(); // vynechaný řádek\n            Console.WriteLine(\"*** KONEC PROGRAMU ***\");\n        }\n    }\n}"
    }
  ],
  "mpt": []
};
