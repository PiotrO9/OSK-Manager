<script setup lang="ts">
import {
    PlusCircle,
    Building2,
    Trash2,
    Loader2,
    Pencil,
} from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/drivingSchool';

interface Props {
    schools: DrivingSchool[];
    isListLoading: boolean;
    deletingId: string | null;
    isFormSaving: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    'request-add': [];
    'request-edit': [school: DrivingSchool];
    'request-delete': [school: DrivingSchool];
}>();

function handleCreateCardKeydown(event: KeyboardEvent) {
    if (isEnterOrSpaceKey(event)) {
        emit('request-add');
    }
}

function handleOpenEditKeydown(event: KeyboardEvent, school: DrivingSchool) {
    if (isEnterOrSpaceKey(event)) {
        emit('request-edit', school);
    }
}

function handleRequestDeleteKeydown(
    event: KeyboardEvent,
    school: DrivingSchool,
) {
    if (isEnterOrSpaceKey(event)) {
        emit('request-delete', school);
    }
}
</script>

<template>
    <div
        v-if="isListLoading && schools.length === 0"
        class="text-muted-foreground text-sm"
        role="status"
    >
        Wczytywanie listy…
    </div>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        <li role="listitem">
            <button
                type="button"
                class="border-primary/40 hover:border-primary hover:bg-primary/5 focus-visible:ring-primary group flex h-full min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Dodaj nową szkołę jazdy"
                tabindex="0"
                :disabled="deletingId !== null || isFormSaving"
                @click="emit('request-add')"
                @keydown="handleCreateCardKeydown"
            >
                <PlusCircle
                    class="text-primary/60 group-hover:text-primary size-8 transition"
                    aria-hidden="true"
                />
                <span
                    class="text-primary/70 group-hover:text-primary text-sm font-medium transition"
                >
                    Dodaj OSK
                </span>
            </button>
        </li>

        <li v-for="school in schools" :key="school.id" role="listitem">
            <div
                class="border-border flex h-full min-h-32 flex-col gap-2 rounded-2xl border bg-white p-5 transition dark:bg-transparent"
                :class="
                    deletingId === school.id
                        ? 'opacity-50'
                        : 'hover:bg-muted/40'
                "
            >
                <div class="flex items-start gap-3">
                    <div
                        class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl"
                    >
                        <Building2 class="size-4" aria-hidden="true" />
                    </div>

                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <p
                                :id="`osk-name-${school.id}`"
                                class="text-foreground truncate font-semibold"
                            >
                                {{ school.name }}
                            </p>
                            <span
                                v-if="school.isDefault"
                                class="bg-primary/15 text-primary shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
                            >
                                Domyślna
                            </span>
                        </div>
                        <p
                            class="text-muted-foreground mt-0.5 text-xs"
                            :aria-labelledby="`osk-name-${school.id}`"
                        >
                            <span v-if="school.city">
                                {{ school.city }}
                            </span>
                            <span v-if="school.city && school.address">
                                ·
                            </span>
                            <span v-if="school.address">
                                {{ school.address }}
                            </span>
                            <span v-if="!school.city && !school.address">
                                Brak adresu
                            </span>
                        </p>
                    </div>

                    <div class="-mt-1 -mr-1 flex shrink-0 items-center gap-0.5">
                        <button
                            type="button"
                            class="text-muted-foreground hover:text-foreground focus-visible:ring-primary rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                            :aria-label="`Edytuj szkołę ${school.name}`"
                            :disabled="deletingId !== null || isFormSaving"
                            tabindex="0"
                            @click="emit('request-edit', school)"
                            @keydown="handleOpenEditKeydown($event, school)"
                        >
                            <Pencil class="size-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            class="text-muted-foreground hover:text-destructive focus-visible:ring-destructive rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                            :aria-label="`Usuń szkołę ${school.name}`"
                            :disabled="deletingId !== null"
                            tabindex="0"
                            @click="emit('request-delete', school)"
                            @keydown="
                                handleRequestDeleteKeydown($event, school)
                            "
                        >
                            <Loader2
                                v-if="deletingId === school.id"
                                class="size-4 animate-spin"
                                aria-hidden="true"
                            />
                            <Trash2 v-else class="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</template>
