import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function collectTestFiles(dir) {
	const results = [];
	if (!fs.existsSync(dir)) {
		return results;
	}

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...collectTestFiles(fullPath));
			continue;
		}
		if (entry.isFile() && entry.name.endsWith('.test.js')) {
			results.push(fullPath);
		}
	}

	return results;
}

function forwardWithoutMutexNoise(stream, writer) {
	stream.setEncoding('utf8');
	stream.on('data', (chunk) => {
		const lines = chunk.split(/\r?\n/);
		for (const line of lines) {
			if (!line) {
				continue;
			}
			if (line.includes('Error mutex already exists')) {
				continue;
			}
			writer(`${line}\n`);
		}
	});
}

async function main() {
	const explicitExecutable = process.env.VSCODE_EXECUTABLE_PATH?.trim();
	let resolvedExecutable = explicitExecutable;

	if (!resolvedExecutable && process.platform === 'win32') {
		const localAppData = process.env.LOCALAPPDATA;
		if (localAppData) {
			const machineInstall = path.join(
				localAppData,
				'Programs',
				'Microsoft VS Code',
				'Code.exe',
			);
			if (fs.existsSync(machineInstall)) {
				resolvedExecutable = machineInstall;
			}
		}
	}

	if (!resolvedExecutable) {
		resolvedExecutable = await downloadAndUnzipVSCode('stable');
	}

	if (!resolvedExecutable || !fs.existsSync(resolvedExecutable)) {
		// Se la cache locale e' corrotta/incompleta, forza un download pulito in una cache separata.
		const freshCachePath = path.resolve(
			repoRoot,
			'.vscode-test-fresh-cache',
		);
		resolvedExecutable = await downloadAndUnzipVSCode({
			version: 'stable',
			cachePath: freshCachePath,
		});
	}

	if (!resolvedExecutable || !fs.existsSync(resolvedExecutable)) {
		console.error(
			`VS Code executable non trovato: ${resolvedExecutable || '<vuoto>'}. Imposta VSCODE_EXECUTABLE_PATH o riesegui il download test.`,
		);
		process.exit(1);
	}

	const compiledTestDir = path.resolve(repoRoot, 'out', 'test');
	const testFiles = collectTestFiles(compiledTestDir);
	if (!testFiles.length) {
		console.error(
			`Nessun file test trovato in ${compiledTestDir}. Esegui prima la compilazione test (pretest).`,
		);
		process.exit(1);
	}

	const testOptions = {
		mochaOpts: {
			ui: 'tdd',
			color: true,
			timeout: 10000,
		},
		colorDefault: true,
		preload: [],
		files: testFiles,
	};

	const runnerPath = path.resolve(
		repoRoot,
		'node_modules',
		'@vscode',
		'test-cli',
		'out',
		'runner.cjs',
	);
	if (!fs.existsSync(runnerPath)) {
		console.error(`Runner test-cli non trovato: ${runnerPath}`);
		process.exit(1);
	}

	const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-ext-test-'));
	const userDataDir = process.env.VSCODE_TEST_USER_DATA_DIR?.trim()
		|| path.join(tempRoot, 'user-data');
	const extensionsDir = process.env.VSCODE_TEST_EXTENSIONS_DIR?.trim()
		|| path.join(tempRoot, 'extensions');
	fs.mkdirSync(userDataDir, { recursive: true });
	fs.mkdirSync(extensionsDir, { recursive: true });

	const args = [
		`--user-data-dir=${userDataDir}`,
		`--extensions-dir=${extensionsDir}`,
		'--no-sandbox',
		'--disable-gpu-sandbox',
		'--disable-updates',
		'--skip-welcome',
		'--skip-release-notes',
		'--disable-workspace-trust',
		`--extensionDevelopmentPath=${repoRoot}`,
		`--extensionTestsPath=${runnerPath}`,
	];

	const env = {
		...process.env,
		VSCODE_TEST_OPTIONS: JSON.stringify(testOptions),
		ELECTRON_RUN_AS_NODE: undefined,
	};

	const child = spawn(resolvedExecutable, args, {
		stdio: ['inherit', 'pipe', 'pipe'],
		shell: false,
		env,
	});

	if (child.stdout) {
		forwardWithoutMutexNoise(child.stdout, (text) => process.stdout.write(text));
	}
	if (child.stderr) {
		forwardWithoutMutexNoise(child.stderr, (text) => process.stderr.write(text));
	}

	child.on('error', (error) => {
		console.error(`Errore avvio test host: ${String(error)}`);
		process.exit(1);
	});

	child.on('close', (code) => {
		process.exit(code ?? 1);
	});
}

main().catch((error) => {
	console.error(`Errore runner test: ${String(error)}`);
	process.exit(1);
});
