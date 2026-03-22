<script setup lang="ts">
export type LoaderVariant =
    | 'circles'
    | 'pulse'
    | 'dots'
    | 'wave'
    | 'orbit'
    | 'spinner';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

export type LoaderColor = 'primary' | 'secondary' | 'white';

interface Props {
    ariaLabel?: string;
    variant?: LoaderVariant;
    size?: LoaderSize;
    color?: LoaderColor;
    text?: string;
    fullScreen?: boolean;
    centered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    ariaLabel: 'Loading...',
    variant: 'circles',
    size: 'lg',
    color: 'primary',
    text: undefined,
    fullScreen: false,
    centered: true,
});

const loaderClass = computed(() => {
    const base = 'flex flex-col items-center justify-center';

    if (props.fullScreen) {
        return `${base} fixed inset-0 z-50 bg-white/90 dark:bg-secondary-950/90 backdrop-blur-sm`;
    }

    if (props.centered) {
        return `${base} w-full py-12`;
    }

    return base;
});

const containerClass = computed(() => {
    return 'flex items-center justify-center';
});

const svgClass = computed(() => {
    const sizeClasses = {
        sm: 'h-16 w-16',
        md: 'h-24 w-24',
        lg: 'h-32 w-32',
        xl: 'h-40 w-40',
    };

    const colorClasses = {
        primary: 'text-primary-500 dark:text-primary-400',
        secondary: 'text-secondary-600 dark:text-secondary-400',
        white: 'text-white',
    };

    return `${sizeClasses[props.size]} ${colorClasses[props.color]}`;
});

const textClass = computed(() => {
    const base = 'mt-4 text-sm font-medium';

    const colorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        secondary: 'text-secondary-600 dark:text-secondary-400',
        white: 'text-white',
    };

    return `${base} ${colorClasses[props.color]}`;
});
</script>

<template>
    <div
        :aria-label="ariaLabel"
        :class="loaderClass"
        role="status"
        aria-live="polite"
    >
        <span class="sr-only">{{ ariaLabel }}</span>
        <div :class="containerClass">
            <svg
                v-if="variant === 'circles'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                aria-hidden="true"
            >
                <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    opacity="0.3"
                />
                <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="125.6"
                    stroke-dashoffset="125.6"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="125.6;0;125.6"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 60 60;360 60 60"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>

            <svg
                v-else-if="variant === 'pulse'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                aria-hidden="true"
            >
                <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="currentColor"
                    opacity="0.2"
                >
                    <animate
                        attributeName="r"
                        values="20;40;20"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.2;0;0.2"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="currentColor"
                    opacity="0.6"
                >
                    <animate
                        attributeName="r"
                        values="20;35;20"
                        dur="1.5s"
                        begin="0.3s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="1.5s"
                        begin="0.3s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="60" cy="60" r="20" fill="currentColor" />
            </svg>

            <svg
                v-else-if="variant === 'dots'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 40"
                aria-hidden="true"
            >
                <circle cx="20" cy="20" r="8" fill="currentColor">
                    <animate
                        attributeName="opacity"
                        values="0.3;1;0.3"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="60" cy="20" r="8" fill="currentColor">
                    <animate
                        attributeName="opacity"
                        values="0.3;1;0.3"
                        dur="1s"
                        begin="0.2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="100" cy="20" r="8" fill="currentColor">
                    <animate
                        attributeName="opacity"
                        values="0.3;1;0.3"
                        dur="1s"
                        begin="0.4s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>

            <svg
                v-else-if="variant === 'wave'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 80"
                aria-hidden="true"
            >
                <path
                    d="M0 40 Q30 20, 60 40 T120 40"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    opacity="0.3"
                />
                <path
                    d="M0 40 Q30 20, 60 40 T120 40"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                >
                    <animate
                        attributeName="d"
                        values="M0 40 Q30 20, 60 40 T120 40;M0 40 Q30 60, 60 40 T120 40;M0 40 Q30 20, 60 40 T120 40"
                        dur="1.5s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>

            <svg
                v-else-if="variant === 'orbit'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                aria-hidden="true"
            >
                <circle
                    cx="60"
                    cy="60"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    opacity="0.2"
                />
                <circle cx="30" cy="60" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 60 60;360 60 60"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="90" cy="60" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="360 60 60;0 60 60"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="60" cy="30" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="90 60 60;450 60 60"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="60" cy="90" r="6" fill="currentColor">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="270 60 60;630 60 60"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>

            <svg
                v-else-if="variant === 'spinner'"
                :class="svgClass"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                aria-hidden="true"
            >
                <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="6"
                    opacity="0.2"
                />
                <path
                    d="M 60 20 A 40 40 0 0 1 100 60"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="6"
                    stroke-linecap="round"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 60 60;360 60 60"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
        <p v-if="text" :class="textClass">
            {{ text }}
        </p>
    </div>
</template>
