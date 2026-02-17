# AI_PRD

## Overview
- Problema: la repository contiene template e documentazione incompleta del kit `AI/`, con placeholder che impediscono un flusso operativo affidabile e verificabile.
- Obiettivo: fornire un contesto AI operativo completo e aderente al progetto reale, con task step-by-step verificabili e knowledge graph aggiornato.
- KPI/Success criteria:
  - Zero placeholder obbligatori nei file `AI/`.
  - Tutti gli step in `AI/AI_TASKS.md` marcati `DONE`.
  - Build/typecheck/lint eseguiti almeno una volta con esito positivo.

## Personas
- Persona primaria: maintainer/sviluppatore VS Code extension che usa Codex per manutenzione incrementale.
- Persona secondaria: reviewer tecnico che deve verificare scope, rischi e tracciabilita' delle modifiche.

## UX/Frontend
- Flusso utente: apertura Extension Development Host, visualizzazione sidebar `Commands`, aggiunta/modifica/esecuzione pulsanti per categoria.
- Stati principali (loading/empty/error/success):
  - Empty: categoria senza pulsanti e stato globale "Nessun comando".
  - Error: JSON args non valido, comando non eseguibile, save workspace fallito.
  - Success: pulsanti salvati in workspace settings e renderizzati nella webview.

## Backend/Domain
- Componenti dominio coinvolti: provider webview `CommandViewProvider`, modello `CommandCategory`/`CommandButton`, configurazione workspace `myCommandSidebar.categories`.
- Regole dominio: persistenza in configurazione workspace; fallback a categorie default e migrazione legacy da `myCommandSidebar.buttons`.

## API contracts
- Endpoint/azioni coinvolte: non ci sono API HTTP; interazione tramite VS Code commands e messaggi webview.
- Request/Response attese:
  - Webview -> Extension: `add`, `execute`, `menu`.
  - Extension -> Webview: `categories`.
- Error handling API: eccezioni intercettate in `executeButton` e `saveCategories` con messaggio utente.

## Data model
- Entita principali: `CommandButton`, `CommandCategory`.
- Tabelle/collezioni: nessun database; storage su settings JSON di workspace.
- Migrazioni: migrazione runtime da key legacy `buttons` a `categories`.

## Error handling
- Errori attesi: JSON args non valido, command id inesistente, mancata disponibilita' workspace folder.
- Strategie fallback/retry: fallback categorie default; stop con messaggio errore in UI.

## Observability
- Log richiesti: output esbuild in fase build, messaggi VS Code per errori/successo utente.
- Metriche/eventi: non definiti contatori o telemetria.

## Performance/Security
- Vincoli performance: bundle singolo `dist/extension.js`; webview locale senza risorse remote.
- Vincoli sicurezza: CSP restrittiva in webview, script con nonce, `default-src 'none'`, nessun secret in repo.

## Test plan
- Unit: presenti test di esempio (`src/test/extension.test.ts`) non rappresentativi delle feature core.
- Integration/E2E: non presenti.
- Smoke manuale: aprire host di sviluppo, aggiungere pulsante, eseguirlo, modificarlo/eliminarlo.

## Rollout
- Strategia rilascio: packaging VSIX tramite `npm run package` + `vsce package` (se `vsce` disponibile localmente).
- Piano rollback: ripristino versione estensione precedente e reset della setting workspace `myCommandSidebar.categories`.


