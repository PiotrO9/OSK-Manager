import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const feEnv = { ...process.env };
const localPath = new URL('.', import.meta.url).pathname.replace(
    /^\/(\w:)/,
    '$1',
);
const status = JSON.parse(
    execFileSync(
        'npx.exe',
        ['--yes', 'supabase', 'status', '-o', 'json', '--workdir', localPath],
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

process.env.DATABASE_URL = status.DB_URL;
process.env.SUPABASE_URL = status.API_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
process.env.SUPABASE_ANON_KEY = status.ANON_KEY;
process.env.SUPABASE_JWT_SECRET = status.JWT_SECRET;
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://127.0.0.1:3100';

const requireBackend = createRequire(
    new URL('../../../../BE/package.json', import.meta.url),
);
const { getPrisma } = requireBackend('./dist/lib/prisma.js');
const { createApp } = requireBackend('./dist/app.js');
const { ensureAuthUsers } = requireBackend(
    './dist/services/devResetSeed/authUsers.js',
);
const { getAuditFixtureAccounts, seedAuditFixture } = requireBackend(
    './dist/services/auditFixtures.service.js',
);
const { resetDatabase } = requireBackend(
    './dist/services/devResetSeed/database.js',
);
const { DEMO_ACCOUNTS } = requireBackend(
    './dist/services/devResetSeed/constants.js',
);

const prisma = getPrisma();
let server;

try {
    const ids = await ensureAuthUsers(
        getAuditFixtureAccounts('school-operational'),
    );

    await prisma.$transaction(
        async (tx) => {
            await resetDatabase(tx);
            await seedAuditFixture(tx, 'school-operational', ids);
        },
        { timeout: 120000, maxWait: 120000 },
    );
    server = createApp().listen(3002, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    const child = spawn('npm.exe', ['run', 'test:e2e:smoke'], {
        cwd: new URL('../../', import.meta.url).pathname.replace(
            /^\/(\w:)/,
            '$1',
        ),
        env: {
            ...feEnv,
            E2E_ENVIRONMENT_NAME: 'osk-local-audit',
            E2E_CONFIRM_ISOLATED_ENVIRONMENT: 'true',
            E2E_API_UPSTREAM: 'http://127.0.0.1:3002',
            E2E_MANAGER_EMAIL: DEMO_ACCOUNTS[0].email,
            E2E_MANAGER_PASSWORD: DEMO_ACCOUNTS[0].password,
            E2E_INSTRUCTOR_EMAIL: DEMO_ACCOUNTS[1].email,
            E2E_INSTRUCTOR_PASSWORD: DEMO_ACCOUNTS[1].password,
            E2E_STUDENT_EMAIL: DEMO_ACCOUNTS[2].email,
            E2E_STUDENT_PASSWORD: DEMO_ACCOUNTS[2].password,
        },
        stdio: 'inherit',
    });
    const exitCode = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code) => resolve(code ?? 1));
    });

    if (exitCode !== 0) process.exitCode = exitCode;
} finally {
    if (server) await new Promise((resolve) => server.close(resolve));

    await prisma.$disconnect();
}
