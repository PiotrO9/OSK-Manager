<script setup lang="ts">
import { Mail, Pencil, Phone, Trash2 } from 'lucide-vue-next';
import type { InstructorDetail } from '~/types/instructors/instructor';

const props = defineProps<{
    instructor: InstructorDetail;
    isSubmitting: boolean;
    isDeleting: boolean;
}>();

const emit = defineEmits<{
    edit: [];
    delete: [];
}>();

const displayValue = displayManagerInstructorDetailsValue;
const courseTypeLabel = managerInstructorCourseTypeLabel;
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <UiCardTitle class="text-xl font-extrabold">
                Kontakt i kwalifikacje
            </UiCardTitle>
            <UiCardDescription>
                Dane profilu oraz kategorie uprawnien.
            </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-4 p-5">
            <div class="grid gap-3 sm:grid-cols-2">
                <div class="border-border rounded-2xl border p-4">
                    <Mail class="mb-3 size-4 text-sky-700" aria-hidden="true" />
                    <p class="text-muted-foreground text-xs">Email</p>
                    <p class="text-foreground mt-1 font-semibold break-all">
                        {{ displayValue(props.instructor.email) }}
                    </p>
                </div>

                <div class="border-border rounded-2xl border p-4">
                    <Phone
                        class="mb-3 size-4 text-sky-700"
                        aria-hidden="true"
                    />
                    <p class="text-muted-foreground text-xs">Telefon</p>
                    <p class="text-foreground mt-1 font-semibold">
                        {{ displayValue(props.instructor.phone) }}
                    </p>
                </div>
            </div>

            <div>
                <p class="text-muted-foreground text-xs">Opis kwalifikacji</p>
                <p class="text-foreground mt-1 text-sm font-medium">
                    {{ displayValue(props.instructor.qualifications) }}
                </p>
            </div>

            <div>
                <p class="text-muted-foreground text-xs">Kategorie uprawnien</p>
                <div
                    v-if="props.instructor.qualifiedCourseTypes.length > 0"
                    class="mt-2 flex flex-wrap gap-2"
                >
                    <StatusBadge
                        v-for="courseType in props.instructor
                            .qualifiedCourseTypes"
                        :key="courseType.id"
                        :label="courseTypeLabel(courseType)"
                        tone="info"
                        subtle
                    />
                </div>
                <p v-else class="text-muted-foreground mt-2 text-sm">
                    Brak przypisanych kategorii.
                </p>
            </div>

            <ActionGroup label="Akcje instruktora">
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="rounded-xl"
                    :disabled="props.isDeleting"
                    @click="emit('edit')"
                >
                    <Pencil class="mr-2 size-4" aria-hidden="true" />
                    Edytuj
                </UiButton>

                <UiButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    class="rounded-xl"
                    :disabled="props.isDeleting || props.isSubmitting"
                    :aria-busy="props.isDeleting"
                    @click="emit('delete')"
                >
                    <Trash2 class="mr-2 size-4" aria-hidden="true" />
                    Usun
                </UiButton>
            </ActionGroup>
        </UiCardContent>
    </UiCard>
</template>
