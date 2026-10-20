<script setup lang="ts">
defineProps<{
    name: string;
    city: string;
    address: string;
    nameError: string;
    disabled: boolean;
}>();
const emit = defineEmits<{
    'update:name': [value: string];
    'update:city': [value: string];
    'update:address': [value: string];
}>();
const nameField = useTemplateRef<HTMLElement>('nameField');

defineExpose({
    focusName: () => nameField.value?.querySelector('input')?.focus(),
});
</script>

<template>
    <div ref="nameField" class="space-y-2">
        <UiLabel for="oskFormNameInput">Nazwa</UiLabel>
        <UiInput
            id="oskFormNameInput"
            name="schoolName"
            :model-value="name"
            type="text"
            placeholder="np. OSK Novum…"
            autocomplete="organization"
            aria-required="true"
            :aria-invalid="nameError ? 'true' : 'false'"
            :aria-describedby="nameError ? 'oskFormNameError' : undefined"
            :disabled="disabled"
            @update:model-value="emit('update:name', String($event))"
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
        <UiLabel for="oskFormCityInput"
            >Miasto
            <span class="text-muted-foreground ml-1 text-xs font-normal"
                >(opcjonalnie)</span
            ></UiLabel
        >
        <UiInput
            id="oskFormCityInput"
            name="addressLevel2"
            :model-value="city"
            type="text"
            autocomplete="address-level2"
            :disabled="disabled"
            @update:model-value="emit('update:city', String($event))"
        />
    </div>
    <div class="space-y-2">
        <UiLabel for="oskFormAddressInput"
            >Adres
            <span class="text-muted-foreground ml-1 text-xs font-normal"
                >(opcjonalnie)</span
            ></UiLabel
        >
        <UiInput
            id="oskFormAddressInput"
            name="streetAddress"
            :model-value="address"
            type="text"
            autocomplete="street-address"
            :disabled="disabled"
            @update:model-value="emit('update:address', String($event))"
        />
    </div>
</template>
