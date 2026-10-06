<script setup lang="ts">
import {
    designSystemScenarioOptions,
    type DesignSystemScenario,
} from '~/data/design-system/scenarios';
const props = withDefaults(
    defineProps<{
        label: string;
        options?: readonly { value: string; label: string }[];
        scenarios?: readonly DesignSystemScenario[];
    }>(),
    {
        options: undefined,
        scenarios: () => ['data', 'empty', 'no-results', 'loading', 'error'],
    },
);
const model = defineModel<string>({ required: true });
const options = computed(
    () =>
        props.options ??
        designSystemScenarioOptions.filter((option) =>
            props.scenarios.includes(option.value),
        ),
);
</script>

<template>
    <div class="flex flex-wrap gap-2" role="group" :aria-label="label">
        <UiButton
            v-for="option in options"
            :key="option.value"
            type="button"
            size="sm"
            :variant="model === option.value ? 'default' : 'outline'"
            :aria-pressed="model === option.value"
            @click="model = option.value"
            >{{ option.label }}</UiButton
        >
    </div>
</template>
