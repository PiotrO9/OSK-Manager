<script setup lang="ts">
interface Props {
    id?: string;
    modelValue: string | number;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    autocomplete?: string;
    placeholder?: string;
    ariaLabel?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: string | number): void;
    (e: 'keydown', event: KeyboardEvent): void;
}

withDefaults(defineProps<Props>(), {
    id: undefined,
    type: 'text',
    autocomplete: undefined,
    placeholder: '',
    ariaLabel: '',
    isDisabled: false,
    isRequired: false,
});

const emit = defineEmits<Emits>();

const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60';

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;

    emit('update:modelValue', target.value);
}
</script>

<template>
    <input
        :id="id"
        :type="type"
        :value="modelValue"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        :disabled="isDisabled"
        :required="isRequired"
        :class="inputClass"
        @input="handleInput"
        @keydown="emit('keydown', $event)"
    />
</template>
