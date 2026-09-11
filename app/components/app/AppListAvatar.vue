<script setup lang="ts">
import ProfileAvatar from './ProfileAvatar.vue';

type AppListAvatarSize = 24 | 32 | 36 | 40;

withDefaults(
    defineProps<{
        src?: string | null;
        initials: string;
        size?: AppListAvatarSize;
    }>(),
    {
        src: null,
        size: 36,
    },
);
</script>

<template>
    <ProfileAvatar
        :src="src"
        :initials="initials"
        :size="size"
        class="border-border bg-muted/40 text-muted-foreground flex shrink-0 items-center justify-center rounded-full border font-semibold"
    />
</template>
