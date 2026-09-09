<script setup lang="ts">
import { ArrowRight, BadgeCheck, LogOut } from 'lucide-vue-next';
import LoginForm from './LoginForm.vue';

const {
    email,
    password,
    isAuthenticated,
    isFormValid,
    isLoading,
    session,
    showDemoMockLoginUi,
    handleDemoMockFill,
    handleLogin,
    handleLogoutClick,
    handleGoHome,
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
                :is-form-valid="isFormValid"
                :is-loading="isLoading"
                :show-demo="showDemoMockLoginUi"
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
                <UiButton
                    class="session-home"
                    type="button"
                    aria-label="Przejdź do strony głównej"
                    @click="handleGoHome"
                    >Strona główna <ArrowRight :size="17" aria-hidden="true"
                /></UiButton>
                <UiButton
                    class="session-logout"
                    type="button"
                    variant="ghost"
                    @click="handleLogoutClick"
                    ><LogOut :size="16" aria-hidden="true" /> Wyloguj
                    się</UiButton
                >
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
</style>
