<script setup lang="ts">
const props = defineProps<{ pkkNumber: string | null }>();
</script>

<template>
    <AppCopyableValue
        :value="props.pkkNumber"
        copy-label="numer PKK"
        success-title="Skopiowano numer PKK"
        error-title="Nie udało się skopiować numeru PKK"
        empty-label="brak numeru"
    />
</template>
