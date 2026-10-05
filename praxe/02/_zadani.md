# [Co má být na konci modulu a jak to vypadá?]

> Verze: 2026-10-03

**Přibližný potřebný čas**: 2 vyučovací hodiny

## Kontext (proč to děláme)

Paní učitelka **Nováková** má dost přihlašování na "univerzální" lokální účty typu `ucitel`/`ucitel`, které zná celá škola. Chce, aby každý žák a učitel měl **svůj vlastní** účet, který funguje na libovolném počítači ve škole. To je přesně to, co řeší Active Directory Domain Services.

## Předpoklad: server je připravený (Modul 1 — Příprava VM)

Tento modul předpokládá, že server **SRV1-DC** už prošel přípravným modulem: má nainstalovaný Windows Server 2025 Datacenter (Desktop Experience), hostname `SRV1-DC`, statickou IP `192.168.X.10/24` na rozhraní `Ethernet1`, účet `Administrator` s heslem `Pa55w.rd` a hotovou lokalizaci (anglické rozhraní, česká regionální nastavení a klávesnice, časové pásmo Praha). Pokud jste přípravu ještě nedokončili, vraťte se k ní nejprve.

## Cílový stav: Povýšení na řadič domény

Server SRV1-DC bude mít nainstalovanou roli **Active Directory Domain Services (AD DS)** a bude povýšen na řadič nového lesa a domény `prijmeni.cyberschool.internal`.

| Parametr | Hodnota na SRV1-DC | Poznámka |
|---|---|---|
| Role serveru | **Active Directory Domain Services (AD DS)**, **DNS Server** | Instaluje se včetně správy RSAT |
| Název kořenové domény lesa (FQDN) | `prijmeni.cyberschool.internal` | Za `prijmeni` dosadíte své příjmení bez diakritiky, malými písmeny (např. `novak.cyberschool.internal`) |
| NetBIOS jméno domény | `PRIJMENI` | Odvozuje se automaticky velkými písmeny (např. `NOVAK`) |
| DSRM heslo (SafeModePassword) | `Pa55w.rd` | Režim obnovení adresářových služeb |
| FSMO role | Všech 5 rolí na `SRV1-DC` | Schema, Domain Naming, PDC, RID, Infrastructure |
| Global Catalog (GC) | `True` | První řadič v doméně je vždy GC |
| Přihlašovací účet po restartu | `PRIJMENI\Administrator` / `Administrator@prijmeni.cyberschool.internal` | Heslo zůstává `Pa55w.rd` |

- Doména `prijmeni.cyberschool.internal` existuje a SRV1-DC je jejím řadičem (Domain Controller).
- Server zároveň funguje jako DNS server pro tuto doménu (role DNS se integruje automaticky s AD DS).
- Po restartu se přihlašujete jako `Administrator@prijmeni.cyberschool.internal` (nikoliv jen lokálně).

## Ověření nástroji

Na SRV1-DC jsou dostupné administrační nástroje pro správu domény — **Active Directory Users and Computers (ADUC)**, **DNS Manager**, **Active Directory Domains and Trusts** — přístupné přes Server Manager → Tools.
