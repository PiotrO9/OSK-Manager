<script setup lang="ts">
export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
    tag?: string;
    ariaLabel?: string;
    variant?: ActionVariant;
    buttonType?: 'button' | 'submit' | 'reset';
    isLoading?: boolean;
    isDisabled?: boolean;
    href?: string;
    circle?: boolean;
}

interface Emits {
    (e: 'click', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
    tag: 'button',
    ariaLabel: 'Action',
    variant: 'primary',
    buttonType: 'button',
    isLoading: false,
    isDisabled: false,
    href: undefined,
    circle: false,
});

const emit = defineEmits<Emits>();

const isDisabled = computed(() => props.isDisabled || props.isLoading);

const baseClasses =
    'inline-flex items-center justify-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-secondary-950 disabled:cursor-not-allowed';

const shapeClasses = computed(() =>
    props.circle ? 'rounded-full w-10 h-10 p-0' : 'rounded-xl px-4 py-2',
);

const stateClasses = computed(() => {
    if (props.isLoading) {
        const loadingBase =
            'cursor-wait border border-secondary-200 dark:border-secondary-700';

        if (props.variant === 'secondary') {
            return `${loadingBase} bg-secondary-100 text-secondary-900 dark:bg-secondary-800 dark:text-secondary-50`;
        }

        if (props.variant === 'ghost') {
            return `${loadingBase} bg-transparent text-secondary-700 dark:text-secondary-300`;
        }

        if (props.variant === 'danger') {
            return `${loadingBase} bg-danger-100 text-danger-600 border-danger-200 dark:bg-danger-950/40 dark:text-danger-300 dark:border-danger-800`;
        }

        return `${loadingBase} bg-primary-100 text-primary-600 border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800`;
    }

    if (props.isDisabled) {
        return 'cursor-not-allowed bg-secondary-100 text-secondary-400 border border-secondary-200 dark:bg-secondary-800 dark:text-secondary-500 dark:border-secondary-700';
    }

    if (props.variant === 'secondary') {
        return 'cursor-pointer bg-secondary-100 text-secondary-900 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-50 dark:hover:bg-secondary-700';
    }

    if (props.variant === 'ghost') {
        return 'cursor-pointer bg-transparent text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800';
    }

    if (props.variant === 'danger') {
        return 'cursor-pointer bg-danger-600 text-white hover:bg-danger-500 dark:bg-danger-700 dark:hover:bg-danger-600';
    }

    return 'cursor-pointer bg-primary-500 text-white hover:bg-primary-400 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-500';
});

const actionClass = computed(
    () => `${baseClasses} ${shapeClasses.value} ${stateClasses.value}`,
);

const loadingClasses = computed(() => ({
    relative: props.isLoading,
    'pointer-events-none overflow-hidden cursor-wait': props.isLoading,
}));

function handleClick(event: MouseEvent) {
    if (isDisabled.value) {
        event.preventDefault();

        return;
    }

    emit('click', event);
}

function handleKeyDown(event: KeyboardEvent) {
    if (isDisabled.value) return;

    if (isEnterOrSpaceKey(event)) {
        event.preventDefault();
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        });

        emit('click', clickEvent);
    }
}
</script>

<template>
    <component
        :is="tag"
        :type="tag === 'button' ? buttonType : undefined"
        :disabled="isDisabled && tag === 'button'"
        :href="tag === 'a' ? href : undefined"
        :aria-label
        :aria-disabled="isDisabled"
        :tabindex="isDisabled ? -1 : 0"
        :class="[actionClass, loadingClasses]"
        @click="handleClick"
        @keydown="handleKeyDown"
    >
        <div
            :class="{
                'opacity-0': isLoading && circle,
                'opacity-50': isLoading && !circle,
            }"
        >
            <slot />
        </div>
        <div
            v-if="isLoading"
            class="absolute inset-0 z-10 flex cursor-wait items-center justify-center gap-2"
            aria-hidden="true"
            @click.stop
            @mousedown.stop
            @mouseup.stop
        >
            <span
                class="size-4 animate-spin cursor-wait rounded-full border-2 border-current border-r-transparent"
            />
        </div>
    </component>
</template>
