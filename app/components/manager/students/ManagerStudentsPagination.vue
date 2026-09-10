<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import type { StudentsPagePagination } from '~/composables/students/useManagerStudentsPage';

interface Props {
    activeSchoolId: string;
    currentPage: number;
    pagination: StudentsPagePagination | null;
    isStudentsLoading: boolean;
    hasError: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    prev: [];
    next: [];
}>();
</script>

<template>
    <nav
        v-if="
            activeSchoolId &&
            pagination &&
            pagination.totalPages > 1 &&
            !isStudentsLoading &&
            !hasError
        "
        class="students-pagination border-border bg-muted/20 flex flex-col gap-3 rounded-b-xl border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        aria-label="Strony listy kursantów"
    >
        <p
            class="text-muted-foreground text-sm font-medium tabular-nums sm:text-xs"
            aria-live="polite"
        >
            Strona {{ currentPage }} z {{ pagination.totalPages }} ({{
                pagination.total
            }}
            kursantów)
        </p>
        <div class="flex flex-wrap gap-2 sm:justify-end">
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="h-11 flex-1 sm:h-9 sm:flex-none"
                :disabled="currentPage <= 1 || isStudentsLoading"
                aria-label="Poprzednia strona listy kursantów"
                @click="emit('prev')"
            >
                <ChevronLeft class="mr-1 size-4" aria-hidden="true" />
                Poprzednia
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="h-11 flex-1 sm:h-9 sm:flex-none"
                :disabled="
                    currentPage >= pagination.totalPages || isStudentsLoading
                "
                aria-label="Następna strona listy kursantów"
                @click="emit('next')"
            >
                Następna
                <ChevronRight class="ml-1 size-4" aria-hidden="true" />
            </UiButton>
        </div>
    </nav>
</template>

<style scoped>
.students-pagination {
    position: sticky;
    bottom: 0;
    z-index: 20;
    background: var(--card);
    background: color-mix(in srgb, var(--card) 96%, transparent);
    box-shadow:
        0 -1px 0 var(--border),
        0 -16px 32px color-mix(in srgb, var(--background) 70%, transparent);
    backdrop-filter: blur(10px);
}
</style>
