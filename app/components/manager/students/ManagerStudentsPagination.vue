<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import type { StudentsPagePagination } from '~/composables/useManagerStudentsPage';

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
    <div
        v-if="
            activeSchoolId &&
            pagination &&
            pagination.totalPages > 1 &&
            !hasError
        "
        class="border-border flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between"
    >
        <p class="text-muted-foreground text-sm tabular-nums">
            Strona {{ currentPage }} z {{ pagination.totalPages }} ({{
                pagination.total
            }}
            kursantów)
        </p>
        <div class="flex flex-wrap gap-2">
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="rounded-xl"
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
                class="rounded-xl"
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
    </div>
</template>
