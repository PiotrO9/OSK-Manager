<script setup lang="ts">
interface Props {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

interface Emits {
    (e: 'update:open', value: boolean): void;
    (e: 'confirm' | 'cancel'): void;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
});

const emit = defineEmits<Emits>();
const slots = useSlots();

const dialogRef = ref<HTMLDialogElement | null>(null);

const hasHeaderSlot = computed(() => !!slots.header);
const hasDefaultSlot = computed(() => !!slots.default);
const hasFooterSlot = computed(() => !!slots.footer);

watch(
    () => props.open,
    (newValue) => {
        if (!dialogRef.value) return;

        if (newValue) {
            nextTick(() => {
                if (dialogRef.value) {
                    dialogRef.value.showModal();
                }
            });
        } else {
            dialogRef.value.close();
        }
    },
    { immediate: true },
);

function closeDialog() {
    emit('update:open', false);
}

function handleConfirm() {
    emit('confirm');
    setTimeout(closeDialog, 0);
}

function handleCancel() {
    emit('cancel');
    setTimeout(closeDialog, 0);
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
    }
}

function handleBackdropClick(event: MouseEvent) {
    if (!dialogRef.value) return;

    if (event.target === dialogRef.value) {
        handleCancel();
    }
}

onMounted(() => {
    if (props.open && dialogRef.value) {
        dialogRef.value.showModal();
    }
});
</script>

<template>
    <Teleport to="body">
        <dialog
            v-show="open"
            ref="dialogRef"
            class="dialog-content dark:bg-secondary-900 dark:text-secondary-50 fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md rounded-xl border-0 bg-white p-0 shadow-2xl outline-none backdrop:bg-black/30 backdrop:backdrop-blur-sm"
            :aria-labelledby="
                hasHeaderSlot || title ? 'dialog-title' : undefined
            "
            :aria-describedby="
                hasDefaultSlot || message ? 'dialog-message' : undefined
            "
            @keydown="handleKeyDown"
            @click="handleBackdropClick"
        >
            <div class="p-6">
                <header v-if="hasHeaderSlot" class="mb-3">
                    <slot name="header" />
                </header>

                <h2
                    v-else-if="title"
                    id="dialog-title"
                    class="text-secondary-900 dark:text-secondary-50 mb-3 text-xl font-semibold"
                >
                    {{ title }}
                </h2>

                <div v-if="hasDefaultSlot" class="mb-6">
                    <slot />
                </div>

                <p
                    v-else-if="message"
                    id="dialog-message"
                    class="text-secondary-600 dark:text-secondary-400 mb-6"
                >
                    {{ message }}
                </p>

                <footer v-if="hasFooterSlot">
                    <slot name="footer" />
                </footer>

                <div v-else class="flex justify-end gap-3">
                    <button
                        type="button"
                        tabindex="0"
                        class="border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus-visible:ring-secondary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 dark:hover:bg-secondary-700 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        :aria-label="cancelText"
                        @click="handleCancel"
                        @keydown="
                            (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleCancel();
                                }
                            }
                        "
                    >
                        {{ cancelText }}
                    </button>
                    <button
                        type="button"
                        tabindex="0"
                        class="bg-danger-600 hover:bg-danger-700 focus-visible:ring-danger-500 dark:bg-danger-700 dark:hover:bg-danger-600 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        :aria-label="confirmText"
                        @click="handleConfirm"
                        @keydown="
                            (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleConfirm();
                                }
                            }
                        "
                    >
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
.dialog-content {
    animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.dialog-content[open] {
    animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dialog-enter {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.dialog-content::backdrop {
    animation: backdrop-enter 0.2s ease-out forwards;
}

@keyframes backdrop-enter {
    from {
        opacity: 0;
        backdrop-filter: blur(0);
    }
    to {
        opacity: 1;
        backdrop-filter: blur(4px);
    }
}
</style>
