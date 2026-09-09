<script setup lang="ts">
const specimens = [
    {
        name: 'Tytuł strony',
        className: 'text-2xl font-semibold leading-8',
        sample: 'Harmonogram jazd',
    },
    {
        name: 'Nagłówek sekcji',
        className: 'text-xl font-semibold leading-7',
        sample: 'Dzisiejsze lekcje',
    },
    {
        name: 'Treść interfejsu',
        className: 'text-sm font-normal leading-5',
        sample: 'Anna Kowalska · Toyota Yaris · kat. B',
    },
    {
        name: 'Etykieta',
        className: 'text-sm font-medium leading-5',
        sample: 'Instruktor prowadzący',
    },
    {
        name: 'Metadane',
        className: 'text-xs font-normal leading-4',
        sample: '08:00–09:30 · 1 250,00 zł · EZG 4K21',
    },
] as const;
</script>

<template>
    <section class="space-y-3" aria-labelledby="typography-heading">
        <div>
            <h3
                id="typography-heading"
                class="text-foreground text-base font-semibold"
            >
                Typografia Satoshi
            </h3>
            <p class="text-muted-foreground mt-1 text-sm">
                Mały tekst pozostaje podstawą interfejsu, ale nie schodzi
                poniżej 12 px.
            </p>
        </div>
        <div
            class="border-border bg-card divide-border divide-y rounded-lg border"
        >
            <div
                v-for="specimen in specimens"
                :key="specimen.name"
                class="grid gap-2 px-4 py-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-baseline"
            >
                <div>
                    <p class="text-muted-foreground text-xs font-medium">
                        {{ specimen.name }}
                    </p>
                    <code class="text-muted-foreground text-xs">{{
                        specimen.className
                    }}</code>
                </div>
                <p :class="specimen.className">{{ specimen.sample }}</p>
            </div>
        </div>
        <div
            class="border-border bg-card grid gap-4 rounded-lg border p-4 sm:grid-cols-3"
        >
            <div v-for="weight in [400, 500, 600]" :key="weight">
                <p class="text-muted-foreground text-xs">
                    Satoshi {{ weight }}
                </p>
                <p class="mt-2 text-base" :style="{ fontWeight: weight }">
                    Łukasz Żółkiewicz
                </p>
            </div>
        </div>
    </section>
</template>
