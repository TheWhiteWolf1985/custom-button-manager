import * as vscode from 'vscode';

type CommandButton = {
	label: string;
	title?: string;
	description?: string;
	command: string;
	terminalCommand?: string;
	icon?: string;
	args?: unknown;
};

type CommandCategory = {
	id: string;
	label: string;
	buttons: CommandButton[];
};

const CONFIG_SECTION = 'myCommandSidebar';
const CONFIG_KEY = 'categories';
const LEGACY_KEY = 'buttons';
const VIEW_ID = 'myCommandSidebar.view';
const TERMINAL_NAME = 'Custom Button Manager';

const DEFAULT_CATEGORIES: CommandCategory[] = [
	{ id: 'ai', label: 'AI', buttons: [] },
	{ id: 'workspace', label: 'Workspace', buttons: [] },
	{ id: 'github', label: 'Github', buttons: [] },
];

const GITHUB_DEFAULT_BUTTONS: CommandButton[] = [
	{
		label: 'Git Fetch',
		title: 'Fetch',
		description: 'Aggiorna refs dal remoto',
		icon: 'arrow-down',
		command: 'workbench.action.terminal.new',
		terminalCommand: 'git fetch',
	},
	{
		label: 'Git Pull',
		title: 'Pull',
		description: 'Scarica e unisci dal remoto',
		icon: 'sync',
		command: 'workbench.action.terminal.new',
		terminalCommand: 'git pull',
	},
	{
		label: 'Git Push',
		title: 'Push',
		description: 'Invia commit al remoto',
		icon: 'arrow-up',
		command: 'workbench.action.terminal.new',
		terminalCommand: 'git push',
	},
];

function normalizeButton(button: CommandButton): CommandButton {
	const title = button.title?.trim() || button.label?.trim() || 'Untitled';
	const terminalCommand = button.terminalCommand?.trim();
	return {
		...button,
		title,
		label: button.label?.trim() || title,
		description: button.description ?? '',
		icon: button.icon ?? '',
		terminalCommand: terminalCommand || undefined,
	};
}

function toNameKey(value: string | undefined): string {
	return (value || '').trim().toLowerCase();
}

function getButtonName(button: CommandButton): string {
	return button.title?.trim() || button.label?.trim() || 'Untitled';
}

export function hasCategoryNameCollision(
	categories: CommandCategory[],
	candidateName: string,
	excludeCategoryIndex?: number,
): boolean {
	const candidate = toNameKey(candidateName);
	if (!candidate) {
		return false;
	}
	return categories.some((category, index) => {
		if (index === excludeCategoryIndex) {
			return false;
		}
		return toNameKey(category.label) === candidate;
	});
}

export function hasButtonNameCollision(
	category: CommandCategory,
	candidateName: string,
	excludeButtonIndex?: number,
): boolean {
	const candidate = toNameKey(candidateName);
	if (!candidate) {
		return false;
	}
	return category.buttons.some((button, index) => {
		if (index === excludeButtonIndex) {
			return false;
		}
		return toNameKey(getButtonName(button)) === candidate;
	});
}

function isGitHubCategory(category: CommandCategory): boolean {
	return category.id?.toLowerCase() === 'github' || category.label?.toLowerCase() === 'github';
}

function ensureGitHubDefaultButtons(categories: CommandCategory[]): CommandCategory[] {
	const nextCategories = categories.map((category) => ({
		...category,
		buttons: category.buttons.map((button) => ({ ...button })),
	}));

	let githubIndex = nextCategories.findIndex(isGitHubCategory);
	if (githubIndex < 0) {
		nextCategories.push({
			id: 'github',
			label: 'Github',
			buttons: GITHUB_DEFAULT_BUTTONS.map(normalizeButton),
		});
		return nextCategories;
	}

	const githubCategory = nextCategories[githubIndex];
	const existingTerminalCommands = new Set(
		githubCategory.buttons
			.map((button) => button.terminalCommand?.trim().toLowerCase())
			.filter((value): value is string => Boolean(value)),
	);

	for (const defaultButton of GITHUB_DEFAULT_BUTTONS) {
		const key = defaultButton.terminalCommand?.toLowerCase();
		if (!key || existingTerminalCommands.has(key)) {
			continue;
		}
		githubCategory.buttons.push(normalizeButton(defaultButton));
		existingTerminalCommands.add(key);
	}

	nextCategories[githubIndex] = githubCategory;
	return nextCategories;
}

export function resolveCategoriesFromConfig(
	categories: CommandCategory[] | undefined,
	legacyButtons: CommandButton[] | undefined,
): CommandCategory[] {
	if (Array.isArray(categories) && categories.length) {
		return ensureGitHubDefaultButtons(categories.map((c, idx) => ({
			id: c.id || `cat-${idx}`,
			label: c.label || `Categoria ${idx + 1}`,
			buttons: Array.isArray(c.buttons) ? c.buttons.map(normalizeButton) : [],
		})));
	}

	// Migration: legacy flat buttons array goes into "Preferiti"
	if (Array.isArray(legacyButtons) && legacyButtons.length) {
		return ensureGitHubDefaultButtons([
			{ id: 'ai', label: 'AI', buttons: legacyButtons.map(normalizeButton) },
			{ id: 'workspace', label: 'Workspace', buttons: [] },
			{ id: 'github', label: 'Github', buttons: [] },
		]);
	}

	return ensureGitHubDefaultButtons(DEFAULT_CATEGORIES.map((c) => ({ ...c, buttons: [...c.buttons] })));
}

export async function executeButtonCommand(
	button: CommandButton,
	executor: (command: string, ...args: unknown[]) => Promise<unknown> | PromiseLike<unknown>,
): Promise<void> {
	const args = button.args;
	if (Array.isArray(args)) {
		await executor(button.command, ...args);
		return;
	}

	if (args !== undefined) {
		await executor(button.command, args);
		return;
	}

	await executor(button.command);
}

export async function executeButtonAction(
	button: CommandButton,
	commandExecutor: (command: string, ...args: unknown[]) => Promise<unknown> | PromiseLike<unknown>,
	terminalExecutor?: (terminalCommand: string) => Promise<void> | void,
): Promise<void> {
	const terminalCommand = button.terminalCommand?.trim();
	if (terminalCommand) {
		if (terminalExecutor) {
			await terminalExecutor(terminalCommand);
		}
		return;
	}
	await executeButtonCommand(button, commandExecutor);
}

export function activate(context: vscode.ExtensionContext) {
	const provider = new CommandViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(VIEW_ID, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
		vscode.commands.registerCommand('myCommandSidebar.addButton', async () => {
			await provider.promptAddOrEdit();
		}),
		vscode.commands.registerCommand('custom-command-sidebar.helloWorld', () => {
			vscode.window.showInformationMessage('Ciao dal custom-command-sidebar!');
		}),
	);
}

export function deactivate() {}

class CommandViewProvider implements vscode.WebviewViewProvider {
	private view?: vscode.WebviewView;
	private configListener?: vscode.Disposable;
	private categoriesCache?: CommandCategory[];
	private commandTerminal?: vscode.Terminal;

	constructor(private readonly context: vscode.ExtensionContext) {}

	public async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
		this.view = webviewView;
		this.categoriesCache = this.loadCategoriesFromConfig();
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri],
		};

		webviewView.webview.html = this.getHtml(webviewView.webview);

		this.configListener ??= vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration(`${CONFIG_SECTION}.${CONFIG_KEY}`) || event.affectsConfiguration(`${CONFIG_SECTION}.${LEGACY_KEY}`)) {
				this.categoriesCache = this.loadCategoriesFromConfig();
				this.postCategories();
			}
		});
		this.context.subscriptions.push(this.configListener);

		webviewView.webview.onDidReceiveMessage(async (message) => {
			switch (message.type) {
			case 'ready':
				this.postCategories();
				break;
			case 'add':
				await this.promptAddOrEdit(undefined, message.categoryIndex);
				break;
			case 'execute':
				await this.executeButton(message.categoryIndex, message.buttonIndex);
				break;
			case 'menu':
				await this.showMenu(message.categoryIndex, message.buttonIndex);
				break;
			default:
				break;
			}
		});
	}

	public async promptAddOrEdit(existing?: CommandButton, categoryIndex?: number, buttonIndex?: number): Promise<void> {
		const categories = this.getCategories();

		let targetCategoryIndex = categoryIndex;
		if (typeof targetCategoryIndex !== 'number') {
			const picked = await vscode.window.showQuickPick(
				categories.map((c, idx) => ({ label: c.label, description: c.id, idx })),
				{
					placeHolder: 'Seleziona una categoria',
					ignoreFocusOut: true,
				},
			);
			if (!picked) {
				return;
			}
			targetCategoryIndex = picked.idx;
		}

		const targetCategory = categories[targetCategoryIndex];
		if (!targetCategory) {
			return;
		}

		const label = await vscode.window.showInputBox({
			prompt: 'Etichetta pulsante',
			value: existing?.label ?? existing?.title ?? '',
			ignoreFocusOut: true,
			validateInput: (value) => (!value.trim() ? 'L\'etichetta è obbligatoria' : undefined),
		});
		if (!label) {
			return;
		}
		const normalizedLabel = label.trim();
		if (hasButtonNameCollision(targetCategory, normalizedLabel, buttonIndex)) {
			void vscode.window.showErrorMessage(`Esiste già un pulsante "${normalizedLabel}" nella categoria "${targetCategory.label}" (case-insensitive).`);
			return;
		}

		const command = await vscode.window.showInputBox({
			prompt: 'Command id (esempio: workbench.action.files.newUntitledFile)',
			value: existing?.command ?? '',
			ignoreFocusOut: true,
			validateInput: (value) => (!value.trim() ? 'Il command id è obbligatorio' : undefined),
		});
		if (!command) {
			return;
		}

		const icon = await vscode.window.showInputBox({
			prompt: 'Icona (nome Codicon, ad es. play, rocket, gear). Lascia vuoto per il default.',
			value: existing?.icon ?? '',
			placeHolder: 'rocket',
			ignoreFocusOut: true,
		});

		const argsRaw = await vscode.window.showInputBox({
			prompt: 'Args (JSON, facoltativo)',
			value: existing?.args !== undefined ? JSON.stringify(existing.args) : '',
			placeHolder: '["--flag"] oppure {"key":"value"}',
			ignoreFocusOut: true,
		});

		let parsedArgs: unknown = existing?.args;
		if (argsRaw !== undefined && argsRaw.trim() !== '') {
			try {
				parsedArgs = JSON.parse(argsRaw);
			} catch (error) {
				void vscode.window.showErrorMessage('Gli argomenti devono essere JSON valido.');
				return;
			}
		} else if (argsRaw !== undefined && argsRaw.trim() === '') {
			parsedArgs = undefined;
		}

		const nextButton: CommandButton = {
			label: normalizedLabel,
			title: normalizedLabel,
			description: existing?.description ?? '',
			command: command.trim(),
			icon: icon?.trim() || '',
			args: parsedArgs,
		};

		const updatedCategories = categories.slice();
		const buttons = targetCategory.buttons.slice();

		if (typeof buttonIndex === 'number' && buttonIndex >= 0 && buttonIndex < buttons.length) {
			buttons[buttonIndex] = nextButton;
		} else {
			buttons.push(nextButton);
		}

		updatedCategories[targetCategoryIndex] = { ...targetCategory, buttons };

		await this.saveCategories(updatedCategories);
		this.postCategories();
	}

	private async showMenu(categoryIndex: number, buttonIndex: number): Promise<void> {
		const categories = this.getCategories();
		const category = categories[categoryIndex];
		const button = category?.buttons[buttonIndex];
		if (!button) {
			return;
		}

		const picked = await vscode.window.showQuickPick(['Modifica', 'Elimina'], {
			placeHolder: `"${button.label}"`,
			ignoreFocusOut: true,
		});

		if (picked === 'Modifica') {
			await this.promptAddOrEdit(button, categoryIndex, buttonIndex);
		} else if (picked === 'Elimina') {
			const confirm = await vscode.window.showWarningMessage(
				`Vuoi rimuovere "${button.label}"?`,
				{ modal: true },
				'Elimina',
			);
			if (confirm === 'Elimina') {
				const nextCategories = this.getCategories();
				const target = nextCategories[categoryIndex];
				if (!target) {
					return;
				}
				target.buttons.splice(buttonIndex, 1);
				await this.saveCategories(nextCategories);
				this.postCategories();
			}
		}
	}

	private async executeButton(categoryIndex: number, buttonIndex: number): Promise<void> {
		const categories = this.getCategories();
		const category = categories[categoryIndex];
		const button = category?.buttons[buttonIndex];
		if (!button) {
			return;
		}

		try {
			await executeButtonAction(
				button,
				vscode.commands.executeCommand,
				async (terminalCommand) => {
					const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
					if (!workspaceFolder) {
						void vscode.window.showErrorMessage('Apri una cartella workspace per eseguire comandi Git dal terminale.');
						return;
					}
					const terminal = this.getOrCreateCommandTerminal(workspaceFolder.uri);
					terminal.show(true);
					terminal.sendText(terminalCommand, true);
				},
			);
		} catch (error) {
			void vscode.window.showErrorMessage(`Esecuzione di "${button.command}" non riuscita: ${String(error)}`);
		}
	}

	private getOrCreateCommandTerminal(cwd: vscode.Uri): vscode.Terminal {
		const existing =
			this.commandTerminal && this.commandTerminal.exitStatus === undefined
				? this.commandTerminal
				: vscode.window.terminals.find((terminal) => terminal.name === TERMINAL_NAME && terminal.exitStatus === undefined);
		if (existing) {
			this.commandTerminal = existing;
			return existing;
		}
		const terminal = vscode.window.createTerminal({
			name: TERMINAL_NAME,
			cwd,
		});
		this.commandTerminal = terminal;
		return terminal;
	}

	private getCategories(): CommandCategory[] {
		if (!this.categoriesCache) {
			this.categoriesCache = this.loadCategoriesFromConfig();
		}
		return this.categoriesCache.map((category) => ({
			...category,
			buttons: category.buttons.map((button) => ({ ...button })),
		}));
	}

	private loadCategoriesFromConfig(): CommandCategory[] {
		const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
		const categories = config.get<CommandCategory[]>(CONFIG_KEY);
		const legacyButtons = config.get<CommandButton[]>(LEGACY_KEY);
		return resolveCategoriesFromConfig(categories, legacyButtons);
	}

	private async saveCategories(categories: CommandCategory[]): Promise<void> {
		if (!vscode.workspace.workspaceFolders?.length) {
			void vscode.window.showErrorMessage('Apri una cartella workspace per salvare i pulsanti Commands (richieste impostazioni workspace).');
			return;
		}
		const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
		try {
			await config.update(CONFIG_KEY, categories, vscode.ConfigurationTarget.Workspace);
			// Clear legacy key to avoid fallback overriding new categories.
			await config.update(LEGACY_KEY, undefined, vscode.ConfigurationTarget.Workspace);
			this.categoriesCache = categories.map((category) => ({
				...category,
				buttons: category.buttons.map((button) => ({ ...button })),
			}));
		} catch (error) {
			void vscode.window.showErrorMessage(`Salvataggio pulsanti non riuscito: ${String(error)}`);
		}
	}

	private postCategories(): void {
		if (!this.view) {
			return;
		}
		this.view.webview.postMessage({
			type: 'categories',
			categories: this.getCategories(),
		});
	}

	private getHtml(webview: vscode.Webview): string {
		const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'codicon.css'));
		const nonce = getNonce();
		const categories = this.getCategories();

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';">
	<link rel="stylesheet" href="${codiconUri}">
	<style>
		:root { color-scheme: light dark; }
		body {
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background: var(--vscode-sideBar-background);
			padding: 10px;
		}
		.button {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 5px 8px;
			background: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: 1px solid var(--vscode-button-border, transparent);
			border-radius: 10px;
			cursor: pointer;
			font-size: 14px;
			appearance: none;
			overflow: hidden;
		}
		.button:hover {
			background: var(--vscode-button-hoverBackground);
			border-radius: 10px;
		}
		.button:focus-visible {
			outline: 2px solid var(--vscode-focusBorder, var(--vscode-button-hoverBackground));
			outline-offset: 1px;
			border-radius: 10px;
		}
		.categories {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		.category {
			border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
			border-radius: 8px;
			overflow: hidden;
			background: var(--vscode-sideBarSectionHeader-background, rgba(255,255,255,0.02));
		}
		.category-header {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 10px;
			cursor: pointer;
			user-select: none;
		}
		.category-header:hover {
			background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04));
		}
		.category-title {
			flex: 1;
			display: inline-flex;
			align-items: center;
			gap: 6px;
			font-weight: 600;
		}
		.category-actions {
			display: inline-flex;
			align-items: center;
			gap: 6px;
		}
		.category-body {
			padding: 8px 10px 12px 10px;
		}
		.grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
			gap: 8px;
		}
		.github-grid {
			grid-template-columns: 1fr;
		}
		.tile {
			position: relative;
			border-radius: 10px;
			background: var(--vscode-sideBarSectionHeader-background, rgba(255,255,255,0.03));
			border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.12));
			min-height: 100px;
			min-width: 100px;
			aspect-ratio: 1 / 1;
			box-shadow:
				2px 2px 6px rgba(255,255,255,0.18),
				0 2px 6px rgba(0,0,0,0.12);
		}
		.command-btn {
			width: 100%;
			height: 100%;
			padding: 24px 16px 18px 16px;
			background: transparent;
			border: none;
			color: inherit;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 10px;
			cursor: pointer;
			text-align: center;
		}
		.command-btn:hover {
			background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.04));
		}
		.command-btn .codicon {
			font-size: 28px;
			color: var(--vscode-icon-foreground, currentColor);
		}
		.command-btn .label {
			font-size: 16px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-weight: 600;
		}
		.github-tile {
			border-radius: 5px;
			min-height: auto;
			aspect-ratio: auto;
		}
		.github-tile__button {
			height: auto;
			min-height: 62px;
			padding: 12px 16px;
			display: grid;
			grid-template-columns: 28px minmax(0, 1fr);
			align-items: center;
			gap: 10px;
			text-align: left;
			justify-items: start;
		}
		.github-tile__icon {
			font-size: 20px;
			width: 24px;
			text-align: center;
			color: var(--vscode-icon-foreground, currentColor);
		}
		.github-tile__content {
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: 3px;
		}
		.github-tile__title {
			font-size: 14px;
			font-weight: 600;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.github-tile__desc {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.menu-btn {
			position: absolute;
			top: 6px;
			right: 6px;
			border: none;
			background: transparent;
			color: var(--vscode-foreground);
			cursor: pointer;
			font-size: 16px;
			padding: 4px;
			line-height: 1;
		}
		.menu-btn:hover {
			color: var(--vscode-textLink-foreground);
		}
		.empty {
			color: var(--vscode-descriptionForeground);
			font-style: italic;
			padding: 8px 0 0 4px;
		}
	</style>
</head>
<body>
	<div id="categories" class="categories"></div>
	<div id="empty" class="empty" hidden>Nessun comando. Usa + sulla categoria per aggiungerne uno.</div>
		<script nonce="${nonce}">
			const vscode = acquireVsCodeApi();
			let categories = [];
			const collapsed = new Map();

		const categoriesEl = document.getElementById('categories');
		const emptyEl = document.getElementById('empty');

			const sectionByCategoryId = new Map();
			const sectionState = new Map();

			function buildCategorySection(cat, catIndex) {
				const section = document.createElement('div');
				section.className = 'category';

				const header = document.createElement('div');
				header.className = 'category-header';

				const caret = document.createElement('span');
				caret.className = 'codicon codicon-chevron-down';
				const isCollapsed = collapsed.get(cat.id) === true;
				if (isCollapsed) {
					caret.style.transform = 'rotate(-90deg)';
				}

				const title = document.createElement('div');
				title.className = 'category-title';
				title.textContent = cat.label || 'Categoria';

				const count = document.createElement('span');
				count.style.opacity = '0.7';
					count.textContent = cat.buttons?.length ? \`(\${cat.buttons.length})\` : '(0)';

				const headerAdd = document.createElement('button');
				headerAdd.className = 'button';
				headerAdd.type = 'button';
				headerAdd.style.padding = '4px 8px';
				headerAdd.style.fontSize = '12px';
				headerAdd.innerHTML = '<span class="codicon codicon-add"></span>';
				headerAdd.addEventListener('click', (event) => {
					event.stopPropagation();
					vscode.postMessage({ type: 'add', categoryIndex: catIndex });
				});

				const actions = document.createElement('div');
				actions.className = 'category-actions';
				actions.append(headerAdd);

				header.append(caret, title, count, actions);
				header.addEventListener('click', () => {
					const current = collapsed.get(cat.id) === true;
					collapsed.set(cat.id, !current);
					render();
				});

				const body = document.createElement('div');
				body.className = 'category-body';
				body.style.display = isCollapsed ? 'none' : 'block';

				if (!cat.buttons?.length) {
					const empty = document.createElement('div');
					empty.className = 'empty';
					empty.textContent = 'Nessun comando in questa categoria';
					body.append(empty);
				} else {
					const grid = document.createElement('div');
					grid.className = 'grid';
					grid.classList.add('github-grid');

					cat.buttons.forEach((btn, buttonIndex) => {
						const tile = document.createElement('div');
						tile.className = 'tile';
						tile.classList.add('github-tile');

						const menu = document.createElement('button');
						menu.className = 'menu-btn';
						menu.textContent = '⋯';
						menu.title = 'Modifica o elimina';
						menu.addEventListener('click', (event) => {
							event.stopPropagation();
							vscode.postMessage({ type: 'menu', categoryIndex: catIndex, buttonIndex });
						});

						const button = document.createElement('button');
						button.className = 'command-btn';
						button.type = 'button';
						button.classList.add('github-tile__button');
						button.addEventListener('click', () => {
							vscode.postMessage({ type: 'execute', categoryIndex: catIndex, buttonIndex });
						});

						const icon = document.createElement('span');
						icon.className = 'codicon codicon-' + (btn.icon || 'terminal');
						icon.classList.add('github-tile__icon');

						const content = document.createElement('span');
						content.className = 'github-tile__content';

						const title = document.createElement('span');
						title.className = 'github-tile__title';
						title.textContent = btn.title || btn.label || 'Untitled';

						const descText = (btn.description || '').trim();
						content.append(title);
						if (descText) {
							const desc = document.createElement('span');
							desc.className = 'github-tile__desc';
							desc.textContent = descText;
							content.append(desc);
						}
						button.append(icon, content);
						tile.append(button, menu);
						grid.append(tile);
					});

					body.append(grid);
				}

				section.append(header, body);
				return section;
			}

			function render() {
				const hasButtons = categories.some(c => c.buttons && c.buttons.length);
				emptyEl.hidden = hasButtons;

				const activeCategoryIds = new Set();
				categories.forEach((cat, catIndex) => {
						const safeId = cat.id || \`cat-\${catIndex}\`;
					const signature = JSON.stringify({
						label: cat.label || 'Categoria',
						buttons: Array.isArray(cat.buttons) ? cat.buttons : [],
						collapsed: collapsed.get(safeId) === true,
						index: catIndex,
					});

					let section = sectionByCategoryId.get(safeId);
					const previousSignature = sectionState.get(safeId);
					if (!section || previousSignature !== signature) {
						const nextSection = buildCategorySection({ ...cat, id: safeId }, catIndex);
						if (section && section.parentElement === categoriesEl) {
							categoriesEl.replaceChild(nextSection, section);
						}
						section = nextSection;
						sectionByCategoryId.set(safeId, section);
						sectionState.set(safeId, signature);
					}

					categoriesEl.append(section);
					activeCategoryIds.add(safeId);
				});

				for (const [categoryId, section] of sectionByCategoryId.entries()) {
					if (!activeCategoryIds.has(categoryId)) {
						section.remove();
						sectionByCategoryId.delete(categoryId);
						sectionState.delete(categoryId);
						collapsed.delete(categoryId);
					}
				}
			}
			window.addEventListener('message', (event) => {
				const { type, categories: updated } = event.data;
				if (type === 'categories') {
					categories = Array.isArray(updated) ? updated : [];
					render();
				}
			});

			vscode.postMessage({ type: 'ready' });
			render();
		</script>
</body>
</html>`;
	}
}

function getNonce(): string {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let text = '';
	for (let i = 0; i < 32; i += 1) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

