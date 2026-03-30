<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pulpit',
    description: () =>
        'Szablon startowy frontend z Nuxt, Vue 3, TypeScript i TailwindCSS.',
});
</script>

<template>
    <div class="space-y-4">
        <h1 class="text-foreground text-2xl font-semibold tracking-tight">
            Witaj w panelu
        </h1>
        <p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Szkielet aplikacji z lewym panelem nawigacji. Treść modułów i
            statystyki możesz dodać tutaj później.
        </p>
    </div>
</template>
