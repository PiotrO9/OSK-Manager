<script setup lang="ts">
import { BookOpen, CircleAlert, CircleCheck, Mail } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        initials: string;
        displayName: string;
        subtitle: string;
        email: string;
        pkkNumber: string | null;
        coursesCount: number;
        showIdentity?: boolean;
    }>(),
    {
        showIdentity: true,
    },
);

const hasPkk = computed(() => Boolean(props.pkkNumber?.trim()));

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '--';
}

function displayPkkNumber(value: string | null): string {
    if (value === null || value === undefined) {
        return 'Brak PKK';
    }

    const t = value.trim();

    return t.length > 0 ? t : 'Brak PKK';
}
</script>

<template>
    <UiCard class="overflow-hidden rounded-lg shadow-xs">
        <UiCardContent class="space-y-3 p-4">
            <div v-if="props.showIdentity" class="flex items-start gap-4">
                <div
                    class="bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-300 flex size-16 shrink-0 items-center justify-center rounded-lg text-xl font-extrabold"
                    aria-hidden="true"
                >
                    {{ initials }}
                </div>
                <div class="min-w-0">
                    <h2 class="text-foreground truncate text-xl font-bold">
                        {{ displayName }}
                    </h2>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ subtitle }}
                    </p>
                </div>
            </div>
            <div v-else class="flex items-center gap-3">
                <div
                    class="bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-300 flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold"
                    aria-hidden="true"
                >
                    {{ initials }}
                </div>
                <div class="min-w-0">
                    <p class="text-foreground text-sm font-semibold">
                        Dane kontaktowe
                    </p>
                    <p class="text-muted-foreground text-sm wrap-break-word">
                        {{ displayText(props.email) }}
                    </p>
                </div>
            </div>

            <div class="grid gap-3">
                <div
                    class="border-border bg-background rounded-lg border px-3 py-3"
                    :class="
                        hasPkk
                            ? 'border-success-200 bg-success-50/40 dark:border-success-500/40 dark:bg-success-500/10'
                            : 'border-warning-200 bg-warning-50/50 dark:border-warning-500/40 dark:bg-warning-500/10'
                    "
                >
                    <div class="flex min-w-0 items-start gap-3">
                        <component
                            :is="hasPkk ? CircleCheck : CircleAlert"
                            class="mt-0.5 size-4 shrink-0"
                            :class="
                                hasPkk
                                    ? 'text-success-700 dark:text-success-300'
                                    : 'text-warning-800 dark:text-warning-300'
                            "
                            aria-hidden="true"
                        />
                        <div class="min-w-0">
                            <p
                                class="text-muted-foreground text-sm font-medium"
                            >
                                Numer PKK
                            </p>
                            <p
                                class="text-foreground mt-0.5 text-base font-semibold wrap-break-word"
                            >
                                <ManagerStudentPkkCopy
                                    v-if="hasPkk"
                                    :pkk-number="props.pkkNumber"
                                />
                                <span v-else>
                                    {{ displayPkkNumber(pkkNumber) }}
                                </span>
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                {{ hasPkk ? 'Uzupełniony' : 'Do uzupełnienia' }}
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    class="border-border bg-background flex items-center justify-between gap-4 rounded-lg border px-3 py-3"
                >
                    <div class="min-w-0">
                        <p class="text-muted-foreground text-sm font-medium">
                            Przypisane kursy
                        </p>
                        <p
                            class="text-foreground mt-0.5 text-xl font-semibold tabular-nums"
                        >
                            {{ coursesCount }}
                        </p>
                    </div>
                    <div class="shrink-0">
                        <BookOpen
                            class="text-muted-foreground size-5 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>

            <dl v-if="props.showIdentity" class="divide-border divide-y">
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <Mail class="size-4" aria-hidden="true" />
                        Email
                    </dt>
                    <dd class="min-w-0 truncate text-right text-sm font-bold">
                        {{ displayText(props.email) }}
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
