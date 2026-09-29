<script setup lang="ts">
import { Building2, Plus, Star } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

interface Props {
    schools: DrivingSchool[];
    defaultSchool: DrivingSchool | null;
    loadError: string | null;
    isLoading: boolean;
    deletingId: string | null;
    settingDefaultId: string | null;
    isFormSaving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    retry: [];
    requestAdd: [];
    requestEdit: [school: DrivingSchool];
    requestDelete: [school: DrivingSchool];
    setDefault: [school: DrivingSchool];
}>();

const schoolsLabel = computed(() => {
    const count = props.schools.length;

    if (count === 1) return '1 szkoła przypisana do konta';

    if ([2, 3, 4].includes(count)) {
        return `${count} szkoły przypisane do konta`;
    }

    return `${count} szkół przypisanych do konta`;
});
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
        aria-labelledby="managerOskListTitle"
        :aria-busy="isLoading"
    >
        <header
            class="border-border flex min-w-0 flex-col gap-4 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
        >
            <div class="flex min-w-0 items-center gap-3">
                <span
                    class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden="true"
                >
                    <Building2 class="size-5" />
                </span>
                <div class="min-w-0">
                    <h2
                        id="managerOskListTitle"
                        class="text-foreground font-semibold text-pretty"
                    >
                        Twoje szkoły
                    </h2>
                    <p
                        class="text-muted-foreground mt-0.5 text-sm tabular-nums"
                        aria-live="polite"
                    >
                        {{ schoolsLabel }}
                    </p>
                </div>
            </div>

            <div
                v-if="defaultSchool"
                class="bg-muted/35 flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 lg:max-w-sm"
            >
                <Star class="text-primary size-4 shrink-0" aria-hidden="true" />
                <div class="min-w-0">
                    <p class="text-muted-foreground text-xs">Domyślna OSK</p>
                    <p
                        class="text-foreground text-sm font-semibold wrap-anywhere"
                    >
                        {{ defaultSchool.name }}
                    </p>
                </div>
            </div>
        </header>

        <LoadingState
            v-if="isLoading && schools.length === 0"
            title="Wczytywanie szkół jazdy…"
            :show-labels="false"
            class="m-4 border-0 shadow-none"
        />

        <ErrorState
            v-else-if="loadError"
            title="Nie udało się wczytać szkół jazdy"
            :description="`${loadError} Spróbuj ponownie.`"
            class="m-4"
            @retry="emit('retry')"
        />

        <EmptyState
            v-else-if="schools.length === 0"
            title="Dodaj pierwszą szkołę jazdy"
            description="Utwórz OSK, aby skonfigurować instruktorów, kursantów, pojazdy i harmonogram."
            class="m-4"
        >
            <template #action>
                <UiButton type="button" @click="emit('requestAdd')">
                    <Plus class="size-4" aria-hidden="true" />
                    Dodaj OSK
                </UiButton>
            </template>
        </EmptyState>

        <ManagerOskListGrid
            v-else
            :schools="schools"
            :deleting-id="deletingId"
            :setting-default-id="settingDefaultId"
            :is-form-saving="isFormSaving"
            @request-edit="emit('requestEdit', $event)"
            @request-delete="emit('requestDelete', $event)"
            @set-default="emit('setDefault', $event)"
        />
    </section>
</template>
