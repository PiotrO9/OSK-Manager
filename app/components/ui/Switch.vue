<script setup lang="ts">
interface Props {
    checked: boolean;
    ariaLabel: string;
    leftIcon?: string;
    rightIcon?: string;
    leftIconClass?: string;
    rightIconClass?: string;
    isDisabled?: boolean;
}

interface Emits {
    (e: 'update:checked' | 'change', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
    leftIcon: undefined,
    rightIcon: undefined,
    leftIconClass: '',
    rightIconClass: '',
    isDisabled: false,
});

const emit = defineEmits<Emits>();

const switchClass = computed(() => {
    const base =
        'relative flex h-8 w-14 cursor-pointer items-center rounded-full px-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-secondary-950 disabled:cursor-not-allowed disabled:opacity-60';

    const checkedClass = props.checked
        ? 'bg-primary-500 dark:bg-primary-600'
        : 'bg-secondary-200 dark:bg-secondary-700';

    return `${base} ${checkedClass}`;
});

function handleClick() {
    if (props.isDisabled) return;

    const newValue = !props.checked;

    emit('update:checked', newValue);
    emit('change', newValue);
}

function handleKeyDown(event: KeyboardEvent) {
    if (props.isDisabled) return;

    if (!isEnterOrSpaceKey(event)) return;

    event.preventDefault();
    handleClick();
}
</script>

<template>
    <button
        type="button"
        :disabled="props.isDisabled"
        :aria-label="props.ariaLabel"
        :aria-checked="props.checked"
        role="switch"
        tabindex="0"
        :class="switchClass"
        @click="handleClick"
        @keydown="handleKeyDown"
    >
        <Icon
            v-if="props.leftIcon"
            :name="props.leftIcon"
            class="absolute left-1.5 size-4 transition-opacity duration-300"
            :class="[
                props.checked ? 'opacity-40' : 'opacity-100',
                props.leftIconClass,
            ]"
            aria-hidden="true"
        />
        <Icon
            v-if="props.rightIcon"
            :name="props.rightIcon"
            class="absolute right-1.5 size-4 transition-opacity duration-300"
            :class="[
                props.checked ? 'opacity-100' : 'opacity-40',
                props.rightIconClass,
            ]"
            aria-hidden="true"
        />
        <span
            class="absolute flex size-6 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300"
            :class="props.checked ? 'translate-x-6' : 'translate-x-0'"
            aria-hidden="true"
        />
    </button>
</template>
