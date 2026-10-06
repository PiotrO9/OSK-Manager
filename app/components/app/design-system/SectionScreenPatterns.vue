<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui';
const patterns = [
    { id: 'students', label: 'Lista kursantów' },
    { id: 'profile', label: 'Profil kursanta' },
    { id: 'student-booking', label: 'Rezerwacja kursanta' },
    { id: 'booking', label: 'Rezerwacja managera' },
    { id: 'payments', label: 'Moje opłaty' },
] as const;
const activePattern = shallowRef('students');
</script>
<template>
    <section aria-label="Wzorce ekranów OSK">
        <TabsRoot v-model="activePattern" class="min-w-0 space-y-5">
            <TabsList
                class="border-border bg-card flex max-w-full gap-1 overflow-x-auto rounded-lg border p-1"
                aria-label="Wybierz wzorzec ekranu"
            >
                <TabsTrigger
                    v-for="pattern in patterns"
                    :key="pattern.id"
                    :value="pattern.id"
                    class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-9 shrink-0 cursor-pointer rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-2"
                >
                    {{ pattern.label }}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="students" class="min-w-0"
                ><DesignSystemStudentsExample
            /></TabsContent>
            <TabsContent value="profile" class="min-w-0"
                ><DesignSystemStudentProfileExample
            /></TabsContent>
            <TabsContent value="student-booking" class="min-w-0"
                ><DesignSystemStudentBookingExample
            /></TabsContent>
            <TabsContent value="booking" class="min-w-0"
                ><DesignSystemBookingExample
            /></TabsContent>
            <TabsContent value="payments" class="min-w-0"
                ><DesignSystemPaymentsExample
            /></TabsContent>
        </TabsRoot>
    </section>
</template>
