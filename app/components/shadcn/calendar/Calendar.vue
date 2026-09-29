<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps, DateValue } from 'reka-ui';
import type { HTMLAttributes, Ref } from 'vue';
import type { LayoutTypes } from '.';
import { getLocalTimeZone, today } from '@internationalized/date';
import { createReusableTemplate, reactiveOmit, useVModel } from '@vueuse/core';
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from 'reka-ui';
import { createYear, createYearRange, toDate } from 'reka-ui/date';
import { computed, toRaw } from 'vue';
import { cn } from '@/lib/utils';
import {
    CalendarCell,
    CalendarCellTrigger,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHead,
    CalendarGridRow,
    CalendarHeadCell,
    CalendarHeader,
    CalendarHeading,
    CalendarNextButton,
    CalendarPrevButton,
} from '.';

const props = withDefaults(
    defineProps<
        CalendarRootProps & {
            class?: HTMLAttributes['class'];
            layout?: LayoutTypes;
            yearRange?: DateValue[];
        }
    >(),
    {
        modelValue: undefined,
        class: undefined,
        layout: undefined,
        yearRange: undefined,
    },
);
const emits = defineEmits<CalendarRootEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'layout', 'placeholder');

const placeholder = useVModel(props, 'placeholder', emits, {
    passive: true,
    defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>;

const formatter = useDateFormatter(props.locale ?? 'en');

const yearRange = computed(() => {
    return (
        props.yearRange ??
        createYearRange({
            start:
                props?.minValue ??
                (
                    toRaw(props.placeholder) ??
                    props.defaultPlaceholder ??
                    today(getLocalTimeZone())
                ).cycle('year', -100),

            end:
                props?.maxValue ??
                (
                    toRaw(props.placeholder) ??
                    props.defaultPlaceholder ??
                    today(getLocalTimeZone())
                ).cycle('year', 10),
        })
    );
});

const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{
    date: DateValue;
}>();
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{
    date: DateValue;
}>();

const forwarded = useForwardPropsEmits(delegatedProps, emits);

function updateDisplayedMonth(value: unknown): void {
    const month = Number(value);

    if (!Number.isInteger(month) || month < 1 || month > 12) return;

    placeholder.value = placeholder.value.set({ month });
}

function updateDisplayedYear(value: unknown): void {
    const year = Number(value);

    if (!Number.isInteger(year)) return;

    placeholder.value = placeholder.value.set({ year });
}
</script>

<template>
    <DefineMonthTemplate #default="{ date }">
        <UiSelect
            :model-value="String(date.month)"
            :disabled="props.disabled"
            @update:model-value="updateDisplayedMonth"
        >
            <UiSelectTrigger
                size="sm"
                aria-label="Wybierz miesiąc"
                class="w-28 min-w-0 px-2"
            >
                <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent class="min-w-36">
                <UiSelectItem
                    v-for="month in createYear({ dateObj: date })"
                    :key="month.toString()"
                    :value="String(month.month)"
                >
                    {{ formatter.custom(toDate(month), { month: 'long' }) }}
                </UiSelectItem>
            </UiSelectContent>
        </UiSelect>
    </DefineMonthTemplate>

    <DefineYearTemplate #default="{ date }">
        <UiSelect
            :model-value="String(date.year)"
            :disabled="props.disabled"
            @update:model-value="updateDisplayedYear"
        >
            <UiSelectTrigger
                size="sm"
                aria-label="Wybierz rok"
                class="w-20 min-w-0 px-2"
            >
                <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent class="min-w-24">
                <UiSelectItem
                    v-for="year in yearRange"
                    :key="year.toString()"
                    :value="String(year.year)"
                >
                    {{ formatter.custom(toDate(year), { year: 'numeric' }) }}
                </UiSelectItem>
            </UiSelectContent>
        </UiSelect>
    </DefineYearTemplate>

    <CalendarRoot
        #default="{ grid, weekDays, date }"
        v-bind="forwarded"
        v-model:placeholder="placeholder"
        data-slot="calendar"
        :class="cn('p-3', props.class)"
    >
        <CalendarHeader class="pt-0">
            <nav
                class="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-1"
            >
                <CalendarPrevButton class="pointer-events-auto">
                    <slot name="calendar-prev-icon" />
                </CalendarPrevButton>
                <CalendarNextButton class="pointer-events-auto">
                    <slot name="calendar-next-icon" />
                </CalendarNextButton>
            </nav>

            <slot
                name="calendar-heading"
                :date="date"
                :month="ReuseMonthTemplate"
                :year="ReuseYearTemplate"
            >
                <template v-if="layout === 'month-and-year'">
                    <div class="flex items-center justify-center gap-1">
                        <ReuseMonthTemplate :date="date" />
                        <ReuseYearTemplate :date="date" />
                    </div>
                </template>
                <template v-else-if="layout === 'month-only'">
                    <div class="flex items-center justify-center gap-1">
                        <ReuseMonthTemplate :date="date" />
                        {{
                            formatter.custom(toDate(date), { year: 'numeric' })
                        }}
                    </div>
                </template>
                <template v-else-if="layout === 'year-only'">
                    <div class="flex items-center justify-center gap-1">
                        {{ formatter.custom(toDate(date), { month: 'short' }) }}
                        <ReuseYearTemplate :date="date" />
                    </div>
                </template>
                <template v-else>
                    <CalendarHeading />
                </template>
            </slot>
        </CalendarHeader>

        <div
            class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
        >
            <CalendarGrid v-for="month in grid" :key="month.value.toString()">
                <CalendarGridHead>
                    <CalendarGridRow>
                        <CalendarHeadCell v-for="day in weekDays" :key="day">
                            {{ day }}
                        </CalendarHeadCell>
                    </CalendarGridRow>
                </CalendarGridHead>
                <CalendarGridBody>
                    <CalendarGridRow
                        v-for="(weekDates, index) in month.rows"
                        :key="`weekDate-${index}`"
                        class="mt-2 w-full"
                    >
                        <CalendarCell
                            v-for="weekDate in weekDates"
                            :key="weekDate.toString()"
                            :date="weekDate"
                        >
                            <CalendarCellTrigger
                                :day="weekDate"
                                :month="month.value"
                            />
                        </CalendarCell>
                    </CalendarGridRow>
                </CalendarGridBody>
            </CalendarGrid>
        </div>
    </CalendarRoot>
</template>
