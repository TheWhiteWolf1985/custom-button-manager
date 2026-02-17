# AI_TASKS — TODO per Codex (post-audit)

Obiettivo: chiudere i 3 punti latenti rimasti dopo gli ultimi step:
1) smoke UI manuale (render sidebar + assenza flicker CRUD) via Extension Development Host  
2) riga stack finale non bloccante (`at id.S (...)`) dopo uscita host  
3) cleanup temp best-effort: ridurre artefatti persistenti in `%TEMP%` con garbage-collection

Regole:
- Conventional Commits
- Cambi minimi, verificabili
- Aggiornare `AI/KNOWLEDGE.yaml` a fine step; usare `AI/DECISIONS.md` solo se serve motivare scelte

---

## STEP 012 — Normalizza lo “stack finale” non bloccante dei test (niente stack nudo quando exit=0)
- Status: DONE
- Goal: quando `npm test` va a buon fine (exit 0), non deve lasciare uno stack “grezzo” in output; deve diventare un warning leggibile e tracciabile.
- Scope:
  - `scripts/run-vscode-tests.mjs` (o runner equivalente)
  - (eventuale) documentazione in `AI/AI_RUNBOOK.md`
  - `AI/KNOWLEDGE.yaml` (+ `AI/DECISIONS.md` se serve)
- Changes:
  - Intercettare stdout/stderr del VS Code Test Host.
  - Se exit code = 0:
    - rilevare pattern della riga `at id.S` (e contesto minimo) e sostituire con `WARN:` chiaro (una riga), evitando stack multilinea.
  - Se exit code ≠ 0:
    - NON filtrare nulla (log completo), per non nascondere errori veri.
  - Aggiungere modalità debug per vedere output raw:
    - es. env `VSCODE_TEST_DEBUG=1` → nessun filtering.
- Commands:
  - `npm test`
- Acceptance criteria:
  - Con test verdi: output non contiene stack nudo `at id.S (...)`; al suo posto compare un warning singola riga con prefisso `WARN`.
  - Con test rossi (forzando un fail): output resta completo e utile al debug.
- Commit message:
  - `fix(test): normalize non-blocking shutdown stack into a clear warning`
- What changed:
  - Aggiornato `scripts/run-vscode-tests.mjs` con buffering output e normalizzazione condizionale: con `exit=0` sostituisce lo stack `at id.S (...)` con singolo `WARN`, con `exit!=0` mantiene output raw completo; aggiunto override `VSCODE_TEST_DEBUG=1` e nota nel runbook.

---

## STEP 013 — Garbage-collection di `%TEMP%` per artefatti test host (prefix-based + retention)
- Status: DONE
- Goal: anche se un processo viene killato, al run successivo vengono ripulite cartelle temp vecchie lasciate dai test.
- Scope:
  - `scripts/run-vscode-tests.mjs`
  - (eventuale) `AI/AI_RUNBOOK.md`
  - `AI/KNOWLEDGE.yaml` (+ `AI/DECISIONS.md` se serve)
- Changes:
  - Usare directory temp con prefisso univoco e riconoscibile, es:
    - `forgejo-vscode-test-host-<timestamp>-<pid>/`
  - A inizio run:
    - cercare in `os.tmpdir()` cartelle con quel prefisso
    - eliminare quelle più vecchie di una retention window (es. 72h o 7 giorni — documentare la scelta)
  - A fine run:
    - cleanup “best-effort” come già fatto (ma mantenendo l’opzione per preservare artefatti):
      - `KEEP_VSCODE_TEST_ARTIFACTS=1` → non cancellare (per debug).
- Commands:
  - `npm test`
- Acceptance criteria:
  - Se esistono cartelle temp con prefisso e “vecchie”, vengono eliminate all’avvio del test.
  - `KEEP_VSCODE_TEST_ARTIFACTS=1` preserva gli artefatti della run corrente.
  - Repo resta pulita (nessun nuovo file non ignorato dopo `npm test`).
- Commit message:
  - `chore(test): add temp artifact garbage-collection for vscode test host`
- What changed:
  - Aggiornato `scripts/run-vscode-tests.mjs` introducendo prefisso temp `forgejo-vscode-test-host-`, garbage-collection all'avvio per cartelle piu' vecchie di 72h in `os.tmpdir()` e mantenimento del cleanup best-effort/fallback con `KEEP_VSCODE_TEST_ARTIFACTS=1`; documentata retention nel runbook.

---

## STEP 014 — Smoke UI manuale: checklist “3 minuti” + istruzioni Extension Development Host
- Status: DONE
- Goal: rendere ripetibile la validazione visuale (render sidebar e assenza flicker CRUD) che non è automatizzabile via sola CLI.
- Scope:
  - `AI/CHECKLISTS/SMOKE.md`
  - `AI/AI_RUNBOOK.md` (se presente)
  - `AI/KNOWLEDGE.yaml`
- Changes:
  - Aggiornare `SMOKE.md` con checklist “3 minuti” (sequenza precisa):
    1) `npm install` + `npm run compile`
    2) avvio Extension Development Host (F5 / Run Extension)
    3) apri una workspace folder
    4) apri sidebar “Commands”
    5) verifica render immediato (no blank/flash)
    6) add button → verifica comparsa senza flicker
    7) edit button → verifica update senza flicker/handler persi
    8) delete button → verifica rimozione senza flash
  - Nel RUNBOOK: aggiungere sezione “Manual smoke (EDH)” con prerequisiti e note.
- Commands:
  - `npm run compile`
  - (manuale) F5 / Run Extension
- Acceptance criteria:
  - Checklist presente, chiara, ripetibile (chiunque la segue e arriva allo stesso risultato).
  - Nessun riferimento a “solo a memoria”: step concreti e osservabili.
- Commit message:
  - `docs(smoke): document manual UI smoke checks for webview regressions`
- What changed:
  - Aggiornati `AI/CHECKLISTS/SMOKE.md` e `AI/AI_RUNBOOK.md` con sequenza manuale ripetibile in Extension Development Host (F5/Run Extension), prerequisiti espliciti e step osservabili per validare render sidebar e assenza flicker su add/edit/delete.

---
