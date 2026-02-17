# AI_INVENTORY

## Cosa esiste (componenti)
- Estensione VS Code TypeScript con bundle Node (`dist/extension.js`) e sorgente principale in `src/extension.ts`.
- View container activity bar `myCommandSidebar` con webview `myCommandSidebar.view`.
- Comandi dichiarati in `package.json`:
  - `custom-command-sidebar.helloWorld`
  - `myCommandSidebar.addButton`
- Configurazione extension:
  - `myCommandSidebar.categories` (array categorie + pulsanti)
  - Legacy fallback: `myCommandSidebar.buttons`
- Build tooling:
  - `esbuild.js` per bundling
  - `tsconfig.json` per typecheck
  - `eslint.config.mjs` per lint
- Test scaffolding base in `src/test/extension.test.ts`.

## Script npm disponibili
- `compile`, `package`, `vscode:prepublish`
- `watch`, `watch:esbuild`, `watch:tsc`
- `check-types`, `lint`
- `compile-tests`, `watch-tests`, `pretest`, `test`

## Entry points e logica
- Entry runtime extension: `dist/extension.js` (da `src/extension.ts`).
- Activation events: `onView:myCommandSidebar.view`, `onCommand:myCommandSidebar.addButton`.
- Logica principale:
  - gestione webview + rendering HTML inline
  - persistenza categorie/pulsanti su workspace config
  - esecuzione comandi via `vscode.commands.executeCommand`

## Debug e packaging
- Debug host: `.vscode/launch.json` configurazione `Run Extension`.
- Packaging exclude list: `.vscodeignore`.

## Cosa NON assumere
- Nessuna API backend remota.
- Nessun database o migrazione strutturata.
- Nessun test end-to-end completo gia' presente.
- Nessuna pipeline CI dichiarata nella repo.

## Integrazioni consentite/vietate
- Consentite: API ufficiali VS Code (`vscode`), risorse locali estensione (`media/*`).
- Vietate/non presenti: CDN runtime, fetch di asset esterni, salvataggi su servizi cloud da codice estensione.

## Confini (in/out scope)
- In scope: documentazione AI, verifiche build/lint/typecheck e mappa tecnica.
- Out scope: feature nuove UI/UX, modifica comportamento runtime non richiesta.
