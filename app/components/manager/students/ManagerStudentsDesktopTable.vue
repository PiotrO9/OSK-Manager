<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import ManagerStudentPkkCopy from './ManagerStudentPkkCopy.vue';
import AppListAvatar from '~/components/app/AppListAvatar.vue';
import type { StudentListItem } from '~/types/students/student';
import type { StudentListRow } from '~/types/students/studentListView';

defineProps<{
    rows: readonly StudentListRow[];
    activeSchoolId: string;
    isStudentsLoading: boolean;
}>();
const emit = defineEmits<{ assignCourse: [student: StudentListItem] }>();
</script>

<template>
    <table class="hidden w-full table-fixed text-left text-sm @3xl:table">
        <caption class="sr-only">
            Kursanci: dane kontaktowe, numer PKK, status konta i przypisanie
            kursu.
        </caption>
        <thead
            class="border-border bg-muted/30 text-muted-foreground border-b text-xs"
        >
            <tr>
                <th scope="col" class="w-[28%] px-5 py-3 font-medium">
                    Kursant
                </th>
                <th scope="col" class="w-[25%] px-4 py-3 font-medium">
                    Kontakt
                </th>
                <th scope="col" class="w-[14%] px-4 py-3 font-medium">
                    Status
                </th>
                <th scope="col" class="w-[13%] px-4 py-3 font-medium">
                    Data dodania
                </th>
                <th
                    scope="col"
                    class="w-[20%] px-5 py-3 text-right font-medium"
                >
                    Akcje
                </th>
            </tr>
        </thead>
        <tbody class="divide-border divide-y">
            <tr
                v-for="row in rows"
                :key="row.student.id"
                class="group hover:bg-muted/30 focus-within:bg-muted/30 transition-colors"
            >
                <th scope="row" class="px-5 py-3 text-left font-normal">
                    <div class="flex min-w-0 items-center gap-3">
                        <AppListAvatar
                            :src="row.student.avatarUrl"
                            :initials="row.initials"
                            :size="36"
                        />
                        <div class="min-w-0 space-y-1">
                            <NuxtLink
                                v-if="row.detailsTo"
                                :to="row.detailsTo"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-foreground hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                                :aria-label="`Otwórz szczegóły kursanta ${row.name} w nowej karcie`"
                                >{{ row.name }}</NuxtLink
                            >
                            <p
                                v-else
                                class="text-foreground font-semibold wrap-anywhere"
                            >
                                {{ row.name }}
                            </p>
                            <p
                                class="text-muted-foreground text-xs wrap-anywhere tabular-nums"
                            >
                                PKK:
                                <ManagerStudentPkkCopy
                                    :pkk-number="row.student.pkkNumber"
                                />
                            </p>
                        </div>
                    </div>
                </th>
                <td class="px-4 py-3">
                    <div class="space-y-1.5 text-xs">
                        <p class="text-foreground wrap-anywhere">
                            {{ row.student.email }}
                        </p>
                        <p class="text-muted-foreground tabular-nums">
                            {{ row.student.phone || 'Brak telefonu' }}
                        </p>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <StatusBadge
                        :label="row.student.isActive ? 'Aktywny' : 'Nieaktywny'"
                        :tone="row.student.isActive ? 'success' : 'neutral'"
                        subtle
                    />
                </td>
                <td
                    class="text-muted-foreground px-4 py-3 text-xs tabular-nums"
                >
                    {{ row.dateLabel }}
                </td>
                <td class="px-3 py-3 text-right">
                    <UiButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        class="text-primary dark:text-primary-300 h-9 gap-1.5 px-2"
                        :disabled="!activeSchoolId || isStudentsLoading"
                        :aria-label="`Przypisz ${row.name} do kursu`"
                        @click="emit('assignCourse', row.student)"
                        ><Plus class="size-3.5" aria-hidden="true" />Przypisz
                        kurs</UiButton
                    >
                </td>
            </tr>
        </tbody>
    </table>
</template>
