<script setup lang="ts">
import { Camera, Info } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';

const props = defineProps<{
    avatarSrc: string;
    isAvatarUploadLoading: boolean;
    isDemoSession: boolean;
    showAvatarImage: boolean;
    userInitials: string;
}>();

const emit = defineEmits<{
    avatarError: [];
    avatarFileChange: [event: Event];
}>();

const avatarFileInput = useTemplateRef<HTMLInputElement>('avatarFileInput');

function chooseAvatar(): void {
    if (props.isDemoSession || props.isAvatarUploadLoading) return;

    avatarFileInput.value?.click();
}
</script>

<template>
    <div class="flex flex-col items-center text-center">
        <div
            class="border-border bg-muted/40 relative flex size-28 items-center justify-center overflow-hidden rounded-full border shadow-xs"
            aria-hidden="true"
        >
            <img
                v-if="showAvatarImage"
                :src="avatarSrc"
                alt=""
                width="112"
                height="112"
                class="size-full object-cover"
                loading="eager"
                @error="emit('avatarError')"
            />
            <span
                v-else
                class="text-foreground text-2xl font-bold tracking-tight"
            >
                {{ userInitials }}
            </span>
        </div>

        <input
            ref="avatarFileInput"
            type="file"
            name="avatar"
            class="sr-only"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Wybierz plik zdjęcia profilowego"
            :disabled="isDemoSession || isAvatarUploadLoading"
            @change="emit('avatarFileChange', $event)"
        />

        <div class="mt-4 flex w-full items-center gap-1.5">
            <UiButton
                type="button"
                variant="secondary"
                class="min-w-0 flex-1"
                :disabled="isDemoSession || isAvatarUploadLoading"
                :aria-busy="isAvatarUploadLoading"
                @click="chooseAvatar"
            >
                <Camera class="size-4" aria-hidden="true" />
                {{ isAvatarUploadLoading ? 'Wysyłanie…' : 'Zmień zdjęcie' }}
            </UiButton>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <button
                            type="button"
                            class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            aria-label="Wymagania dotyczące zdjęcia profilowego"
                        >
                            <Info class="size-3.5" aria-hidden="true" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end">
                        JPEG, PNG lub WebP, maksymalnie 5 MB.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <p
            v-if="isDemoSession"
            class="text-warning-700 dark:text-warning-300 mt-2 text-xs font-medium"
            role="status"
        >
            Zmiana zdjęcia jest wyłączona w trybie demo.
        </p>
    </div>
</template>
