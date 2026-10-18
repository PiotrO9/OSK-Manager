<script setup lang="ts">
import type { SecurityLogDetail } from '~/types/security-logs/securityLog';
import {
    eventDate,
    eventLabel,
    operationLabel,
    outcomeLabel,
    personLabel,
    severityLabel,
    severityTone,
    targetLabel,
} from '~/utils/security-logs/securityLogPresentation';

defineProps<{
    open: boolean;
    detail: SecurityLogDetail | null;
    loading: boolean;
    error: string;
}>();
const emit = defineEmits<{ close: []; retry: [] }>();
</script>

<template>
    <UiDialog :open="open" @update:open="!$event && emit('close')">
        <UiDialogContent class="max-h-[88vh] overflow-y-auto sm:max-w-xl">
            <UiDialogHeader
                ><UiDialogTitle>Szczegóły zdarzenia</UiDialogTitle
                ><UiDialogDescription
                    >Informacje zapisane w dzienniku
                    bezpieczeństwa.</UiDialogDescription
                ></UiDialogHeader
            >
            <LoadingState v-if="loading" title="Wczytywanie szczegółów" />
            <ErrorState
                v-else-if="error"
                :description="error"
                @retry="emit('retry')"
            />
            <div v-else-if="detail" class="space-y-4 text-sm">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-foreground text-base font-semibold">
                        {{ eventLabel(detail.type) }}
                    </h3>
                    <StatusBadge
                        :label="severityLabel(detail.severity)"
                        :tone="severityTone(detail.severity)"
                    />
                </div>
                <dl
                    class="grid grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] gap-x-4 gap-y-2 break-words"
                >
                    <dt class="text-muted-foreground">Data i czas</dt>
                    <dd>{{ eventDate(detail.occurredAt) }}</dd>
                    <dt class="text-muted-foreground">Wynik</dt>
                    <dd>{{ outcomeLabel(detail.outcome) }}</dd>
                    <dt class="text-muted-foreground">Wykonawca</dt>
                    <dd>
                        {{ personLabel(detail.actor)
                        }}{{
                            detail.actor?.role ? ` (${detail.actor.role})` : ''
                        }}
                    </dd>
                    <dt class="text-muted-foreground">Operacja</dt>
                    <dd>{{ operationLabel(detail) }}</dd>
                    <template v-if="detail.operationCode">
                        <dt class="text-muted-foreground">Kod operacji</dt>
                        <dd class="font-mono text-xs">
                            {{ detail.operationCode }}
                        </dd>
                    </template>
                    <dt class="text-muted-foreground">Cel</dt>
                    <dd>
                        {{ targetLabel(detail.target) }}
                    </dd>
                    <dt class="text-muted-foreground">Powód</dt>
                    <dd>{{ detail.reasonCode || '—' }}</dd>
                    <dt class="text-muted-foreground">HTTP</dt>
                    <dd>
                        {{ detail.httpMethod || '—' }}
                        {{ detail.routeTemplate || ''
                        }}{{
                            detail.httpStatus ? ` · ${detail.httpStatus}` : ''
                        }}
                    </dd>
                    <dt class="text-muted-foreground">Adres IP</dt>
                    <dd>{{ detail.clientIp || 'Brak danych' }}</dd>
                    <dt class="text-muted-foreground">Przeglądarka</dt>
                    <dd>{{ detail.userAgent || 'Brak danych' }}</dd>
                    <dt class="text-muted-foreground">Identyfikator żądania</dt>
                    <dd class="font-mono text-xs">
                        {{ detail.requestId || '—' }}
                    </dd>
                    <template v-if="detail.metadata?.attemptCount"
                        ><dt class="text-muted-foreground">Liczba prób</dt>
                        <dd>
                            {{ detail.metadata.attemptCount
                            }}{{
                                detail.metadata.windowMinutes
                                    ? ` w ${detail.metadata.windowMinutes} min`
                                    : ''
                            }}
                        </dd></template
                    >
                </dl>
            </div>
        </UiDialogContent>
    </UiDialog>
</template>
