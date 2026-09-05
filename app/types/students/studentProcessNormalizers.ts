import type {
    StudentProcessStatus,
    StudentProcessStatusStep,
} from './studentModels';
import { parseBooleanLike } from './studentNormalizeShared';

function normalizeStudentProcessStatusStep(
    raw: unknown,
): StudentProcessStatusStep | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const name = o.name != null ? String(o.name).trim() : '';

    if (!name) {
        return null;
    }

    const description =
        o.description != null ? String(o.description).trim() : '';

    return {
        name,
        completed: parseBooleanLike(o.completed, false),
        description,
    };
}

export function normalizeStudentProcessStatus(
    raw: unknown,
): StudentProcessStatus | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    if (!Array.isArray(o.steps)) {
        return null;
    }

    return {
        steps: o.steps
            .map((row) => normalizeStudentProcessStatusStep(row))
            .filter((x): x is StudentProcessStatusStep => x !== null),
    };
}
