<script setup lang="ts">
import { ArrowUpRight, Mail, Phone, Plus } from 'lucide-vue-next';
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
    <div class="divide-border divide-y @3xl:hidden">
        <article
            v-for="row in rows"
            :key="row.student.id"
            class="space-y-4 p-4 sm:p-5"
        >
            <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                    <AppListAvatar
                        :src="row.student.avatarUrl"
                        :initials="row.initials"
                        :size="36"
                    />
                    <div class="min-w-0 space-y-1">
                        <h2 class="text-sm font-semibold wrap-anywhere">
                            {{ row.name }}
                        </h2>
                        <p class="text-muted-foreground text-xs">
                            Dodano {{ row.dateLabel }}
                        </p>
                    </div>
                </div>
                <StatusBadge
                    :label="row.student.isActive ? 'Aktywny' : 'Nieaktywny'"
                    :tone="row.student.isActive ? 'success' : 'neutral'"
                    subtle
                />
            </div>
            <dl class="space-y-2 text-sm">
                <div class="flex items-start gap-2">
                    <dt>
                        <span class="sr-only">E-mail</span
                        ><Mail
                            class="text-muted-foreground mt-0.5 size-4"
                            aria-hidden="true"
                        />
                    </dt>
                    <dd class="min-w-0 wrap-anywhere">
                        {{ row.student.email }}
                    </dd>
                </div>
                <div class="flex items-center gap-2">
                    <dt>
                        <span class="sr-only">Telefon</span
                        ><Phone
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                    </dt>
                    <dd class="text-muted-foreground tabular-nums">
                        {{ row.student.phone || 'Brak telefonu' }}
                    </dd>
                </div>
                <div
                    class="text-muted-foreground flex flex-wrap items-baseline gap-2 text-xs"
                >
                    <dt>PKK</dt>
                    <dd class="wrap-anywhere tabular-nums">
                        <ManagerStudentPkkCopy
                            :pkk-number="row.student.pkkNumber"
                            class="min-h-11"
                        />
                    </dd>
                </div>
            </dl>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <UiButton
                    type="button"
                    variant="outline"
                    class="h-11"
                    :disabled="!activeSchoolId || isStudentsLoading"
                    :aria-label="`Przypisz ${row.name} do kursu`"
                    @click="emit('assignCourse', row.student)"
                    ><Plus class="size-4" aria-hidden="true" />Przypisz
                    kurs</UiButton
                >
                <UiButton
                    v-if="row.detailsTo"
                    as-child
                    variant="ghost"
                    class="text-primary dark:text-primary-300 h-11"
                    ><NuxtLink
                        :to="row.detailsTo"
                        target="_blank"
                        rel="noopener noreferrer"
                        :aria-label="`Otwórz szczegóły kursanta ${row.name} w nowej karcie`"
                        >Profil
                        <ArrowUpRight
                            class="size-4"
                            aria-hidden="true" /></NuxtLink
                ></UiButton>
            </div>
        </article>
    </div>
</template>
