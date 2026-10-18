<script setup lang="ts">
const { toasts, removeToast } = useAppToast();
</script>

<template>
    <div
        class="pointer-events-none fixed top-4 right-4 left-4 z-50 sm:left-auto sm:w-full sm:max-w-sm"
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
            <AppToastItem
                v-for="toast in toasts"
                :key="toast.id"
                :toast="toast"
                @close="removeToast"
            />
        </TransitionGroup>
    </div>
</template>
