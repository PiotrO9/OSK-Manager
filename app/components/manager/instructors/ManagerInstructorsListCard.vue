<script setup lang="ts">
import { Mail } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';

defineProps<{
    schools: DrivingSchool[];
    activeSchool: DrivingSchool | null;
    instructors: InstructorListItem[];
    isSchoolsLoading: boolean;
    isInstructorsLoading: boolean;
    schoolsLoadError: string | null;
    instructorsLoadError: string | null;
    visibleInstructorsLabel: string;
    qualificationFilterLabel: string;
    instructorDetailsTo: (instructor: InstructorListItem) => unknown;
    instructorQualificationLabel: (instructor: InstructorListItem) => string;
    instructorInitials: (instructor: InstructorListItem) => string;
}>();

const emit = defineEmits<{
    activeSchoolChange: [];
    retrySchools: [];
    retryInstructors: [];
}>();

const activeSchoolId = defineModel<string>('activeSchoolId', {
    required: true,
});
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <div
                class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
            >
                <div class="space-y-1">
                    <UiCardTitle class="text-xl font-extrabold">
                        Lista instruktorów
                    </UiCardTitle>
                    <UiCardDescription>
                        {{ visibleInstructorsLabel }}
                        <span v-if="activeSchool">
                            · {{ activeSchool.name }}
                        </span>
                    </UiCardDescription>
                </div>

                <UiBadge
                    v-if="activeSchool"
                    variant="outline"
                    class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                >
                    {{ activeSchool.name }}
                </UiBadge>
            </div>
        </UiCardHeader>

        <UiCardContent
            class="space-y-4 px-4 py-4"
            :aria-busy="isSchoolsLoading || isInstructorsLoading"
        >
            <div
                class="border-border bg-card flex min-w-0 flex-col gap-3 rounded-2xl border px-4 py-3 shadow-xs md:flex-row md:items-center md:justify-between"
            >
                <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <p class="text-foreground text-sm font-semibold">Filtry</p>

                    <div v-if="schools.length > 1" class="min-w-52">
                        <UiSelect
                            v-model="activeSchoolId"
                            :disabled="isInstructorsLoading"
                            @update:model-value="emit('activeSchoolChange')"
                        >
                            <UiSelectTrigger
                                id="instructors-page-school"
                                class="h-8 rounded-full border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700"
                                aria-label="Wybierz szkołę jazdy do podglądu listy instruktorów"
                            >
                                <UiSelectValue placeholder="Wybierz OSK" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-for="s in schools"
                                        :key="s.id"
                                        :value="s.id"
                                    >
                                        {{ s.name
                                        }}{{
                                            s.city && s.city.length > 0
                                                ? ` (${s.city})`
                                                : ''
                                        }}
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <UiBadge
                        v-else-if="activeSchool"
                        variant="outline"
                        class="rounded-full border-sky-200 bg-sky-50 text-sky-700"
                    >
                        {{ activeSchool.name }}
                    </UiBadge>

                    <UiBadge variant="outline" class="bg-muted/40 rounded-full">
                        {{ qualificationFilterLabel }}
                    </UiBadge>
                </div>

                <p
                    class="text-muted-foreground text-xs font-semibold whitespace-nowrap"
                >
                    {{ visibleInstructorsLabel }}
                </p>
            </div>

            <div v-if="isSchoolsLoading" class="space-y-3" role="status">
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
            </div>

            <ErrorState
                v-else-if="schoolsLoadError"
                title="Nie udało się wczytać szkół jazdy"
                :description="schoolsLoadError"
                @retry="emit('retrySchools')"
            />

            <EmptyState
                v-else-if="schools.length === 0"
                title="Brak szkół jazdy"
                description="Dodaj OSK w panelu szkół, aby wyświetlić listę instruktorów."
            />

            <ErrorState
                v-else-if="instructorsLoadError"
                title="Nie udało się wczytać instruktorów"
                :description="instructorsLoadError"
                @retry="emit('retryInstructors')"
            />

            <div
                v-else-if="isInstructorsLoading"
                class="space-y-3"
                role="status"
            >
                <UiSkeleton class="h-14 rounded-xl" />
                <UiSkeleton class="h-14 rounded-xl" />
                <UiSkeleton class="h-14 rounded-xl" />
            </div>

            <EmptyState
                v-else-if="instructors.length === 0"
                title="Brak instruktorów"
                description="W wybranej szkole nie ma jeszcze instruktorów."
            />

            <template v-else>
                <div class="hidden overflow-hidden rounded-2xl border md:block">
                    <table class="w-full min-w-[760px] text-left text-sm">
                        <thead
                            class="bg-muted/50 text-muted-foreground border-b"
                        >
                            <tr>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Nazwa
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Kontakt
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Zakres
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Status
                                </th>
                                <th scope="col" class="px-4 py-3 font-semibold">
                                    Akcje
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-border divide-y">
                            <tr
                                v-for="instructor in instructors"
                                :key="instructor.id"
                                class="hover:bg-muted/30"
                            >
                                <td class="px-4 py-3">
                                    <div
                                        class="flex min-w-0 items-center gap-3"
                                    >
                                        <div
                                            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                                        >
                                            {{ instructorInitials(instructor) }}
                                        </div>
                                        <div class="min-w-0">
                                            <p class="truncate font-extrabold">
                                                {{
                                                    formatInstructorDisplayName(
                                                        instructor,
                                                    )
                                                }}
                                            </p>
                                            <p
                                                class="text-muted-foreground text-xs"
                                            >
                                                {{
                                                    instructorQualificationLabel(
                                                        instructor,
                                                    )
                                                }}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <p
                                        class="text-muted-foreground flex items-center gap-2 text-sm break-all"
                                    >
                                        <Mail
                                            class="size-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {{ instructor.email || '—' }}
                                    </p>
                                </td>
                                <td class="px-4 py-3">
                                    <UiBadge
                                        variant="outline"
                                        class="bg-muted/40 rounded-full"
                                    >
                                        {{
                                            instructorQualificationLabel(
                                                instructor,
                                            )
                                        }}
                                    </UiBadge>
                                </td>
                                <td class="px-4 py-3">
                                    <UiBadge
                                        variant="outline"
                                        class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                    >
                                        Konto
                                    </UiBadge>
                                </td>
                                <td class="px-4 py-3">
                                    <UiButton
                                        as-child
                                        variant="outline"
                                        size="sm"
                                        class="rounded-xl"
                                    >
                                        <NuxtLink
                                            :to="
                                                instructorDetailsTo(instructor)
                                            "
                                            :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                        >
                                            Szczegóły
                                        </NuxtLink>
                                    </UiButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="space-y-3 md:hidden">
                    <article
                        v-for="instructor in instructors"
                        :key="instructor.id"
                        class="border-border rounded-2xl border p-4"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="truncate font-extrabold">
                                    {{
                                        formatInstructorDisplayName(instructor)
                                    }}
                                </p>
                                <p
                                    class="text-muted-foreground mt-1 text-sm break-all"
                                >
                                    {{ instructor.email || '—' }}
                                </p>
                            </div>
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                            >
                                {{ instructorInitials(instructor) }}
                            </div>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <UiBadge
                                variant="outline"
                                class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                                Konto
                            </UiBadge>
                            <UiBadge
                                variant="outline"
                                class="bg-muted/40 rounded-full"
                            >
                                {{ instructorQualificationLabel(instructor) }}
                            </UiBadge>
                        </div>

                        <div class="mt-4">
                            <UiButton
                                as-child
                                variant="outline"
                                size="sm"
                                class="w-full rounded-xl"
                            >
                                <NuxtLink
                                    :to="instructorDetailsTo(instructor)"
                                    :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                >
                                    Szczegóły
                                </NuxtLink>
                            </UiButton>
                        </div>
                    </article>
                </div>
            </template>
        </UiCardContent>
    </UiCard>
</template>
