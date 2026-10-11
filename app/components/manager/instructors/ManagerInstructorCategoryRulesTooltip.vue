<script setup lang="ts">
import { Info } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';
</script>

<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child>
                <button
                    type="button"
                    class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-6 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label="Zasady usuwania kategorii uprawnień"
                >
                    <Info class="size-4" aria-hidden="true" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" class="max-w-72 text-left">
                Usunięcie kategorii jest możliwe po zakończeniu lub
                przeniesieniu zaplanowanych zajęć i aktywnych kursów instruktora
                w tej kategorii.
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>
