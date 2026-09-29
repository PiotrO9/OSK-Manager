<script setup lang="ts">
import { Building2, Loader2, Pencil, Star, Trash2 } from 'lucide-vue-next';
import AppCourseTypeBadges from '~/components/app/AppCourseTypeBadges.vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

interface Props {
    schools: DrivingSchool[];
    deletingId: string | null;
    settingDefaultId: string | null;
    isFormSaving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    requestEdit: [school: DrivingSchool];
    requestDelete: [school: DrivingSchool];
    setDefault: [school: DrivingSchool];
}>();

function formatLocation(school: DrivingSchool): string {
    const parts = [school.city, school.address]
        .map((part) => part?.trim())
        .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(' · ') : 'Adres nieuzupełniony';
}

function isActionDisabled(): boolean {
    return (
        props.deletingId !== null ||
        props.settingDefaultId !== null ||
        props.isFormSaving
    );
}
</script>

<template>
    <div class="@container">
        <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-3xl text-sm">
                <thead class="bg-muted/25 text-muted-foreground">
                    <tr class="border-border border-b">
                        <th
                            scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold"
                        >
                            Szkoła
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold"
                        >
                            Kategorie
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold"
                        >
                            Kontekst
                        </th>
                        <th
                            scope="col"
                            class="px-5 py-3 text-right text-xs font-semibold"
                        >
                            Akcje
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="school in props.schools"
                        :key="school.id"
                        class="hover:bg-muted/25 transition-colors"
                        :class="
                            props.deletingId === school.id ? 'opacity-50' : ''
                        "
                    >
                        <td class="px-5 py-3.5 align-middle">
                            <div class="flex min-w-0 items-center gap-3">
                                <span
                                    class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                                    aria-hidden="true"
                                >
                                    <Building2 class="size-4" />
                                </span>
                                <div class="min-w-0">
                                    <p
                                        class="text-foreground font-semibold wrap-anywhere"
                                    >
                                        {{ school.name }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-0.5 text-xs wrap-anywhere"
                                    >
                                        {{ formatLocation(school) }}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3.5 align-middle">
                            <AppCourseTypeBadges
                                :course-types="school.offeredCourseTypes ?? []"
                                :group-label="`Kategorie oferowane przez ${school.name}`"
                                empty-label="Nie skonfigurowano"
                            />
                        </td>
                        <td class="px-4 py-3.5 align-middle">
                            <StatusBadge
                                v-if="school.isDefault === true"
                                label="Domyślna"
                                tone="info"
                                subtle
                            />
                            <span v-else class="text-muted-foreground text-xs">
                                Dodatkowa
                            </span>
                        </td>
                        <td class="px-5 py-3.5 align-middle">
                            <div class="flex justify-end gap-1.5">
                                <UiButton
                                    v-if="school.isDefault !== true"
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    :disabled="isActionDisabled()"
                                    @click="emit('setDefault', school)"
                                >
                                    <Loader2
                                        v-if="
                                            props.settingDefaultId === school.id
                                        "
                                        class="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                    <Star
                                        v-else
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                    Ustaw domyślną
                                </UiButton>
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    :disabled="isActionDisabled()"
                                    @click="emit('requestEdit', school)"
                                >
                                    <Pencil class="size-4" aria-hidden="true" />
                                    Edytuj
                                </UiButton>
                                <UiButton
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    :disabled="isActionDisabled()"
                                    :aria-label="`Usuń szkołę ${school.name}`"
                                    @click="emit('requestDelete', school)"
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
        </div>

        <ul class="divide-border divide-y md:hidden" role="list">
            <li
                v-for="school in props.schools"
                :key="school.id"
                class="p-4"
                :class="props.deletingId === school.id ? 'opacity-50' : ''"
            >
                <article class="space-y-4">
                    <div class="flex min-w-0 items-start gap-3">
                        <span
                            class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                            aria-hidden="true"
                        >
                            <Building2 class="size-4" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <div
                                class="flex min-w-0 flex-wrap items-start justify-between gap-2"
                            >
                                <p
                                    class="text-foreground min-w-0 font-semibold wrap-anywhere"
                                >
                                    {{ school.name }}
                                </p>
                                <StatusBadge
                                    v-if="school.isDefault === true"
                                    label="Domyślna"
                                    tone="info"
                                    subtle
                                />
                            </div>
                            <p
                                class="text-muted-foreground mt-1 text-sm wrap-anywhere"
                            >
                                {{ formatLocation(school) }}
                            </p>
                            <div class="mt-3 space-y-1.5">
                                <p class="text-muted-foreground text-xs">
                                    Kategorie
                                </p>
                                <AppCourseTypeBadges
                                    :course-types="
                                        school.offeredCourseTypes ?? []
                                    "
                                    :group-label="`Kategorie oferowane przez ${school.name}`"
                                    empty-label="Nie skonfigurowano"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-end gap-2">
                        <UiButton
                            v-if="school.isDefault !== true"
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="h-11"
                            :disabled="isActionDisabled()"
                            @click="emit('setDefault', school)"
                        >
                            <Loader2
                                v-if="props.settingDefaultId === school.id"
                                class="size-4 animate-spin"
                                aria-hidden="true"
                            />
                            <Star v-else class="size-4" aria-hidden="true" />
                            Ustaw domyślną
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="h-11"
                            :disabled="isActionDisabled()"
                            @click="emit('requestEdit', school)"
                        >
                            <Pencil class="size-4" aria-hidden="true" />
                            Edytuj
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="size-11"
                            :disabled="isActionDisabled()"
                            :aria-label="`Usuń szkołę ${school.name}`"
                            @click="emit('requestDelete', school)"
                        >
                            <Loader2
                                v-if="props.deletingId === school.id"
                                class="size-4 animate-spin"
                                aria-hidden="true"
                            />
                            <Trash2 v-else class="size-4" aria-hidden="true" />
                        </UiButton>
                    </div>
                </article>
            </li>
        </ul>
    </div>
</template>
