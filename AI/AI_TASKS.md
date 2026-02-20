# AI_TASKS — UI tiles globali + categoria AI + onboarding + menu categorie + nuova icona

Obiettivo: applicare UX “tiles verticali” a tutte le categorie, rinominare “Preferiti” → “AI”, aggiungere azioni default (starter pack minimo), introdurre gestione categorie (Add Category + menu ⋮), e migliorare icona estensione.  
Vincoli/Decisioni (da utente):
- Riutilizzare ESATTAMENTE lo stesso componente/CSS delle tiles già fatto per GitHub (niente reinventare).
- Icone: Codicons (no dipendenze esterne).
- Description: opzionale.
- Nomi categorie: unici (case-insensitive). Se duplicato → errore e stop (niente auto-suffix).
- Nomi pulsanti: unici dentro la categoria (case-insensitive). Se duplicato → errore e stop.
- AI structure: click → lancia script PowerShell che crea cartelle+file con contenuto; se `AI/` esiste → rinomina la cartella top-level in `AI_new` (senza “disastri” interni).
- Menu categorie: usare ⋮ e QuickPick; delete con conferma “hard” se categoria non vuota.
- Icona estensione: techy, monochrome.

---

## STEP 001 — UI/UX: tiles verticali per TUTTE le categorie (riuso 1:1 del componente GitHub)
- Status: DONE
- Goal: sostituire ovunque i pulsanti “quadrati” con tiles verticali 1-per-riga identiche a GitHub (stesso CSS/componente).
- Scope:
  - Webview render (HTML/CSS/JS) di tutte le categorie
  - Styling: riuso classi già esistenti delle tiles GitHub
- Changes:
  - Rendere il renderer “tile” il default per ogni categoria (non solo GitHub).
  - Assicurare `border-radius: 5px` sul contenitore esterno (come già definito nel componente tiles).
  - Icon area a sinistra (Codicon), title sopra, description sotto (description opzionale: se vuota non occupa spazio).
  - Nessun cambio di UX funzionale (click/CRUD invariati).
- Commands:
  - `npm run compile`
  - Manuale: F5 (Extension Development Host) → apri workspace → verifica rendering tiles su tutte le categorie
- Acceptance criteria:
  - Tutte le categorie usano tiles verticali 1-per-riga, identiche alla tile GitHub già implementata
  - Nessuna regressione su click/CRUD
- Commit message:
  - `feat(ui): use existing tile component as default layout for all categories`
- What changed:
  - Il renderer webview usa ora il componente tile verticale già esistente come default per tutte le categorie.
  - Le tiles sono sempre 1-per-riga con `border-radius: 5px`, icona a sinistra e blocco title/description a destra.
  - La description resta opzionale: se vuota non viene renderizzata.
  - Nessuna modifica al flusso funzionale click/CRUD (`execute`/`menu` invariati).
- Files touched:
  - `src/extension.ts`
  - `AI/AI_TASKS.md`
- Commands run:
  - `npm run compile` (PASS)
  - `F5 / Run Extension` (manuale richiesto, non eseguito via CLI)

---

## STEP 002 — Rinominare “Preferiti” → “AI” (refactor semplice, no migrazione complessa)
- Status: DONE
- Goal: sostituire naming in UI e seed defaults: categoria “Preferiti” diventa “AI”.
- Scope:
  - Seed categorie default / label UI
  - Eventuali stringhe hardcoded e test snapshot (se presenti)
- Changes:
  - Rinominare tutte le occorrenze di “Preferiti” in “AI”.
  - Se esiste logica di seed iniziale: creare “AI” invece di “Preferiti”.
  - (Dato che è in test) niente migrazione elaborata: il rename è sufficiente.
- Commands:
  - `npm run compile`
  - Manuale: EDH → verifica che la categoria esca come “AI”
- Acceptance criteria:
  - “Preferiti” non compare più in UI né nei default
  - “AI” compare al suo posto
- Commit message:
  - `chore(ui): rename default category Preferiti to AI`
- What changed:
  - Rinominata la categoria default runtime da `Preferiti` a `AI` (`id: ai`, `label: AI`).
  - Aggiornata anche la default configuration dichiarata in `package.json` (`myCommandSidebar.categories`).
  - Allineata la migrazione legacy (`buttons`) per creare la categoria `AI` invece di `Preferiti`.
  - Test aggiornato sul valore `id` della prima categoria migrata.
- Files touched:
  - `src/extension.ts`
  - `package.json`
  - `src/test/extension.test.ts`
  - `AI/AI_TASKS.md`
- Commands run:
  - `npm run compile` (PASS)
  - `F5 / Run Extension` (manuale richiesto, non eseguito via CLI)

---

## STEP 003 — Validazione unicità (case-insensitive) per categorie e pulsanti
- Status: TODO
- Goal: bloccare creazione/rename se il nome è già presente (categorie globali; pulsanti dentro categoria).
- Scope:
  - Flussi: add category, rename category, add button, edit/rename button (se esiste)
- Changes:
  - Implementare check case-insensitive:
    - categoria: `trim().toLowerCase()` su tutte le categorie esistenti
    - pulsante: confronto su `title` (fallback `label`) dentro la categoria
  - In caso di collisione: mostrare errore e non salvare nulla.
- Commands:
  - `npm run compile`
  - `npm test` (se suite presente)
  - Manuale: provare duplicati (stesso nome con case diversa)
- Acceptance criteria:
  - Non è possibile creare/renominare categorie con nome duplicato (case-insensitive)
  - Non è possibile creare/renominare pulsanti duplicati dentro la stessa categoria (case-insensitive)
- Commit message:
  - `fix(core): enforce case-insensitive uniqueness for categories and buttons`

---

## STEP 004 — Pulsante globale “Aggiungi categoria” in cima (sotto header estensione)
- Status: TODO
- Goal: aggiungere un controllo globale sempre visibile “Aggiungi categoria”.
- Scope:
  - Webview top area (header)
  - Handler lato extension (creazione categoria)
- Changes:
  - Inserire pulsante “Aggiungi categoria” sotto il titolo/nome estensione.
  - Click → input nome → validazione unicità (STEP 003) → crea categoria vuota.
  - Se nome duplicato: errore e non creare.
- Commands:
  - `npm run compile`
  - Manuale: EDH → aggiungi categoria nuova; prova duplicato
- Acceptance criteria:
  - Pulsante visibile e funzionante
  - Validazione unicità rispettata
- Commit message:
  - `feat(ui): add global Add Category action in header`

---

## STEP 005 — Header categoria: sostituire “+” con menu ⋮ (QuickPick: Elimina / Rinomina / Aggiungi pulsante)
- Status: TODO
- Goal: rimuovere il pulsante “+” dall’accordion header e sostituirlo con ⋮; azioni via menu contestuale con iconografia standard.
- Scope:
  - Webview accordion header
  - Handler lato extension: menu QuickPick e azioni
- Changes:
  - Rimuovere icona/azione “+” dal header.
  - Aggiungere ⋮ (vertical ellipsis) per ogni categoria.
  - Click su ⋮ → QuickPick con:
    - `Aggiungi pulsante`
    - `Rinomina`
    - `Elimina`
  - Elimina:
    - se categoria contiene pulsanti → conferma hard con conteggio
    - se confermato → elimina categoria e relativi pulsanti
  - Rinomina:
    - input nome → validazione unicità (STEP 003)
  - Aggiungi pulsante:
    - richiama il flusso già esistente “add button” dentro quella categoria
- Commands:
  - `npm run compile`
  - Manuale: EDH → apri menu ⋮ → prova rename/delete/add
- Acceptance criteria:
  - “+” non è più presente nel header
  - ⋮ apre QuickPick con le 3 azioni
  - Delete richiede conferma se non vuota
  - Rename blocca duplicati case-insensitive
- Commit message:
  - `feat(ui): replace header add button with kebab menu for category actions`

---

## STEP 006 — Starter pack minimo (3–5 azioni) + categorie base (AI, Workspace, GitHub, Build/Test, Utils)
- Status: TODO
- Goal: dare all’utente un set minimo subito usabile, senza riempire la sidebar di roba.
- Scope:
  - Seed defaults
  - Definizione bottoni standard (terminal vs VS Code command)
- Changes:
  - Assicurare presenza categorie default:
    - `AI`, `Workspace`, `GitHub`, `Build/Test`, `Utils`
  - Seed minimo (3–5 azioni TOTALI o comunque “minimo sindacale” per partire):
    - GitHub: `Fetch`, `Pull`, `Push` (terminal command)
    - AI: `Crea struttura AI` (vedi STEP 007)
    - (Opzionale 1 sola utility “starter”): `Reload Window` oppure `Toggle Terminal`
  - Regole seed:
    - creare solo se mancano (niente duplicati)
    - rispettare unicità case-insensitive (STEP 003)
- Commands:
  - `npm run compile`
  - Manuale: EDH su workspace “pulita” → verifica seed
- Acceptance criteria:
  - Le categorie base esistono
  - Le azioni minime sono presenti e non duplicate
  - Click sulle azioni terminal apre terminal e lancia comando (dove previsto)
- Commit message:
  - `feat(defaults): seed minimal starter actions across default categories`

---

## STEP 007 — Categoria AI: pulsante “Crea struttura AI” che lancia PowerShell script
- Status: TODO
- Goal: un pulsante in categoria AI che crea la struttura AI nel workspace attivo eseguendo uno script PowerShell.
- Scope:
  - Script PowerShell (nuovo file in repo, versionato)
  - Integrazione button → terminal execution
  - Template contenuti AI (derivati da `AI.rar`)
- Changes:
  - Inserire in repo uno script unico, es:
    - `scripts/create-ai-structure.ps1`
  - Lo script deve:
    1) determinare la workspace folder target (passata come argomento dal runner/extension)
    2) se esiste `<workspace>/AI`:
       - rinominare SOLO la cartella top-level in `AI_new`
       - **se `AI_new` esiste già**, usare un suffix sicuro tipo `AI_new_2`, `AI_new_3`, ...
    3) creare la struttura cartelle+file con contenuto, basandosi sul template derivato da `AI.rar`
  - Aggiungere/aggiornare il button default in categoria AI:
    - tile con Codicon (es. `codicon-folder-library` o simile)
    - title: `Crea struttura AI`
    - description: `Crea AI/ e i file base del kit`
    - action: lancia PowerShell in terminale con `-ExecutionPolicy Bypass -File ... -WorkspacePath ...`
  - Comportamento non-Windows:
    - mostrare errore user-friendly (“funzione disponibile solo su Windows/PowerShell”) e non fare nulla
- Commands:
  - `npm run compile`
  - Manuale (Windows): EDH → click tile → verifica creazione struttura
  - Manuale (Windows): se AI esiste → verifica rename a AI_new(+suffix)
- Acceptance criteria:
  - Click su “Crea struttura AI” crea la struttura prevista (cartelle + file con contenuto)
  - Se `AI/` esiste, viene rinominata a `AI_new` (o `AI_new_N`) senza toccare contenuti interni
  - Nessun file creato fuori workspace target
  - Non-Windows: messaggio chiaro, nessun side-effect
- Commit message:
  - `feat(ai): add PowerShell action to generate AI folder structure in workspace`
- Notes/Inputs:
  - `AI.rar` deve essere reso disponibile in repo (es. `templates/AI/` estratto) e usato come sorgente contenuti.

---

## STEP 008 — Icona estensione: nuova icona techy monochrome (sostituire “quadrato bianco”)
- Status: TODO
- Goal: sostituire l’icona attuale con una più leggibile e coerente.
- Scope:
  - Asset icona (es. `resources/icon.png` e sorgente `resources/icon.svg`)
  - `package.json` (campo `icon`)
- Changes:
  - Produrre una nuova icona monochrome, stile techy (es. tiles + simbolo comando/chevron/bolt in line art).
  - Salvare sorgente (SVG) e export PNG per VS Code Marketplace.
  - Aggiornare il path icon in `package.json`.
- Commands:
  - `npm run compile`
  - Manuale: verificare che VS Code mostri la nuova icona (Extensions view / sidebar)
- Acceptance criteria:
  - L’icona non è più un quadrato bianco pieno
  - Risulta leggibile a 16–32 px
- Commit message:
  - `chore(assets): replace extension icon with techy monochrome design`

---

## STEP 009 — Smoke checklist aggiornata (UI tiles globali + menu ⋮ + AI create structure)
- Status: TODO
- Goal: rendere verificabile in 3–5 minuti la qualità post-cambiamenti.
- Scope:
  - `AI/CHECKLISTS/SMOKE.md`
  - `AI/KNOWLEDGE.yaml`
- Changes:
  - Aggiungere checklist:
    1) F5 EDH → tutte categorie in tiles verticali
    2) “Aggiungi categoria” funziona + blocco duplicati
    3) ⋮ menu categoria: aggiungi/rename/delete (con conferma su delete)
    4) Categoria AI: “Crea struttura AI” crea struttura; se AI esiste → rename AI_new(+suffix)
    5) Starter pack presente senza duplicati
- Commands:
  - `npm run compile`
  - (manuale) F5 / Run Extension
- Acceptance criteria:
  - Checklist presente, chiara, ripetibile
  - Eseguita almeno una volta post STEP 001–008
- Commit message:
  - `docs(smoke): update checklist for global tiles, category menu, and AI bootstrap`

---
