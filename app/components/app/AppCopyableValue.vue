<script setup lang="ts">
import { Copy } from 'lucide-vue-next';
import { copyTextToClipboard } from '~/utils/browser/copyToClipboard';

const props = withDefaults(
    defineProps<{
        value: string | null | undefined;
        copyLabel: string;
        successTitle: string;
        errorTitle: string;
        emptyLabel?: string;
    }>(),
    {
        emptyLabel: 'brak wartości',
    },
);

const { addToast } = useAppToast();
const normalizedValue = computed(() => props.value?.trim() ?? '');

async function copyValue(): Promise<void> {
    if (!normalizedValue.value) return;

    const copied = await copyTextToClipboard(normalizedValue.value);

    if (copied) {
        addToast({
            title: props.successTitle,
            variant: 'success',
            durationMs: 1800,
        });

        return;
    }

    addToast({
        title: props.errorTitle,
        description: 'Zaznacz wartość i skopiuj ją ręcznie.',
        variant: 'error',
    });
}
</script>

<template>
    <button
        v-if="normalizedValue"
        type="button"
        class="hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring inline-flex max-w-full cursor-pointer items-center gap-1 rounded-sm text-left underline-offset-4 outline-none hover:underline focus-visible:ring-2"
        :aria-label="`Kopiuj ${props.copyLabel} ${normalizedValue}`"
        :title="`Kliknij, aby skopiować ${props.copyLabel}`"
        @click="copyValue"
    >
        <span class="wrap-anywhere tabular-nums">{{ normalizedValue }}</span>
        <Copy class="size-3 shrink-0" aria-hidden="true" />
    </button>
    <span v-else>{{ props.emptyLabel }}</span>
</template>
