import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mode = process.argv[2];
const forwardedArgs = process.argv.slice(3);

if (mode !== 'ui' && mode !== 'full') {
    console.error(
        'Usage: node scripts/run-e2e.mjs <ui|full> [playwright args]',
    );
    process.exit(2);
}

if (mode === 'full') {
    const environmentName = String(
        process.env.E2E_ENVIRONMENT_NAME || '',
    ).trim();
    const confirmedIsolated =
        process.env.E2E_CONFIRM_ISOLATED_ENVIRONMENT === 'true';
    const upstream = String(process.env.E2E_API_UPSTREAM || '').trim();

    if (
        !environmentName ||
        /^(prod|production|dev|development)$/i.test(environmentName)
    ) {
        console.error(
            'Full E2E requires E2E_ENVIRONMENT_NAME naming a dedicated environment (not DEV or PROD).',
        );
        process.exit(2);
    }

    if (!confirmedIsolated) {
        console.error(
            'Full E2E requires E2E_CONFIRM_ISOLATED_ENVIRONMENT=true.',
        );
        process.exit(2);
    }

    if (!upstream) {
        console.error('Full E2E requires E2E_API_UPSTREAM.');
        process.exit(2);
    }
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const playwrightCli = path.join(
    projectDirectory,
    'node_modules',
    '@playwright',
    'test',
    'cli.js',
);
const project = mode === 'full' ? 'full-chromium' : 'ui-chromium';
const env = {
    ...process.env,
    E2E_MODE: mode === 'full' ? 'upstream' : 'mock',
};

const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', `--project=${project}`, ...forwardedArgs],
    {
        cwd: projectDirectory,
        env,
        stdio: 'inherit',
        shell: false,
    },
);

if (result.error) {
    console.error(result.error);
}

process.exit(result.status ?? 1);
