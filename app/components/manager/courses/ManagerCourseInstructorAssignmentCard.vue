<script setup lang="ts">
import { ExternalLink, UserCheck } from 'lucide-vue-next';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { CourseDetail } from '~/types/courses/course';

const props = defineProps<{
    course: CourseDetail;
    noInstructorValue: string;
    instructorName: string;
    instructorProfileId: string;
    instructorSaveBlockedReason: string;
    instructorsLoadError: string | null;
    isInstructorsLoading: boolean;
    isPatchLoading: boolean;
    effectiveSchoolId: string;
    instructors: InstructorListItem[];
    qualifiedInstructors: InstructorListItem[];
    canSaveInstructorAssignment: boolean;
}>();

defineEmits<{
    retryInstructors: [];
    instructorSelectChange: [];
    saveInstructorAssignment: [];
}>();

const selectedInstructorProfileId = defineModel<string>(
    'selectedInstructorProfileId',
    {
        required: true,
    },
);

const instructorDetailsRoute = computed(() => {
    const instructorId = props.instructorProfileId.trim();

    return instructorId ? `/manager/instructors/${instructorId}` : null;
});

const currentInstructorInitials = computed(() => {
    const name = props.instructorName.trim();

    if (!props.course.instructor || !name) {
        return 'BI';
    }

    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
});
</script>

<template>
    <UiCard
        class="h-fit max-w-4xl gap-0 overflow-hidden rounded-lg py-0 shadow-xs"
    >
        <UiCardHeader class="border-border border-b px-5 py-4">
            <UiCardTitle class="text-base font-semibold">
                Instruktor kursu
            </UiCardTitle>
            <UiCardDescription>
                Obecny prowadzący i szybka zmiana przypisania.
            </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-4 p-5">
            <div
                class="border-border bg-muted/20 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div class="flex min-w-0 items-center gap-3">
                    <AppListAvatar
                        :src="course.instructor?.avatarUrl ?? null"
                        :initials="currentInstructorInitials"
                        :size="40"
                    />
                    <div class="min-w-0">
                        <p class="text-muted-foreground text-xs font-medium">
                            Aktualnie prowadzi
                        </p>
                        <NuxtLink
                            v-if="instructorDetailsRoute"
                            :to="instructorDetailsRoute"
                            class="text-foreground hover:text-primary mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-sm font-semibold"
                        >
                            <span class="truncate">{{ instructorName }}</span>
                            <ExternalLink
                                class="size-3 shrink-0"
                                aria-hidden="true"
                            />
                        </NuxtLink>
                        <p
                            v-else
                            class="text-foreground mt-0.5 text-sm font-semibold"
                        >
                            {{ instructorName }}
                        </p>
                    </div>
                </div>
            </div>

            <p
                v-if="instructorSaveBlockedReason"
                class="border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-300 rounded-lg border px-4 py-3 text-sm font-medium"
                role="status"
            >
                {{ instructorSaveBlockedReason }}
            </p>

            <ErrorState
                v-if="instructorsLoadError"
                title="Nie udało się wczytać instruktorów"
                :description="instructorsLoadError"
                @retry="$emit('retryInstructors')"
            />

            <div
                class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
            >
                <div class="min-w-0 space-y-2">
                    <UiLabel for="course-detail-instructor-select">
                        Zmień prowadzącego
                    </UiLabel>
                    <p
                        v-if="isInstructorsLoading"
                        class="text-muted-foreground rounded-lg border px-3 py-2 text-sm"
                        role="status"
                    >
                        Wczytywanie listy instruktorów...
                    </p>
                    <UiSelect
                        v-else
                        v-model="selectedInstructorProfileId"
                        :disabled="
                            !!instructorSaveBlockedReason || isPatchLoading
                        "
                        @update:model-value="$emit('instructorSelectChange')"
                    >
                        <UiSelectTrigger
                            id="course-detail-instructor-select"
                            class="h-11 w-full rounded-lg"
                            aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
                        >
                            <UiSelectValue placeholder="Brak instruktora" />
                        </UiSelectTrigger>
                        <UiSelectContent>
                            <UiSelectGroup>
                                <UiSelectItem :value="noInstructorValue">
                                    Brak instruktora
                                </UiSelectItem>
                                <UiSelectItem
                                    v-for="ins in qualifiedInstructors"
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
                </div>

                <UiButton
                    type="button"
                    class="h-11 gap-2 rounded-lg px-4 font-semibold"
                    :disabled="!canSaveInstructorAssignment"
                    :aria-busy="isPatchLoading"
                    @click="$emit('saveInstructorAssignment')"
                >
                    <UserCheck class="size-4" aria-hidden="true" />
                    {{ isPatchLoading ? 'Zapisywanie...' : 'Zapisz' }}
                </UiButton>
            </div>

            <div class="space-y-2">
                <p
                    v-if="
                        !isInstructorsLoading &&
                        effectiveSchoolId &&
                        instructors.length === 0
                    "
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak instruktorów w tej szkole. Możesz wyczyścić przypisanie
                    albo dodać instruktorów w panelu OSK.
                </p>
                <p
                    v-else-if="
                        !isInstructorsLoading &&
                        effectiveSchoolId &&
                        qualifiedInstructors.length === 0
                    "
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak instruktorów z uprawnieniem do kategorii tego kursu.
                </p>
            </div>
        </UiCardContent>
    </UiCard>
</template>
