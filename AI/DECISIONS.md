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
