<script setup lang="ts">
import { Camera, Info } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';

defineProps<{
    avatarSrc: string;
    isAvatarUploadLoading: boolean;
    isDemoSession: boolean;
    showAvatarImage: boolean;
    userInitials: string;
}>();

defineEmits<{
    avatarError: [];
    avatarFileChange: [event: Event];
    chooseAvatar: [];
    chooseAvatarKeydown: [event: KeyboardEvent];
}>();

const avatarFileInputRef = defineModel<HTMLInputElement | null>(
    'avatarFileInputRef',
    {
        required: true,
    },
);
</script>

<template>
    <div
        class="border-border/70 bg-muted/20 flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center"
    >
        <div
            class="border-border bg-muted/40 relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
            aria-hidden="true"
        >
            <img
                v-if="showAvatarImage"
                :src="avatarSrc"
                alt=""
                class="size-full object-cover"
                loading="lazy"
                @error="$emit('avatarError')"
            />
            <span
                v-else
                class="text-foreground text-2xl font-bold tracking-tight"
            >
                {{ userInitials }}
            </span>
            <span
                class="bg-primary text-primary-foreground absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full shadow-sm"
                aria-hidden="true"
            >
                <Camera class="size-4" />
            </span>
        </div>
        <div class="min-w-0 flex-1 space-y-3">
            <input
                ref="avatarFileInputRef"
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Wybierz plik obrazu avatara"
                :disabled="isDemoSession || isAvatarUploadLoading"
                @change="$emit('avatarFileChange', $event)"
            />
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <p class="text-foreground text-sm font-semibold">
                        Zdjęcie profilowe
                    </p>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <button
                                    type="button"
                                    class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    aria-label="Wymagania zdjęcia profilowego"
                                >
                                    <Info class="size-4" aria-hidden="true" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                JPEG, PNG lub WebP, do 5 MB.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p
                    v-if="isDemoSession"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    W trybie demo nie można przesłać avatara.
                </p>
            </div>
            <UiButton
                type="button"
                variant="secondary"
                :disabled="isDemoSession || isAvatarUploadLoading"
                :aria-busy="isAvatarUploadLoading"
                @click="$emit('chooseAvatar')"
                @keydown="$emit('chooseAvatarKeydown', $event)"
            >
                {{ isAvatarUploadLoading ? 'Wysyłanie…' : 'Zmień avatar' }}
            </UiButton>
        </div>
    </div>
</template>
