<script setup lang="ts">
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next';
import type { StudentListItem } from '~/types/students/student';
import { formatStudentDisplayName } from '~/types/students/student';

interface CourseParticipantsPagination {
    total: number;
    totalPages: number;
    pageSize: number;
}

defineProps<{
    participants: readonly StudentListItem[];
    currentPage: number;
    pagination: CourseParticipantsPagination | null;
    participantsTotal: number | null;
    isLoading: boolean;
    error: string | null;
}>();

defineEmits<{
    retry: [];
    prevPage: [];
    nextPage: [];
}>();

function studentInitials(student: StudentListItem): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
}

function studentTo(student: StudentListItem): string {
    return `/manager/students/${student.userId}`;
}
</script>

<template>
    <section
        class="border-border bg-card rounded-lg border shadow-xs"
        aria-labelledby="course-progress-heading"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="min-w-0 space-y-1">
                <h2
                    id="course-progress-heading"
                    class="text-foreground text-base font-semibold"
                >
                    Postęp kursantów
                </h2>
                <p class="text-muted-foreground text-sm">
                    Lista kursantów przypisanych do tego kursu.
                </p>
            </div>
        </div>

        <div class="space-y-4 p-5">
            <div v-if="isLoading" class="space-y-3" role="status">
                <div
                    v-for="index in 4"
                    :key="index"
                    class="border-border flex items-center gap-3 rounded-lg border p-3"
                >
                    <div
                        class="bg-muted size-9 shrink-0 animate-pulse rounded-full"
                    />
                    <div class="min-w-0 flex-1 space-y-2">
                        <div class="bg-muted h-4 w-40 animate-pulse rounded" />
                        <div
                            class="bg-muted h-2 w-full animate-pulse rounded"
                        />
                    </div>
                </div>
            </div>

            <ErrorState
                v-else-if="error"
                title="Nie udało się wczytać uczestników"
                :description="error"
                @retry="$emit('retry')"
            />

            <EmptyState
                v-else-if="participantsTotal === 0"
                title="Brak kursantów w kursie"
                description="Po przypisaniu kursantów lista i zapełnienie zaczną pokazywać realne wartości."
            />

            <div v-else class="space-y-3">
                <div
                    v-for="student in participants"
                    :key="student.id"
                    class="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex min-w-0 items-center gap-3">
                        <AppListAvatar
                            :src="student.avatarUrl"
                            :initials="studentInitials(student)"
                            :size="36"
                        />
                        <div class="min-w-0">
                            <NuxtLink
                                :to="studentTo(student)"
                                class="text-foreground hover:text-primary truncate text-sm font-semibold"
                            >
                                {{ formatStudentDisplayName(student) }}
                            </NuxtLink>
                            <p class="text-muted-foreground truncate text-xs">
                                {{ student.email }}
                            </p>
                        </div>
                    </div>

                    <NuxtLink
                        :to="studentTo(student)"
                        class="text-muted-foreground hover:text-primary inline-flex items-center gap-1 self-start text-xs font-medium sm:self-center"
                        aria-label="Przejdź do szczegółów kursanta"
                    >
                        Szczegóły
                        <ExternalLink class="size-3" aria-hidden="true" />
                    </NuxtLink>
                </div>

                <nav
                    v-if="pagination"
                    class="border-border bg-muted/20 flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    aria-label="Strony kursantów w kursie"
                >
                    <p
                        class="text-muted-foreground text-sm font-medium tabular-nums sm:text-xs"
                        aria-live="polite"
                    >
                        Strona {{ currentPage }} z
                        {{ pagination.totalPages }} ({{ pagination.total }}
                        uczestników)
                    </p>
                    <div class="flex flex-wrap gap-2 sm:justify-end">
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="h-10 flex-1 sm:h-9 sm:flex-none"
                            :disabled="currentPage <= 1 || isLoading"
                            aria-label="Poprzednia strona kursantów"
                            @click="$emit('prevPage')"
                        >
                            <ChevronLeft
                                class="mr-1 size-4"
                                aria-hidden="true"
                            />
                            Poprzednia
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="h-10 flex-1 sm:h-9 sm:flex-none"
                            :disabled="
                                currentPage >= pagination.totalPages ||
                                isLoading
                            "
                            aria-label="Następna strona kursantów"
                            @click="$emit('nextPage')"
                        >
                            Następna
                            <ChevronRight
                                class="ml-1 size-4"
                                aria-hidden="true"
                            />
                        </UiButton>
                    </div>
                </nav>
            </div>
        </div>
    </section>
</template>
