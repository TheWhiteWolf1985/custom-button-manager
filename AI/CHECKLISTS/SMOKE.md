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
