<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Moje konto',
    description: () => 'Dane profilu i avatar.',
});

const account = useAccountPage();
</script>

<template>
    <div class="mx-auto w-full max-w-[1120px] space-y-5 md:space-y-6">
        <AccountPageHeader
            :can-edit-inline-profile="account.canEditInlineProfile.value"
            :inline-profile-editing="account.inlineProfileEditing.value"
            :is-inline-profile-saving="account.isInlineProfileSaving.value"
            @cancel-edit="account.handleCancelInlineProfileEdit"
            @save="account.handleInlineProfileSubmit"
            @start-edit="account.handleStartInlineProfileEdit"
        />

        <div class="grid gap-4">
            <AccountProfileCard
                v-model:avatar-file-input-ref="account.avatarFileInputRef.value"
                v-model:edit-bio="account.editBio.value"
                v-model:edit-first-name="account.editFirstName.value"
                v-model:edit-last-name="account.editLastName.value"
                v-model:edit-phone="account.editPhone.value"
                :account-pkk-number="account.accountPkkNumber.value"
                :avatar-src="account.avatarSrc.value"
                :can-edit-phone-and-bio="account.canEditPhoneAndBio.value"
                :can-edit-profile-names="account.canEditProfileNames.value"
                :display-name="account.displayName.value"
                :format-profile-field="account.formatProfileField"
                :inline-profile-editing="account.inlineProfileEditing.value"
                :is-account-pkk-missing="account.isAccountPkkMissing.value"
                :is-avatar-upload-loading="account.isAvatarUploadLoading.value"
                :is-demo-session="account.isDemoSession.value"
                :is-inline-profile-saving="account.isInlineProfileSaving.value"
                :is-student-session="account.isStudentSession.value"
                :profile-contact-error="account.profileContactError.value"
                :profile-names-error="account.profileNamesError.value"
                :session="account.session.value"
                :session-role-badge="account.sessionRoleBadge.value"
                :show-avatar-image="account.showAvatarImage.value"
                :user-initials="account.userInitials.value"
                @avatar-error="account.handleAvatarImageError"
                @avatar-file-change="account.handleAvatarFileChange"
                @choose-avatar="account.handleChooseAvatarClick"
                @choose-avatar-keydown="account.handleChooseAvatarKeyDown"
            />
        </div>
    </div>
</template>
