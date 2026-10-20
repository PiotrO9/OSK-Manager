<script setup lang="ts">
defineProps<{
    name: string;
    city: string;
    address: string;
    asDefault: boolean;
    defaultSwitchLocked: boolean;
    isSaving: boolean;
    nameError: string;
    submitError: string;
}>();
const emit = defineEmits<{
    'update:name': [value: string];
    'update:city': [value: string];
    'update:address': [value: string];
    'update:asDefault': [value: boolean];
    submit: [];
    cancel: [];
}>();
const fields = useTemplateRef<{ focusName: () => void }>('fields');

defineExpose({ focusName: () => fields.value?.focusName() });
</script>

<template>
    <form
        novalidate
        class="border-border bg-card space-y-6 rounded-xl border p-5 sm:p-6"
        :aria-busy="isSaving"
        @submit.prevent="emit('submit')"
    >
        <fieldset class="space-y-4" :disabled="isSaving">
            <legend class="text-foreground mb-4 font-semibold">
                Dane szkoły jazdy
            </legend>
            <ManagerOskBasicFields
                ref="fields"
                :name="name"
                :city="city"
                :address="address"
                :name-error="nameError"
                :disabled="isSaving"
                @update:name="emit('update:name', $event)"
                @update:city="emit('update:city', $event)"
                @update:address="emit('update:address', $event)"
            />
        </fieldset>
        <div
            class="border-border flex items-center justify-between gap-4 rounded-lg border p-4"
        >
            <div class="min-w-0 space-y-1">
                <UiLabel for="oskFormDefaultSwitch"
                    >Ustaw jako domyślną</UiLabel
                >
                <p
                    id="oskFormDefaultHint"
                    class="text-muted-foreground text-sm"
                >
                    {{
                        defaultSwitchLocked
                            ? 'Pierwsza szkoła na koncie automatycznie staje się domyślna.'
                            : 'Nowe moduły będą domyślnie otwierane w kontekście tej szkoły.'
                    }}
                </p>
            </div>
            <UiSwitch
                id="oskFormDefaultSwitch"
                :model-value="asDefault"
                :disabled="isSaving || defaultSwitchLocked"
                aria-describedby="oskFormDefaultHint"
                @update:model-value="emit('update:asDefault', $event)"
            />
        </div>
        <p v-if="submitError" class="text-destructive text-sm" role="alert">
            {{ submitError }}
        </p>
        <div
            class="border-border flex flex-col-reverse justify-end gap-3 border-t pt-5 sm:flex-row"
        >
            <UiButton
                type="button"
                variant="outline"
                :disabled="isSaving"
                @click="emit('cancel')"
                >Anuluj</UiButton
            >
            <UiButton
                type="submit"
                :disabled="isSaving"
                :aria-busy="isSaving"
                >{{ isSaving ? 'Zapisywanie…' : 'Dodaj szkołę' }}</UiButton
            >
        </div>
    </form>
</template>
