# AI_TASKS - custom-command-sidebar (VSCode-custom-button)

Fonte principale: audit tecnico 2026-02-17.  
Obiettivo: rendere il progetto più robusto e “production-ready” senza refactor gratuiti.

Regole:
- Cambi piccoli, verificabili, e con commit Conventional Commits.
- No nuove dipendenze senza necessità esplicita (se servono, motivarle nello step).
- Ogni step aggiorna `AI/KNOWLEDGE.yaml` e, se serve, `AI/DECISIONS.md`.

---

### STEP 001 - Riproduzione baseline e messa in chiaro dei comandi
- Status: DONE
- Goal: Rendere ripetibile lo stato attuale e fissare i comandi reali di build/test.
- Scope: `package.json`, `.vscode-test.mjs` (solo lettura/annotazioni se serve), `AI/AI_RUNBOOK.md` (se già presente), `AI/KNOWLEDGE.yaml`.
- Changes:
  - Verificare e documentare i comandi reali: install, compile, lint, test.
  - Annotare il failure attuale di `npm test` su Windows (path con spazi / Code.exe non risolto).
  - Aggiornare RUNBOOK con troubleshooting minimo per test (senza ancora fixare).
- Commands:
  - `npm install`
  - `npm run compile`
  - `npm run lint` (se presente)
  - `npm test` (atteso KO su Windows al momento)
- Acceptance criteria:
  - RUNBOOK/KNOWLEDGE aggiornati con comandi e risultato baseline (OK/KO) riproducibile.
  - Nessuna modifica funzionale al runtime dell’estensione.
- Commit message:
  - `chore(ai): record baseline build and test status`
- Blockers/Notes:
  - Il test runner oggi fallisce su Windows con path contenenti spazi (audit).
- What changed:
  - Aggiornato `AI/AI_RUNBOOK.md` con baseline riproducibile comandi (install/compile/lint/test) e dettaglio errore attuale su `npm test` in Windows.

---

### STEP 002 - Fix test runner: `npm test` deve funzionare su Windows (path con spazi)
- Status: DONE
- Goal: Rendere eseguibile `npm test` in ambiente Windows anche con workspace path contenenti spazi.
- Scope: `.vscode-test.mjs`, `package.json` (script test), eventuale utilità locale in `scripts/` se necessaria.
- Changes:
  - Sistemare la risoluzione dell’executable VS Code usato dai test (`Code.exe`) evitando problemi di quoting/spazi.
  - Preferire approccio compatibile con `@vscode/test-electron`:
    - usare path assoluto corretto,
    - evitare concatenazioni “a stringa” non quotate,
    - se serve: fallback via env var (`VSCODE_EXECUTABLE_PATH`) documentata.
  - Rendere il fallimento “parlante” (messaggio chiaro se VS Code non è trovato).
- Commands:
  - `npm test`
- Acceptance criteria:
  - Su Windows: `npm test` avvia l’Extension Test Host e completa (pass o fail *dei test*, ma il runner deve partire).
  - Su non-Windows: comportamento invariato.
  - Nessun “Code.exe non riconosciuto” / path truncato.
- Commit message:
  - `fix(test): make extension test runner work on Windows paths with spaces`
- Blockers/Notes:
  - Audit evidenzia KO attuale per `Code.exe` non riconosciuta in `.vscode-test` su path con spazi.
- What changed:
  - Aggiunto runner locale `scripts/run-vscode-tests.mjs` con avvio VS Code test host via `spawn(..., shell: false)` e aggiornato script `test` in `package.json`.

---

### STEP 003 - Test minimi reali: categorie, migrazione legacy, execute args
- Status: DONE
- Goal: Aggiungere una copertura test “minima ma vera” sui flussi core.
- Scope: `src/test/extension.test.ts`, eventuali file nuovi in `src/test/`, piccoli refactor testability in `src/extension.ts` (solo se necessario).
- Changes:
  - Aggiungere almeno 3 test di integrazione (mocha):
    1) `getCategories()` legge da workspace settings e restituisce struttura attesa.
    2) Migrazione legacy: se esiste vecchia key/config, viene convertita correttamente.
    3) Esecuzione comando: `executeButton` chiama `vscode.commands.executeCommand` con:
       - args array,
       - args object,
       - args assenti (solo command).
  - Evitare dipendenze nuove: mockare `vscode.commands.executeCommand` con override temporaneo nei test.
  - Se per testability serve estrarre piccole funzioni pure (es. parse/validate args), farlo senza cambiare UX.
- Commands:
  - `npm test`
- Acceptance criteria:
  - Almeno 3 test nuovi verdi.
  - I test coprono i casi “che rompono spesso”: args, migrazione, lettura settings.
- Commit message:
  - `test(core): add minimal integration tests for categories migration and command execution`
- Blockers/Notes:
  - Audit: suite attuale quasi solo di esempio, nessun test sul workflow reale.
- What changed:
  - Aggiunti 3 test reali in `src/test/extension.test.ts` e introdotte funzioni pure esportate (`resolveCategoriesFromConfig`, `executeButtonCommand`) in `src/extension.ts` per coprire categorie/migrazione/args.

---

### STEP 004 - Reattività webview: evitare full re-render quando cambia poco
- Status: TODO
- Goal: Ridurre lavoro DOM: non ricostruire tutto ad ogni update se non necessario.
- Scope: `src/extension.ts` (webview render), eventuale helper JS inlined (resta offline).
- Changes:
  - Sostituire `categoriesEl.innerHTML = ''` + rebuild totale con strategia incrementale:
    - key stable per categoria/pulsante,
    - update per categoria (patch) quando cambia solo una categoria,
    - mantenere nodi riutilizzabili quando possibile.
  - Non cambiare UX o layout percepito (salvo step grid responsiva successivo).
- Commands:
  - `npm run compile`
  - Smoke manuale: apri sidebar, aggiungi/modifica/elimina pulsante, verifica nessun flicker.
- Acceptance criteria:
  - Update di un singolo button non causa “flash”/ricostruzione completa visibile.
  - Nessun regress su add/edit/delete/execute.
- Commit message:
  - `perf(webview): reduce full redraws by patching category DOM updates`
- Blockers/Notes:
  - Audit: re-render completo ad ogni update, può degradare con molti pulsanti.

---

### STEP 005 - Grid responsiva: adattarsi alla larghezza reale della sidebar
- Status: TODO
- Goal: Rendere la griglia dei pulsanti adattiva (niente 3 colonne fisse).
- Scope: `src/extension.ts` (CSS webview).
- Changes:
  - Passare da `repeat(3, ...)` a `repeat(auto-fill, minmax(96px, 1fr))` (o valore equivalente validato).
  - Verificare con sidebar stretta e larga.
- Commands:
  - `npm run compile`
  - Smoke manuale: resize sidebar e verifica wrap coerente.
- Acceptance criteria:
  - Su sidebar stretta: niente pulsanti “schiacciati” illeggibili.
  - Su sidebar larga: uso spazio migliore, wrap naturale.
- Commit message:
  - `feat(ui): make button grid responsive to sidebar width`
- Blockers/Notes:
  - Audit: grid a 3 colonne fisse non si adatta.

---

### STEP 006 - Cache categorie lato provider: meno letture settings ripetute
- Status: TODO
- Goal: Ridurre roundtrip su configuration: mantenere stato in memoria e sync su change.
- Scope: `src/extension.ts` (provider), eventuale listener `workspace.onDidChangeConfiguration`.
- Changes:
  - Introdurre cache in-memory delle categorie nel provider:
    - `this.categories` aggiornato su load e su write,
    - listener `onDidChangeConfiguration` per aggiornare cache se cambia la key.
  - Aggiornare i call-site (`promptAddOrEdit`, `showMenu`, `executeButton`, `postCategories`) per usare cache dove sensato.
- Commands:
  - `npm run compile`
  - `npm test`
- Acceptance criteria:
  - Funzionalità invariata.
  - Meno chiamate ripetute a `getCategories()` nelle hot path (verificabile via log temporaneo rimosso prima del commit).
- Commit message:
  - `perf(core): cache categories in provider and sync on configuration changes`
- Blockers/Notes:
  - Audit: letture ripetute delle categorie in più flussi.

---

### STEP 007 - Hardening bootstrap dati webview: niente JSON inline nello script
- Status: TODO
- Goal: Evitare edge case di rottura script con contenuti estremi nei settings.
- Scope: `src/extension.ts` (HTML webview + JS), messaggistica `postMessage`.
- Changes:
  - Rimuovere l’iniezione inline `JSON.stringify(categories)` nello script HTML.
  - Inviare le categorie con un `postMessage` iniziale (handshake) e renderizzare lato webview dopo ricezione.
  - Mantenere CSP/nonce e nessun fetch remoto.
- Commands:
  - `npm run compile`
  - Smoke manuale: categorie con caratteri strani (quote, emoji) non rompono UI.
- Acceptance criteria:
  - Nessun JSON inline in script.
  - UI funziona identica e non si rompe con input “sporchi”.
- Commit message:
  - `fix(webview): bootstrap categories via postMessage instead of inline JSON`
- Blockers/Notes:
  - Audit: inline JSON nello script può rompersi con edge case.

---

### STEP 008 - Coerenza UX: uniformare lingua messaggi (IT o EN) + cleanup finale
- Status: TODO
- Goal: Rendere i messaggi utente coerenti e chiudere con audit “no diff”.
- Scope: `src/extension.ts` (stringhe UX), `AI/KNOWLEDGE.yaml`, `AI/DECISIONS.md`, `AI/CHECKLISTS/SMOKE.md`.
- Changes:
  - Scegliere una lingua (preferenza: IT se target personale) e uniformare prompt/validator/message.
  - Aggiornare checklist smoke con i 2 flussi critici:
    1) add/edit/delete pulsante
    2) execute comando con args
  - Aggiornare KNOWLEDGE/DECISIONS con ciò che è cambiato e perché.
- Commands:
  - `npm run compile`
  - `npm test`
- Acceptance criteria:
  - Messaggistica coerente (niente mix IT/EN).
  - Smoke checklist compilata e verificabile.
  - KNOWLEDGE aggiornato e pronto per consegna.
- Commit message:
  - `chore(ux): unify user-facing messages and finalize ai audit artifacts`
- Blockers/Notes:
  - Audit: UX mista IT/EN.

---
