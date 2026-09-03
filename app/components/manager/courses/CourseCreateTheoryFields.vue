<script setup lang="ts">
import { courseCreateFormMessages } from '~/utils/courses/courseCreateFormMessages';

const props = defineProps<{
    isDisabled: boolean;
    showTheoryStartRequired: boolean;
    showTheoryEndRequired: boolean;
    showTheoryRangeInvalid: boolean;
    showCapacityInvalid: boolean;
}>();

const theoryStartModel = defineModel<string>('theoryStart', { required: true });
const theoryEndModel = defineModel<string>('theoryEnd', { required: true });
const capacityModel = defineModel<string>('capacity', { required: true });

const formMessages = courseCreateFormMessages;
</script>

<template>
    <div class="space-y-2">
        <UiLabel for="course-create-theory-start">
            Data rozpoczęcia teorii
        </UiLabel>
        <UiDatePicker
            id="course-create-theory-start"
            v-model="theoryStartModel"
            :disabled="props.isDisabled"
            trigger-class="h-10 w-full rounded-xl bg-background"
            placeholder="Wybierz datę rozpoczęcia"
            :aria-invalid="
                props.showTheoryStartRequired || props.showTheoryRangeInvalid
            "
            :aria-describedby="
                props.showTheoryStartRequired || props.showTheoryRangeInvalid
                    ? 'course-create-theory-error'
                    : undefined
            "
        />
    </div>

    <div class="space-y-2">
        <UiLabel for="course-create-theory-end">
            Data zakończenia teorii
        </UiLabel>
        <UiDatePicker
            id="course-create-theory-end"
            v-model="theoryEndModel"
            :disabled="props.isDisabled"
            trigger-class="h-10 w-full rounded-xl bg-background"
            placeholder="Wybierz datę zakończenia"
            :aria-invalid="
                props.showTheoryEndRequired || props.showTheoryRangeInvalid
            "
            :aria-describedby="
                props.showTheoryEndRequired || props.showTheoryRangeInvalid
                    ? 'course-create-theory-error'
                    : undefined
            "
        />
    </div>

    <p
        v-if="props.showTheoryStartRequired || props.showTheoryEndRequired"
        id="course-create-theory-error"
        class="text-destructive text-sm"
        role="alert"
    >
        <span v-if="props.showTheoryStartRequired">
            {{ formMessages.theoryStartRequired }}
        </span>
        <span v-else-if="props.showTheoryEndRequired">
            {{ formMessages.theoryEndRequired }}
        </span>
    </p>
    <p
        v-else-if="props.showTheoryRangeInvalid"
        class="text-destructive text-sm"
        role="alert"
    >
        {{ formMessages.theoryRangeInvalid }}
    </p>

    <div class="space-y-2">
        <UiLabel for="course-create-capacity">
            Limit miejsc (opcjonalnie — puste = brak limitu)
        </UiLabel>
        <UiInput
            id="course-create-capacity"
            v-model="capacityModel"
            type="number"
            name="capacity"
            inputmode="numeric"
            min="0"
            step="1"
            autocomplete="off"
            :aria-invalid="props.showCapacityInvalid"
            :aria-describedby="
                props.showCapacityInvalid
                    ? 'course-create-capacity-error'
                    : undefined
            "
            :disabled="props.isDisabled"
            class="bg-background h-10 rounded-xl"
        />
        <p
            v-if="props.showCapacityInvalid"
            id="course-create-capacity-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ formMessages.capacityInvalid }}
        </p>
    </div>
</template>
