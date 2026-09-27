<script setup lang="ts">
import { ImageIcon, Info, RefreshCw, Upload, X } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';

const props = defineProps<{
    canRetry: boolean;
    fileName: string;
    fileSize: string | null;
    hasPendingFile: boolean;
    isBusy: boolean;
    photoUploadError: string | null;
    previewPhotoSrc: string | null;
    vehicleName: string;
}>();

defineEmits<{
    clearFile: [];
    fileChange: [event: Event];
    retryPhotoUpload: [];
}>();

const imageFailed = ref(false);

watch(
    () => props.previewPhotoSrc,
    () => {
        imageFailed.value = false;
    },
);
</script>

<template>
    <section
        class="border-border bg-muted/15 overflow-hidden rounded-xl border"
        aria-labelledby="vehicle-photo-heading"
    >
        <div class="border-border border-b px-4 py-4 sm:px-5">
            <h3
                id="vehicle-photo-heading"
                class="text-foreground text-base font-semibold"
            >
                Zdjęcie pojazdu
            </h3>
            <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                Zdjęcie pomaga szybko rozpoznać pojazd na liście i podczas
                planowania jazd.
            </p>
        </div>

        <div
            class="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(16rem,24rem)_minmax(0,1fr)] lg:items-start"
        >
            <div
                class="bg-background text-muted-foreground border-border relative aspect-[4/3] w-full max-w-96 overflow-hidden rounded-xl border"
            >
                <img
                    v-if="previewPhotoSrc && !imageFailed"
                    :src="previewPhotoSrc"
                    :alt="`Zdjęcie pojazdu ${vehicleName}`"
                    width="640"
                    height="480"
                    class="size-full object-cover"
                    @error="imageFailed = true"
                />
                <div
                    v-else
                    class="flex size-full flex-col items-center justify-center gap-2 px-4 text-center text-sm"
                    role="img"
                    aria-label="Brak zdjęcia pojazdu"
                >
                    <ImageIcon
                        class="text-muted-foreground/60 size-7"
                        aria-hidden="true"
                    />
                    <span>Brak zdjęcia</span>
                </div>
            </div>

            <div class="min-w-0 space-y-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <p class="text-foreground text-sm font-semibold">
                            Wybierz nowe zdjęcie
                        </p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <button
                                        type="button"
                                        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-6 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                        aria-label="Wymagania zdjęcia pojazdu"
                                    >
                                        <Info
                                            class="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    JPEG, PNG lub WebP, maksymalnie 5 MB.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p class="text-muted-foreground text-sm">
                        Plik zostanie przesłany razem z zapisem formularza.
                    </p>
                </div>

                <input
                    id="vehicle-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="sr-only"
                    aria-label="Wybierz nowe zdjęcie pojazdu"
                    :disabled="isBusy"
                    @change="$emit('fileChange', $event)"
                />

                <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <UiButton
                        as-child
                        type="button"
                        variant="secondary"
                        :class="{ 'pointer-events-none opacity-50': isBusy }"
                    >
                        <label
                            for="vehicle-photo-input"
                            class="cursor-pointer"
                            :aria-disabled="isBusy"
                        >
                            <Upload class="size-4" aria-hidden="true" />
                            {{
                                hasPendingFile ? 'Wybierz inne' : 'Wybierz plik'
                            }}
                        </label>
                    </UiButton>

                    <UiButton
                        v-if="hasPendingFile"
                        type="button"
                        variant="outline"
                        :disabled="isBusy"
                        @click="$emit('clearFile')"
                    >
                        <X class="size-4" aria-hidden="true" />
                        Usuń wybór
                    </UiButton>
                </div>

                <div
                    v-if="hasPendingFile"
                    class="border-border bg-background min-w-0 rounded-lg border px-3 py-2"
                    aria-live="polite"
                >
                    <p class="text-foreground truncate text-sm font-medium">
                        {{ fileName }}
                    </p>
                    <p v-if="fileSize" class="text-muted-foreground text-xs">
                        {{ fileSize }}
                    </p>
                </div>
                <p v-else class="text-muted-foreground text-sm">
                    Nie wybrano pliku.
                </p>

                <div
                    v-if="photoUploadError"
                    class="border-destructive/30 bg-destructive/5 rounded-lg border p-3"
                    role="alert"
                >
                    <p class="text-destructive text-sm">
                        {{ photoUploadError }}
                    </p>
                    <UiButton
                        v-if="canRetry"
                        type="button"
                        variant="outline"
                        size="sm"
                        class="bg-background mt-3"
                        :disabled="isBusy"
                        @click="$emit('retryPhotoUpload')"
                    >
                        <RefreshCw class="size-4" aria-hidden="true" />
                        Spróbuj ponownie
                    </UiButton>
                </div>
            </div>
        </div>
    </section>
</template>
