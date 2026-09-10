<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';

type ProfileAvatarSize = 24 | 32 | 36 | 40;
type ProfileAvatarShape = 'circle' | 'rounded';
type ImageState = 'idle' | 'loading' | 'loaded' | 'error';

const props = withDefaults(
    defineProps<{
        src?: string | null;
        initials: string;
        size?: ProfileAvatarSize;
        shape?: ProfileAvatarShape;
    }>(),
    {
        src: null,
        size: 36,
        shape: 'circle',
    },
);

const imageState = shallowRef<ImageState>('idle');

const normalizedSrc = computed(() => {
    const src = props.src?.trim();

    return src && src.length > 0 ? src : null;
});

const displayInitials = computed(() => {
    const value = props.initials.trim();

    return value.length > 0 ? value : '?';
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 24:
            return 'size-6 text-[10px]';
        case 32:
            return 'size-8 text-xs';
        case 40:
            return 'size-10 text-sm';
        case 36:
        default:
            return 'size-9 text-xs';
    }
});

const shapeClass = computed(() =>
    props.shape === 'rounded' ? 'rounded-xl' : 'rounded-full',
);

const showImage = computed(
    () => normalizedSrc.value !== null && imageState.value !== 'error',
);
const showInitials = computed(() => imageState.value !== 'loaded');

watch(
    normalizedSrc,
    (src) => {
        imageState.value = src ? 'loading' : 'idle';
    },
    { immediate: true },
);

function isCurrentImage(event: Event): boolean {
    const img = event.currentTarget;

    return (
        img instanceof HTMLImageElement &&
        img.getAttribute('src') === normalizedSrc.value
    );
}

function handleImageLoad(event: Event): void {
    if (isCurrentImage(event)) {
        imageState.value = 'loaded';
    }
}

function handleImageError(event: Event): void {
    if (isCurrentImage(event)) {
        imageState.value = 'error';
    }
}
</script>

<template>
    <span
        class="relative flex shrink-0 items-center justify-center overflow-hidden font-semibold"
        :class="[sizeClass, shapeClass]"
        aria-hidden="true"
    >
        <span
            v-if="showInitials"
            class="flex size-full items-center justify-center"
        >
            {{ displayInitials }}
        </span>
        <img
            v-if="showImage"
            :key="normalizedSrc ?? 'profile-avatar-empty'"
            :src="normalizedSrc ?? undefined"
            alt=""
            class="absolute inset-0 size-full object-cover transition-opacity"
            :class="imageState === 'loaded' ? 'opacity-100' : 'opacity-0'"
            @load="handleImageLoad"
            @error="handleImageError"
        />
    </span>
</template>
