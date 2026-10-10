<script setup lang="ts">
import LoginForm from './LoginForm.vue';

const {
    email,
    emailError,
    password,
    isAuthenticated,
    isLoading,
    showDemoMockLoginUi,
    handleDemoMockFill,
    handleLogin,
    passwordError,
    submitError,
} = useLoginPage();
</script>

<template>
    <section class="login-panel" aria-label="Panel logowania">
        <div class="panel-content">
            <div class="panel-heading">
                <h1 class="panel-title">Dobrze Cię widzieć</h1>
            </div>
            <LoginForm
                v-model:email="email"
                v-model:password="password"
                :email-error="emailError"
                :is-loading="isLoading || isAuthenticated"
                :password-error="passwordError"
                :show-demo="showDemoMockLoginUi"
                :submit-error="submitError"
                @submit="handleLogin"
                @fill-demo="handleDemoMockFill"
            />
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
