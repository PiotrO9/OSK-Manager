<script setup lang="ts">
defineProps<{
    totalStudentsCount: number;
    pageStudentsCount: number;
    activeStudentsOnPage: number;
    studentsWithPkkOnPage: number;
}>();
</script>

<template>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">Kursanci</p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ totalStudentsCount }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">Na stronie</p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ pageStudentsCount }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">
                Aktywni na stronie
            </p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ activeStudentsOnPage }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">
                Z numerem PKK
            </p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ studentsWithPkkOnPage }}
            </p>
        </div>
    </div>
</template>
