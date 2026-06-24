<script setup lang="ts">
import { BookOpen, IdCard, Mail } from 'lucide-vue-next';

const props = defineProps<{
    initials: string;
    displayName: string;
    subtitle: string;
    email: string;
    pkkNumber: string | null;
    coursesCount: number;
}>();

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
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardContent class="space-y-5 p-5">
            <div class="flex items-start gap-4 xl:flex-col">
                <div
                    class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                    aria-hidden="true"
                >
                    {{ initials }}
                </div>
                <div class="min-w-0">
                    <h2 class="text-foreground truncate text-xl font-extrabold">
                        {{ displayName }}
                    </h2>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ subtitle }}
                    </p>
                </div>
            </div>

            <dl class="divide-border divide-y">
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <Mail class="size-4" aria-hidden="true" />
                        Email
                    </dt>
                    <dd
                        class="max-w-[180px] truncate text-right text-sm font-bold"
                    >
                        {{ displayText(props.email) }}
                    </dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <IdCard class="size-4" aria-hidden="true" />
                        Numer PKK
                    </dt>
                    <dd
                        class="text-right text-sm font-bold"
                        :class="{
                            'text-muted-foreground':
                                !pkkNumber || pkkNumber.trim().length === 0,
                        }"
                    >
                        {{ displayPkkNumber(pkkNumber) }}
                    </dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <BookOpen class="size-4" aria-hidden="true" />
                        Kursy
                    </dt>
                    <dd class="text-sm font-bold">
                        {{ coursesCount }}
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
