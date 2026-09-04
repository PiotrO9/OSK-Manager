<script setup lang="ts">
import { Mail } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';

defineProps<{
    instructors: InstructorListItem[];
    instructorDetailsTo: (instructor: InstructorListItem) => RouteLocationRaw;
    instructorQualificationLabel: (instructor: InstructorListItem) => string;
    instructorInitials: (instructor: InstructorListItem) => string;
}>();
</script>

<template>
    <div class="hidden overflow-hidden rounded-2xl border md:block">
        <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-muted/50 text-muted-foreground border-b">
                <tr>
                    <th scope="col" class="px-4 py-3 font-semibold">Nazwa</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Kontakt</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Zakres</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Akcje</th>
                </tr>
            </thead>
            <tbody class="divide-border divide-y">
                <tr
                    v-for="instructor in instructors"
                    :key="instructor.id"
                    class="hover:bg-muted/30"
                >
                    <td class="px-4 py-3">
                        <div class="flex min-w-0 items-center gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                            >
                                {{ instructorInitials(instructor) }}
                            </div>
                            <div class="min-w-0">
                                <p class="truncate font-extrabold">
                                    {{
                                        formatInstructorDisplayName(instructor)
                                    }}
                                </p>
                                <p class="text-muted-foreground text-xs">
                                    {{
                                        instructorQualificationLabel(instructor)
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
                            {{ instructorQualificationLabel(instructor) }}
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
                                :to="instructorDetailsTo(instructor)"
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
</template>
