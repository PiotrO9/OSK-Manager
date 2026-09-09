<script setup lang="ts">
import {
    ArrowRight,
    BriefcaseBusiness,
    CarFront,
    Eye,
    EyeOff,
    GraduationCap,
    LoaderCircle,
    LockKeyhole,
    Mail,
} from 'lucide-vue-next';
import type { DemoMockLoginRole } from '~/composables/auth/useLoginPage';

defineProps<{ isFormValid: boolean; isLoading: boolean; showDemo: boolean }>();
const emit = defineEmits<{ submit: []; fillDemo: [role: DemoMockLoginRole] }>();
const email = defineModel<string>('email', { required: true });
const password = defineModel<string>('password', { required: true });
const passwordVisible = shallowRef(false);
const demoRoles = [
    {
        role: 'manager',
        label: 'Manager',
        accountLabel: 'managera',
        icon: BriefcaseBusiness,
    },
    {
        role: 'student',
        label: 'Kursant',
        accountLabel: 'kursanta',
        icon: GraduationCap,
    },
    {
        role: 'instructor',
        label: 'Instruktor',
        accountLabel: 'instruktora',
        icon: CarFront,
    },
] as const;

function fillDemo(role: DemoMockLoginRole) {
    passwordVisible.value = false;
    emit('fillDemo', role);
}
</script>

<template>
    <form
        class="login-form"
        :aria-busy="isLoading"
        @submit.prevent="emit('submit')"
    >
        <div class="form-field">
            <label class="field-label" for="emailInput">Adres e-mail</label>
            <div class="input-wrap">
                <Mail class="field-icon" :size="17" aria-hidden="true" />
                <UiInput
                    id="emailInput"
                    v-model="email"
                    class="login-input"
                    type="email"
                    name="email"
                    autocomplete="username"
                    inputmode="email"
                    :spellcheck="false"
                    autocapitalize="none"
                    placeholder="np. jan@example.com"
                    :disabled="isLoading"
                    required
                />
            </div>
        </div>
        <div class="form-field">
            <label class="field-label" for="passwordInput">Hasło</label>
            <div class="input-wrap">
                <LockKeyhole class="field-icon" :size="17" aria-hidden="true" />
                <UiInput
                    id="passwordInput"
                    v-model="password"
                    class="login-input password-input"
                    :type="passwordVisible ? 'text' : 'password'"
                    name="password"
                    autocomplete="current-password"
                    placeholder="Wprowadź hasło"
                    :disabled="isLoading"
                    required
                />
                <button
                    class="password-toggle"
                    type="button"
                    :aria-label="
                        passwordVisible ? 'Ukryj hasło' : 'Pokaż hasło'
                    "
                    :aria-pressed="passwordVisible"
                    aria-controls="passwordInput"
                    :disabled="isLoading"
                    @click="passwordVisible = !passwordVisible"
                >
                    <EyeOff
                        v-if="passwordVisible"
                        :size="18"
                        aria-hidden="true"
                    />
                    <Eye v-else :size="18" aria-hidden="true" />
                </button>
            </div>
        </div>
        <UiButton
            class="login-submit"
            type="submit"
            :disabled="!isFormValid || isLoading"
        >
            <span>{{ isLoading ? 'Logowanie…' : 'Zaloguj się' }}</span>
            <LoaderCircle
                v-if="isLoading"
                class="loading-icon"
                :size="18"
                aria-hidden="true"
            />
            <ArrowRight v-else :size="18" aria-hidden="true" />
        </UiButton>
        <section
            v-if="showDemo"
            class="demo-section"
            aria-label="Demo: szybkie uzupełnianie formularza logowania"
        >
            <div class="demo-divider" aria-hidden="true" />
            <div class="demo-heading">
                <h2 class="demo-title">Sprawdź, jak to działa</h2>
                <span class="demo-badge">DEMO</span>
            </div>
            <p class="demo-description">
                Wybierz rolę, a uzupełnimy dane logowania.
            </p>
            <div class="demo-roles">
                <button
                    v-for="item in demoRoles"
                    :key="item.role"
                    class="demo-role"
                    type="button"
                    :aria-label="`Demo: wstaw dane konta ${item.accountLabel} w formularz`"
                    :disabled="isLoading"
                    @click="fillDemo(item.role)"
                >
                    <component :is="item.icon" :size="19" aria-hidden="true" />
                    <span>{{ item.label }}</span>
                </button>
            </div>
        </section>
    </form>
</template>

<style scoped>
.form-field + .form-field {
    margin-top: 20px;
}
.field-label {
    display: block;
    margin-bottom: 9px;
    font-size: 12px;
    font-weight: 800;
}
.input-wrap {
    position: relative;
}
.field-icon {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 16px;
    color: var(--login-muted);
    transform: translateY(-50%);
    pointer-events: none;
}
.login-input {
    height: 52px;
    padding: 0 16px 0 44px;
    border: 1px solid var(--login-border);
    border-radius: 10px;
    background: var(--login-surface);
    color: var(--login-ink);
    font-size: 14px;
    box-shadow: 0 2px 3px #172b3a03;
}
.login-input::placeholder {
    color: var(--login-muted);
    font-weight: 400;
}
.login-input:focus-visible {
    border-color: var(--login-accent);
    outline: 3px solid color-mix(in srgb, var(--login-accent) 16%, transparent);
    outline-offset: 1px;
    box-shadow: none;
}
.password-input {
    padding-right: 50px;
}
.password-toggle {
    position: absolute;
    top: 4px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 7px;
    color: var(--login-muted);
    cursor: pointer;
}
.password-toggle:hover {
    background: var(--login-soft);
    color: var(--login-ink);
}
.password-toggle:disabled {
    cursor: wait;
    opacity: 0.5;
}
.login-submit {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 52px;
    margin-top: 26px;
    padding-inline: 20px;
    border: 1px solid #087caf;
    border-radius: 10px;
    background: #087caf;
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 5px 12px #087caf19;
    transition:
        background 0.18s,
        box-shadow 0.18s;
}
.login-submit:hover {
    background: #06628c;
    box-shadow: 0 6px 16px #087caf28;
}
.login-submit:disabled {
    border-color: var(--login-border);
    background: var(--login-soft);
    color: var(--login-muted);
    opacity: 1;
    box-shadow: none;
}
.demo-divider {
    margin: 29px 0 24px;
    height: 1px;
    background: var(--login-border);
}
.demo-heading {
    display: flex;
    align-items: center;
    gap: 9px;
}
.demo-title {
    font-size: 13px;
    font-weight: 800;
}
.demo-badge {
    padding: 3px 6px;
    border: 1px solid var(--login-border);
    border-radius: 4px;
    background: var(--login-soft);
    color: var(--login-muted);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
}
.demo-description {
    margin-top: 6px;
    color: var(--login-muted);
    font-size: 11px;
    line-height: 1.65;
}
.demo-roles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
}
.demo-role {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 75px;
    padding: 12px 4px;
    border: 1px solid var(--login-border);
    border-radius: 10px;
    background: var(--login-surface);
    color: var(--login-muted);
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    transition:
        border-color 0.18s,
        background 0.18s,
        color 0.18s;
}
.demo-role:hover {
    border-color: var(--login-accent);
    background: var(--login-accent-soft);
    color: var(--login-accent);
}
.demo-role:disabled {
    opacity: 0.5;
    cursor: wait;
}
.password-toggle:focus-visible,
.demo-role:focus-visible {
    outline: 2px solid var(--login-accent);
    outline-offset: 3px;
}
.loading-icon {
    animation: login-spin 1s linear infinite;
}
@keyframes login-spin {
    to {
        transform: rotate(360deg);
    }
}
@media (max-width: 959px) {
    .login-input {
        font-size: 16px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .login-submit,
    .demo-role {
        transition: none;
    }
    .loading-icon {
        animation: none;
    }
}
</style>
