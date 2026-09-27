<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';
import EventsDaySchedulePanel from '~/components/events/EventsDaySchedulePanel.vue';
import {
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
} from '~/utils/date/weeklyCalendarDates';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager-or-instructor'],
});

usePageMeta({
    title: () => 'Wydarzenia',
    description: () =>
        'Dzienny widok wydarzeń instruktora - zajęcia grupowe i bloki czasu.',
});

const eventsDay = useEventsDayPage();
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="
                eventsDay.isManager.value
                    ? 'Wydarzenia dnia'
                    : 'Moje wydarzenia'
            "
            :description="eventsDay.pageDescription.value"
        >
            <template #actions>
                <UiPopover v-model:open="eventsDay.isCalendarOpen.value">
                    <UiPopoverTrigger as-child>
                        <UiButton
                            type="button"
                            variant="outline"
                            class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                            :disabled="eventsDay.isLoading.value"
                            aria-label="Wybierz dzień w kalendarzu"
                        >
                            <CalendarDays
                                class="mr-2 size-4"
                                aria-hidden="true"
                            />
                            {{ eventsDay.selectedDate.value }}
                        </UiButton>
                    </UiPopoverTrigger>
                    <UiPopoverContent class="w-auto p-0" align="end">
                        <UiCalendar
                            :week-starts-on="1"
                            :min-value="WEEK_PICKER_CALENDAR_MIN"
                            :max-value="WEEK_PICKER_CALENDAR_MAX"
                            :model-value="eventsDay.calendarSelected.value"
                            locale="pl-PL"
                            @update:model-value="eventsDay.handleCalendarUpdate"
                        />
                    </UiPopoverContent>
                </UiPopover>
            </template>
        </PageHeader>

        <EventsDaySchedulePanel
            v-model:view-mode="eventsDay.viewMode.value"
            :attention-events="eventsDay.attentionEvents.value"
            :effective-view-mode="eventsDay.effectiveViewMode.value"
            :error-message="eventsDay.errorMessage.value"
            :events="eventsDay.events.value"
            :filtered-events="eventsDay.filteredEvents.value"
            :is-compact-viewport="eventsDay.isCompactViewport.value"
            :is-instructors-loading="eventsDay.isInstructorsLoading.value"
            :is-loading="eventsDay.isLoading.value"
            :is-manager="eventsDay.isManager.value"
            :is-school-loading="eventsDay.isSchoolLoading.value"
            :school-id="eventsDay.schoolId.value"
            :selected-date="eventsDay.selectedDate.value"
            :selected-date-label="eventsDay.selectedDateLabel.value"
            :manager-schedule-columns="eventsDay.managerScheduleColumns.value"
            :manager-schedule-rows="eventsDay.managerScheduleRows.value"
            :selected-status="eventsDay.selectedStatus.value"
            :sorted-filtered-events="eventsDay.sortedFilteredEvents.value"
            :visible-events-label="eventsDay.visibleEventsLabel.value"
            @previous="eventsDay.handlePrevDay"
            @today="eventsDay.handleTodayClick"
            @next="eventsDay.handleNextDay"
            @retry="eventsDay.loadEvents"
            @select-status="eventsDay.handleStatusFilterOptionSelect"
            @status-changed="eventsDay.handleStatusChanged"
        />
    </div>
</template>
