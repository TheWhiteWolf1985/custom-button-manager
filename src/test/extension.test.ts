import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {
	executeButtonAction,
	executeButtonCommand,
	hasButtonNameCollision,
	hasCategoryNameCollision,
	resolveCategoriesFromConfig,
} from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('resolveCategoriesFromConfig restituisce la struttura settings', () => {
		const categories = resolveCategoriesFromConfig(
			[
				{
					id: '',
					label: '',
					buttons: [{ label: 'Apri terminale', command: 'workbench.action.terminal.new' }],
				},
			],
			undefined,
		);

		assert.strictEqual(categories.length, 5);
		assert.strictEqual(categories[0].id, 'cat-0');
		assert.strictEqual(categories[0].label, 'Categoria 1');
		assert.strictEqual(categories[0].buttons.length, 1);
		assert.strictEqual(categories[0].buttons[0].command, 'workbench.action.terminal.new');
		assert.strictEqual(categories[0].buttons[0].title, 'Apri terminale');
		assert.strictEqual(categories[0].buttons[0].description, '');
		assert.strictEqual(categories[0].buttons[0].icon, '');
		assert.ok(categories.some((category) => category.id === 'github'));
		assert.ok(categories.some((category) => category.id === 'build-test'));
		assert.ok(categories.some((category) => category.id === 'utils'));
	});

	test('resolveCategoriesFromConfig migra la chiave legacy buttons', () => {
		const categories = resolveCategoriesFromConfig(undefined, [
			{ label: 'Nuovo file', command: 'workbench.action.files.newUntitledFile' },
		]);

		assert.strictEqual(categories.length, 5);
		assert.strictEqual(categories[0].id, 'ai');
		assert.strictEqual(categories[0].buttons.length, 1);
		assert.strictEqual(categories[0].buttons[0].title, 'Nuovo file');
		assert.ok(categories.some((category) => category.id === 'workspace'));
		assert.ok(categories.some((category) => category.id === 'github'));
		const githubCategory = categories.find((category) => category.id === 'github');
		assert.ok(githubCategory);
		assert.strictEqual(githubCategory?.buttons.length, 3);
		assert.deepStrictEqual(
			githubCategory?.buttons.map((button) => button.terminalCommand),
			['git fetch', 'git pull', 'git push'],
		);
		const aiCategory = categories.find((category) => category.id === 'ai');
		assert.ok(aiCategory?.buttons.some((button) => button.title === 'Crea struttura AI'));
		const utilsCategory = categories.find((category) => category.id === 'utils');
		assert.ok(utilsCategory?.buttons.some((button) => button.title === 'Reload Window'));
	});

	test('resolveCategoriesFromConfig usa fallback title/description/icon retrocompatibili', () => {
		const categories = resolveCategoriesFromConfig(
			[
				{
					id: 'github',
					label: 'GitHub',
					buttons: [
						{
							label: '',
							title: '',
							description: undefined,
							icon: undefined,
							command: 'git.fetch',
						},
					],
				},
			],
			undefined,
		);

		assert.strictEqual(categories[0].buttons[0].title, 'Untitled');
		assert.strictEqual(categories[0].buttons[0].label, 'Untitled');
		assert.strictEqual(categories[0].buttons[0].description, '');
		assert.strictEqual(categories[0].buttons[0].icon, '');
	});

	test('resolveCategoriesFromConfig aggiunge i default GitHub mancanti senza duplicati', () => {
		const categories = resolveCategoriesFromConfig(
			[
				{
					id: 'github',
					label: 'GitHub',
					buttons: [
						{
							label: 'Git Fetch',
							title: 'Fetch',
							description: 'Custom',
							icon: 'arrow-down',
							command: 'workbench.action.terminal.new',
							terminalCommand: 'git fetch',
						},
					],
				},
			],
			undefined,
		);

		const githubCategory = categories.find((category) => category.id === 'github');
		assert.ok(githubCategory);
		assert.strictEqual(githubCategory?.buttons.length, 3);
		assert.strictEqual(
			githubCategory?.buttons.filter((button) => button.terminalCommand === 'git fetch').length,
			1,
		);
		assert.ok(githubCategory?.buttons.some((button) => button.terminalCommand === 'git pull'));
		assert.ok(githubCategory?.buttons.some((button) => button.terminalCommand === 'git push'));
	});

	test('executeButtonCommand gestisce args array/object/assenti', async () => {
		const calls: Array<{ command: string; args: unknown[] }> = [];
		const executor = async (command: string, ...args: unknown[]) => {
			calls.push({ command, args });
			return undefined;
		};

		await executeButtonCommand(
			{ label: 'Array', command: 'ext.array', args: ['a', 1] },
			executor,
		);
		await executeButtonCommand(
			{ label: 'Object', command: 'ext.object', args: { id: 7 } },
			executor,
		);
		await executeButtonCommand(
			{ label: 'NoArgs', command: 'ext.noargs' },
			executor,
		);

		assert.strictEqual(calls.length, 3);
		assert.deepStrictEqual(calls[0], { command: 'ext.array', args: ['a', 1] });
		assert.deepStrictEqual(calls[1], { command: 'ext.object', args: [{ id: 7 }] });
		assert.deepStrictEqual(calls[2], { command: 'ext.noargs', args: [] });
	});

	test('executeButtonAction usa terminalCommand senza interferire con command id classici', async () => {
		const commandCalls: Array<{ command: string; args: unknown[] }> = [];
		const terminalCalls: string[] = [];
		const commandExecutor = async (command: string, ...args: unknown[]) => {
			commandCalls.push({ command, args });
			return undefined;
		};
		const terminalExecutor = async (terminalCommand: string) => {
			terminalCalls.push(terminalCommand);
		};

		await executeButtonAction(
			{ label: 'Fetch', command: 'ignored.command', terminalCommand: 'git fetch' },
			commandExecutor,
			terminalExecutor,
		);
		await executeButtonAction(
			{ label: 'NoTerm', command: 'workbench.action.files.newUntitledFile' },
			commandExecutor,
			terminalExecutor,
		);

		assert.deepStrictEqual(terminalCalls, ['git fetch']);
		assert.strictEqual(commandCalls.length, 1);
		assert.strictEqual(commandCalls[0].command, 'workbench.action.files.newUntitledFile');
	});

	test('hasCategoryNameCollision rileva duplicati case-insensitive', () => {
		const categories = [
			{ id: 'ai', label: 'AI', buttons: [] },
			{ id: 'workspace', label: 'Workspace', buttons: [] },
		];

		assert.strictEqual(hasCategoryNameCollision(categories, 'ai'), true);
		assert.strictEqual(hasCategoryNameCollision(categories, 'AI', 0), false);
		assert.strictEqual(hasCategoryNameCollision(categories, 'utils'), false);
	});

	test('hasButtonNameCollision rileva duplicati case-insensitive nella categoria', () => {
		const category = {
			id: 'github',
			label: 'Github',
			buttons: [
				{ label: 'Fetch', title: 'Fetch', command: 'x', terminalCommand: 'git fetch' },
				{ label: 'Pull', title: 'Pull', command: 'y', terminalCommand: 'git pull' },
			],
		};

		assert.strictEqual(hasButtonNameCollision(category, 'fetch'), true);
		assert.strictEqual(hasButtonNameCollision(category, 'FETCH', 0), false);
		assert.strictEqual(hasButtonNameCollision(category, 'push'), false);
	});
});
