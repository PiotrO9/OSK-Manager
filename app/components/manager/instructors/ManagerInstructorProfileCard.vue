<script setup lang="ts">
import AppListAvatar from '~/components/app/AppListAvatar.vue';

interface ProfileRow {
    label: string;
    value: string;
}

defineProps<{
    initials: string;
    name: string;
    avatarUrl: string | null;
    categoryLabel: string;
    profileRows: ProfileRow[];
    hasQualifiedCourseTypes: boolean;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-lg shadow-xs">
        <UiCardContent class="space-y-3 p-4">
            <div class="flex items-center gap-3">
                <AppListAvatar
                    :src="avatarUrl"
                    :initials="initials"
                    :size="36"
                />

                <div class="min-w-0">
                    <p class="text-foreground text-sm font-semibold">
                        Dane instruktora
                    </p>
                    <p class="text-muted-foreground text-sm wrap-break-word">
                        {{ name }}
                    </p>
                </div>
            </div>

            <div class="grid gap-3">
                <div
                    class="border-success-200 bg-success-50/40 dark:border-success-500/40 dark:bg-success-500/10 rounded-lg border px-3 py-3"
                >
                    <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p
                                class="text-muted-foreground text-sm font-medium"
                            >
                                Status
                            </p>
                            <p
                                class="text-foreground mt-0.5 text-base font-semibold"
                            >
                                Aktywny
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                Profil instruktora
                            </p>
                        </div>
                        <StatusBadge label="Aktywny" tone="success" />
                    </div>
                </div>

                <div
                    class="border-border bg-background rounded-lg border px-3 py-3"
                >
                    <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p
                                class="text-muted-foreground text-sm font-medium"
                            >
                                Kategorie
                            </p>
                            <p
                                class="text-foreground mt-0.5 text-base font-semibold wrap-break-word"
                            >
                                {{ categoryLabel }}
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                {{
                                    hasQualifiedCourseTypes
                                        ? 'Uzupełnione'
                                        : 'Do uzupełnienia'
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <dl class="divide-border divide-y">
                <div
                    v-for="row in profileRows"
                    :key="row.label"
                    class="flex items-center justify-between gap-4 py-3"
                >
                    <dt class="text-muted-foreground text-sm">
                        {{ row.label }}
                    </dt>
                    <dd
                        class="text-foreground min-w-0 truncate text-right text-sm font-bold"
                    >
                        {{ row.value }}
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
