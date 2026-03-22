<script setup lang="ts">
import { RADIO_GROUP_INJECTION_KEY } from './radioGroupContext';

interface Props {
    id?: string;
    value: string | number;
    name?: string;
    modelValue?: string | number;
    ariaLabel?: string;
    isDisabled?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: string | number): void;
}

const props = withDefaults(defineProps<Props>(), {
    id: undefined,
    name: undefined,
    modelValue: undefined,
    ariaLabel: '',
    isDisabled: false,
});

const emit = defineEmits<Emits>();

const radioGroupContextRef = inject(RADIO_GROUP_INJECTION_KEY, null);

const generatedId = useId();
const effectiveId = computed(
    () =>
        props.id ??
        `radio-${generatedId}-${String(props.value).replace(/\s/g, '-')}`,
);

const effectiveName = computed(() => {
    const ctx = radioGroupContextRef?.value;

    if (ctx) return ctx.name;

    return props.name ?? `radio-${Math.random().toString(36).slice(2)}`;
});

const isChecked = computed(() => {
    const ctx = radioGroupContextRef?.value;
    const currentValue = ctx ? ctx.modelValue : props.modelValue;

    return currentValue === props.value;
});

function handleChange() {
    if (props.isDisabled) return;

    const ctx = radioGroupContextRef?.value;

    if (ctx) {
        ctx.setValue(props.value);
    } else {
        emit('update:modelValue', props.value);
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (props.isDisabled) return;

    if (!isEnterOrSpaceKey(event)) return;

    event.preventDefault();
    handleChange();
}

const radioClass =
    'size-4 shrink-0 cursor-pointer rounded-full border-2 border-secondary-300 text-primary-500 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-secondary-600 dark:focus-visible:ring-offset-secondary-950 disabled:cursor-not-allowed disabled:opacity-60';
</script>

<template>
    <label
        :for="effectiveId"
        class="inline-flex cursor-pointer items-center gap-2"
        :class="{ 'cursor-not-allowed opacity-60': props.isDisabled }"
    >
        <input
            :id="effectiveId"
            type="radio"
            :name="effectiveName"
            :value="value"
            :checked="isChecked"
            :disabled="props.isDisabled"
            :aria-label="props.ariaLabel"
            :aria-checked="isChecked"
            :class="radioClass"
            tabindex="0"
            @change="handleChange"
            @keydown="handleKeyDown"
        />
        <span
            v-if="$slots.default"
            class="text-sm text-slate-700 dark:text-slate-300"
        >
            <slot />
        </span>
    </label>
</template>
