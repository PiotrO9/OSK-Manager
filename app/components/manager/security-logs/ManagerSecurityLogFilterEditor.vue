<script setup lang="ts">
import type {
    SecurityLogFilterDraft,
    SecurityLogFilterField,
    SecurityLogFilterOperator,
} from '~~/shared/utils/securityLogFilters';
import {
    securityLogFieldConfigs,
    securityLogFilterChoices,
} from '~~/shared/utils/securityLogFilters';
import type { SecurityLogPersonOption } from '~/types/security-logs/securityLog';

const props = defineProps<{
    draft: SecurityLogFilterDraft;
    error: string;
    disabled: boolean;
    personOptions: SecurityLogPersonOption[];
    personOptionsLoading: boolean;
}>();
const emit = defineEmits<{
    updateDraft: [value: SecurityLogFilterDraft];
    apply: [];
    cancel: [];
    searchPeople: [value: string];
}>();
const fieldConfig = computed(() =>
    securityLogFieldConfigs.find((item) => item.value === props.draft.field)!,
);
const operators = computed(() =>
    props.draft.field === 'occurredAt'
        ? [
              { value: 'on', label: 'Dnia' },
              { value: 'before', label: 'Przed' },
              { value: 'after', label: 'Po' },
              { value: 'between', label: 'Pomiędzy' },
          ]
        : props.draft.field === 'clientIp'
          ? [
                { value: 'is', label: 'Jest' },
                { value: 'isNot', label: 'Nie jest' },
                { value: 'isEmpty', label: 'Brak danych' },
            ]
          : fieldConfig.value.kind === 'person'
            ? [
                  { value: 'is', label: 'Jest' },
                  { value: 'isNot', label: 'Nie jest' },
              ]
            : [
                  { value: 'is', label: 'Jest' },
                  { value: 'isNot', label: 'Nie jest' },
                  { value: 'oneOf', label: 'Jeden z' },
              ],
);
const choices = computed(() => securityLogFilterChoices[props.draft.field]);
const selectedValues = computed(() =>
    props.draft.value
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
);

function toggleChoice(value: string, checked: unknown): void {
    const next = new Set(selectedValues.value);

    if (checked === true) next.add(value);
    else next.delete(value);

    patch({ value: [...next].join(', ') });
}

function patch(value: Partial<SecurityLogFilterDraft>): void {
    emit('updateDraft', { ...props.draft, ...value });
}

function fieldChange(value: unknown): void {
    const field = String(value) as SecurityLogFilterField;

    if (!securityLogFieldConfigs.some((item) => item.value === field)) return;

    patch({
        field,
        operator: field === 'occurredAt' ? 'on' : 'is',
        value: '',
        valueTo: '',
    });
}

function operatorChange(value: unknown): void {
    if (!operators.value.some((item) => item.value === value)) return;

    patch({
        operator: value as SecurityLogFilterOperator,
        value: '',
        valueTo: '',
    });
}
</script>

<template>
    <form class="space-y-4" @submit.prevent="emit('apply')">
        <div class="grid gap-2">
            <UiLabel for="security-log-filter-field">Pole</UiLabel>
            <UiSelect
                :model-value="draft.field"
                :disabled="disabled"
                @update:model-value="fieldChange"
            >
                <UiSelectTrigger
                    id="security-log-filter-field"
                    class="h-11 w-full"
                    ><UiSelectValue
                /></UiSelectTrigger>
                <UiSelectContent
                    ><UiSelectGroup
                        ><UiSelectItem
                            v-for="field in securityLogFieldConfigs"
                            :key="field.value"
                            :value="field.value"
                            >{{ field.label }}</UiSelectItem
                        ></UiSelectGroup
                    ></UiSelectContent
                >
            </UiSelect>
        </div>
        <div class="grid gap-2">
            <UiLabel for="security-log-filter-operator">Warunek</UiLabel>
            <UiSelect
                :model-value="draft.operator"
                :disabled="disabled"
                @update:model-value="operatorChange"
            >
                <UiSelectTrigger
                    id="security-log-filter-operator"
                    class="h-11 w-full"
                    ><UiSelectValue
                /></UiSelectTrigger>
                <UiSelectContent
                    ><UiSelectGroup
                        ><UiSelectItem
                            v-for="operator in operators"
                            :key="operator.value"
                            :value="operator.value"
                            >{{ operator.label }}</UiSelectItem
                        ></UiSelectGroup
                    ></UiSelectContent
                >
            </UiSelect>
        </div>
        <template v-if="draft.operator !== 'isEmpty'">
            <div v-if="fieldConfig.kind === 'person'" class="grid gap-2">
                <UiLabel for="security-log-filter-person-search"
                    >Szukaj osoby</UiLabel
                >
                <UiInput
                    id="security-log-filter-person-search"
                    type="search"
                    maxlength="80"
                    placeholder="Imię lub nazwisko"
                    :disabled="disabled"
                    @update:model-value="emit('searchPeople', String($event))"
                />
                <UiLabel for="security-log-filter-person">Osoba</UiLabel>
                <UiSelect
                    :model-value="draft.value"
                    :disabled="
                        disabled ||
                        personOptionsLoading ||
                        personOptions.length === 0
                    "
                    @update:model-value="patch({ value: String($event) })"
                >
                    <UiSelectTrigger
                        id="security-log-filter-person"
                        class="h-11 w-full"
                        ><UiSelectValue
                            :placeholder="
                                personOptionsLoading
                                    ? 'Wczytywanie osób…'
                                    : 'Wybierz osobę'
                            "
                    /></UiSelectTrigger>
                    <UiSelectContent
                        ><UiSelectGroup
                            ><UiSelectItem
                                v-for="person in personOptions"
                                :key="person.userId"
                                :value="person.userId"
                                >{{
                                    person.displayName ||
                                    `Użytkownik ${person.userId.slice(0, 8)}`
                                }}</UiSelectItem
                            ></UiSelectGroup
                        ></UiSelectContent
                    >
                </UiSelect>
            </div>
            <div
                v-else-if="choices && draft.operator !== 'oneOf'"
                class="grid gap-2"
            >
                <UiLabel for="security-log-filter-choice">Wartość</UiLabel>
                <UiSelect
                    :model-value="draft.value"
                    :disabled="disabled"
                    @update:model-value="patch({ value: String($event) })"
                >
                    <UiSelectTrigger
                        id="security-log-filter-choice"
                        class="h-11 w-full"
                        ><UiSelectValue placeholder="Wybierz wartość"
                    /></UiSelectTrigger>
                    <UiSelectContent
                        ><UiSelectGroup
                            ><UiSelectItem
                                v-for="choice in choices"
                                :key="choice.value"
                                :value="choice.value"
                                >{{ choice.label }}</UiSelectItem
                            ></UiSelectGroup
                        ></UiSelectContent
                    >
                </UiSelect>
            </div>
            <fieldset
                v-else-if="choices && draft.operator === 'oneOf'"
                class="grid gap-2"
            >
                <legend class="mb-2 text-sm font-medium">
                    Wybierz wartości
                </legend>
                <div
                    class="border-border max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2"
                >
                    <label
                        v-for="choice in choices"
                        :key="choice.value"
                        :for="`security-log-choice-${choice.value}`"
                        class="hover:bg-muted flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm"
                    >
                        <UiCheckbox
                            :id="`security-log-choice-${choice.value}`"
                            :model-value="selectedValues.includes(choice.value)"
                            :disabled="
                                disabled ||
                                (!selectedValues.includes(choice.value) &&
                                    selectedValues.length >= 20)
                            "
                            :aria-label="choice.label"
                            @update:model-value="
                                toggleChoice(choice.value, $event)
                            "
                        />
                        {{ choice.label }}
                    </label>
                </div>
            </fieldset>
            <div v-else class="grid gap-2">
                <UiLabel for="security-log-filter-value">{{
                    draft.operator === 'between' ? 'Data od' : 'Wartość'
                }}</UiLabel>
                <UiInput
                    id="security-log-filter-value"
                    :model-value="draft.value"
                    :disabled="disabled"
                    :type="fieldConfig.kind === 'date' ? 'date' : 'text'"
                    maxlength="120"
                    class="h-11"
                    :placeholder="
                        draft.operator === 'oneOf'
                            ? 'Wartości oddziel przecinkami'
                            : ''
                    "
                    @update:model-value="patch({ value: String($event) })"
                />
            </div>
            <div v-if="draft.operator === 'between'" class="grid gap-2">
                <UiLabel for="security-log-filter-date-to">Data do</UiLabel>
                <UiInput
                    id="security-log-filter-date-to"
                    :model-value="draft.valueTo"
                    :disabled="disabled"
                    type="date"
                    class="h-11"
                    @update:model-value="patch({ valueTo: String($event) })"
                />
            </div>
        </template>
        <p v-if="error" class="text-destructive text-sm" role="alert">
            {{ error }}
        </p>
        <div
            class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"
        >
            <UiButton
                type="button"
                variant="outline"
                :disabled="disabled"
                @click="emit('cancel')"
                >Anuluj</UiButton
            >
            <UiButton type="submit" :disabled="disabled"
                >Zastosuj filtr</UiButton
            >
        </div>
    </form>
</template>
