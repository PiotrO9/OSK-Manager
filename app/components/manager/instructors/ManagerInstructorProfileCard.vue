<script setup lang="ts">
interface ProfileRow {
    label: string;
    value: string;
}

defineProps<{
    initials: string;
    name: string;
    categoryLabel: string;
    profileRows: ProfileRow[];
    hasQualifiedCourseTypes: boolean;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardContent class="p-5">
            <div class="space-y-5">
                <div class="flex items-start gap-4">
                    <div
                        class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                        aria-hidden="true"
                    >
                        {{ initials }}
                    </div>

                    <div class="min-w-0 pt-1">
                        <h2
                            class="text-foreground truncate text-xl font-extrabold"
                        >
                            {{ name }}
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Instruktor · {{ categoryLabel }}
                        </p>
                    </div>
                </div>

                <div class="border-border divide-border divide-y border-t">
                    <div
                        v-for="row in profileRows"
                        :key="row.label"
                        class="grid grid-cols-[6.5rem_1fr] gap-3 py-3 text-sm"
                    >
                        <p class="text-muted-foreground">
                            {{ row.label }}
                        </p>
                        <p
                            class="text-foreground min-w-0 text-right font-semibold break-words"
                        >
                            {{ row.value }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <StatusBadge label="Aktywny" tone="success" />
                    <StatusBadge
                        :label="
                            hasQualifiedCourseTypes
                                ? 'Kwalifikacje'
                                : 'Brak kategorii'
                        "
                        :tone="hasQualifiedCourseTypes ? 'info' : 'neutral'"
                        subtle
                    />
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
