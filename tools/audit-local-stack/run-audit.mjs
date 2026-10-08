import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const [fixtureId, specFile] = process.argv.slice(2);
const allowed = new Map([
    ['manager-only', new Set(['manager-osk-audit.spec.ts'])],
    ['booking-ready', new Set(['booking-audit.spec.ts'])],
    ['payment-ready', new Set(['payment-audit.spec.ts'])],
    [
        'school-operational',
        new Set([
            'role-access-audit.spec.ts',
            'login-validation-audit.spec.ts',
        ]),
    ],
]);

if (!allowed.get(fixtureId)?.has(specFile)) {
    throw new Error('Usage: run-audit.mjs <fixture> <matching audit spec>');
}

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

const feEnv = { ...process.env };

process.env.DATABASE_URL = status.DB_URL;
process.env.SUPABASE_URL = status.API_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
process.env.SUPABASE_ANON_KEY = status.ANON_KEY;
process.env.SUPABASE_JWT_SECRET = status.JWT_SECRET;
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://127.0.0.1:3100';

const requireBackend = createRequire(
    path.join(root, '../../../../BE/package.json'),
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
    const ids = await ensureAuthUsers(getAuditFixtureAccounts(fixtureId));
    const fixture = await prisma.$transaction(
        async (tx) => {
            await resetDatabase(tx);

            return seedAuditFixture(tx, fixtureId, ids);
        },
        { timeout: 120000, maxWait: 120000 },
    );

    server = createApp().listen(3002, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));

    const child = spawn(
        'npm.exe',
        [
            'run',
            'test:e2e:full',
            '--',
            '--workers=1',
            '--grep',
            '@audit',
            specFile,
        ],
        {
            cwd: path.join(root, '../..'),
            env: {
                ...feEnv,
                E2E_ENVIRONMENT_NAME: 'osk-local-audit',
                E2E_CONFIRM_ISOLATED_ENVIRONMENT: 'true',
                E2E_API_UPSTREAM: 'http://127.0.0.1:3002',
                E2E_AUDIT_FIXTURE: fixtureId,
                E2E_MANAGER_EMAIL: DEMO_ACCOUNTS[0].email,
                E2E_MANAGER_PASSWORD: DEMO_ACCOUNTS[0].password,
                E2E_INSTRUCTOR_EMAIL: DEMO_ACCOUNTS[1].email,
                E2E_INSTRUCTOR_PASSWORD: DEMO_ACCOUNTS[1].password,
                E2E_STUDENT_EMAIL: DEMO_ACCOUNTS[2].email,
                E2E_STUDENT_PASSWORD: DEMO_ACCOUNTS[2].password,
                E2E_BOOKING_DATE: fixture.bookableWindow?.date ?? '',
                E2E_AUDIT_SCHOOL_ID: fixture.logicalIds.school ?? '',
                E2E_AUDIT_STUDENT_ID: fixture.logicalIds['student-1'] ?? '',
                E2E_AUDIT_COURSE_ID:
                    fixture.logicalIds['course-practical'] ?? '',
            },
            stdio: 'inherit',
        },
    );
    const exitCode = await new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('exit', (code) => resolve(code ?? 1));
    });

    if (exitCode !== 0) process.exitCode = exitCode;
} finally {
    if (server) await new Promise((resolve) => server.close(resolve));

    await prisma.$disconnect();
}
