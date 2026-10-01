---
aliases: [Mass Storage Structure, Struktura sekundárního úložiště]
---

# Struktura sekundárního úložiště

První komerční pevný disk byl **IBM 350 Disk Storage System** – 54 plotens o průměru 24" (60 cm), přístupová doba < 1 s.

## Pevný disk (Hard Disk)

Talíř (platter) je plochý kruhový disk (jako CD), obě strany pokryté magnetickým materiálem. Nad povrchem "létá" čtecí/zapisovací hlava, připevněná k rameni, které pohybuje všemi hlavami najednou.

- **Track (stopa)** – kruhová dráha na talíři
- **Sector (sektor)** – podčást stopy
- **Cylinder (cylindr)** – sada stop na všech talířích ve stejné poloze ramene
- **Surface (povrch)** – jedna strana talíře

### Rychlost disku

- **[[RPM]]** – otáčky za minutu (typicky 5400, 7200, 10000, 15000)
- **Transfer rate** – rychlost přenosu dat mezi diskem a počítačem
- **Positioning time (random access time)** = **seek time** (čas na přesun ramene na správný cylindr) + **rotation latency** (čas, než se správný sektor dostane pod hlavu)

### Head Crash

Hlava létá na extrémně tenkém vzduchovém polštáři (mikrony) – riziko dotyku s povrchem a poškození magnetické vrstvy. **Head crash** obvykle nelze opravit, celý disk se musí vyměnit.

### Řadiče

- **Host controller** – řadič na straně počítače
- **Disk controller** – vestavěný v každé jednotce, má vlastní [[cache]]. Přenos dat mezi cache a povrchem disku probíhá jinou rychlostí než mezi cache a host controllerem (elektronická rychlost)

## SSD (Solid-State Disk)

Nevolatilní paměť používaná jako náhrada mechanického disku – od DRAM se zálohovací baterií po flash paměti (**[[SLC]]**, **[[MLC]]**).

**Výhody:** žádné pohyblivé části → spolehlivější, žádný seek time ani latence → rychlejší, nižší spotřeba.
**Nevýhody:** dražší za MB, menší kapacita než velké HDD, kratší životnost.

Standardní sběrnice (bus) mohou limitovat propustnost rychlých SSD – některé se proto připojují přímo na sběrnici PCI. U SSD **neplatí algoritmy plánování disku** (nemá hlavu) – ale formátování a propustnost ano.

## Magnetické pásky

Nejstarší médium sekundárního úložiště – trvanlivé, velká kapacita, ale **přístup k datům pomalý** (náhodný přístup ~1000× pomalejší než u HDD). Používají se hlavně pro **zálohování** a přenos dat mezi systémy. Formáty: **LTO-5, SDLT**, šířky 4/8/19 mm, ¼/½ palce.

## Struktura disku

Moderní disky se adresují jako velké jednorozměrné pole **logických bloků** (nejmenší jednotka přenosu, obvykle 512 B).

### LBA (Logical Block Addressing)

Logické bloky (sektory) se číslují lineárně od 0. Nástupce staršího **CHS** (Cylinder-Head-Sector). Základní LBA má 28bitovou adresu (max. 2²⁸ sektorů = 128 GiB při 512B blocích); novější **ATA-6/ATA-100** používá 48bitovou adresu (až 128 PiB).

### CLV vs. CAV

- **Constant Linear Velocity (CLV)** – hustota bitů na stopu je konstantní, vnější stopy (delší) mají víc sektorů než vnitřní; otáčky se mění podle polohy hlavy (CD-ROM, DVD-ROM)
- **Constant Angular Velocity (CAV)** – otáčky konstantní, hustota bitů klesá směrem ven (klasické HDD)

## Připojení disku (Disk Attachment)

### Host-Attached Storage

Úložiště připojené přes lokální V/V porty: **EIDE, ATA, SATA, USB, Fibre Channel (FC), SCSI, SAS, FireWire**. Domácí PC typicky IDE/SATA (max. 2 disky na sběrnici u IDE), servery/pracovní stanice Fibre Channel.

### Network-Attached Storage (NAS)

Speciální úložné zařízení přístupné vzdáleně přes datovou síť (**NFS** na UNIXu, **CIFS/SMB** na Windows) přes vzdálená volání procedur (RPC) po TCP/UDP – obvykle stejná LAN jako ostatní provoz. **iSCSI** – novější protokol, přenáší SCSI protokol přes IP síť.

### Storage Area Network (SAN)

Privátní síť propojující servery a úložná pole (používá úložné protokoly, ne síťové) – řeší nevýhodu NAS (soutěžení o šířku pásma s běžným síťovým provozem). Flexibilní – víc hostů i úložišť na jedné síti, dynamické přidělování kapacity. Nejběžnější SAN propojení: **FC**, rostoucí obliba **iSCSI**, alternativa **InfiniBand**.

**Souvisí:** [[HDD]], [[SSD]], [[cache]], [[05_Souborove_systemy]], [[RAID]]
