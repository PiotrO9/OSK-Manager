<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: [
        'manager',
        (to) => {
            if (!('schoolId' in to.query)) return;

            const query = { ...to.query };

            delete query.schoolId;

            return navigateTo(
                { path: to.path, query, hash: to.hash },
                { replace: true },
            );
        },
    ],
});
</script>

<template>
    <ManagerLessonEditContainer />
</template>
