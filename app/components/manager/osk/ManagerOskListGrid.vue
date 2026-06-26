<script setup lang="ts">
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

interface Props {
    schools: DrivingSchool[];
    isListLoading: boolean;
    deletingId: string | null;
    isFormSaving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'request-add': [];
    'request-edit': [school: DrivingSchool];
    'request-delete': [school: DrivingSchool];
}>();

function formatLocation(school: DrivingSchool): string {
    const parts = [school.city, school.address]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(' · ') : 'Brak adresu';
}

function formatScope(school: DrivingSchool): string {
    return school.isDefault === true ? 'Domyślna' : 'Oddział';
}

function isActionDisabled(school: DrivingSchool): boolean {
    return (
        props.deletingId !== null ||
        props.isFormSaving ||
        props.deletingId === school.id
    );
}
</script>

<template>
    <DataTableShell
        :is-loading="props.isListLoading && props.schools.length === 0"
        empty-title="Brak szkół jazdy"
        empty-description="Dodaj pierwszą OSK, aby skonfigurować panel managera."
    >
        <table class="w-full min-w-4xl text-sm">
            <thead class="bg-muted/30 text-muted-foreground">
                <tr class="border-border border-b">
                    <th class="px-4 py-3 text-left text-xs font-semibold">
                        Nazwa
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold">
                        Zakres
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold">
                        Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold">
                        Ostatnia aktywność
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-semibold">
                        Akcje
                    </th>
                </tr>
            </thead>
            <tbody class="divide-border divide-y">
                <tr v-if="props.schools.length === 0">
                    <td colspan="5" class="px-4 py-8">
                        <div
                            class="flex flex-col items-center justify-center gap-3 text-center"
                        >
                            <div>
                                <p class="text-foreground font-semibold">
                                    Brak szkół jazdy
                                </p>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    Dodaj pierwszą OSK, aby skonfigurować panel.
                                </p>
                            </div>
                            <UiButton
                                type="button"
                                @click="emit('request-add')"
                            >
                                <Plus class="size-4" aria-hidden="true" />
                                Dodaj OSK
                            </UiButton>
                        </div>
                    </td>
                </tr>
                <tr
                    v-for="school in props.schools"
                    :key="school.id"
                    class="hover:bg-muted/30 transition"
                    :class="deletingId === school.id ? 'opacity-50' : ''"
                >
                    <td class="px-4 py-3 align-middle">
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                {{ school.name }}
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                {{ formatLocation(school) }}
                            </p>
                        </div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        {{ formatScope(school) }}
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <StatusBadge label="Aktywna" tone="success" subtle />
                    </td>
                    <td class="text-muted-foreground px-4 py-3 align-middle">
                        —
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex justify-end gap-2">
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                :disabled="isActionDisabled(school)"
                                @click="emit('request-edit', school)"
                            >
                                <Pencil class="size-4" aria-hidden="true" />
                                Edytuj
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                :disabled="props.deletingId !== null"
                                :aria-label="`Usuń szkołę ${school.name}`"
                                @click="emit('request-delete', school)"
                            >
                                <Loader2
                                    v-if="props.deletingId === school.id"
                                    class="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                                <Trash2
                                    v-else
                                    class="size-4"
                                    aria-hidden="true"
                                />
                            </UiButton>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <template #mobile>
            <div v-if="props.schools.length === 0" class="px-4 py-8">
                <div class="flex flex-col items-center gap-3 text-center">
                    <div>
                        <p class="text-foreground font-semibold">
                            Brak szkół jazdy
                        </p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Dodaj pierwszą OSK, aby skonfigurować panel.
                        </p>
                    </div>
                    <UiButton type="button" @click="emit('request-add')">
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj OSK
                    </UiButton>
                </div>
            </div>
            <ul v-else class="divide-border divide-y" role="list">
                <li
                    v-for="school in props.schools"
                    :key="school.id"
                    class="p-4"
                    :class="deletingId === school.id ? 'opacity-50' : ''"
                >
                    <article class="space-y-3">
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                {{ school.name }}
                            </p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                {{ formatLocation(school) }}
                            </p>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <StatusBadge
                                label="Aktywna"
                                tone="success"
                                subtle
                            />
                            <StatusBadge :label="formatScope(school)" subtle />
                        </div>

                        <div class="flex justify-end gap-2">
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                :disabled="isActionDisabled(school)"
                                @click="emit('request-edit', school)"
                            >
                                <Pencil class="size-4" aria-hidden="true" />
                                Edytuj
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                :disabled="props.deletingId !== null"
                                :aria-label="`Usuń szkołę ${school.name}`"
                                @click="emit('request-delete', school)"
                            >
                                <Loader2
                                    v-if="props.deletingId === school.id"
                                    class="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                                <Trash2
                                    v-else
                                    class="size-4"
                                    aria-hidden="true"
                                />
                            </UiButton>
                        </div>
                    </article>
                </li>
            </ul>
        </template>
    </DataTableShell>
</template>
