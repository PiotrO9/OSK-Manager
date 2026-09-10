<script setup lang="ts">
import { Copy } from 'lucide-vue-next';

const props = defineProps<{ pkkNumber: string | null }>();
const { addToast } = useAppToast();
const number = computed(() => props.pkkNumber?.trim() ?? '');

async function copyPkk() {
    if (!number.value) return;

    try {
        await navigator.clipboard.writeText(number.value);
        addToast({
            title: 'Skopiowano numer PKK',
            variant: 'success',
            durationMs: 1800,
        });
    } catch {
        addToast({
            title: 'Nie udało się skopiować numeru PKK',
            description: 'Zaznacz numer i skopiuj go ręcznie.',
            variant: 'error',
        });
    }
}
</script>

<template>
    <button
        v-if="number"
        type="button"
        class="hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring inline-flex max-w-full cursor-pointer items-center gap-1 rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2"
        :aria-label="`Kopiuj numer PKK ${number}`"
        title="Kliknij, aby skopiować numer PKK"
        @click="copyPkk"
    >
        <span class="wrap-anywhere tabular-nums">{{ number }}</span>
        <Copy class="size-3 shrink-0" aria-hidden="true" />
    </button>
    <span v-else>brak numeru</span>
</template>
