<script setup lang="ts">
import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import { formatCourseKindLabel } from '~/types/courses/course';
import type { CourseKind } from '~/types/courses/course';
import { courseCreateFormMessages } from '~/utils/courses/courseCreateFormMessages';

const props = defineProps<{
    offeredCourseTypes: OfferedCourseType[];
    hasOfferedCategoryList: boolean;
    kindOptions: readonly CourseKind[];
    isDisabled: boolean;
    showNameRequired: boolean;
    showCategoryRequired: boolean;
    showKindRequired: boolean;
    showTotalHoursInvalid: boolean;
}>();

const nameModel = defineModel<string>('name', { required: true });
const categoryModel = defineModel<string>('category', { required: true });
const kindModel = defineModel<CourseKind>('kind', { required: true });
const totalHoursModel = defineModel<string>('totalHours', { required: true });

const formMessages = courseCreateFormMessages;
</script>

<template>
    <div class="space-y-2">
        <UiLabel for="course-create-name">Nazwa kursu</UiLabel>
        <UiInput
            id="course-create-name"
            v-model="nameModel"
            type="text"
            name="name"
            autocomplete="off"
            required
            :aria-invalid="props.showNameRequired"
            :aria-describedby="
                props.showNameRequired ? 'course-create-name-error' : undefined
            "
            :disabled="props.isDisabled"
            class="bg-background h-10 rounded-xl"
        />
        <p
            v-if="props.showNameRequired"
            id="course-create-name-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ formMessages.nameRequired }}
        </p>
    </div>

    <div class="space-y-2">
        <UiLabel for="course-create-category">{{
            props.hasOfferedCategoryList
                ? 'Kategoria (oferta OSK)'
                : 'Kategoria (kod, np. B)'
        }}</UiLabel>
        <UiSelect
            v-if="props.hasOfferedCategoryList"
            v-model="categoryModel"
            :disabled="props.isDisabled"
        >
            <UiSelectTrigger
                id="course-create-category"
                class="bg-background h-10 w-full rounded-xl"
                :aria-invalid="props.showCategoryRequired"
                :aria-describedby="
                    props.showCategoryRequired
                        ? 'course-create-category-error'
                        : undefined
                "
            >
                <UiSelectValue placeholder="Wybierz kategorię" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="t in props.offeredCourseTypes"
                        :key="t.id"
                        :value="t.code"
                    >
                        {{ t.code
                        }}{{
                            t.name && t.name !== t.code ? ` — ${t.name}` : ''
                        }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <UiInput
            v-else
            id="course-create-category"
            v-model="categoryModel"
            type="text"
            name="category"
            autocomplete="off"
            placeholder="Np. B, CE"
            :disabled="props.isDisabled"
            :aria-invalid="props.showCategoryRequired"
            :aria-describedby="
                props.showCategoryRequired
                    ? 'course-create-category-error'
                    : undefined
            "
            class="bg-background h-10 rounded-xl"
        />
        <p
            v-if="props.showCategoryRequired"
            id="course-create-category-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{
                props.hasOfferedCategoryList
                    ? formMessages.categoryRequiredFromOffer
                    : formMessages.categoryRequiredManual
            }}
        </p>
    </div>

    <div class="space-y-2">
        <UiLabel for="course-create-kind">Rodzaj kursu</UiLabel>
        <UiSelect v-model="kindModel" :disabled="props.isDisabled">
            <UiSelectTrigger
                id="course-create-kind"
                class="bg-background h-10 w-full rounded-xl"
                :aria-invalid="props.showKindRequired"
                :aria-describedby="
                    props.showKindRequired
                        ? 'course-create-kind-error'
                        : undefined
                "
            >
                <UiSelectValue placeholder="Rodzaj kursu" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="k in props.kindOptions"
                        :key="k"
                        :value="k"
                    >
                        {{ formatCourseKindLabel(k) }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="props.showKindRequired"
            id="course-create-kind-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ formMessages.kindRequired }}
        </p>
    </div>

    <div class="space-y-2">
        <UiLabel for="course-create-hours">Łączna liczba godzin</UiLabel>
        <UiInput
            id="course-create-hours"
            v-model="totalHoursModel"
            type="number"
            name="totalHours"
            inputmode="numeric"
            min="1"
            step="1"
            autocomplete="off"
            :aria-invalid="props.showTotalHoursInvalid"
            :aria-describedby="
                props.showTotalHoursInvalid
                    ? 'course-create-hours-error'
                    : undefined
            "
            :disabled="props.isDisabled"
            class="bg-background h-10 rounded-xl"
        />
        <p
            v-if="props.showTotalHoursInvalid"
            id="course-create-hours-error"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ formMessages.totalHoursInvalid }}
        </p>
    </div>
</template>
