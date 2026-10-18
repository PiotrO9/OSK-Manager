import { forwardSecurityLogs } from '~~/server/utils/security-logs/securityLogsBff';

export default defineEventHandler((event) =>
    forwardSecurityLogs(event, 'options'),
);
