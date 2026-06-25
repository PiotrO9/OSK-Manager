<script setup lang="ts">
import { Mail, Phone, UserPlus } from 'lucide-vue-next';
import {
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/student';

interface Props {
    students: readonly StudentListItem[];
    activeSchoolId: string;
    isStudentsLoading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    assignCourse: [student: StudentListItem];
}>();

function formatStudentCreatedAt(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return 'Brak daty';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

function studentStatusLabel(student: StudentListItem): string {
    return student.isActive ? 'Aktywny' : 'Nieaktywny';
}

function studentStatusClasses(student: StudentListItem): string {
    return student.isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';
}
</script>

<template>
    <div class="hidden overflow-hidden rounded-2xl border md:block">
        <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-muted/50 text-muted-foreground border-b">
                <tr>
                    <th scope="col" class="px-4 py-3 font-semibold">Kursant</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Kontakt</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-4 py-3 font-semibold">
                        Utworzono
                    </th>
                    <th scope="col" class="px-4 py-3 font-semibold">Akcje</th>
                </tr>
            </thead>
            <tbody class="divide-border divide-y">
                <tr
                    v-for="student in students"
                    :key="student.id"
                    class="hover:bg-muted/30"
                >
                    <td class="px-4 py-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                            >
                                {{ student.firstName[0]
                                }}{{ student.lastName[0] }}
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-extrabold">
                                    {{ formatStudentDisplayName(student) }}
                                </p>
                                <p class="text-muted-foreground text-xs">
                                    PKK: {{ student.pkkNumber ?? 'brak' }}
                                </p>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="space-y-1">
                            <p
                                class="text-muted-foreground flex items-center gap-2 text-sm break-all"
                            >
                                <Mail
                                    class="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                {{ student.email }}
                            </p>
                            <p
                                class="text-muted-foreground flex items-center gap-2 text-sm"
                            >
                                <Phone
                                    class="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                {{ student.phone ?? 'brak' }}
                            </p>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <UiBadge
                            variant="outline"
                            class="rounded-full"
                            :class="studentStatusClasses(student)"
                        >
                            {{ studentStatusLabel(student) }}
                        </UiBadge>
                    </td>
                    <td class="text-muted-foreground px-4 py-3">
                        {{ formatStudentCreatedAt(student.createdAt) }}
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-2">
                            <UiButton
                                v-if="activeSchoolId"
                                as-child
                                variant="outline"
                                size="sm"
                                class="rounded-xl"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/manager/students/${student.userId}`,
                                        query: { schoolId: activeSchoolId },
                                    }"
                                    :aria-label="`Otwórz szczegóły kursanta ${formatStudentDisplayName(student)}`"
                                >
                                    Szczegóły
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                class="rounded-xl"
                                :disabled="!activeSchoolId || isStudentsLoading"
                                :aria-label="`Przypisz ${formatStudentDisplayName(student)} do kursu`"
                                @click="emit('assignCourse', student)"
                            >
                                <UserPlus
                                    class="mr-1.5 size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                Kurs
                            </UiButton>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="space-y-3 md:hidden">
        <article
            v-for="student in students"
            :key="student.id"
            class="border-border rounded-2xl border p-4"
        >
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <p class="truncate font-extrabold">
                        {{ formatStudentDisplayName(student) }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-sm break-all">
                        {{ student.email }}
                    </p>
                </div>
                <UiBadge
                    variant="outline"
                    class="shrink-0 rounded-full"
                    :class="studentStatusClasses(student)"
                >
                    {{ studentStatusLabel(student) }}
                </UiBadge>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
                <UiBadge variant="outline" class="bg-muted/40 rounded-full">
                    PKK: {{ student.pkkNumber ?? 'brak' }}
                </UiBadge>
                <UiBadge variant="outline" class="bg-muted/40 rounded-full">
                    {{ formatStudentCreatedAt(student.createdAt) }}
                </UiBadge>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
                <UiButton
                    v-if="activeSchoolId"
                    as-child
                    variant="outline"
                    size="sm"
                    class="rounded-xl"
                >
                    <NuxtLink
                        :to="{
                            path: `/manager/students/${student.userId}`,
                            query: { schoolId: activeSchoolId },
                        }"
                        :aria-label="`Otwórz szczegóły kursanta ${formatStudentDisplayName(student)}`"
                    >
                        Szczegóły
                    </NuxtLink>
                </UiButton>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="rounded-xl"
                    :disabled="!activeSchoolId || isStudentsLoading"
                    :aria-label="`Przypisz ${formatStudentDisplayName(student)} do kursu`"
                    @click="emit('assignCourse', student)"
                >
                    <UserPlus
                        class="mr-1.5 size-3.5 shrink-0"
                        aria-hidden="true"
                    />
                    Przypisz kurs
                </UiButton>
            </div>
        </article>
    </div>
</template>
