<script setup lang="ts">
const patterns = [
    { id: 'students', label: 'Lista kursantów' },
    { id: 'profile', label: 'Profil kursanta' },
    { id: 'booking', label: 'Rezerwacja jazdy' },
    { id: 'payments', label: 'Płatności' },
] as const;

type PatternId = (typeof patterns)[number]['id'];
const activePattern = shallowRef<PatternId>('students');
</script>

<template>
    <section class="space-y-5" aria-label="Wzorce ekranów OSK">
        <div
            class="border-border bg-card flex max-w-full gap-1 overflow-x-auto rounded-lg border p-1"
            role="tablist"
            aria-label="Wybierz wzorzec ekranu"
        >
            <button
                v-for="pattern in patterns"
                :key="pattern.id"
                type="button"
                role="tab"
                class="h-9 shrink-0 rounded-md px-3 text-sm font-medium"
                :class="
                    activePattern === pattern.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                "
                :aria-selected="activePattern === pattern.id"
                @click="activePattern = pattern.id"
            >
                {{ pattern.label }}
            </button>
        </div>
        <div class="min-w-0">
            <DesignSystemStudentsExample v-if="activePattern === 'students'" />
            <DesignSystemStudentProfileExample
                v-else-if="activePattern === 'profile'"
            />
            <DesignSystemBookingExample
                v-else-if="activePattern === 'booking'"
            />
            <DesignSystemPaymentsExample v-else />
        </div>
    </section>
</template>
