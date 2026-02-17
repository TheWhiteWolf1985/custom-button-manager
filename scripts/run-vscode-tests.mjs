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

function captureStream(stream, collector) {
	stream.setEncoding('utf8');
	stream.on('data', (chunk) => {
		collector.push(chunk);
	});
}

function normalizeSuccessfulRunOutput(rawOutput) {
	const lines = rawOutput.split(/\r?\n/);
	const filtered = [];
	let shutdownStackDetected = false;

	for (const line of lines) {
		if (!line) {
			continue;
		}
		if (line.includes('Error mutex already exists')) {
			continue;
		}
		if (/^\s*at id\.S \(.+\)\s*$/.test(line)) {
			shutdownStackDetected = true;
			continue;
		}
		filtered.push(line);
	}

	if (shutdownStackDetected) {
		filtered.push(
			'WARN: normalized non-blocking VS Code Test Host shutdown stack (enable VSCODE_TEST_DEBUG=1 for raw output).',
		);
	}

	return `${filtered.join('\n')}\n`;
}

function safeRemove(targetPath) {
	if (!targetPath) {
		return;
	}
	try {
		fs.rmSync(targetPath, { recursive: true, force: true });
	} catch {
		// cleanup best-effort
	}
}

function gcOldTempArtifacts(tempDir, prefix, maxAgeMs) {
	const now = Date.now();
	let entries = [];
	try {
		entries = fs.readdirSync(tempDir, { withFileTypes: true });
	} catch {
		return;
	}

	for (const entry of entries) {
		if (!entry.isDirectory() || !entry.name.startsWith(prefix)) {
			continue;
		}
		const fullPath = path.join(tempDir, entry.name);
		let stats;
		try {
			stats = fs.statSync(fullPath);
		} catch {
			continue;
		}
		if (now - stats.mtimeMs > maxAgeMs) {
			safeRemove(fullPath);
		}
	}
}

async function main() {
	const tempArtifactPrefix = 'forgejo-vscode-test-host-';
	const retentionHours = 72;
	const retentionMs = retentionHours * 60 * 60 * 1000;
	gcOldTempArtifacts(os.tmpdir(), tempArtifactPrefix, retentionMs);

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
		const freshCachePath = path.join(os.tmpdir(), 'vscode-test-fresh-cache');
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

	const tempRoot = fs.mkdtempSync(
		path.join(
			os.tmpdir(),
			`${tempArtifactPrefix}${Date.now()}-${process.pid}-`,
		),
	);
	const keepArtifacts = process.env.KEEP_VSCODE_TEST_ARTIFACTS === '1';
	const customUserDataDir = process.env.VSCODE_TEST_USER_DATA_DIR?.trim();
	const customExtensionsDir = process.env.VSCODE_TEST_EXTENSIONS_DIR?.trim();
	const userDataDir = customUserDataDir || path.join(tempRoot, 'user-data');
	const extensionsDir = customExtensionsDir || path.join(tempRoot, 'extensions');
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

	const debugRawOutput = process.env.VSCODE_TEST_DEBUG === '1';
	const stdoutChunks = [];
	const stderrChunks = [];

	if (child.stdout) {
		captureStream(child.stdout, stdoutChunks);
	}
	if (child.stderr) {
		captureStream(child.stderr, stderrChunks);
	}

	child.on('error', (error) => {
		console.error(`Errore avvio test host: ${String(error)}`);
		if (!keepArtifacts) {
			if (!customUserDataDir) {
				safeRemove(userDataDir);
			}
			if (!customExtensionsDir) {
				safeRemove(extensionsDir);
			}
			safeRemove(tempRoot);
		}
		process.exit(1);
	});

	child.on('close', (code) => {
		const stdoutRaw = stdoutChunks.join('');
		const stderrRaw = stderrChunks.join('');
		const success = code === 0;
		if (debugRawOutput || !success) {
			if (stdoutRaw) {
				process.stdout.write(stdoutRaw);
			}
			if (stderrRaw) {
				process.stderr.write(stderrRaw);
			}
		} else {
			if (stdoutRaw) {
				process.stdout.write(normalizeSuccessfulRunOutput(stdoutRaw));
			}
			if (stderrRaw) {
				process.stderr.write(normalizeSuccessfulRunOutput(stderrRaw));
			}
		}

		if (!keepArtifacts) {
			if (!customUserDataDir) {
				safeRemove(userDataDir);
			}
			if (!customExtensionsDir) {
				safeRemove(extensionsDir);
			}
			safeRemove(tempRoot);
		}
		process.exit(code ?? 1);
	});
}

main().catch((error) => {
	console.error(`Errore runner test: ${String(error)}`);
	process.exit(1);
});
