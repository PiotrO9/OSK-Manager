<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';
import { designSystemStudents } from '~/data/design-system/fixtures';
</script>

<template>
    <div class="space-y-4">
        <PageHeader
            title="Kursanci"
            description="Lista kursantów przypisanych do wybranej szkoły."
            eyebrow="Manager"
        >
            <template #actions
                ><UiButton
                    ><UserPlus aria-hidden="true" /> Dodaj kursanta</UiButton
                ></template
            >
        </PageHeader>
        <ManagerStudentsList
            :students="designSystemStudents"
            active-school-id="design-system"
            :is-students-loading="false"
            :show-details-link="false"
            @assign-course="() => undefined"
        />
    </div>
</template>
