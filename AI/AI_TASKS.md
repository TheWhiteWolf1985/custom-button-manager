# AI_TASKS

### STEP 001 - Setup contesto AI
- Status: DONE
- Goal: compilare i file base del kit AI con informazioni reali del repository e rimuovere i placeholder obbligatori.
- Scope: `AI/AI_PROJECT.md`, `AI/AI_PRD.md`, `AI/AI_CONVENTIONS.md`, `AI/AI_RUNBOOK.md`, `AI/AI_INVENTORY.md`, `AI/METADATA.yaml`, `AI/AI_TASKS.md`, `AI/KNOWLEDGE.yaml`, `AI/DECISIONS.md`.
- Changes:
  - Analisi completa repository (config, sorgenti, docs, debug setup).
  - Compilazione documentazione AI contestuale al progetto `custom-command-sidebar`.
  - Inizializzazione knowledge graph con entita' e relazioni principali dell'estensione.
- Commands:
  - `rg --files`
  - `Get-Content` su file sorgente/config/docs principali
- Acceptance criteria:
  - Nessun placeholder obbligatorio nei file AI core modificati nello step.
  - Inventario repository e runbook aderenti agli script reali di `package.json`.
  - `AI/KNOWLEDGE.yaml` contiene entita' e relazioni non vuote.
- Commit message:
  - "chore(ai): initialize AI context files"

### STEP 002 - Verifica build/dev
- Status: DONE
- Goal: validare i comandi operativi minimi del progetto senza introdurre modifiche funzionali.
- Scope: verifica dipendenze e quality gates tecnici disponibili da script npm.
- Changes:
  - Eseguita installazione dipendenze (`npm install`) con lockfile aggiornato automaticamente.
  - Eseguita build completa (`npm run compile`) con typecheck + lint + bundling esbuild.
  - Registrato limite: debug host/test host restano verifiche manuali in ambiente VS Code GUI.
- Commands:
  - `npm install`
  - `npm run compile`
- Acceptance criteria:
  - `npm install` completato senza errori bloccanti.
  - `npm run compile` completato con exit code 0.
  - Esiti registrati in `AI_TASKS.md` e `AI/KNOWLEDGE.yaml`.
- Commit message:
  - "chore(ai): verify build and dev commands"

### STEP 003 - Audit finale AI
- Status: DONE
- Goal: chiudere checklist AI con tracciamento decisioni/knowledge e validazione placeholder.
- Scope: `AI/AI_TASKS.md`, `AI/KNOWLEDGE.yaml`, `AI/DECISIONS.md` e controllo placeholder in tutta `AI/`.
- Changes:
  - Aggiornati status step a `DONE`.
  - Verificata assenza placeholder obbligatori in tutta la cartella `AI/`.
  - Consolidati rischi residui e verifiche manuali richieste.
- Commands:
  - `rg "placeholder obbligatori" AI`
  - `git status --short`
- Acceptance criteria:
  - Nessun placeholder obbligatorio trovato in `AI/`.
  - Tutti gli step marcati `DONE`.
  - `AI/KNOWLEDGE.yaml` aggiornato con change log completo.
- Commit message:
  - "chore(ai): complete AI audit and close tasks"

