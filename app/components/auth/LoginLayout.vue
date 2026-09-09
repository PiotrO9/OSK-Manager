<script setup lang="ts">
import { Route } from 'lucide-vue-next';
import LoginPanel from './LoginPanel.vue';
import LoginPosterArt from './LoginPosterArt.vue';
</script>

<template>
    <div class="login-layout">
        <div class="login-stage">
            <div class="login-card">
                <section
                    class="login-story"
                    aria-label="OSK Manager — funkcje aplikacji"
                >
                    <div class="login-brand">
                        <span class="brand-symbol"
                            ><Route
                                :size="24"
                                :stroke-width="1.6"
                                aria-hidden="true"
                        /></span>
                        <span><strong>OSK</strong> Manager</span>
                    </div>
                    <LoginPosterArt />
                    <p class="story-modules">Panel zarządzania szkołą jazdy</p>
                </section>
                <LoginPanel class="poster-form-panel" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-layout {
    --login-ink: #142e3d;
    --login-muted: #627480;
    --login-surface: #fff;
    --login-soft: #f3f6f7;
    --login-border: #d7e1e6;
    --login-accent: #087caf;
    --login-accent-soft: #eaf7fd;
    min-height: 100dvh;
    background: #e9eef0;
    color: var(--login-ink);
}
.login-stage {
    display: grid;
    align-content: center;
    min-height: 100dvh;
    padding: 32px 48px;
}
.login-card {
    display: grid;
    grid-template-columns: 1.08fr 1fr;
    width: 100%;
    max-width: 1240px;
    margin: auto;
    overflow: hidden;
    border-radius: 22px;
    background: var(--login-surface);
    box-shadow: 0 24px 80px #17384a0b;
}
.login-story {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 654px;
    overflow: hidden;
    padding: 34px 40px 26px;
    background: #102f40;
    color: #f4f8fa;
}
.login-brand {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    letter-spacing: -0.7px;
}
.brand-symbol {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid #ffffff30;
    border-radius: 12px;
    color: #88d6fa;
}
.login-brand strong {
    font-weight: 800;
}
.story-modules {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #ffffff26;
    font-size: 10px;
    color: #bad4e1;
}
.poster-form-panel {
    min-width: 0;
    padding: 38px 56px;
}
.poster-form-panel :deep(.panel-content) {
    max-width: 354px;
    padding: 20px 0;
}
.poster-form-panel :deep(.panel-title) {
    font-size: clamp(28px, 2.4vw, 34px);
    letter-spacing: -1.1px;
}
.poster-form-panel :deep(.login-input),
.poster-form-panel :deep(.login-submit) {
    height: 50px;
}
.poster-form-panel :deep(.demo-role) {
    min-height: 68px;
}
.login-layout {
    background: #eaf0f2;
}
.login-layout .login-card {
    border: 1px solid #dce5e9;
    border-radius: 24px;
    box-shadow:
        0 24px 64px #1638490d,
        0 3px 12px #16384904;
}
.login-layout .brand-symbol {
    background: #8adaff0a;
    border-color: #8adaff40;
}
.login-layout .login-brand {
    gap: 13px;
    letter-spacing: -0.5px;
}
.login-layout .login-brand strong {
    margin-right: 4px;
}
.login-layout .story-modules {
    gap: 16px;
    margin-inline: -40px;
    margin-bottom: -26px;
    padding: 22px 40px;
    background: #102f40;
    font-size: 10px;
}
.login-layout .poster-form-panel {
    padding-inline: 50px;
}
.login-layout .poster-form-panel :deep(.panel-content) {
    max-width: 368px;
    animation: poster-form-enter 0.55s ease-out both;
}
.login-layout .poster-form-panel :deep(.panel-heading) {
    margin-bottom: 34px;
}
.login-layout .poster-form-panel :deep(.panel-title) {
    font-size: 34px;
    letter-spacing: -1.2px;
}
.login-layout .poster-form-panel :deep(.field-label) {
    font-weight: 750;
}
.login-layout .poster-form-panel :deep(.login-input) {
    border-radius: 9px;
    background: #fbfcfd;
    box-shadow: none;
    transition:
        border-color 0.18s,
        background 0.18s;
}
.login-layout .poster-form-panel :deep(.login-input:hover:not(:disabled)) {
    border-color: #a6becb;
}
.login-layout .poster-form-panel :deep(.login-input:focus-visible) {
    background: #fff;
    border-color: #087caf;
}
.login-layout .poster-form-panel :deep(.login-submit) {
    border-radius: 9px;
}
.login-layout .poster-form-panel :deep(.login-submit:not(:disabled)) {
    background: #123e54;
    border-color: #123e54;
    box-shadow: 0 4px 10px #123e541a;
}
.login-layout .poster-form-panel :deep(.login-submit:not(:disabled):hover) {
    background: #0b5679;
    border-color: #0b5679;
}
.login-layout .poster-form-panel :deep(.demo-role) {
    min-height: 72px;
    border-radius: 9px;
    font-size: 11px;
}
.login-layout .poster-form-panel :deep(.demo-role[aria-pressed='true']) {
    border-color: #087caf;
    background: #eef9ff;
    color: #05668f;
    box-shadow: inset 0 0 0 1px #087caf;
}
@keyframes poster-form-enter {
    from {
        opacity: 0;
        transform: translateY(7px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@media (min-width: 901px) and (max-width: 1100px) {
    .login-layout .poster-form-panel {
        padding-inline: 32px;
    }
    .login-layout .poster-form-panel :deep(.panel-title) {
        font-size: 29px;
    }
    .login-layout .story-modules {
        margin-inline: -30px;
        padding-inline: 30px;
        gap: 10px;
        font-size: 9px;
    }
}
@media (max-width: 900px) {
    .login-layout .login-card {
        grid-template-columns: 1fr;
        max-width: 480px;
        border-radius: 18px;
    }
    .login-layout .login-story {
        min-height: 0;
        padding: 24px;
    }
    .login-layout .login-brand {
        font-size: 18px;
    }
    .login-layout .story-modules {
        display: none;
    }
    .login-layout .poster-form-panel {
        padding: 30px 28px;
    }
    .login-layout .poster-form-panel :deep(.panel-content) {
        padding: 0;
    }
    .login-layout .poster-form-panel :deep(.panel-title) {
        font-size: 29px;
    }
    .login-layout .poster-form-panel :deep(.panel-heading) {
        margin-bottom: 27px;
    }
}
@media (max-width: 360px) {
    .login-layout .poster-form-panel {
        padding-inline: 20px;
    }
    .login-layout .poster-form-panel :deep(.panel-title) {
        font-size: 26px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .login-layout .poster-form-panel :deep(.panel-content) {
        animation: none;
    }
    .login-layout .poster-form-panel :deep(.login-input) {
        transition: none;
    }
}
@media (min-width: 1600px) {
    .login-card {
        max-width: 1320px;
    }
}
@media (max-width: 1100px) {
    .login-stage {
        padding-inline: 24px;
    }
    .poster-form-panel {
        padding-inline: 32px;
    }
    .login-story {
        padding-inline: 30px;
    }
}
@media (max-width: 760px) {
    .login-stage {
        display: block;
        min-height: 0;
        padding: 8px 16px 24px;
    }
    .login-story {
        min-height: 0;
        padding: 24px;
    }
    .login-brand {
        font-size: 18px;
    }
    .story-modules {
        display: none;
    }
    .poster-form-panel {
        padding: 32px 28px;
    }
    .poster-form-panel :deep(.panel-content) {
        padding: 0;
    }
    .poster-form-panel :deep(.panel-title) {
        font-size: 29px;
    }
}
@media (max-width: 360px) {
    .login-stage {
        padding-inline: 10px;
    }
    .poster-form-panel {
        padding-inline: 20px;
    }
}
</style>
