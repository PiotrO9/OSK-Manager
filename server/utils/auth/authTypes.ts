export type BffAdapter =
    | { mode: 'upstream'; upstreamBase: string }
    | { mode: 'mock' };

export type ProfilePatchPayload = Record<string, string | null | undefined>;

export interface BffAuthUserResponse {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    bio: string | null;
    profileUpdatedAt: string | null;
    pkkNumber?: string | null;
    avatarUrl: string | null;
    role: string;
    drivingSchools?: unknown[];
    defaultOskId?: string | null;
}
