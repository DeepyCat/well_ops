// Obsah předmětu Mikroprocesorová technika. Nahraď tímto souborem mikroprocesory-data.js ve složce stránky.
window.ZAPISNIK_DATA = {
  "zadani": [
    {
      "id": "mit10",
      "title": "10_Fr – Maticová klávesnice 4×4 → displej",
      "desc": "Číst maticovou klávesnici 4×4 (řádky PE0–PE3 jako výstupy, sloupce PE4–PE7 jako vstupy s pull-up rezistory) a stisknutou číslici 0–9 zobrazit na sedmisegmentovém displeji na PORTB. Klávesy A–D, * a # se nezobrazují.\n\nPoznámka: v původním souboru byly překlepy (uint8_7 místo uint8_t), takže se nepřeložil. Tady je opravený. Tabulka segmentů je navíc pro společnou katodu (1 = svítí), na rozdíl od předchozích úloh.",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\n// Definice pole kláves podle nákresu v sešitu\nconst char klavesy[4][4] = {\n\t{'1', '2', '3', 'A'},\n\t{'4', '5', '6', 'B'},\n\t{'7', '8', '9', 'C'},\n\t{'*', '0', '#', 'D'}\n};\n\n// Převodní tabulka pro 7segmentový displej (katodový typ: 1 = rozsvícený segment [a, b, c, d, e, f, g])\n// Zde zjednodušeně pro číslice 0-9 (pro písmena A-D lze doplnit)\nconst uint8_t seg_codes[] = {\n\t0b00111111, // 0\n\t0b00000110, // 1\n\t0b01011011, // 2\n\t0b01001111, // 3\n\t0b01100110, // 4\n\t0b01101101, // 5\n\t0b01111101, // 6\n\t0b00000111, // 7\n\t0b01111111, // 8\n\t0b01101111  // 9\n};\n\nvoid setup_ports() {\n\t// Předpoklad: Port E je rozdělen na řádky (výstupy) a sloupce (vstupy s pull-up)\n\t// Řádky např. dolní 4 bity (výstupy), sloupce horní 4 bity (vstupy)\n\tDDRE = 0x0F;   // 0-3 výstupy (řádky), 4-7 vstupy (sloupce)\n\tPORTE = 0xF0;  // Zapnutí pull-up rezistorů na vstupech\n\t\n\t// Port pro 7segmentový displej (např. Port B jako výstup)\n\tDDRB = 0xFF;\n}\n\nchar skenuj_klavesnici() {\n\tfor (int radek = 0; radek < 4; radek++) {\n\t\t// Nastavíme nulu na příslušný řádek, ostatní 1\n\t\tPORTE = ~(1 << radek);\n\t\t_delay_ms(5); // Krátké zpoždění pro ustálení signálu\n\t\t\n\t\t// Přečteme sloupce (bity 4 až 7)\n\t\tuint8_t stav_sloupcU = (PINE >> 4) & 0x0F;\n\t\t\n\t\tfor (int sloupec = 0; sloupec < 4; sloupec++) {\n\t\t\t// Testujeme, zda je na sloupci 0 (tzn. tlačítko je stisknuté)\n\t\t\tif (!(stav_sloupcU & (1 << sloupec))) {\n\t\t\t\t// Počkáme na uvolnění nebo ošetříme zákmity (debounce)\n\t\t\t\twhile (!((PINE >> 4) & (1 << sloupec)));\n\t\t\t\treturn klavesy[radek][sloupec];\n\t\t\t}\n\t\t}\n\t}\n\treturn '\\0'; // Žádná klávesa nestisknuta\n}\n\nint main(void) {\n\tsetup_ports();\n\t\n\twhile (1) {\n\t\tchar stisknuto = skenuj_klavesnici();\n\t\t\n\t\tif (stisknuto != '\\0') {\n\t\t\t// Pokud byla stisknuta číslice 0-9, zobrazíme ji na 7segmentovém displeji\n\t\t\tif (stisknuto >= '0' && stisknuto <= '9') {\n\t\t\t\tint cislo = stisknuto - '0';\n\t\t\t\tPORTB = seg_codes[cislo];\n\t\t\t}\n\t\t\t// Případně lze ošetřit i zobrazení písmen A-D podle zapojení tvého displeje\n\t\t}\n\t}\n\t\n\treturn 0;\n}\n",
      "done": false
    },
    {
      "id": "mit09",
      "title": "09_Fr – Číslo stisknutého tlačítka na displeji",
      "desc": "Zobrazit na displeji číslo nejnižšího stisknutého tlačítka z PK0–PK7 (1 až 8). Když není stisknuté žádné, displej zhasne. Segmenty jsou na PORTB, pozice displeje se vybírá na PORTD, obnova každých 5 ms.",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRB = 0xFF;\n\tDDRD = 0xFF;\n\tDDRK = 0x00;\n\n\tuint8_t segmenty[10] = {0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90};\n\n\tuint8_t pin_displej = 0;\n\n\twhile (1)\n\t{\n\t\tunsigned char data = PINK;\n\t\tdata = ~data;\n\t\tdata &= 0xFF;\n\n\t\tint cislo = 0;\n\t\tuint8_t stisknuto = 0;\n\n\t\tfor (int i = 0; i < 8; i++) {\n\t\t\tif (data & (1 << i)) {\n\t\t\t\tcislo = i + 1;\n\t\t\t\tstisknuto = 1;\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\n\t\tif (stisknuto) {\n\t\t\tPORTD = ~(1 << pin_displej);\n\t\t\tPORTB = segmenty[cislo];\n\t\t}\n\t\telse {\n\t\t\tPORTD = 0xFF;\n\t\t\tPORTB = 0xFF;\n\t\t}\n\n\t\t_delay_ms(5);\n\t}\n}\n",
      "done": false
    },
    {
      "id": "mit08",
      "title": "08_Fr – LED svítí při stisku tlačítka",
      "desc": "LED na PF0 svítí, dokud je stisknuté tlačítko PK7. Po uvolnění všechny LED na portu F zhasnou (PF jsou výstupy, PK vstupy).",
      "lang": "C",
      "code": "/*\n * _08_Fr.c\n *\n * Created: 24.09.2024 17:14:31\n * Author : Lenovo L450\n */ \n\n#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n    DDRK = 0x00;\n\tDDRF = 0xFF;\n    while (1) \n    {\n\t\tif ((PINK & (1<<7))==0) {\n\t\t\tPORTF = 0xFE;\n\t\t} else {\n\t\t\tPORTF = 0xFF;\t\n\t\t}\n    }\n}\n",
      "done": false
    },
    {
      "id": "mit07",
      "title": "07_Fr – Znaky na displeji podle tlačítka",
      "desc": "Na jedné pozici sedmisegmentového displeje zobrazit znak podle tlačítka: PK7 zobrazí písmeno L (0xC7), PK0 zobrazí znak 0xC4. Po uvolnění tlačítka zůstává zobrazen poslední znak.",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRB = 0xFF;\n\tPORTD = 0xFE;\n\tDDRK = 0x00;\n\tuint8_t pismeno[2]={0xC7, 0xC4};\n    while (1) \n    {\n\t\tif ((PINK & (1 << 0)) == 0)\n\t\t{\n\t\t\tPORTB = pismeno[1];\n\t\t}\n\t\telse if ((PINK & (1 << 7)) == 0)\n\t\t{\n\t\t\tPORTB = pismeno[0];\n\t\t}\n    }\n}\n",
      "done": false
    },
    {
      "id": "mit06",
      "title": "06_Fr – Dvoumístné číslo z tlačítek (multiplex)",
      "desc": "Zobrazit hodnotu čtyř tlačítek PK0–PK3 (číslo 0–15) jako dvoumístné desítkové číslo na dvou pozicích displeje (desítky a jednotky). Pozice se střídají multiplexováním po 4 ms. Na vstupech PK jsou zapnuté pull-up rezistory a tlačítko je aktivní v nule.",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRB = 0xFF;  // Výstupy pro segmenty displeje\n\tDDRD = 0xFF;  // Výstupy pro řízení pozic displejů (digity)\n\tDDRK = 0x00;  // Vstupy pro tlačítka\n\tPORTK = 0xFF; // Zapnutí interních pull-up rezistorů na tlačítkách\n\n\tuint8_t segmenty[10] = {0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8, 0x80, 0x90};\n\n\t// Zde si můžeš upravit, na kterých bitech/pinech PORTD budou jednotlivé pozice viset.\n\t// Například pokud chceš posunout zobrazení o kousek vlevo, změň čísla pinů (např. z 0 a 1 na 2 a 3).\n\tuint8_t pin_desitky = 4; // Příklad: pin pro desítky\n\tuint8_t pin_jednotky = 5; // Příklad: pin pro jednotky\n\n\twhile (1)\n\t{\n\t\t// Načtení tlačítek\n\t\tunsigned char data = PINK;\n\t\tdata = ~data;\n\t\tdata &= 0x0F;\n\n\t\tif (data > 15) {\n\t\t\tdata = 15;\n\t\t}\n\n\t\t// Rozdělení na desítky a jednotky\n\t\tint desitky = data / 10;\n\t\tint jednotky = data % 10;\n\n\t\t// --- MULTIPLEXOVÁNÍ ---\n\n\t\t// 1. Zobrazení desítek\n\t\tPORTD = ~(1 << pin_desitky);  // Aktivace pin pro desítky\n\t\tPORTB = segmenty[desitky];\n\t\t_delay_ms(4);\n\n\t\t// 2. Zobrazení jednotek\n\t\tPORTD = ~(1 << pin_jednotky); // Aktivace pin pro jednotky\n\t\tPORTB = segmenty[jednotky];\n\t\t_delay_ms(4);\n\t}\n}\n",
      "done": false
    },
    {
      "id": "mit05",
      "title": "05_Fr – Čítač 0–F na displeji",
      "desc": "Na sedmisegmentovém displeji v nekonečné smyčce postupně zobrazovat znaky 0 až F (hexadecimálně), každý 500 ms. Segmenty jsou na PORTB, první pozice displeje se vybírá na PORTD (0xFE).",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tuint8_t segmenty[16]={0xC0, 0xF9, 0xA4, 0xB0, 0x99, 0x92, 0x82, 0xF8,\n\t\t0x80, 0x98, 0x88, 0x83, 0xC6, 0xA1, 0x86, 0x8E};\n\tDDRB=0xFF;\n\tDDRD=0xFF;\n\tPORTD = 0xFE;\n\twhile (1)\n\t{\n\t\tfor(int i=0; i<16; i++) {\n\t\t\tPORTB = segmenty[i];\n\t\t\t_delay_ms(500);\n\t\t}\n\t}\n}\n",
      "done": false
    },
    {
      "id": "mit04",
      "title": "04_Fr – Běžící světlo se zapamatovaným směrem",
      "desc": "Automaticky běžící světlo na LED PF0–PF7 s krokem 100 ms. Tlačítko PK0 nastaví směr doprava, tlačítko PK7 doleva. Směr se pamatuje, takže světlo běží dál i po uvolnění tlačítka.",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRF=0xFF;\n\tPORTF=0xFe;\n\tDDRK=0x00;\n\tint smer = 0;\n\twhile (1)\n\t{\t\n\t\tif ((PINK &(1<<0))==0)\n\t\t{\n\t\t\tsmer = 0;\n\t\t}\n\t\telse if ((PINK &(1<<7))==0)\n\t\t{\n\t\t\tsmer = 1;\n\t\t}\n\t\t\n\t\t if (smer == 0)\n\t\t{\n\t\t\tPORTF = ((PORTF<<7)|(PORTF>>1));\n\t\t\t_delay_ms(100);\n\t\t}\n\t\telse if (smer == 1)\n\t\t{\n\t\t\tPORTF = ((PORTF<<1)|(PORTF>>7));\n\t\t\t_delay_ms(100);\n\t\t}\n\t}\n}\n",
      "done": false
    },
    {
      "id": "mit03",
      "title": "03_Fr – Běžící světlo doprava / doleva",
      "desc": "Na LED PF0–PF7 svítí jedna LED. Tlačítko PK0 posune světlo o jednu pozici doprava, tlačítko PK7 o jednu pozici doleva (cyklicky přes všech 8 LED, rychlost 100 ms).",
      "lang": "C",
      "code": "#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRF=0xFF;\n\tPORTF=0xFe;\n\tDDRK=0x00;\n    while (1) \n    {\n\t\tif ((PINK &(1<<0))==0)\n\t\t{\n\t\t\t_delay_ms(100);\n\t\t\t\n\t\t\tPORTF = ((PORTF<<7)|(PORTF>>1));\n\t\t}\n\t\telse if ((PINK &(1<<7))==0)\n\t\t{\n\t\t\t_delay_ms(100);\n\t\t\tPORTF = ((PORTF<<1)|(PORTF>>7));\t\n\t\t}\n    }\n}\n",
      "done": false
    },
    {
      "id": "mit02",
      "title": "02_Fr – Běžící světlo (pomalu / rychle)",
      "desc": "Na PF0 svítí jedna LED. Tlačítko PK0 posouvá světlo doleva pomalu (krok po 500 ms), tlačítko PK1 rychleji (krok po 250 ms). Pozice se posouvá cyklicky přes všech 8 LED PF0–PF7.",
      "lang": "C",
      "code": "/*\n * _01_Fr.c\n *\n * Created: 24.09.2024 17:14:31\n * Author : Lenovo L450\n */ \n\n#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRF=0xFF;\n\tPORTF=0xFe;\n\tDDRK=0x00;\n    while (1) \n    {\n\t\tif ((PINK &(1<<0))==0)\n\t\t{\n\t\t\t_delay_ms(500);\n\t\t\t\n\t\t\tPORTF = ((PORTF<<1)|(PORTF>>7));\n\t\t}\n\t\telse if ((PINK &(1<<1))==0)\n\t\t{\n\t\t\t_delay_ms(50);\n\t\t\tPORTF = ((PORTF<<1)|(PORTF>>7));\t\n\t\t\t_delay_ms(200);\n\t\t}\n    }\n}\n",
      "done": false
    },
    {
      "id": "mit01",
      "title": "01_Fr – Zablikání LED po stisku tlačítka",
      "desc": "Po stisku tlačítka PK0 dvakrát krátce zablikat LED na PF0 (100 ms svítí, 100 ms nesvítí). LED na portu F svítí při logické 0.",
      "lang": "C",
      "code": "/*\n * _01_Fr.c\n *\n * Created: 24.09.2024 17:14:31\n * Author : Lenovo L450\n */ \n\n#include <avr/io.h>\n#include <avr/interrupt.h>\n#define F_CPU 16000000\n#include <util/delay.h>\n\nint main(void)\n{\n\tDDRF=0xFF;\n\tPORTF=0xFF;\n    while (1) \n    {\n\t\tif ((PINK &(1<<0))==0)\n\t\t{\n\t\t\tPORTF^=(1<<0);\n\t\t\t_delay_ms(100);\n\t\t\tPORTF^=(1<<0);\n\t\t\t_delay_ms(100);\n\t\t\tPORTF^=(1<<0);\n\t\t\t_delay_ms(100);\n\t\t\tPORTF^=(1<<0);\n\t\t}\n    }\n}\n",
      "done": false
    }
  ]
};
