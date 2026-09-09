<script setup lang="ts">
import { designSystemProcessSteps } from '~/data/design-system/fixtures';
</script>

<template>
    <div class="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ManagerStudentProfileCard
            initials="AK"
            display-name="Anna Kowalska"
            subtitle="Kursantka · kat. B"
            email="anna.kowalska@example.com"
            pkk-number="12345678901234567890"
            :courses-count="1"
        />
        <ManagerStudentProcessStatus
            :steps="designSystemProcessSteps"
            :is-loading="false"
            :error="null"
        />
    </div>
</template>
