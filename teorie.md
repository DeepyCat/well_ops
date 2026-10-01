## Architektura OS
- Co je jako mode bit (Furt otočený zády)
 ### Bezpečností okruhy procesoru
 - Instrukce
 - Registry 
	 - Protector rings
		 - Ring 0 = Registry a vše instrukce (Kernel)
		 - Ring 1 = Některé registry a instrukce (nic)
		 - Ring 2 = Některé registry a instrukce (nic)
		 - Ring 3 = Některé registry a instrukce (User)
	- Plánověč Dispeře Správce paměti IPC = Ring 0
	- bash GUI Word Xmild, CLI = Ring 3
- Kernel
	- Monolitcký - vše v ring 0. Fast, kromě aplikaci
	- Mikrokernel - jen 3 programy b ring 0, stabilnější
	- 
