import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const status = JSON.parse(
    execFileSync(
        'npx.exe',
        ['--yes', 'supabase', 'status', '-o', 'json', '--workdir', root],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ),
);
const database = new URL(status.DB_URL);
const api = new URL(status.API_URL);

if (
    !['127.0.0.1', 'localhost'].includes(database.hostname) ||
    database.port !== '54322' ||
    !['127.0.0.1', 'localhost'].includes(api.hostname) ||
    api.port !== '54321'
)
    throw new Error('Refusing non-local audit target');

const result = spawnSync('npx.exe', ['prisma', 'migrate', 'deploy'], {
    cwd: path.join(root, '../../../../BE'),
    env: { ...process.env, DATABASE_URL: status.DB_URL },
    stdio: 'inherit',
});

if (result.error) throw result.error;

process.exitCode = result.status ?? 1;
