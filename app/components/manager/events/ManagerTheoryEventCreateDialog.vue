<script setup lang="ts">
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';

const props = defineProps<{
    slotCtx: LessonBookingSlotContext | null;
    /** Do listy kursów (opcjonalny `courseId` przy POST THEORY). */
    schoolId: string;
    showBack?: boolean;
}>();

const emit = defineEmits<{
    created: [payload: { eventId: string; capacity: number | null }];
    back: [];
}>();

const open = defineModel<boolean>('open', { required: true });

const DESCRIPTION_ID = 'theory-event-create-desc';

const numberInputClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
const {
    capacityInput,
    coursesLoadError,
    filteredAvailableInstructors,
    formError,
    handleClose,
    handleSubmit,
    isCoursesLoading,
    isLoading,
    eventAvailabilityStatus,
    eventAvailabilityMessage,
    selectedCourseId,
    selectedInstructorId,
    slotWhenLabel,
    theoryCourses,
} = useManagerTheoryEventCreateDialog({
    open,
    schoolId: toRef(props, 'schoolId'),
    slotCtx: toRef(props, 'slotCtx'),
    emitCreated: (payload) => emit('created', payload),
});

function handleBack(): void {
    handleClose();
    emit('back');
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isLoading"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Nowe zajęcia teoretyczne</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Wybierz instruktora, opcjonalny kurs oraz limit miejsc.
                    Uczestników dodasz w następnym kroku.
                </UiDialogDescription>
            </UiDialogHeader>

            <div
                v-if="slotCtx"
                class="bg-muted/40 space-y-1 rounded-lg border px-3 py-2 text-sm"
                role="status"
            >
                <p>
                    <span class="text-muted-foreground">Termin:</span>
                    {{ slotWhenLabel }}
                </p>
            </div>

            <form
                v-if="slotCtx"
                class="space-y-4"
                aria-label="Formularz bloku teorii"
                :aria-busy="isLoading"
                @submit.prevent="handleSubmit"
            >
                <div
                    v-if="filteredAvailableInstructors.length > 1"
                    class="space-y-2"
                >
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-instructor"
                    >
                        Instruktor
                    </label>
                    <UiSelect
                        v-model="selectedInstructorId"
                        :disabled="isLoading"
                    >
                        <UiSelectTrigger
                            id="theory-event-instructor"
                            class="w-full"
                            aria-required="true"
                        >
                            <UiSelectValue
                                placeholder="— Wybierz instruktora —"
                            />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="ins in filteredAvailableInstructors"
                                    :key="ins.id"
                                    :value="ins.id"
                                >
                                    {{ ins.firstName }} {{ ins.lastName }}
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                </div>

                <div v-if="schoolId.trim()" class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-course"
                    >
                        Kurs (opcjonalnie)
                    </label>
                    <p
                        v-if="isCoursesLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Wczytywanie kursów…
                    </p>
                    <p
                        v-else-if="coursesLoadError"
                        class="text-destructive text-xs"
                        role="alert"
                    >
                        {{ coursesLoadError }}
                    </p>
                    <UiSelect
                        v-model="selectedCourseId"
                        :disabled="isLoading || isCoursesLoading"
                    >
                        <UiSelectTrigger
                            id="theory-event-course"
                            class="w-full"
                            aria-label="Powiązanie bloku z kursem"
                        >
                            <UiSelectValue
                                placeholder="— Bez powiązania z kursem —"
                            />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem
                                    v-for="c in theoryCourses"
                                    :key="c.id"
                                    :value="c.id"
                                >
                                    {{ c.name }} ({{ c.category }})
                                </UiSelectItem>
                            </UiSelectGroup>
                        </UiSelectContent>
                    </UiSelect>
                    <p class="text-muted-foreground text-xs">
                        Powiązanie z kursem nie zapisuje automatycznie jego
                        uczestników na te zajęcia.
                    </p>
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="theory-event-capacity"
                    >
                        Limit miejsc (opcjonalnie)
                    </label>
                    <input
                        id="theory-event-capacity"
                        v-model="capacityInput"
                        type="number"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        :disabled="isLoading"
                        :class="numberInputClass"
                        placeholder="Puste = bez limitu"
                        aria-describedby="theory-event-capacity-hint"
                    />
                    <p
                        id="theory-event-capacity-hint"
                        class="text-muted-foreground text-xs"
                    >
                        Pozostaw puste, jeśli liczba uczestników nie ma być
                        ograniczona.
                    </p>
                </div>

                <p
                    v-if="eventAvailabilityStatus !== 'idle'"
                    :class="[
                        'text-sm',
                        eventAvailabilityStatus === 'unavailable'
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    ]"
                    :role="
                        eventAvailabilityStatus === 'unavailable'
                            ? 'alert'
                            : 'status'
                    "
                >
                    {{ eventAvailabilityMessage }}
                </p>

                <p
                    v-if="formError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ formError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isLoading"
                        @click="props.showBack ? handleBack() : handleClose()"
                    >
                        {{ props.showBack ? 'Wstecz' : 'Anuluj' }}
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="
                            isLoading ||
                            eventAvailabilityStatus === 'checking' ||
                            eventAvailabilityStatus === 'unavailable'
                        "
                    >
                        {{ isLoading ? 'Tworzenie…' : 'Utwórz blok' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
