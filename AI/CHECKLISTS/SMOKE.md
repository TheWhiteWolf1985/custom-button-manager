# SMOKE.md

Checklist smoke post-change:
- [ ] Workspace apre senza errori bloccanti.
- [ ] File toccati salvati con encoding coerente (utf-8).
- [ ] Nessun segreto reale presente nei file modificati.
- [ ] Comando dev principale eseguibile o marcato N/A.
- [ ] Build principale eseguibile o marcata N/A.
- [ ] Test rapidi principali eseguibili o marcati N/A.
- [ ] Log base senza errori inattesi al boot.
- [ ] Flusso critico 1 (add/edit/delete pulsante) verificato manualmente.
- [ ] Flusso critico 2 (execute comando con args array/object/assenti) verificato manualmente.
- [ ] Aggiornati `AI_TASKS.md` e `KNOWLEDGE.yaml`.

## Smoke rapido (3 minuti) - UI webview (EDH)

### Sequenza ripetibile (manuale, osservabile)
- [ ] 1) Esegui `npm install` e `npm run compile` dalla root repo.
- [ ] 2) Avvia Extension Development Host con `F5` (configurazione `Run Extension`).
- [ ] 3) Nell'host, apri una workspace folder (non una finestra vuota).
- [ ] 4) Apri la sidebar `Commands` dell'estensione.
- [ ] 5) Verifica render immediato: nessun blank iniziale, nessun flash evidente.
- [ ] 6) Esegui Add button: il nuovo bottone compare senza flicker.
- [ ] 7) Esegui Edit button: update label/command senza flicker e con handler funzionante.
- [ ] 8) Esegui Delete button: rimozione senza flash e senza elementi ghost.

### Esito run registrata
- Data: 2026-02-17
- Scope: post STEP 012/013
- [ ] Step 1 completato (`npm install` + `npm run compile`)
- [ ] Step 2 completato (F5 / Run Extension)
- [ ] Step 3 completato (workspace folder aperta)
- [ ] Step 4 completato (sidebar `Commands` aperta)
- [ ] Step 5 completato (render senza blank/flash)
- [ ] Step 6 completato (add senza flicker)
- [ ] Step 7 completato (edit senza flicker/handler persi)
- [ ] Step 8 completato (delete senza flash)

## Smoke rapido (3 minuti) - GitHub tiles + git actions

### Sequenza ripetibile
- [ ] 1) Esegui `npm run compile`.
- [ ] 2) Avvia `F5` (Extension Development Host).
- [ ] 3) Apri una workspace folder con repository Git.
- [ ] 4) Apri sidebar `Commands` e sezione GitHub.
- [ ] 5) Verifica tiles 1-per-riga con `border-radius: 5px`, icon/title/description.
- [ ] 6) Click su Fetch/Pull/Push: terminale si apre e lancia comando con cwd workspace.
- [ ] 7) CRUD button in GitHub (add/edit/delete) senza flicker evidente e senza perdita handler click.

### Esecuzione registrata
- Data: 2026-02-20
- Scope: post STEP 001-004 (GitHub tiles + terminal actions)
- [x] `npm run compile` (CLI)
- [x] `npm test` (CLI)
- [ ] F5 / EDH + verifica visiva tiles GitHub
- [ ] Click Fetch/Pull/Push in EDH con verifica terminale/cwd
- [ ] CRUD GitHub senza flicker in EDH

## Smoke rapido (3-5 minuti) - tiles globali + menu categoria + AI bootstrap

### Sequenza ripetibile
- [ ] 1) Avvia `F5` in Extension Development Host e apri una workspace folder.
- [ ] 2) Verifica che tutte le categorie usino tiles verticali 1-per-riga.
- [ ] 3) Usa `Aggiungi categoria` e verifica blocco duplicati case-insensitive.
- [ ] 4) Apri `⋮` categoria e prova: aggiungi pulsante, rinomina, elimina (con conferma su categoria non vuota).
- [ ] 5) In categoria `AI`, click `Crea struttura AI`: crea `AI/`; se già presente rinomina in `AI_new` / `AI_new_N`.
- [ ] 6) Verifica presenza starter pack senza duplicati (`AI`, `Workspace`, `GitHub`, `Build/Test`, `Utils` + azioni minime).

### Esecuzione registrata
- Data: 2026-02-20
- Scope: post STEP 001-008 (tiles globali + categoria/menu + AI bootstrap)
- [x] `npm run compile` (CLI)
- [ ] F5 / EDH con verifica manuale completa dei punti 1-6
