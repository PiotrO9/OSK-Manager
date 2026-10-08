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

    const processRecord = raw as Record<string, unknown>;
    const name =
        processRecord.name != null ? String(processRecord.name).trim() : '';

    if (!name) {
        return null;
    }

    const description =
        processRecord.description != null
            ? String(processRecord.description).trim()
            : '';

    return {
        name,
        completed: parseBooleanLike(processRecord.completed, false),
        description,
    };
}

export function normalizeStudentProcessStatus(
    raw: unknown,
): StudentProcessStatus | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const processRecord = raw as Record<string, unknown>;

    if (!Array.isArray(processRecord.steps)) {
        return null;
    }

    return {
        steps: processRecord.steps
            .map((row) => normalizeStudentProcessStatusStep(row))
            .filter((step): step is StudentProcessStatusStep => step !== null),
    };
}
