<script setup lang="ts">
import { COURSE_KINDS, type CourseKind } from '~~/shared/contracts/courses';
import { formatCourseKindLabel } from '~/types/courses/courseFormatting';
import type { CourseTypeOption } from '~/types/courses/courseType';
import { courseTypeVehicleIcon } from '~/utils/courses/courseTypeVehicleIcon';

const props = defineProps<{
    enabledCourseKinds: CourseKind[];
    offeredCourseTypeIds: string[];
    courseTypes: CourseTypeOption[];
    isCourseTypesLoading: boolean;
    courseTypesLoadError: string | null;
    isSaving: boolean;
}>();

const emit = defineEmits<{
    'update:enabledCourseKinds': [value: CourseKind[]];
    'update:offeredCourseTypeIds': [value: string[]];
    retryCourseTypes: [];
}>();

function handleCourseKindChange(
    kind: CourseKind,
    checked: boolean | 'indeterminate',
) {
    const selected = new Set(props.enabledCourseKinds);

    if (checked === true) selected.add(kind);
    else selected.delete(kind);

    emit(
        'update:enabledCourseKinds',
        COURSE_KINDS.filter((item) => selected.has(item)),
    );
}

function handleCourseTypeChange(
    id: string,
    checked: boolean | 'indeterminate',
) {
    const selected = new Set(props.offeredCourseTypeIds);

    if (checked === true) selected.add(id);
    else selected.delete(id);

    const catalogIds = new Set(props.courseTypes.map((item) => item.id));

    emit('update:offeredCourseTypeIds', [
        ...props.offeredCourseTypeIds.filter(
            (itemId) => !catalogIds.has(itemId),
        ),
        ...props.courseTypes
            .map((item) => item.id)
            .filter((itemId) => selected.has(itemId)),
    ]);
}
</script>

<template>
    <div class="space-y-4">
        <fieldset class="border-border space-y-2 rounded-xl border p-3">
            <legend class="px-1 text-sm font-medium">
                Włączone rodzaje kursów
            </legend>
            <label
                v-for="kind in COURSE_KINDS"
                :key="kind"
                class="flex items-center gap-2 text-sm"
            >
                <UiCheckbox
                    :model-value="enabledCourseKinds.includes(kind)"
                    :disabled="isSaving"
                    @update:model-value="handleCourseKindChange(kind, $event)"
                />
                {{ formatCourseKindLabel(kind) }}
            </label>
        </fieldset>

        <fieldset class="border-border space-y-2 rounded-xl border p-3">
            <legend class="px-1 text-sm font-medium">
                Oferowane kategorie
            </legend>
            <p
                v-if="isCourseTypesLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie kategorii…
            </p>
            <div
                v-else-if="courseTypesLoadError"
                class="space-y-2"
                role="alert"
            >
                <p class="text-destructive text-sm">
                    {{ courseTypesLoadError }}
                </p>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="emit('retryCourseTypes')"
                >
                    Spróbuj ponownie
                </UiButton>
            </div>
            <p
                v-else-if="courseTypes.length === 0"
                class="text-muted-foreground text-sm"
            >
                Katalog kategorii jest pusty.
            </p>
            <div v-else class="grid gap-2 sm:grid-cols-2">
                <label
                    v-for="type in courseTypes"
                    :key="type.id"
                    class="border-border hover:bg-muted/50 flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors"
                    :class="
                        offeredCourseTypeIds.includes(type.id)
                            ? 'border-primary/35 bg-primary/5'
                            : ''
                    "
                >
                    <UiCheckbox
                        :model-value="offeredCourseTypeIds.includes(type.id)"
                        :disabled="isSaving"
                        @update:model-value="
                            handleCourseTypeChange(type.id, $event)
                        "
                    />
                    <span
                        class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md"
                        :class="
                            offeredCourseTypeIds.includes(type.id)
                                ? 'bg-primary/10 text-primary'
                                : ''
                        "
                        aria-hidden="true"
                    >
                        <component
                            :is="courseTypeVehicleIcon(type.code)"
                            class="size-4"
                        />
                    </span>
                    <span class="min-w-0 font-medium">
                        {{ type.name.trim() || `Kategoria ${type.code}` }}
                    </span>
                </label>
            </div>
        </fieldset>
    </div>
</template>
