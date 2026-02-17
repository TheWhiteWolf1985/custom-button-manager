# AI_TASKS — Bootstrap contenuti AI/ in repo esistente (struttura già creata)

> **Assunzione**: la cartella `AI/` esiste già con la struttura standard e i file presenti.  
> **Obiettivo**: Codex deve **solo aggiornare/compilare i contenuti dei file** in `AI/` usando informazioni **certe** trovate nella repo (e nelle doc esistenti), senza inventare.  
> **Regola anti-invenzione**: se un dato non è presente o non è deducibile con certezza → usare `<<REQUIRED>>` / `<<OPTIONAL>>` e registrare il TODO in `AI/KNOWLEDGE.yaml` (changes_log).

---

## STEP 001 — Preflight: lettura standard e verifica file AI/
- Status: DONE
- Goal: Capire lo standard leggendo `AI/README.md` e verificare che tutti i file standard esistano (senza crearli).
- Scope:
  - `AI/README.md`
  - Tutti i file standard dentro `AI/` (PROJECT, PRD, TASKS, RUNBOOK, CONVENTIONS, INVENTORY, DECISIONS, KNOWLEDGE, CHECKLISTS, SCHEMAS)
- Changes:
  - **NON creare** file/cartelle.
  - Se mancano file standard: elencarli in output e segnare `<<REQUIRED>>` nel report (vedi STEP 007). **Non proseguire** se mancano file chiave (`AI/README.md`, `AI/AI_PROJECT.md`, `AI/AI_PRD.md`, `AI/AI_RUNBOOK.md`, `AI/AI_TASKS.md`, `AI/KNOWLEDGE.yaml`).
- Commands:
  - (bash) `ls -la AI && find AI -maxdepth 3 -type f -print`
  - (pwsh) `Get-ChildItem AI -Recurse -Force | Select-Object FullName,Length`
- Acceptance criteria:
  - `AI/README.md` letto e compreso.
  - Lista completa dei file standard presenti/mancanti prodotta (senza creare nulla).
- Commit message:
  - "docs(ai): preflight AI standard check"
- What changed:
  - Letto `AI/README.md` e verificata la presenza dei file standard in `AI/` senza creare nuove risorse.
---

## STEP 002 — Scansione repo: tooling, comandi reali, entrypoint, doc esistenti
- Status: DONE
- Goal: Raccogliere segnali **certi** per compilare `RUNBOOK`, `METADATA`, `INVENTORY`, `PRD`, senza supposizioni.
- Scope:
  - Root e cartelle principali della repo
  - Indicatori tooling: `package.json`, lockfile, `pyproject.toml`, `requirements.txt`, `Dockerfile`, `docker-compose*`, `Makefile`, `pom.xml`, `build.gradle*`, `go.mod`, `Cargo.toml`, `*.sln`, `*.csproj`
  - Doc: `README*`, `docs/`, `openapi.*`, `swagger.*`, `api*.yaml|yml|json`, `schema.sql`, `migrations/`, `db/`, `infra/`
- Changes:
  - Nessuna modifica ancora ai file AI/: solo raccolta evidenze (paths + estratti utili).
  - Preparare una lista “EVIDENZE” (file → cosa contiene) da riversare nel changes_log di `AI/KNOWLEDGE.yaml`.
- Commands:
  - (bash) `ls -la`
  - (bash) `find . -maxdepth 4 -type f \( -name "package.json" -o -name "pyproject.toml" -o -name "requirements.txt" -o -name "Dockerfile" -o -name "docker-compose*.yml" -o -name "docker-compose*.yaml" -o -name "Makefile" -o -name "go.mod" -o -name "Cargo.toml" -o -name "pom.xml" -o -name "build.gradle" -o -name "build.gradle.kts" -o -name "*.sln" -o -name "*.csproj" \) -print`
  - `rg -n "openapi|swagger|FastAPI|Uvicorn|SQLAlchemy|alembic|docker-compose|kubernetes|flutter|platformio|ble" -S .`
  - Se esiste `package.json`: leggere scripts (`cat package.json` / `Get-Content package.json`)
- Acceptance criteria:
  - Elenco indicatori tooling trovato (o vuoto) + riferimenti alle doc/API/schema/migrations se presenti.
- Commit message:
  - "docs(ai): collect repo evidence for AI files"
- What changed:
  - Raccolte evidenze certe su tooling e documentazione presenti in repo (`package.json`, `package-lock.json`, `README.md`, `CHANGELOG.md`, `.vscode/launch.json`, `src/extension.ts`).

---

## STEP 003 — Compilazione completa: AI/METADATA.yaml
- Status: DONE
- Goal: Compilare `AI/METADATA.yaml` usando solo dati certi (repo name, remote se presente, stack dedotto da indicatori).
- Scope: `AI/METADATA.yaml`
- Changes:
  - Compilare campi con evidenza:
    - `project_name`: (se certo) nome repo/cartella root
    - `repo_url`: (se `.git` e origin presente) URL origin
    - `stack_summary`: basato su indicatori (es. Node/FastAPI/Docker ecc.)
    - `created_at/updated_at`: usare date attuali solo se previste dal file; altrimenti `<<OPTIONAL>>`
  - Tutto il resto resta `<<REQUIRED>>`/`<<OPTIONAL>>` se non certo.
- Commands:
  - Se `.git` esiste: `git remote -v` / `git rev-parse --show-toplevel`
- Acceptance criteria:
  - `AI/METADATA.yaml` compilato con info certe + placeholders dove serve.
- Commit message:
  - "docs(ai): compile metadata"
- What changed:
  - Compilato `repo_url` da `git remote -v` e confermati `project_name`/`stack_summary` su evidenze di repository.

---

## STEP 004 — Compilazione completa: AI/AI_RUNBOOK.md (comandi reali)
- Status: DONE
- Goal: Compilare `AI/AI_RUNBOOK.md` con comandi **reali** trovati nella repo, senza inventare.
- Scope: `AI/AI_RUNBOOK.md`
- Changes:
  - Se Node: usare `package.json` scripts (dev/build/test/lint/typecheck/format) se esistono.
  - Se Python: leggere doc/pyproject/requirements e indicare comandi solo se espliciti.
  - Se Docker: indicare presenza di Dockerfile/compose e i comandi solo se documentati.
  - Se Makefile: elencare target esistenti (senza interpretarli).
  - Se comandi non deducibili: lasciare `<<REQUIRED>>` e aggiungere TODO in `AI/KNOWLEDGE.yaml`.
- Commands:
  - Lettura `package.json` / Makefile / doc presenti
  - (bash) `rg -n "npm run|pnpm|yarn|pytest|uvicorn|fastapi|docker compose|docker-compose|make " -S README* docs -g'!*node_modules/*'`
- Acceptance criteria:
  - Runbook contiene solo comandi supportati da file reali.
  - Ogni sezione non compilabile ha `<<REQUIRED>>` + TODO tracciato in KNOWLEDGE.
- Commit message:
  - "docs(ai): compile runbook from repo tooling"
- What changed:
  - Verificati i comandi reali da `package.json`/`README.md` e aggiunti placeholder `<<REQUIRED>>` per sezioni non deducibili (Python, Docker, Makefile).

---

## STEP 005 — Compilazione completa: AI/AI_INVENTORY.md + AI/AI_CONVENTIONS.md
- Status: DONE
- Goal: Popolare inventario e convenzioni con info esplicite (da repo/doc), senza assunzioni.
- Scope:
  - `AI/AI_INVENTORY.md`
  - `AI/AI_CONVENTIONS.md`
- Changes:
  - INVENTORY:
    - elencare componenti/moduli/cartelle principali (solo “cosa esiste”, non “cosa fa” se non documentato)
    - integrare con informazioni esplicite trovate in doc/AI_old (se presenti in repo) o README
  - CONVENTIONS:
    - se esistono regole commit (CONTRIBUTING, doc, pattern commit history), riportarle
    - se non esistono evidenze, lasciare `<<REQUIRED>>` per “commit style” e “testing conventions”
- Commands:
  - `ls`/`find` root dirs
  - `rg -n "conventional commits|commit message|lint|format|prettier|eslint|black|ruff|flake8|mypy|pytest" -S .`
  - (opzionale, non distruttivo) `git log -n 30 --pretty=oneline` se git presente (solo per osservare pattern)
- Acceptance criteria:
  - INVENTORY descrive ciò che esiste senza interpretazioni non supportate.
  - CONVENTIONS contiene solo standard supportati o placeholders.
- Commit message:
  - "docs(ai): compile inventory and conventions"
- What changed:
  - Verificate cartelle/componenti esistenti in `AI_INVENTORY.md` e aggiornate convenzioni con placeholder `<<REQUIRED>>` dove non esiste policy esplicita (branch naming).

---

## STEP 006 — Compilazione completa: AI/AI_PROJECT.md + AI/AI_PRD.md
- Status: DONE
- Goal: Compilare obiettivi/vincoli (PROJECT) e specifiche (PRD) usando doc esistenti nella repo.
- Scope:
  - `AI/AI_PROJECT.md`
  - `AI/AI_PRD.md`
- Changes:
  - AI_PROJECT:
    - Obiettivi, non-obiettivi, vincoli, DoD, quality gates, sicurezza/privacy, logging/observability
    - Solo se supportati da README/docs/config; altrimenti placeholders
  - AI_PRD:
    - Overview/scope
    - Flussi e requisiti (UI se esiste frontend, API se esiste backend)
    - Contratti API se presenti (OpenAPI/Swagger/YAML)
    - Data model se presenti migrazioni/schema
    - Error handling + osservabilità se documentati
    - Test plan: derivare da runbook/scripts (solo se certi)
- Commands:
  - Lettura README/docs
  - Ricerca `openapi|swagger|schema|migration|alembic|models|routes|endpoints` con `rg`
- Acceptance criteria:
  - PROJECT e PRD sono compilati con informazioni supportate e hanno placeholders dove mancano dati.
  - Nessuna “feature” o requisito inventato.
- Commit message:
  - "docs(ai): compile project and prd"
- What changed:
  - Verificata coerenza di `AI/AI_PROJECT.md` e `AI/AI_PRD.md` con README/config/codebase corrente; nessun contenuto aggiuntivo necessario oltre alle evidenze già presenti.

---

## STEP 007 — Normalizzazione: AI/DECISIONS.md + AI/KNOWLEDGE.yaml (tracciabilità + TODO)
- Status: DONE
- Goal: Garantire tracciabilità (decisioni) e memoria esterna (knowledge) includendo evidenze, TODO e una entry “bootstrap”.
- Scope:
  - `AI/DECISIONS.md`
  - `AI/KNOWLEDGE.yaml`
- Changes:
  - DECISIONS:
    - Se esistono decisioni esplicite in docs/repo, riportarle in formato ADR.
    - Se non ci sono, lasciare template + “Nessuna decisione rilevata (bootstrap)”.
  - KNOWLEDGE:
    - Assicurare YAML valido e schema coerente (meta/entities/relations/changes_log).
    - Aggiungere in `changes_log` una entry: `bootstrap_ai_kit_from_repo` con:
      - sources_used: lista file/paths letti (README, package.json, openapi, migrations…)
      - summary: cosa è stato compilato
      - todo_required: elenco placeholders <<REQUIRED>> rimasti (file → campo)
- Commands:
  - Validazione YAML (se disponibile):
    - `python -c "import yaml; yaml.safe_load(open('AI/KNOWLEDGE.yaml','r',encoding='utf-8'))"` (solo se PyYAML installato)
    - altrimenti: controllo manuale e nota “YAML parser non disponibile”
- Acceptance criteria:
  - KNOWLEDGE.yaml è valido e contiene entry changes_log bootstrap + TODO.
  - DECISIONS coerente e non inventato.
- Commit message:
  - "docs(ai): normalize decisions and knowledge"
- What changed:
  - Aggiornati `AI/DECISIONS.md` (ADR bootstrap) e `AI/KNOWLEDGE.yaml` con entry `bootstrap_ai_kit_from_repo`, TODO `<<REQUIRED>>` residui e nota fallback per validazione YAML senza PyYAML.

---

## STEP 008 — Validazioni finali + audit (senza diff)
- Status: TODO
- Goal: Garantire che i file AI siano coerenti e pronti per essere usati dal Product Engineer.
- Scope:
  - `AI/` (tutti i file)
- Changes:
  - Validare JSON schema in `AI/SCHEMAS/*.json` (parse ok).
  - Verificare che `AI/README.md` descriva correttamente i file presenti.
  - Verificare assenza riferimenti a “templates/init-ai-kit”.
  - Produrre audit finale in output (console) e, se previsto dallo standard del progetto, aggiornare una sezione “Audit” in `AI/KNOWLEDGE.yaml` (solo se già prevista).
- Commands:
  - `rg -n -i "templates|init-ai-kit|AI_old" AI`
  - Parse JSON:
    - `python -c "import json,glob; [json.load(open(p,'r',encoding='utf-8')) for p in glob.glob('AI/SCHEMAS/*.json')]; print('OK')"` (se python disponibile)
  - Tree AI:
    - `find AI -maxdepth 3 -type f -print` / `Get-ChildItem AI -Recurse`
- Acceptance criteria:
  - Nessun riferimento a template/init.
  - JSON parse OK.
  - Audit stampato con: file modificati, comandi letti, TODO rimasti.
- Commit message:
  - "docs(ai): finalize ai docs bootstrap"

---

## Audit finale atteso (da stampare in output, NO DIFF)
- Stato: “BOOTSTRAP AI COMPLETATO”
- Stack/tooling rilevati: (bullet)
- File AI aggiornati: (lista percorsi)
- Evidenze usate: (top 10 file/paths)
- TODO rimasti (<<REQUIRED>>): (lista file → campo)
- Comandi reali raccolti (runbook): (lista)

