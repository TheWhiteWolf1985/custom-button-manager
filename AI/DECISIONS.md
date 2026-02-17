# DECISIONS

## ADR 001
- Date: 2026-02-17
- Context: La richiesta e' inizializzare il contesto AI senza modificare la logica applicativa dell'estensione.
- Decision: Limitare l'intervento ai file del kit `AI/` e alle verifiche tecniche minime (`npm install`, `npm run compile`) gia' previste dagli script esistenti.
- Alternatives:
  - Aggiornare anche `README.md` applicativo e test funzionali nello stesso ciclo.
- Consequences:
  - Setup AI rapido e tracciabile con rischio basso.
  - Resta lavoro futuro su documentazione utente finale e test funzionali estesi.

## ADR 002
- Date: 2026-02-17
- Context: Il debug dell'estensione e l'esecuzione test VS Code richiedono Extension Host/GUI non sempre automatizzabile da shell.
- Decision: Documentare nel runbook i passi manuali (`F5`, smoke in Extension Development Host) e mantenere la verifica automatica su build/lint/typecheck.
- Alternatives:
  - Forzare `npm test` anche in ambienti non predisposti.
- Consequences:
  - Verifiche CLI affidabili e ripetibili.
  - Necessita' di un controllo manuale aggiuntivo per scenari UI/host.

## ADR 003
- Date: 2026-02-17
- Context: Durante il bootstrap AI restano aree non deducibili con certezza (branch policy, comandi Python/Docker/Makefile).
- Decision: Mantenere placeholder `<<REQUIRED>>` nei documenti coinvolti e tracciare i TODO residui in `AI/KNOWLEDGE.yaml`.
- Alternatives:
  - Compilare comunque sezioni mancanti con convenzioni generiche non verificate.
- Consequences:
  - Nessuna informazione inventata nei file AI.
  - Resta un backlog esplicito da completare quando la repository includera' policy/tooling aggiuntivo.

## ADR 004
- Date: 2026-02-17
- Context: La UX mostrava testi misti IT/EN in prompt, validazioni e menu webview.
- Decision: Uniformare i messaggi utente in italiano, mantenendo invariati i command id tecnici.
- Alternatives:
  - Lasciare stringhe miste per evitare ritocchi testuali.
- Consequences:
  - Esperienza utente piu' coerente nel flusso add/edit/delete/execute.
  - Richiede aggiornare eventuali documentazioni future che citano messaggi runtime letterali.
