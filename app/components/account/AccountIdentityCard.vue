<script setup lang="ts">
import AccountProfileAvatarSection from './AccountProfileAvatarSection.vue';
import type { AccountRolePresentation } from '~/utils/account/accountProfilePresentation';

defineProps<{
    avatarSrc: string;
    displayName: string;
    email: string;
    isAvatarUploadLoading: boolean;
    isDemoSession: boolean;
    role: AccountRolePresentation;
    showAvatarImage: boolean;
    userInitials: string;
}>();

defineEmits<{
    avatarError: [];
    avatarFileChange: [event: Event];
}>();
</script>

<template>
    <UiCard class="border-border bg-card rounded-2xl shadow-sm">
        <UiCardContent class="p-5">
            <AccountProfileAvatarSection
                :avatar-src="avatarSrc"
                :is-avatar-upload-loading="isAvatarUploadLoading"
                :is-demo-session="isDemoSession"
                :show-avatar-image="showAvatarImage"
                :user-initials="userInitials"
                @avatar-error="$emit('avatarError')"
                @avatar-file-change="$emit('avatarFileChange', $event)"
            />

            <div class="border-border mt-5 border-t pt-5 text-center">
                <h2
                    class="text-foreground text-lg leading-tight font-bold break-words"
                >
                    {{ displayName }}
                </h2>
                <p
                    v-if="email"
                    class="text-muted-foreground mt-1 text-sm break-all"
                >
                    {{ email }}
                </p>
                <StatusBadge
                    class="mt-3"
                    :label="role.label"
                    :tone="role.tone"
                    subtle
                />
            </div>
        </UiCardContent>
    </UiCard>
</template>
