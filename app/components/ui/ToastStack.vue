<script setup lang="ts">
const { toasts, removeToast } = useToast();

interface ToastA11y {
    role: 'status' | 'alert';
    ariaLive: 'polite' | 'assertive';
}

interface ToastUi {
    containerClass: string;
    iconWrapperClass: string;
    iconClass: string;
    closeButtonClass: string;
    closeRingClass: string;
    a11y: ToastA11y;
}

function getToastUi(variant: ToastVariant): ToastUi {
    if (variant === 'success') {
        return {
            containerClass:
                'border-success-600/60 bg-success-50/90 text-secondary-900 dark:border-success-500/60 dark:bg-success-950/90 dark:text-success-50',
            iconWrapperClass:
                'bg-success-500/15 text-success-700 dark:bg-success-500/30 dark:text-success-300',
            iconClass: 'text-success-700 dark:text-success-300',
            closeButtonClass:
                'text-success-700/70 hover:text-success-800 hover:bg-success-100/50 active:bg-success-200/50 dark:text-success-300/70 dark:hover:text-success-200 dark:hover:bg-success-900/30 dark:active:bg-success-800/40',
            closeRingClass:
                'focus-visible:ring-success-400 focus-visible:ring-offset-2',
            a11y: { role: 'status', ariaLive: 'polite' },
        };
    }

    if (variant === 'warning') {
        return {
            containerClass:
                'border-warning-600/60 bg-warning-50/90 text-secondary-900 dark:border-warning-500/60 dark:bg-warning-950/90 dark:text-warning-50',
            iconWrapperClass:
                'bg-warning-500/15 text-warning-800 dark:bg-warning-500/30 dark:text-warning-300',
            iconClass: 'text-warning-800 dark:text-warning-300',
            closeButtonClass:
                'text-warning-800/70 hover:text-warning-900 hover:bg-warning-100/50 active:bg-warning-200/50 dark:text-warning-300/70 dark:hover:text-warning-200 dark:hover:bg-warning-900/30 dark:active:bg-warning-800/40',
            closeRingClass:
                'focus-visible:ring-warning-400 focus-visible:ring-offset-2',
            a11y: { role: 'status', ariaLive: 'polite' },
        };
    }

    if (variant === 'error') {
        return {
            containerClass:
                'border-danger-600/60 bg-danger-50/90 text-secondary-900 dark:border-danger-500/60 dark:bg-danger-950/90 dark:text-danger-50',
            iconWrapperClass:
                'bg-danger-500/15 text-danger-800 dark:bg-danger-500/30 dark:text-danger-300',
            iconClass: 'text-danger-800 dark:text-danger-300',
            closeButtonClass:
                'text-danger-800/70 hover:text-danger-900 hover:bg-danger-100/50 active:bg-danger-200/50 dark:text-danger-300/70 dark:hover:text-danger-200 dark:hover:bg-danger-900/30 dark:active:bg-danger-800/40',
            closeRingClass:
                'focus-visible:ring-danger-400 focus-visible:ring-offset-2',
            a11y: { role: 'alert', ariaLive: 'assertive' },
        };
    }

    return {
        containerClass:
            'border-primary-600/60 bg-white/90 text-secondary-900 dark:border-primary-500/60 dark:bg-secondary-900/90 dark:text-primary-50',
        iconWrapperClass:
            'bg-primary-500/15 text-primary-800 dark:bg-primary-500/30 dark:text-primary-300',
        iconClass: 'text-primary-800 dark:text-primary-300',
        closeButtonClass:
            'text-secondary-700/70 hover:text-secondary-900 hover:bg-secondary-100/50 active:bg-secondary-200/50 dark:text-secondary-300/70 dark:hover:text-secondary-200 dark:hover:bg-secondary-800/50 dark:active:bg-secondary-700/60',
        closeRingClass:
            'focus-visible:ring-primary-400 focus-visible:ring-offset-2',
        a11y: { role: 'status', ariaLive: 'polite' },
    };
}

function getToastIcon(variant: ToastVariant): string {
    if (variant === 'success') return 'heroicons:check-circle';

    if (variant === 'warning') return 'heroicons:exclamation-triangle';

    if (variant === 'error') return 'heroicons:x-circle';

    return 'heroicons:information-circle';
}

function handleClose(toastId: string) {
    removeToast(toastId);
}

function handleCloseKeyDown(event: KeyboardEvent, toastId: string) {
    if (!event) return;

    if (!isEnterOrSpaceKey(event)) return;

    event.preventDefault();
    handleClose(toastId);
}
</script>

<template>
    <div
        class="pointer-events-none fixed top-4 right-4 z-50 w-full max-w-sm space-y-3"
        aria-label="Powiadomienia"
    >
        <TransitionGroup
            tag="div"
            class="space-y-3"
            move-class="transform-gpu transition duration-300 ease-out motion-reduce:transition-none"
            enter-active-class="will-change-transform transform-gpu transition duration-300 ease-out motion-reduce:transition-none"
            enter-from-class="opacity-0 translate-y-2 translate-x-6 scale-95"
            enter-to-class="opacity-100 translate-y-0 translate-x-0 scale-100"
            leave-active-class="will-change-transform transform-gpu transition duration-200 ease-in motion-reduce:transition-none"
            leave-from-class="opacity-100 translate-y-0 translate-x-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 translate-x-6 scale-95"
        >
            <div
                v-for="toast in toasts"
                :key="toast.id"
                class="pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur"
                :class="getToastUi(toast.variant).containerClass"
                :role="getToastUi(toast.variant).a11y.role"
                :aria-live="getToastUi(toast.variant).a11y.ariaLive"
                aria-atomic="true"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-start gap-3">
                        <div
                            class="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl"
                            :class="getToastUi(toast.variant).iconWrapperClass"
                            aria-hidden="true"
                        >
                            <Icon
                                :name="getToastIcon(toast.variant)"
                                :class="[
                                    'size-5',
                                    getToastUi(toast.variant).iconClass,
                                ]"
                                aria-hidden="true"
                            />
                        </div>

                        <div class="min-w-0">
                            <p class="truncate text-sm font-semibold">
                                {{ toast.title }}
                            </p>
                            <p
                                v-if="toast.description"
                                class="text-secondary-700 dark:text-secondary-300 mt-1 text-sm"
                            >
                                {{ toast.description }}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        tabindex="0"
                        class="group relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 motion-reduce:transition-none"
                        :class="[
                            getToastUi(toast.variant).closeButtonClass,
                            getToastUi(toast.variant).closeRingClass,
                        ]"
                        aria-label="Zamknij powiadomienie"
                        @click="handleClose(toast.id)"
                        @keydown="handleCloseKeyDown($event, toast.id)"
                    >
                        <Icon
                            name="heroicons:x-mark"
                            class="size-4 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 motion-reduce:transition-none"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped></style>
