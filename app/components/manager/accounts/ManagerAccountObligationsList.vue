<script setup lang="ts">
import type { ManagerAccount } from '~/types/manager/account';
import type {
    AccountObligation,
    AccountObligationType,
} from '~/types/manager/accountObligation';

const props = defineProps<{
    account: ManagerAccount;
    obligations: readonly AccountObligation[];
}>();

const labels: Record<AccountObligationType, string> = {
    LESSON: 'Lekcja',
    COURSE: 'Kurs',
    EVENT: 'Wydarzenie',
    PAYMENT: 'Płatność',
    TIME_BLOCK: 'Blok czasu',
};

const grouped = computed(() =>
    Object.entries(labels)
        .map(([type, label]) => ({
            type: type as AccountObligationType,
            label,
            items: props.obligations.filter((item) => item.type === type),
        }))
        .filter((group) => group.items.length),
);

function formatDate(value: string | null, dateOnly = false): string {
    if (!value) return 'Bez daty';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('pl-PL', {
              dateStyle: 'medium',
              ...(dateOnly ? {} : { timeStyle: 'short' as const }),
              timeZone: 'Europe/Warsaw',
          }).format(date);
}

function target(item: AccountObligation): string {
    if (item.type === 'LESSON') return `/manager/lessons/${item.id}/edit`;

    if (item.type === 'COURSE') return `/manager/courses/${item.id}`;

    if (item.type === 'EVENT') return `/manager/events/${item.id}/edit`;

    if (item.type === 'PAYMENT')
        return `/manager/students/${props.account.id}?tab=payments&paymentId=${encodeURIComponent(item.id)}`;

    const instructorProfileId = props.account.instructorProfile?.id;

    return instructorProfileId
        ? `/manager/instructors/${instructorProfileId}/schedule${item.startTime ? `?week=${encodeURIComponent(item.startTime)}` : ''}`
        : '';
}
</script>

<template>
    <div class="space-y-6">
        <section v-for="group in grouped" :key="group.type" class="space-y-3">
            <h2 class="text-lg font-semibold">
                {{ group.label }} ({{ group.items.length }})
            </h2>
            <div class="space-y-2">
                <details
                    v-for="item in group.items"
                    :key="`${item.type}-${item.id}`"
                    class="border-border bg-card rounded-xl border p-4"
                >
                    <summary class="cursor-pointer font-medium">
                        {{ item.title
                        }}<span
                            v-if="item.startTime"
                            class="text-muted-foreground ml-2 text-sm font-normal"
                            >{{
                                formatDate(
                                    item.startTime,
                                    item.type === 'PAYMENT',
                                )
                            }}</span
                        >
                    </summary>
                    <div class="text-muted-foreground mt-3 space-y-1 text-sm">
                        <p>Typ: {{ group.label }}</p>
                        <p v-if="item.startTime">
                            Początek lub termin:
                            {{
                                formatDate(
                                    item.startTime,
                                    item.type === 'PAYMENT',
                                )
                            }}
                        </p>
                        <p v-if="item.endTime">
                            Koniec: {{ formatDate(item.endTime) }}
                        </p>
                        <p v-if="item.amount">
                            Kwota: {{ item.amount }}
                            {{ item.currency || 'PLN' }}
                        </p>
                        <p v-if="item.status">
                            Status:
                            {{
                                item.status === 'PENDING'
                                    ? 'Oczekująca'
                                    : item.status
                            }}
                        </p>
                        <p v-if="item.type === 'PAYMENT'">
                            Płatność jest powiązana z planem kursu, w którym
                            uczestniczy kursant.
                        </p>
                        <NuxtLink
                            v-if="target(item)"
                            :to="target(item)"
                            class="text-primary inline-block font-semibold underline underline-offset-4"
                            >Otwórz powiązany widok</NuxtLink
                        >
                    </div>
                </details>
            </div>
        </section>
    </div>
</template>
