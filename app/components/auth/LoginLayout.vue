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
    --login-ink: var(--foreground);
    --login-muted: var(--muted-foreground);
    --login-surface: var(--card);
    --login-soft: var(--muted);
    --login-border: var(--border);
    --login-accent: var(--primary);
    --login-accent-hover: var(--color-primary-700);
    --login-accent-soft: var(--accent);
    --login-story: var(--primary);
    --login-story-deep: var(--color-primary-950);
    --login-story-muted: var(--color-primary-200);
    min-height: 100dvh;
    background: var(--background);
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
    box-shadow: 0 24px 80px color-mix(in srgb, var(--primary) 7%, transparent);
}
.login-story {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 654px;
    overflow: hidden;
    padding: 34px 40px 26px;
    background:
        radial-gradient(
            circle at 82% 18%,
            color-mix(in srgb, var(--color-primary-300) 32%, transparent) 0 16%,
            transparent 34%
        ),
        linear-gradient(
            135deg,
            var(--primary) 0%,
            var(--color-primary-800) 46%,
            var(--login-story-deep) 100%
        );
    color: var(--primary-foreground);
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
    border: 1px solid
        color-mix(in srgb, var(--color-primary-300) 42%, transparent);
    border-radius: 12px;
    color: var(--color-primary-300);
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
    border-top: 1px solid
        color-mix(in srgb, var(--color-primary-200) 24%, transparent);
    font-size: 10px;
    color: var(--login-story-muted);
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
    background: var(--background);
}
.login-layout .login-card {
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow:
        0 24px 64px color-mix(in srgb, var(--primary) 6%, transparent),
        0 3px 12px color-mix(in srgb, var(--foreground) 4%, transparent);
}
.login-layout .brand-symbol {
    background: color-mix(in srgb, var(--color-primary-300) 10%, transparent);
    border-color: color-mix(in srgb, var(--color-primary-300) 42%, transparent);
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
    background: color-mix(in srgb, var(--login-story-deep) 82%, var(--primary));
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
.login-layout .poster-form-panel :deep(.demo-role) {
    min-height: 72px;
    border-radius: 8px;
    font-size: 11px;
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
