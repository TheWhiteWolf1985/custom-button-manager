# AI_CONVENTIONS

## Commit style
- Formato consigliato: Conventional Commits.
- Commit atomici e con scope chiaro.
- Commit solo dopo verifiche previste dallo step.

Esempio:
- `chore(ai): initialize project AI context`

## Branch naming
- Pattern branch documentato nel repository: `<<REQUIRED>>` (nessun `CONTRIBUTING`/policy branch trovato).

## Naming code
- Naming coerente con standard del progetto target.
- Evitare abbreviazioni opache.
- Evitare rinomine massive non richieste.

## Test conventions
- Ogni modifica deve avere verifica associata.
- Preferire test mirati al comportamento toccato.
- Tracciare i comandi eseguiti in `AI_TASKS` e `KNOWLEDGE`.

## Guardrails
- No nuove dipendenze senza richiesta.
- No refactor non richiesto.
- No feature reintrodotte se rimosse dal progetto.
- No segreti reali.
