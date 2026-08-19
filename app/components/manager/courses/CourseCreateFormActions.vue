<script setup lang="ts">
import { cn } from '@/lib/utils';
import { buttonVariants } from '~/components/shadcn/button';

defineProps<{
    schoolId: string;
    isSaving: boolean;
    isBlocked: boolean;
}>();
</script>

<template>
    <div
        class="border-border bg-muted/10 flex flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:justify-end md:px-5"
    >
        <UiButton
            as-child
            variant="outline"
            class="h-10 rounded-xl px-4 font-semibold shadow-sm"
        >
            <NuxtLink
                :to="{
                    path: '/manager/courses',
                    query: { schoolId },
                }"
            >
                Anuluj
            </NuxtLink>
        </UiButton>
        <button
            type="submit"
            :class="
                cn(
                    buttonVariants(),
                    'h-10 rounded-xl px-4 font-semibold shadow-sm',
                )
            "
            :disabled="isSaving || isBlocked"
        >
            {{ isSaving ? 'Tworzenie…' : 'Zapisz' }}
        </button>
    </div>
</template>
