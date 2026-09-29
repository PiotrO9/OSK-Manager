<script setup lang="ts">
import { computed } from 'vue';
import ProfileAvatar from './ProfileAvatar.vue';

type AppUserIdentityAvatarSize = 24 | 32 | 36 | 40;
type AppUserIdentityAvatarTone = 'default' | 'sidebar';

const props = withDefaults(
    defineProps<{
        avatarSrc?: string | null;
        initials: string;
        name?: string;
        subtitle?: string | null;
        avatarSize?: AppUserIdentityAvatarSize;
        avatarTone?: AppUserIdentityAvatarTone;
        compact?: boolean;
        truncate?: boolean;
    }>(),
    {
        avatarSrc: null,
        name: '',
        subtitle: null,
        avatarSize: 36,
        avatarTone: 'default',
        compact: false,
        truncate: false,
    },
);

defineSlots<{
    details?(): unknown;
    name?(): unknown;
    subtitle?(): unknown;
}>();

const gapClass = computed(() =>
    props.avatarSize === 24
        ? 'gap-1.5'
        : props.avatarSize === 32
          ? 'gap-2'
          : 'gap-3',
);

const avatarToneClass = computed(() =>
    props.avatarTone === 'sidebar'
        ? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground'
        : 'border-border bg-muted/40 text-muted-foreground',
);

const textOverflowClass = computed(() =>
    props.truncate ? 'truncate' : 'wrap-anywhere',
);
</script>

<template>
    <div class="flex min-w-0 items-center" :class="gapClass">
        <ProfileAvatar
            :src="avatarSrc"
            :initials="initials"
            :size="avatarSize"
            class="border"
            :class="avatarToneClass"
        />

        <div
            v-if="
                !compact &&
                ($slots.details ||
                    name ||
                    subtitle ||
                    $slots.name ||
                    $slots.subtitle)
            "
            class="min-w-0 flex-1"
        >
            <slot v-if="$slots.details" name="details" />
            <template v-else>
                <div
                    v-if="name || $slots.name"
                    class="text-foreground text-sm leading-tight font-semibold"
                    :class="textOverflowClass"
                >
                    <slot name="name">{{ name }}</slot>
                </div>
                <div
                    v-if="subtitle || $slots.subtitle"
                    class="text-muted-foreground mt-0.5 text-xs leading-tight"
                    :class="textOverflowClass"
                >
                    <slot name="subtitle">{{ subtitle }}</slot>
                </div>
            </template>
        </div>
    </div>
</template>
