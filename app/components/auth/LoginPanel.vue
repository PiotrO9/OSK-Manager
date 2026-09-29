<script setup lang="ts">
import { ArrowRight, BadgeCheck, LoaderCircle, LogOut } from 'lucide-vue-next';
import LoginForm from './LoginForm.vue';

const {
    authenticatedContinueTarget,
    email,
    emailError,
    password,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    session,
    showDemoMockLoginUi,
    handleDemoMockFill,
    handleLogin,
    handleLogoutClick,
    handleContinueClick,
    passwordError,
    submitError,
} = useLoginPage();
</script>

<template>
    <section class="login-panel" aria-label="Panel logowania">
        <div class="panel-content">
            <div class="panel-heading">
                <h1 class="panel-title">
                    {{
                        isAuthenticated ? 'Możesz ruszać' : 'Dobrze Cię widzieć'
                    }}
                </h1>
            </div>
            <LoginForm
                v-if="!isAuthenticated"
                v-model:email="email"
                v-model:password="password"
                :email-error="emailError"
                :is-loading="isLoading"
                :password-error="passwordError"
                :show-demo="showDemoMockLoginUi"
                :submit-error="submitError"
                @submit="handleLogin"
                @fill-demo="handleDemoMockFill"
            />
            <div v-else class="session-card">
                <div class="session-info">
                    <BadgeCheck
                        class="session-icon"
                        :size="30"
                        aria-hidden="true"
                    />
                    <div>
                        <p class="session-label">Zalogowany jako</p>
                        <p class="session-name">{{ session?.userName }}</p>
                    </div>
                </div>
                <UiButton as-child class="session-home">
                    <NuxtLink
                        :to="authenticatedContinueTarget"
                        @click="handleContinueClick"
                    >
                        Wróć do aplikacji
                        <ArrowRight :size="17" aria-hidden="true" />
                    </NuxtLink>
                </UiButton>
                <UiButton
                    class="session-logout"
                    type="button"
                    variant="ghost"
                    :disabled="isLoggingOut"
                    @click="handleLogoutClick"
                >
                    <LoaderCircle
                        v-if="isLoggingOut"
                        class="session-logout-spinner"
                        :size="16"
                        aria-hidden="true"
                    />
                    <LogOut v-else :size="16" aria-hidden="true" />
                    {{ isLoggingOut ? 'Wylogowywanie…' : 'Wyloguj się' }}
                </UiButton>
            </div>
        </div>
    </section>
</template>

<style scoped>
.login-panel {
    display: flex;
    flex-direction: column;
    padding: 46px clamp(32px, 5vw, 80px) 30px;
}
.panel-content {
    width: 100%;
    max-width: 400px;
    margin: auto;
    padding: 32px 0;
}
.panel-title {
    font-size: clamp(29px, 2.65vw, 39px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -1.5px;
}
.panel-heading {
    margin-bottom: 32px;
}
.session-card {
    padding: 24px;
    border: 1px solid var(--login-border);
    border-radius: 14px;
    background: var(--login-soft);
}
.session-info {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
}
.session-icon {
    flex-shrink: 0;
    color: var(--login-accent);
}
.session-label {
    color: var(--login-muted);
    font-size: 12px;
}
.session-name {
    margin-top: 4px;
    overflow-wrap: anywhere;
    font-size: 16px;
    font-weight: 800;
}
.session-home {
    width: 100%;
    height: 48px;
    justify-content: space-between;
    border-radius: 8px;
    background: var(--primary);
    color: var(--primary-foreground);
}
.session-home:hover {
    background: var(--login-accent-hover);
}
.session-logout {
    width: 100%;
    height: 44px;
    margin-top: 8px;
    color: var(--login-muted);
}
.session-logout-spinner {
    animation: session-logout-spin 1s linear infinite;
}
@keyframes session-logout-spin {
    to {
        transform: rotate(360deg);
    }
}
@media (max-width: 959px) {
    .login-panel {
        padding: 36px 32px 24px;
    }
    .panel-content {
        padding: 0 0 24px;
    }
    .panel-title {
        font-size: 32px;
    }
}
@media (max-width: 479px) {
    .login-panel {
        padding: 32px 24px 20px;
    }
    .panel-title {
        font-size: 30px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .session-logout-spinner {
        animation: none;
    }
}
</style>
