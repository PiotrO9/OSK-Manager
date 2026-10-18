export interface SecurityLogPerson {
    visibility?: string;
    userId?: string | null;
    displayName?: string | null;
    role?: string | null;
}

export interface SecurityLogItem {
    id: string;
    occurredAt: string;
    type: string;
    category: string;
    severity: string;
    outcome: string;
    reasonCode?: string | null;
    operationCode?: string | null;
    operationLabel?: string | null;
    httpMethod?: string | null;
    routeTemplate?: string | null;
    httpStatus?: number | null;
    actor?: SecurityLogPerson | null;
    target?: SecurityLogPerson | null;
    clientIp?: string | null;
    requestId?: string | null;
}

export interface SecurityLogDetail extends SecurityLogItem {
    userAgent?: string | null;
    ipSource?: string | null;
    resourceType?: string | null;
    resourceId?: string | null;
    metadata?: { attemptCount?: number; windowMinutes?: number } | null;
}

export interface SecurityLogsPageInfo {
    nextCursor: string | null;
    previousCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SecurityLogsListData {
    items: SecurityLogItem[];
    pageInfo: SecurityLogsPageInfo;
    collectionStatus: 'OK' | 'DEGRADED' | 'UNKNOWN';
}

export interface SecurityLogPersonOption {
    userId: string;
    displayName: string | null;
    role?: string;
}

export interface SecurityLogFilterOptionsData {
    items: SecurityLogPersonOption[];
    nextCursor?: string | null;
}
