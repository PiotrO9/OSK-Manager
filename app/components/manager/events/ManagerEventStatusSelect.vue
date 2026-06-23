<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import type { EventStatusCode, InstructorEvent } from '~/types/instructorEvent';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
    instructorEventStatusBadgeVariant,
    normalizeInstructorEventStatus,
} from '~/utils/instructorEventStatusDisplay';

const props = defineProps<{
    eventId: string;
    /** Aktualny status z API lub harmonogramu. */
    status?: string | null;
    /** Kompaktowy układ (np. w tabeli). */
    compact?: boolean;
}>();

const emit = defineEmits<{
    'update:status': [status: string];
    'status-changed': [payload: { id: string; status: string }];
}>();

const { addToast } = useAppToast();
const { updateInstructorEvent } = useInstructorEventsApi();

const localStatus = ref<EventStatusCode>(
    normalizeInstructorEventStatus(props.status ?? undefined),
);

let lastRequestId = 0;
const isSaving = ref(false);

watch(
    () => props.status,
    (s) => {
        localStatus.value = normalizeInstructorEventStatus(s ?? undefined);
    },
);

async function handleStatusUpdate(value: unknown): Promise<void> {
    const next = typeof value === 'string' ? value.trim().toUpperCase() : '';

    if (!INSTRUCTOR_EVENT_STATUS_OPTIONS.includes(next as EventStatusCode)) {
        return;
    }

    const nextStatus = next as EventStatusCode;
    const previous = localStatus.value;

    if (nextStatus === previous) {
        return;
    }

    const eid = props.eventId.trim();

    if (!eid) {
        return;
    }

    const myId = ++lastRequestId;

    localStatus.value = nextStatus;
    isSaving.value = true;

    try {
        const updated: InstructorEvent = await updateInstructorEvent(eid, {
            status: nextStatus,
        });

        if (myId !== lastRequestId) {
            return;
        }

        const resolved = normalizeInstructorEventStatus(updated.status);

        localStatus.value = resolved;
        emit('update:status', resolved);
        emit('status-changed', { id: eid, status: resolved });
    } catch (err: unknown) {
        if (myId !== lastRequestId) {
            return;
        }

        localStatus.value = previous;

        const code = getApiErrorStatusCode(err);

        addToast({
            title: 'Zmiana statusu',
            description:
                code === 404
                    ? 'Nie znaleziono wydarzenia lub zostało usunięte.'
                    : getApiFetchErrorMessage(
                          err,
                          'Nie udało się zmienić statusu wydarzenia.',
                      ),
            variant: 'error',
        });
    } finally {
        if (myId === lastRequestId) {
            isSaving.value = false;
        }
    }
}
</script>

<template>
    <div
        class="flex flex-wrap items-center gap-2"
        :class="compact ? 'min-w-0' : 'gap-3'"
    >
        <UiBadge
            :variant="instructorEventStatusBadgeVariant(localStatus)"
            class="shrink-0 font-normal"
        >
            {{ INSTRUCTOR_EVENT_STATUS_LABELS[localStatus] }}
        </UiBadge>
        <UiSelect
            :model-value="localStatus"
            :disabled="isSaving"
            :aria-label="
                'Zmień status wydarzenia — obecnie ' +
                INSTRUCTOR_EVENT_STATUS_LABELS[localStatus]
            "
            @update:model-value="handleStatusUpdate"
        >
            <UiSelectTrigger
                class="max-w-full min-w-38"
                :class="compact ? 'h-8 text-xs' : ''"
                @click.stop
            >
                <UiSelectValue
                    :placeholder="INSTRUCTOR_EVENT_STATUS_LABELS[localStatus]"
                />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="opt in INSTRUCTOR_EVENT_STATUS_OPTIONS"
                        :key="opt"
                        :value="opt"
                    >
                        {{ INSTRUCTOR_EVENT_STATUS_LABELS[opt] }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <span
            v-if="isSaving"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Zapisywanie…
        </span>
    </div>
</template>
