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
        : 'Zmień dane szkoły lub ustaw ją jako domyślną.',
);

const descriptionId = computed(() =>
    props.mode === 'create' ? 'osk-form-create-desc' : 'osk-form-edit-desc',
);

const submitLabel = computed(() =>
    props.mode === 'create' ? 'Dodaj szkołę' : 'Zapisz zmiany',
);

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
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="true"
            :aria-describedby="descriptionId"
            class="max-w-md"
            @pointer-down-outside="handlePointerDownOutside"
        >
            <UiDialogHeader>
                <UiDialogTitle>{{ dialogTitle }}</UiDialogTitle>
                <UiDialogDescription :id="descriptionId">
                    {{ dialogDescription }}
                </UiDialogDescription>
            </UiDialogHeader>

            <form class="space-y-4" @submit.prevent="emit('submit')">
                <div class="space-y-2">
                    <UiLabel for="oskFormNameInput">Nazwa</UiLabel>
                    <UiInput
                        id="oskFormNameInput"
                        :model-value="name"
                        type="text"
                        :placeholder="
                            mode === 'create' ? 'np. OSK Novum' : undefined
                        "
                        autocomplete="organization"
                        aria-required="true"
                        aria-label="Nazwa szkoły jazdy"
                        :disabled="isSaving"
                        @update:model-value="emit('update:name', $event)"
                    />
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
                        :model-value="city"
                        type="text"
                        :placeholder="
                            mode === 'create' ? 'np. Warszawa' : undefined
                        "
                        aria-label="Miasto"
                        :disabled="isSaving"
                        @update:model-value="emit('update:city', $event)"
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
                        :model-value="address"
                        type="text"
                        :placeholder="
                            mode === 'create' ? 'ul. Przykładowa 1' : undefined
                        "
                        aria-label="Adres"
                        :disabled="isSaving"
                        @update:model-value="emit('update:address', $event)"
                    />
                </div>

                <div
                    v-if="mode === 'edit'"
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
                            Domyślna OSK
                        </UiLabel>
                        <p
                            id="oskFormDefaultHint"
                            class="text-muted-foreground mt-0.5 text-xs"
                        >
                            Używana jako domyślny wybór w aplikacji.
                        </p>
                        <p
                            v-if="defaultSwitchLocked"
                            id="oskFormDefaultLockedHint"
                            class="text-muted-foreground mt-1 text-xs"
                        >
                            Przy jednej szkole na koncie status domyślnej musi
                            pozostać włączony.
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
                                ? 'Domyślna szkoła — przy jednej szkole na koncie nie można wyłączyć'
                                : 'Ustaw jako domyślną szkołę jazdy'
                        "
                        @update:model-value="emit('update:asDefault', $event)"
                    />
                </div>

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
                        :disabled="
                            isSaving ||
                            (mode === 'create' && name.trim().length === 0)
                        "
                    >
                        {{ isSaving ? 'Zapisywanie…' : submitLabel }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
