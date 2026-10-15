<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import type { ButtonVariants } from '.';
import { Primitive } from 'reka-ui';
import { cn } from '@/lib/utils';
import { buttonVariants } from '.';

interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    class?: HTMLAttributes['class'];
    disabled?: boolean;
    /** Czas, przez który przycisk pozostaje zablokowany po aktywacji. */
    activationDelaySeconds?: number;
    /** Pozwala uruchamiać odliczanie ponownie przy każdym otwarciu modala. */
    activationDelayActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    as: 'button',
    variant: undefined,
    size: undefined,
    class: undefined,
    disabled: false,
    activationDelaySeconds: 0,
    activationDelayActive: true,
});

const remainingSeconds = shallowRef(0);
let countdownTimer: ReturnType<typeof setInterval> | undefined;

function clearCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);

    countdownTimer = undefined;
}

function resetCountdown() {
    clearCountdown();

    const delaySeconds = Math.max(0, Math.ceil(props.activationDelaySeconds));

    if (!props.activationDelayActive || delaySeconds === 0) {
        remainingSeconds.value = 0;

        return;
    }

    remainingSeconds.value = delaySeconds;

    if (!import.meta.client) return;

    const unlockAt = Date.now() + delaySeconds * 1000;

    countdownTimer = setInterval(() => {
        remainingSeconds.value = Math.max(
            0,
            Math.ceil((unlockAt - Date.now()) / 1000),
        );

        if (remainingSeconds.value === 0) clearCountdown();
    }, 200);
}

watch(
    () => [props.activationDelaySeconds, props.activationDelayActive],
    resetCountdown,
    { immediate: true },
);

onUnmounted(clearCountdown);
</script>

<template>
    <Primitive
        data-slot="button"
        :data-variant="variant"
        :data-size="size"
        :as="as"
        :as-child="asChild"
        :disabled="disabled || remainingSeconds > 0"
        :class="cn(buttonVariants({ variant, size }), props.class)"
    >
        <slot />
        <span v-if="remainingSeconds > 0" aria-live="polite">
            ({{ remainingSeconds }} s)
        </span>
    </Primitive>
</template>
