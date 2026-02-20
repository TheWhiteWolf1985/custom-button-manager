# AI_TASKS — GitHub tiles + default git actions

Obiettivo: migliorare UX del submenù GitHub con tiles verticali e introdurre azioni Git base (push/pull/fetch) di default eseguite in terminale.

Vincoli:
- Cambi piccoli e verificabili.
- Conventional Commits.
- Nessuna dipendenza nuova non necessaria.
- Aggiornare `AI/KNOWLEDGE.yaml` a fine step; usare `AI/DECISIONS.md` solo se serve tracciare scelte (es. schema dati, compatibilità).

Assunzioni operative:
- Esiste una categoria/submenù “GitHub” (nome case-insensitive).
- Esiste già il rendering webview dei pulsanti e un modello dati “button”.

---

## STEP 001 — UX: GitHub buttons → tiles verticali 1-per-riga (layout come reference)
- Status: DONE
- Goal: Nel submenù/categoria GitHub i pulsanti non sono più “square grid”, ma tiles verticali (una per riga) con layout:
  - box esterno con `border-radius: 5px`
  - colonna sinistra: icon (area dedicata)
  - colonna destra: title (riga 1) + description (riga 2)
- Scope:
  - Webview HTML/CSS/JS che renderizza la categoria GitHub
  - Solo styling/layout del submenù GitHub (altre categorie invariate)
- Changes:
  - Aggiungere classi CSS dedicate (es. `.github-tile`, `.github-tile__icon`, `.github-tile__content`, `.github-tile__title`, `.github-tile__desc`)
  - Forzare layout 1-colonna per GitHub (flex/ grid) e spacing coerente
  - Border esterno arrotondato: `border-radius: 5px;`
  - Garantire che click/hover/focus continuino a funzionare (no regress su handler)
- Commands:
  - `npm run compile`
  - Manuale: F5 (Extension Development Host) → apri workspace → apri sidebar → verifica GitHub tiles render e interazioni
- Acceptance criteria:
  - In GitHub: ogni azione appare come tile 1-per-riga con icon/title/description come reference
  - Border esterno arrotondato visibile (`5px`)
  - Nessun flicker evidente su CRUD (add/edit/delete) dentro GitHub
  - Altre categorie mantengono layout attuale
- Commit message:
  - `feat(ui): render GitHub buttons as vertical tiles with icon/title/description`
- What changed:
  - Nel rendering webview è stata aggiunta una variante dedicata alla categoria GitHub (match per `id/label` case-insensitive) con layout 1-colonna.
  - Introdotte classi CSS specifiche `.github-tile*` con `border-radius: 5px`, area icona a sinistra e area testo (title + description) a destra.
  - Le altre categorie continuano a usare il layout grid attuale senza modifiche.
  - Handler click/menu dei pulsanti GitHub restano invariati (`execute`/`menu` via `postMessage`).
- Files touched:
  - `src/extension.ts`
  - `AI/AI_TASKS.md`
- Commands run:
  - `npm run compile` (PASS)
  - `F5 / Run Extension` (manuale richiesto, non eseguito via CLI)

---

## STEP 002 — Modello dati: aggiungere supporto a `icon` e `description` (retrocompatibile)
- Status: DONE
- Goal: Abilitare title/description/icon per le tiles GitHub senza rompere config esistenti.
- Scope:
  - Modello dati dei button (type/interface)
  - Migrazione/normalizzazione config esistente (se presente)
  - Webview render (lettura campi)
- Changes:
  - Estendere lo schema button con campi opzionali:
    - `title` (o usare `label` come fallback)
    - `description` (string opzionale)
    - `icon` (string opzionale: emoji o codicon-name/placeholder a discrezione, senza nuove deps)
  - Normalizzazione: se mancano campi, usare fallback sicuri:
    - title = `title ?? label ?? "Untitled"`
    - description = `description ?? ""`
    - icon = `icon ?? ""`
  - Aggiornare render GitHub per mostrare title/description/icon (senza crash se vuoti)
- Commands:
  - `npm run compile`
  - `npm test` (se presente)
- Acceptance criteria:
  - Config esistenti si caricano senza errori
  - GitHub tiles mostrano title/description/icon quando presenti; quando assenti non rompono UI
- Commit message:
  - `refactor(core): extend button schema with optional icon and description`
- What changed:
  - Esteso il modello `CommandButton` con campi opzionali `title` e `description`, mantenendo compatibilità con `label`.
  - In `resolveCategoriesFromConfig` aggiunta normalizzazione retrocompatibile: fallback su `title/label`, `description` e `icon` sempre sicuri.
  - Aggiornato il render webview per leggere `title/description` sulle tiles GitHub senza crash quando i campi non sono presenti.
  - Aggiunti test unitari sui fallback (`title ?? label ?? "Untitled"`, `description ?? ""`, `icon ?? ""`).
- Files touched:
  - `src/extension.ts`
  - `src/test/extension.test.ts`
  - `AI/AI_TASKS.md`
- Commands run:
  - `npm run compile` (PASS)
  - `npm test` (PASS)

---

## STEP 003 — Esecuzione in terminale: introdurre `terminalCommand` (push/pull/fetch devono usare terminale)
- Status: DONE
- Goal: Permettere a un button di eseguire un comando nel terminale VS Code (non solo `vscode.commands.executeCommand`).
- Scope:
  - Logica di esecuzione del click (provider/extension runtime)
  - Gestione terminale (creazione/riuso) e cwd (workspace folder)
- Changes:
  - Introdurre supporto a button “terminal action” (minimo):
    - nuovo campo opzionale: `terminalCommand: string`
    - se presente: aprire/riusare un terminale dedicato (nome stabile, es. `Custom Button Manager`)
    - impostare `cwd` sulla prima workspace folder (se presente), altrimenti fallback a default
    - eseguire con `terminal.sendText(terminalCommand, true)`
  - Gestione errori:
    - se non c’è workspace folder: mostrare messaggio “Apri una cartella workspace…” (coerente con stile progetto)
- Commands:
  - `npm run compile`
  - Manuale: EDH → click su un button terminalCommand → terminale si apre e comando parte
  - `npm test` (aggiungere/aggiornare test se suite disponibile)
- Acceptance criteria:
  - Un button con `terminalCommand` lancia davvero il comando nel terminale (apre terminale se non esiste)
  - Non interferisce con i button “command id” già esistenti
  - Nessun crash quando workspace non è aperta: messaggio utente chiaro
- Commit message:
  - `feat(core): support terminalCommand buttons executed via VS Code terminal`
- What changed:
  - Esteso `CommandButton` con campo opzionale `terminalCommand` e introdotta `executeButtonAction` per instradare correttamente azioni terminale vs command-id.
  - In `CommandViewProvider.executeButton` aggiunta esecuzione terminale con riuso/creazione terminale dedicato (`Custom Button Manager`) e `cwd` sulla prima workspace folder.
  - Aggiunta gestione errore esplicita quando manca una workspace folder aperta (`Apri una cartella workspace...`) senza crash.
  - I pulsanti esistenti basati su `command` continuano a usare `vscode.commands.executeCommand`.
- Files touched:
  - `src/extension.ts`
  - `src/test/extension.test.ts`
  - `AI/AI_TASKS.md`
- Commands run:
  - `npm run compile` (PASS)
  - `npm test` (PASS)
  - `F5 / Run Extension` (manuale richiesto, non eseguito via CLI)

---

## STEP 004 — Default GitHub actions: aggiungere push/pull/fetch preconfigurate
- Status: TODO
- Goal: Nel submenù GitHub, creare di default le tiles base:
  - `Git Fetch` → `git fetch`
  - `Git Pull` → `git pull`
  - `Git Push` → `git push`
- Scope:
  - Inizializzazione config di default / seed categories
  - Categoria GitHub (case-insensitive)
  - Campi icon/title/description + terminalCommand
- Changes:
  - Seed di default (solo se mancano):
    - se la categoria GitHub non esiste: crearla con questi 3 button
    - se esiste ma mancano uno o più tra fetch/pull/push: aggiungerli senza duplicare
  - Definire tiles con:
    - icon: (emoji o placeholder) per differenziare visivamente
    - title: `Fetch` / `Pull` / `Push`
    - description: breve (es. “Aggiorna refs”, “Scarica e unisci”, “Invia commit al remoto”)
    - terminalCommand: `git fetch` / `git pull` / `git push`
- Commands:
  - `npm run compile`
  - Manuale: EDH → apri GitHub → verificare presenza tiles default → click → terminale esegue comando
- Acceptance criteria:
  - Prima install/run su workspace nuova: GitHub mostra fetch/pull/push senza configurazione manuale
  - Nessun duplicato se l’utente ha già button simili
  - Click su ciascuna tile esegue il comando in terminale (cwd workspace)
- Commit message:
  - `feat(defaults): add GitHub default tiles for fetch/pull/push`

---

## STEP 005 — QA: smoke checklist per tiles GitHub + git actions
- Status: TODO
- Goal: Rendere ripetibile la validazione manuale (UI) e ridurre rischio regressioni.
- Scope:
  - `AI/CHECKLISTS/SMOKE.md`
  - (opzionale) `AI/AI_RUNBOOK.md` (sezione “Manual smoke - Extension Development Host”)
  - `AI/KNOWLEDGE.yaml`
- Changes:
  - Aggiungere checklist “3 minuti”:
    1) `npm run compile`
    2) F5 → Extension Development Host
    3) apri una workspace folder con un repo git
    4) apri sidebar → sezione GitHub
    5) verifica tiles 1-per-riga + border-radius 5px + icon/title/description
    6) click Fetch/Pull/Push → terminale si apre e lancia comando (cwd corretto)
    7) CRUD button in GitHub: add/edit/delete senza flicker evidente e senza perdere handler click
- Commands:
  - `npm run compile`
  - `npm test` (se presente)
- Acceptance criteria:
  - Checklist aggiornata e chiara (ripetibile da terzi)
  - Eseguita almeno una volta dopo STEP 001–004
- Commit message:
  - `docs(smoke): add manual checks for GitHub tiles and git terminal actions`

---
