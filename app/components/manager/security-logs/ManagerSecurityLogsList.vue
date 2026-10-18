<script setup lang="ts">
import type { SecurityLogItem } from '~/types/security-logs/securityLog';
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

defineProps<{ items: readonly SecurityLogItem[] }>();
const emit = defineEmits<{ openDetails: [eventId: string] }>();
</script>

<template>
    <div class="min-w-0">
        <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[790px] table-fixed text-left text-sm">
                <thead
                    class="bg-muted/40 text-muted-foreground border-border border-b text-xs font-semibold"
                >
                    <tr>
                        <th scope="col" class="w-[17%] px-4 py-3">
                            Data i czas
                        </th>
                        <th scope="col" class="w-[22%] px-4 py-3">Zdarzenie</th>
                        <th scope="col" class="w-[17%] px-4 py-3">Wykonawca</th>
                        <th scope="col" class="w-[24%] px-4 py-3">
                            Operacja i cel
                        </th>
                        <th scope="col" class="w-[11%] px-4 py-3">Wynik</th>
                        <th scope="col" class="w-[9%] px-4 py-3">Szczegóły</th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="item in items"
                        :key="item.id"
                        class="hover:bg-muted/20"
                    >
                        <td
                            class="text-muted-foreground px-4 py-3 align-top text-xs tabular-nums"
                        >
                            {{ eventDate(item.occurredAt) }}
                        </td>
                        <td class="px-4 py-3 align-top">
                            <p class="text-foreground font-medium">
                                {{ eventLabel(item.type) }}
                            </p>
                            <StatusBadge
                                class="mt-1.5"
                                :label="severityLabel(item.severity)"
                                :tone="severityTone(item.severity)"
                                subtle
                            />
                        </td>
                        <td class="px-4 py-3 align-top">
                            <span
                                class="block truncate"
                                :title="personLabel(item.actor)"
                                >{{ personLabel(item.actor) }}</span
                            ><span
                                v-if="item.actor?.role"
                                class="text-muted-foreground text-xs"
                                >{{ item.actor.role }}</span
                            >
                        </td>
                        <td class="px-4 py-3 align-top">
                            <span class="block font-medium break-words">{{
                                operationLabel(item)
                            }}</span
                            ><span
                                v-if="targetLabel(item.target) !== '—'"
                                class="text-muted-foreground block truncate text-xs"
                                :title="targetLabel(item.target)"
                                >{{ targetLabel(item.target) }}</span
                            >
                        </td>
                        <td class="px-4 py-3 align-top">
                            <span class="font-medium">{{
                                outcomeLabel(item.outcome)
                            }}</span
                            ><span
                                v-if="item.httpStatus"
                                class="text-muted-foreground block text-xs"
                                >HTTP {{ item.httpStatus }}</span
                            >
                        </td>
                        <td class="px-4 py-3 align-top">
                            <UiButton
                                type="button"
                                size="sm"
                                variant="outline"
                                :aria-label="`Szczegóły: ${eventLabel(item.type)} ${eventDate(item.occurredAt)}`"
                                @click="emit('openDetails', item.id)"
                                >Szczegóły</UiButton
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <ul
            class="divide-border divide-y md:hidden"
            aria-label="Zdarzenia bezpieczeństwa"
        >
            <li
                v-for="item in items"
                :key="item.id"
                class="space-y-3 px-4 py-4"
            >
                <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <p class="font-semibold">{{ eventLabel(item.type) }}</p>
                        <p class="text-muted-foreground text-xs tabular-nums">
                            {{ eventDate(item.occurredAt) }}
                        </p>
                    </div>
                    <StatusBadge
                        :label="severityLabel(item.severity)"
                        :tone="severityTone(item.severity)"
                        subtle
                    />
                </div>
                <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt class="text-muted-foreground">Wykonawca</dt>
                    <dd class="min-w-0 break-words">
                        {{ personLabel(item.actor) }}
                    </dd>
                    <dt class="text-muted-foreground">Operacja</dt>
                    <dd class="min-w-0 break-words">
                        {{ operationLabel(item) }}
                    </dd>
                    <dt class="text-muted-foreground">Cel</dt>
                    <dd class="min-w-0 break-words">
                        {{ targetLabel(item.target) }}
                    </dd>
                    <dt class="text-muted-foreground">Wynik</dt>
                    <dd>
                        {{ outcomeLabel(item.outcome)
                        }}{{
                            item.httpStatus ? ` · HTTP ${item.httpStatus}` : ''
                        }}
                    </dd>
                </dl>
                <UiButton
                    type="button"
                    variant="outline"
                    class="h-11 w-full"
                    @click="emit('openDetails', item.id)"
                    >Szczegóły</UiButton
                >
            </li>
        </ul>
    </div>
</template>
