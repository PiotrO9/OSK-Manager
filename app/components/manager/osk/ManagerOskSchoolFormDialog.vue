<script setup lang="ts">
interface Props {
    open: boolean;
    mode: 'create' | 'edit';
    name: string;
    city: string;
    address: string;
    asDefault: boolean;
    isSaving: boolean;
    defaultSwitchLocked: boolean;
    nameError: string;
    submitError: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:name': [value: string];
    'update:city': [value: string];
    'update:address': [value: string];
    'update:asDefault': [value: boolean];
    submit: [];
}>();

const dialogTitle = computed(() =>
    props.mode === 'create' ? 'Nowa szkoła jazdy' : 'Edycja szkoły jazdy',
);

const dialogDescription = computed(() =>
    props.mode === 'create'
        ? 'Wypełnij dane nowej szkoły jazdy.'
        : 'Zmień nazwę lub dane adresowe szkoły.',
);

const descriptionId = computed(() =>
    props.mode === 'create' ? 'osk-form-create-desc' : 'osk-form-edit-desc',
);

const submitLabel = computed(() =>
    props.mode === 'create' ? 'Dodaj szkołę' : 'Zapisz zmiany',
);

const nameFieldRef = useTemplateRef<HTMLElement>('nameField');

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handlePointerDownOutside(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

function handleEscapeKeyDown(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

function toTextInputValue(value: string | number): string {
    return String(value);
}

watch(
    () => props.nameError,
    async (error) => {
        if (!error) return;

        await nextTick();
        nameFieldRef.value?.querySelector('input')?.focus();
    },
);
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="!isSaving"
            :aria-describedby="descriptionId"
            class="max-w-md"
            @pointer-down-outside="handlePointerDownOutside"
            @escape-key-down="handleEscapeKeyDown"
        >
            <UiDialogHeader>
                <UiDialogTitle>{{ dialogTitle }}</UiDialogTitle>
                <UiDialogDescription :id="descriptionId">
                    {{ dialogDescription }}
                </UiDialogDescription>
            </UiDialogHeader>

            <form class="space-y-4" @submit.prevent="emit('submit')">
                <div ref="nameField" class="space-y-2">
                    <UiLabel for="oskFormNameInput">Nazwa</UiLabel>
                    <UiInput
                        id="oskFormNameInput"
                        name="schoolName"
                        :model-value="name"
                        type="text"
                        :placeholder="
                            mode === 'create' ? 'np. OSK Novum…' : undefined
                        "
                        autocomplete="organization"
                        aria-required="true"
                        :aria-invalid="nameError ? 'true' : 'false'"
                        :aria-describedby="
                            nameError ? 'oskFormNameError' : undefined
                        "
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:name', toTextInputValue($event))
                        "
                    />
                    <p
                        v-if="nameError"
                        id="oskFormNameError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ nameError }}
                    </p>
                </div>
                <div class="space-y-2">
                    <UiLabel for="oskFormCityInput">
                        Miasto
                        <span
                            class="text-muted-foreground ml-1 text-xs font-normal"
                            >(opcjonalnie)</span
                        >
                    </UiLabel>
                    <UiInput
                        id="oskFormCityInput"
                        name="addressLevel2"
                        :model-value="city"
                        type="text"
                        :placeholder="
                            mode === 'create' ? 'np. Warszawa…' : undefined
                        "
                        autocomplete="address-level2"
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:city', toTextInputValue($event))
                        "
                    />
                </div>
                <div class="space-y-2">
                    <UiLabel for="oskFormAddressInput">
                        Adres
                        <span
                            class="text-muted-foreground ml-1 text-xs font-normal"
                            >(opcjonalnie)</span
                        >
                    </UiLabel>
                    <UiInput
                        id="oskFormAddressInput"
                        name="streetAddress"
                        :model-value="address"
                        type="text"
                        :placeholder="
                            mode === 'create'
                                ? 'np. ul. Przykładowa 1…'
                                : undefined
                        "
                        autocomplete="street-address"
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:address', toTextInputValue($event))
                        "
                    />
                </div>

                <div
                    v-if="mode === 'create'"
                    class="border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3"
                >
                    <div class="min-w-0">
                        <UiLabel
                            for="oskFormDefaultSwitch"
                            :class="
                                defaultSwitchLocked
                                    ? 'text-sm font-medium'
                                    : 'cursor-pointer text-sm font-medium'
                            "
                        >
                            Ustaw jako domyślną
                        </UiLabel>
                        <p
                            id="oskFormDefaultHint"
                            class="text-muted-foreground mt-0.5 text-xs"
                        >
                            Nowe moduły będą domyślnie otwierane w kontekście
                            tej szkoły.
                        </p>
                        <p
                            v-if="defaultSwitchLocked"
                            id="oskFormDefaultLockedHint"
                            class="text-muted-foreground mt-1 text-xs"
                        >
                            Pierwsza szkoła na koncie automatycznie staje się
                            domyślna.
                        </p>
                    </div>
                    <UiSwitch
                        id="oskFormDefaultSwitch"
                        :model-value="asDefault"
                        :disabled="isSaving || defaultSwitchLocked"
                        :aria-describedby="
                            defaultSwitchLocked
                                ? 'oskFormDefaultHint oskFormDefaultLockedHint'
                                : 'oskFormDefaultHint'
                        "
                        :aria-label="
                            defaultSwitchLocked
                                ? 'Pierwsza szkoła automatycznie stanie się domyślna'
                                : 'Ustaw nową szkołę jako domyślną'
                        "
                        @update:model-value="emit('update:asDefault', $event)"
                    />
                </div>

                <p
                    v-if="submitError"
                    class="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-sm"
                    role="alert"
                >
                    {{ submitError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="isSaving"
                        :aria-busy="isSaving"
                    >
                        {{ isSaving ? 'Zapisywanie…' : submitLabel }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
