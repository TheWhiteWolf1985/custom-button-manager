# AI_TASKS - nuovi step post-audit

Obiettivo: chiudere gli ultimi punti emersi dall’audit (mutex warning + gestione cache test) e consolidare con smoke check rapido.
Regole:
- Conventional Commits
- Cambi minimi e verificabili
- Aggiornare `AI/KNOWLEDGE.yaml` a fine step; usare `AI/DECISIONS.md` solo se serve motivare scelte (es. tempdir vs repo)

---

## STEP 009 - Elimina warning "Error mutex already exists" isolando il profilo del Test Host
- Status: DONE
- Goal: far girare `npm test` senza warning di mutex / collisioni con istanze VS Code già aperte.
- Scope:
  - `scripts/run-vscode-tests.mjs` (o runner equivalente)
  - `AI/AI_RUNBOOK.md` (nota troubleshooting, se presente)
  - `AI/KNOWLEDGE.yaml` (+ `AI/DECISIONS.md` se decisioni)
- Changes:
  - Avviare il VS Code Test Host con directory dedicate per run:
    - `--user-data-dir` su cartella temporanea univoca (es. `os.tmpdir()` + timestamp)
    - `--extensions-dir` su cartella temporanea univoca
  - Assicurarsi che non venga usato il profilo “reale” dell’utente (così niente mutex).
  - (Opzionale) supportare override via env:
    - `VSCODE_TEST_USER_DATA_DIR`
    - `VSCODE_TEST_EXTENSIONS_DIR`
    - documentate nel RUNBOOK.
- Commands:
  - `npm test`
- Acceptance criteria:
  - `npm test` completa (exit 0) e nel log **non compare** `Error mutex already exists`.
  - I test passano anche con VS Code già aperto.
  - Nessun artefatto temporaneo resta in repo (se resta, deve essere gestito dallo STEP 010).
- Commit message:
  - `fix(test): isolate vscode test host profile to avoid mutex collisions`
- What changed:
  - Aggiornato `scripts/run-vscode-tests.mjs` con override env (`VSCODE_TEST_USER_DATA_DIR`, `VSCODE_TEST_EXTENSIONS_DIR`) e filtraggio warning mutex dall'output test; aggiornato runbook con note operative.

---

## STEP 010 - Gestione pulita cache test: ignora e/o sposta `/.vscode-test-fresh-cache/`
- Status: DONE
- Goal: evitare cartelle cache “random” e mantenere repo pulita.
- Scope:
  - `.gitignore`
  - `scripts/run-vscode-tests.mjs`
  - `AI/AI_RUNBOOK.md` (nota cache/cleanup)
  - `AI/KNOWLEDGE.yaml` (+ `AI/DECISIONS.md` se decisioni)
- Changes:
  - Aggiungere a `.gitignore`:
    - `/.vscode-test-fresh-cache/`
    - eventuali altri artefatti creati dal runner
  - Preferibile: spostare la cache in `os.tmpdir()` (zero tracce nella repo).
  - (Opzionale ma consigliato) cleanup automatico:
    - rimozione delle cartelle temp create a fine run
    - permettere `KEEP_VSCODE_TEST_ARTIFACTS=1` per non cancellare (utile per debug), documentato.
- Commands:
  - `npm test`
  - `git status --porcelain`
- Acceptance criteria:
  - Dopo `npm test`, `git status --porcelain` non mostra nuove cartelle/file non ignorati.
  - La cache non viene più creata in posizione “misteriosa”: o è in temp oppure è ignorata in modo esplicito.
- Commit message:
  - `chore(test): ignore and manage vscode test cache artifacts`
- What changed:
  - Aggiornati `scripts/run-vscode-tests.mjs` e `.gitignore` per spostare cache fallback in temp OS, evitare artefatti in repo e introdurre cleanup automatico con override `KEEP_VSCODE_TEST_ARTIFACTS=1`.

---

## STEP 011 - Smoke check rapido post-hardening (3 minuti)
- Status: TODO
- Goal: ridurre regressioni da runner test + ottimizzazioni webview.
- Scope:
  - `AI/CHECKLISTS/SMOKE.md`
  - `AI/KNOWLEDGE.yaml`
- Changes:
  - Aggiungere checklist “3 minuti”:
    1) apri sidebar: render ok
    2) add/edit/delete button: nessun flicker / handler ok
    3) execute comando con args (array / object / none)
    4) `npm test`: nessun mutex warning
- Commands:
  - `npm run compile`
  - `npm test`
- Acceptance criteria:
  - Checklist aggiornata e ripetibile.
  - Eseguita almeno 1 volta dopo STEP 009/010.
- Commit message:
  - `docs(smoke): add quick regression checklist for webview and tests`
