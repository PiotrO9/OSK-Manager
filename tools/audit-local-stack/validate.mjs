import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';

const requireBackend = createRequire(
    new URL('../../../../BE/package.json', import.meta.url),
);
const status = JSON.parse(
    execFileSync(
        'npx.exe',
        [
            '--yes',
            'supabase',
            'status',
            '-o',
            'json',
            '--workdir',
            new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'),
        ],
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
) {
    throw new Error('Refusing to test a non-local database or Auth service');
}

const target = [
    database.hostname.toLowerCase(),
    database.port,
    decodeURIComponent(database.username),
    decodeURIComponent(database.pathname),
    database.searchParams.get('schema') || 'public',
].join('|');

process.env.DATABASE_URL = status.DB_URL;
process.env.SUPABASE_URL = status.API_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = status.SERVICE_ROLE_KEY;
process.env.SUPABASE_ANON_KEY = status.ANON_KEY;
process.env.SUPABASE_JWT_SECRET = status.JWT_SECRET;
process.env.NODE_ENV = 'test';
process.env.ALLOW_DB_RESET = 'true';
process.env.ALLOW_DB_FULL_RESET = 'true';
process.env.AUDIT_RESET_CONFIRM_SECRET = randomBytes(48).toString('base64');
process.env.AUDIT_RESET_TARGET_FINGERPRINT = createHash('sha256')
    .update(target)
    .digest('hex');

const { createApp } = requireBackend('./dist/app.js');
const { getPrisma } = requireBackend('./dist/lib/prisma.js');
const { ADMIN_ACCOUNT } = requireBackend(
    './dist/services/devResetSeed/constants.js',
);
const server = createApp().listen(0, '127.0.0.1');

await new Promise((resolve) => server.once('listening', resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
const prisma = getPrisma();

async function request(path, body, token) {
    const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    const json = await response.json();

    return { status: response.status, ...json };
}

async function loginAdmin() {
    const result = await request('/auth/login', {
        email: ADMIN_ACCOUNT.email,
        password: ADMIN_ACCOUNT.password,
    });

    if (result.status !== 200 || !result.data?.access_token) {
        throw new Error(`Admin login failed: ${result.status} ${result.error}`);
    }

    return result.data.access_token;
}

async function execute(operation, token) {
    const preview = await request('/dev/audit/preview', { operation }, token);

    if (preview.status !== 200) {
        throw new Error(`Preview failed: ${preview.status} ${preview.error}`);
    }

    const body = {
        operation,
        confirmation: preview.data.confirmation,
        ...(operation.kind === 'fixture' || operation.level === 'full'
            ? { fullConfirmation: 'WIPE AUDIT DATABASE' }
            : {}),
    };
    const result = await request('/dev/audit/execute', body, token);

    if (result.status !== 200) {
        throw new Error(
            `Execute ${JSON.stringify(operation)} failed: ${result.status} ${result.error}`,
        );
    }

    const after = result.data.reset.after;

    console.log(
        JSON.stringify({
            operation,
            after,
            fixture: result.data.fixture?.fixture,
        }),
    );

    return result;
}

try {
    let token = await loginAdmin();

    for (const fixture of [
        'manager-only',
        'school-empty',
        'school-staffed',
        'school-operational',
        'booking-ready',
        'payment-ready',
    ]) {
        await execute({ kind: 'fixture', fixture }, token);
        token = await loginAdmin();
    }

    for (const level of ['instructors', 'schools', 'managers', 'full']) {
        await execute({ kind: 'clear', level }, token);

        if (level === 'full') token = await loginAdmin();
    }

    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

    if (adminCount !== 1)
        throw new Error(`Unexpected admin count: ${adminCount}`);

    console.log('AUDIT_LOCAL_VALIDATION_OK');
} finally {
    await prisma.$disconnect();
    await new Promise((resolve) => server.close(resolve));
}
