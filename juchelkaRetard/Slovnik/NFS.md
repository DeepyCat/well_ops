---
aliases: [Network File System]
tags: [slovnik]
---

# NFS

**Network File System** – protokol pro sdílení souborů mezi UNIXovými/Linuxovými stroji po síti. Vzdálený adresář se jeví jako součást lokálního souborového systému.

---

## Podrobně

### Princip

Klient-server vztah – jeden stroj (server) zpřístupní svůj adresář, druhý (klient) si ho **mountne** (připojí) do vlastní adresářové struktury. Jeden stroj může být zároveň klient i server pro různé adresáře.

### Ověřování

Klasické NFS ověřuje podle **síťové identity klienta** – ID uživatele musí sedět na klientovi i serveru stejně, jinak server přidělí přístup podle špatného uživatele. Bezpečnější varianty používají šifrované ověřování (Kerberos) nebo [[LDAP]].

### Windows obdoba

**CIFS/SMB** – funguje podobně, ale ověřování je typicky svázané s doménovým přihlášením ([[LDAP|Active Directory]]).

**Souvisí:** [[05_Directory_Structures]], [[06_File_System_Implementation]]
