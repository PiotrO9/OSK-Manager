import { createHmac, randomUUID } from 'node:crypto';
import type { H3Event } from 'h3';
import type { UpstreamRequestOptions } from '../upstream/upstreamTypes';

let warnedMissingSecret = false;

function shouldReport(path: string): boolean {
    // Session probes are routine and would otherwise flood the audit log.
    return !/^\/auth\/(me|login|refresh|logout|password-recovery\/request)(?:\/|$)/.test(
        path,
    );
}

export async function reportBffMissingSession(
    _event: H3Event,
    upstreamBase: string,
    options: UpstreamRequestOptions,
): Promise<void> {
    const method = options.method ?? 'GET';
    const path = options.path.split('?')[0] ?? options.path;

    if (!shouldReport(path)) return;

    const secret = process.env.SECURITY_LOGS_BFF_SHARED_SECRET;

    if (!secret || secret.length < 32) {
        if (!warnedMissingSecret) {
            console.warn(
                'SECURITY_LOGS_BFF_SHARED_SECRET is unset; local BFF authorization denials cannot be reported',
            );
            warnedMissingSecret = true;
        }

        return;
    }

    const timestamp = new Date().toISOString();
    const body = JSON.stringify({
        attemptId: randomUUID(),
        method,
        path,
        reasonCode: 'MISSING_SESSION',
    });
    const signature = createHmac('sha256', secret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

    try {
        const response = await fetch(
            `${upstreamBase.replace(/\/$/, '')}/internal/security-events/bff-denial`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OSK-Audit-Timestamp': timestamp,
                    'X-OSK-Audit-Signature': `sha256=${signature}`,
                },
                body,
                signal: AbortSignal.timeout(1000),
            },
        );

        if (!response.ok) {
            console.warn(
                `Local BFF authorization denial was not accepted (${response.status})`,
            );
        }
    } catch (error) {
        console.warn('Could not report local BFF authorization denial', error);
    }
}
