<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router';
import AccountIdentityCard from '~/components/account/AccountIdentityCard.vue';
import AccountPageHeader from '~/components/account/AccountPageHeader.vue';
import AccountProfileCard from '~/components/account/AccountProfileCard.vue';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Moje konto',
    description: () => 'Dane profilu i avatar.',
});

const account = useAccountPage();

onBeforeRouteLeave(() => account.confirmDiscardChanges());

function handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!account.isInlineProfileDirty.value) return;

    event.preventDefault();
    event.returnValue = '';
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload));
onBeforeUnmount(() =>
    window.removeEventListener('beforeunload', handleBeforeUnload),
);
</script>

<template>
    <div class="space-y-5 md:space-y-6">
        <AccountPageHeader
            :can-edit-inline-profile="account.canEditInlineProfile.value"
            :inline-profile-editing="account.inlineProfileEditing.value"
            :is-inline-profile-saving="account.isInlineProfileSaving.value"
            @start-edit="account.handleStartInlineProfileEdit"
        />

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]"
        >
            <aside class="min-w-0 xl:sticky xl:top-5 xl:self-start">
                <AccountIdentityCard
                    :avatar-src="account.avatarSrc.value"
                    :display-name="account.displayName.value"
                    :email="account.session.value?.email ?? ''"
                    :is-avatar-upload-loading="
                        account.isAvatarUploadLoading.value
                    "
                    :is-demo-session="account.isDemoSession.value"
                    :role="account.sessionRoleBadge.value"
                    :show-avatar-image="account.showAvatarImage.value"
                    :user-initials="account.userInitials.value"
                    @avatar-error="account.handleAvatarImageError"
                    @avatar-file-change="account.handleAvatarFileChange"
                />
            </aside>

            <AccountProfileCard
                v-model:edit-bio="account.editBio.value"
                v-model:edit-first-name="account.editFirstName.value"
                v-model:edit-last-name="account.editLastName.value"
                v-model:edit-phone="account.editPhone.value"
                :account-pkk-number="account.accountPkkNumber.value"
                :avatar-src="account.avatarSrc.value"
                :can-edit-phone-and-bio="account.canEditPhoneAndBio.value"
                :can-edit-profile-names="account.canEditProfileNames.value"
                :edit-bio-error="account.editBioError.value"
                :edit-first-name-error="account.editFirstNameError.value"
                :edit-last-name-error="account.editLastNameError.value"
                :first-name="account.session.value?.firstName"
                :format-profile-field="account.formatProfileField"
                :inline-profile-editing="account.inlineProfileEditing.value"
                :is-account-pkk-missing="account.isAccountPkkMissing.value"
                :is-inline-profile-dirty="account.isInlineProfileDirty.value"
                :is-inline-profile-saving="account.isInlineProfileSaving.value"
                :is-student-session="account.isStudentSession.value"
                :last-name="account.session.value?.lastName"
                :session="account.session.value"
                @cancel-edit="account.handleCancelInlineProfileEdit"
                @save="account.handleInlineProfileSubmit"
            />
        </div>
    </div>
</template>
