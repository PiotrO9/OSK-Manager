<script setup lang="ts">
import type { FormControlSize } from '@/lib/formControlVariants';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';

const examples = reactive(
    (
        [
            ['default', 'Standardowy formularz'],
            ['touch', 'Filtry zaawansowane'],
            ['compact', 'Kontrolki w listach'],
            ['sm', 'Wewnętrzne kontrolki kalendarza'],
        ] as const
    ).map(([size, label]) => ({
        size: size as FormControlSize,
        label,
        text: 'Anna Kowalska',
        choice: 'planned',
        date: '2026-11-01',
        time: '09:30',
    })),
);
</script>

<template>
    <FormSection
        title="Rozmiary kontrolek"
        description="Pola w jednym wierszu korzystają z tego samego wariantu."
    >
        <div class="space-y-6">
            <fieldset
                v-for="example in examples"
                :key="example.size"
                :data-control-example="example.size"
                class="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
                <legend class="mb-3 text-sm font-medium">
                    {{ example.label }}
                </legend>
                <div class="min-w-0 space-y-1.5">
                    <UiLabel :for="`size-${example.size}-text`">Tekst</UiLabel>
                    <UiInput
                        :id="`size-${example.size}-text`"
                        v-model="example.text"
                        :control-size="example.size"
                    />
                </div>
                <div class="min-w-0 space-y-1.5">
                    <UiLabel :for="`size-${example.size}-select`"
                        >Status</UiLabel
                    >
                    <UiSelect v-model="example.choice">
                        <UiSelectTrigger
                            :id="`size-${example.size}-select`"
                            :control-size="example.size"
                            class="w-full"
                        >
                            <UiSelectValue />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectItem value="planned"
                                >Zaplanowana</UiSelectItem
                            >
                            <UiSelectItem value="done"
                                >Zrealizowana</UiSelectItem
                            >
                        </UiSelectContent>
                    </UiSelect>
                </div>
                <div class="min-w-0 space-y-1.5">
                    <UiLabel :for="`size-${example.size}-date`">Data</UiLabel>
                    <UiDatePicker
                        :id="`size-${example.size}-date`"
                        v-model="example.date"
                        :control-size="example.size"
                    />
                </div>
                <div class="min-w-0 space-y-1.5">
                    <UiLabel :for="`size-${example.size}-time`"
                        >Godzina</UiLabel
                    >
                    <UiTimePicker
                        :id="`size-${example.size}-time`"
                        v-model="example.time"
                        :control-size="example.size"
                        :label="`Godzina: ${example.label}`"
                    />
                </div>
            </fieldset>
        </div>
    </FormSection>
</template>
