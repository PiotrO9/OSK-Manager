<script setup lang="ts">
import { formatInstructorDisplayName } from '~/types/instructors/instructor';
import type { InstructorListItem } from '~/types/instructors/instructor';

const props = defineProps<{
    instructors: InstructorListItem[];
    qualifiedInstructors: InstructorListItem[];
    isInstructorsLoading: boolean;
    isDisabled: boolean;
}>();

const instructorIdModel = defineModel<string>('instructorId', {
    required: true,
});
</script>

<template>
    <div class="space-y-2">
        <UiLabel for="course-create-instructor">
            Instruktor (opcjonalnie)
        </UiLabel>
        <p
            v-if="props.isInstructorsLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie listy instruktorów…
        </p>
        <UiSelect
            v-else
            v-model="instructorIdModel"
            :disabled="props.isDisabled"
        >
            <UiSelectTrigger
                id="course-create-instructor"
                class="bg-background h-10 w-full rounded-xl"
                aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
            >
                <UiSelectValue placeholder="— Brak instruktora —" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="ins in props.qualifiedInstructors"
                        :key="ins.id"
                        :value="ins.id"
                    >
                        {{ formatInstructorDisplayName(ins)
                        }}{{
                            ins.email && ins.email.length > 0
                                ? ` (${ins.email})`
                                : ''
                        }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="!props.isInstructorsLoading && props.instructors.length === 0"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak instruktorów przypisanych do tej szkoły — możesz utworzyć kurs
            bez instruktora.
        </p>
        <p
            v-else-if="
                !props.isInstructorsLoading &&
                props.qualifiedInstructors.length === 0
            "
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak instruktorów z uprawnieniem do wybranej kategorii - możesz
            utworzyć kurs bez instruktora.
        </p>
    </div>
</template>
