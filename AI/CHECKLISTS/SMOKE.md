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

## Smoke rapido (3 minuti) - post hardening test runner

### Checklist ripetibile
- [ ] Apri sidebar `Commands`: render iniziale OK.
- [ ] Add/Edit/Delete button: nessun flicker evidente, handler operativi.
- [ ] Execute comando con args: casi `array`, `object`, `none`.
- [ ] `npm test`: nessun warning `Error mutex already exists`.

### Esecuzione registrata
- Data: 2026-02-17
- Scope: post STEP 009/010
- [ ] Sidebar render OK (manuale in Extension Development Host)
- [ ] Add/Edit/Delete senza flicker (manuale in Extension Development Host)
- [ ] Execute args array/object/none (manuale in Extension Development Host)
- [x] `npm test` senza warning mutex (verificato via CLI)
