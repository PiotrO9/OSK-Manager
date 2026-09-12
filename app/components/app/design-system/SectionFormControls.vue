<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { Search } from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiDateRangePicker from '~/components/shadcn/date-range-picker/DateRangePicker.vue';
import UiDateTimePicker from '~/components/shadcn/date-time-picker/DateTimePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import UiWeekPicker from '~/components/shadcn/week-picker/WeekPicker.vue';
import {
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    getMonday,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';

const name = shallowRef('Anna Kowalska');
const email = shallowRef('anna.kowalska@example.com');
const phone = shallowRef('+48 500 100 200');
const amount = shallowRef('850,00');
const status = shallowRef('planned');
const notes = shallowRef('Parkowanie równoległe do przećwiczenia.');
const website = shallowRef('https://osk-manager.pl');
const password = shallowRef('Tymczasowe-2026');
const hoursLimit = shallowRef(30);
const birthDate = shallowRef('2001-04-18');
const examDate = shallowRef('2026-09-18');
const optionalExamDate = shallowRef('');
const boundedDate = shallowRef('2026-09-12');
const lessonDateRange = shallowRef({
    start: '2026-09-12',
    end: '2026-09-14',
});
const optionalDateRange = shallowRef({
    start: '',
    end: '',
});
const startTime = shallowRef('08:00');
const lessonTime = shallowRef('09:30');
const instructorStartTime = shallowRef('08:00');
const instructorEndTime = shallowRef('16:00');
const disabledTime = shallowRef('12:00');
const lessonStart = shallowRef('2026-09-10T08:00');
const optionalLessonStart = shallowRef('');
const boundedLessonStart = shallowRef('2026-09-12T10:30');
const demoWeekStart = shallowRef(getMonday(new Date(2026, 8, 7)));
const demoWeekOpen = shallowRef(false);
const notificationChannel = shallowRef('sms');
const sms = shallowRef(true);
const urgent = shallowRef(false);

const demoWeekSelected = computed(() =>
    weekCalendarDatesFromMonday(demoWeekStart.value),
);

const demoWeekRangeLabel = computed(() => {
    const range = weekRangeFromMonday(demoWeekStart.value);
    const from = new Date(`${range.dateFrom}T00:00:00`);
    const to = new Date(`${range.dateTo}T00:00:00`);
    const sameMonth = from.getMonth() === to.getMonth();
    const month = new Intl.DateTimeFormat('pl-PL', { month: 'long' }).format(
        to,
    );
    const startDay = from.getDate();
    const endDay = to.getDate();

    if (sameMonth) {
        return `${startDay}-${endDay} ${month}`;
    }

    const startMonth = new Intl.DateTimeFormat('pl-PL', {
        month: 'short',
    }).format(from);

    return `${startDay} ${startMonth} - ${endDay} ${month}`;
});

function handleDemoWeekUpdate(
    value: DateValue | DateValue[] | undefined,
): void {
    if (value === undefined) {
        return;
    }

    const values = Array.isArray(value) ? value : [value];

    if (values.length === 0) {
        return;
    }

    let anchor = values[0]!;

    for (const item of values) {
        if (toDate(item).getTime() > toDate(anchor).getTime()) {
            anchor = item;
        }
    }

    demoWeekStart.value = getMonday(toDate(anchor));
    demoWeekOpen.value = false;
}
</script>

<template>
    <section class="space-y-5" aria-label="Kontrolki formularza">
        <FormSection
            title="Dane kursanta"
            description="Etykieta pozostaje widoczna niezależnie od wartości i placeholdera."
        >
            <div class="grid min-w-0 gap-4 md:grid-cols-2">
                <div class="space-y-1.5">
                    <UiLabel for="ds-name">Imię i nazwisko</UiLabel
                    ><UiInput id="ds-name" v-model="name" />
                    <p class="text-muted-foreground text-xs">
                        Nazwa wyświetlana w grafiku.
                    </p>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-email">Adres e-mail</UiLabel
                    ><UiInput id="ds-email" v-model="email" type="email" />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-phone">Telefon</UiLabel
                    ><UiInput id="ds-phone" v-model="phone" type="tel" />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-url">Strona OSK</UiLabel
                    ><UiInput id="ds-url" v-model="website" type="url" />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-password">Hasło tymczasowe</UiLabel
                    ><UiInput
                        id="ds-password"
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                    />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-amount">Kwota raty</UiLabel>
                    <div class="relative">
                        <UiInput
                            id="ds-amount"
                            v-model="amount"
                            inputmode="decimal"
                            class="pr-12 tabular-nums"
                        /><span
                            class="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                            >PLN</span
                        >
                    </div>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-hours-limit">Limit godzin</UiLabel>
                    <UiInput
                        id="ds-hours-limit"
                        v-model="hoursLimit"
                        type="number"
                        min="0"
                        max="80"
                        step="1"
                        class="tabular-nums"
                    />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-search">Wyszukiwanie</UiLabel>
                    <div class="relative">
                        <Search
                            class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        /><UiInput
                            id="ds-search"
                            class="pl-9"
                            placeholder="Nazwisko, telefon lub PKK"
                        />
                    </div>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-status">Status lekcji</UiLabel
                    ><UiSelect v-model="status"
                        ><UiSelectTrigger id="ds-status" class="w-full"
                            ><UiSelectValue /></UiSelectTrigger
                        ><UiSelectContent
                            ><UiSelectItem value="planned"
                                >Zaplanowana</UiSelectItem
                            ><UiSelectItem value="done"
                                >Zrealizowana</UiSelectItem
                            ><UiSelectItem value="cancelled"
                                >Anulowana</UiSelectItem
                            ></UiSelectContent
                        ></UiSelect
                    >
                </div>
                <div class="space-y-1.5 md:col-span-2">
                    <UiLabel for="ds-notes">Notatka instruktora</UiLabel
                    ><UiTextarea id="ds-notes" v-model="notes" rows="3" />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-birth-date">Data urodzenia</UiLabel>
                    <UiInput
                        id="ds-birth-date"
                        v-model="birthDate"
                        type="date"
                    />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-start-time">Godzina jazdy</UiLabel>
                    <UiInput
                        id="ds-start-time"
                        v-model="startTime"
                        type="time"
                    />
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-exam-date">Badanie lekarskie</UiLabel>
                    <UiDatePicker
                        id="ds-exam-date"
                        v-model="examDate"
                        trigger-class="max-w-none"
                    />
                    <p class="text-muted-foreground text-xs">
                        Picker aplikacyjny dla pól daty.
                    </p>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-lesson-start">Termin jazdy</UiLabel>
                    <UiDateTimePicker
                        id="ds-lesson-start"
                        v-model="lessonStart"
                        :minute-options="[0, 15, 30, 45]"
                        trigger-class="max-w-none"
                    />
                    <p class="text-muted-foreground text-xs">
                        Picker daty i godziny dla harmonogramu.
                    </p>
                </div>
                <div class="space-y-4 rounded-lg border p-3 md:col-span-2">
                    <div>
                        <p class="text-foreground text-sm font-semibold">
                            Pickery daty i czasu
                        </p>
                        <p class="text-muted-foreground mt-1 text-xs">
                            Warianty kontrolek używanych w grafiku, dostępności
                            i rezerwacjach.
                        </p>
                    </div>
                    <div class="grid gap-4 lg:grid-cols-3">
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-date-basic">Data</UiLabel>
                            <UiDatePicker
                                id="ds-picker-date-basic"
                                v-model="examDate"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Podstawowy wybór pojedynczej daty.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-date-clearable">
                                Data opcjonalna
                            </UiLabel>
                            <UiDatePicker
                                id="ds-picker-date-clearable"
                                v-model="optionalExamDate"
                                clearable
                                placeholder="Brak ustawionej daty"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Wariant pusty z możliwością czyszczenia.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-date-bounded">
                                Data z zakresem
                            </UiLabel>
                            <UiDatePicker
                                id="ds-picker-date-bounded"
                                v-model="boundedDate"
                                min="2026-09-07"
                                max="2026-09-30"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Ograniczenie do dozwolonego okresu.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-time-basic">
                                Godzina
                            </UiLabel>
                            <UiTimePicker
                                id="ds-picker-time-basic"
                                v-model="lessonTime"
                                label="Godzina jazdy"
                                context-label="Jazda praktyczna"
                            />
                            <p class="text-muted-foreground text-xs">
                                Nowy zegar analogowy z presetami minut.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-time-start">
                                Początek pracy
                            </UiLabel>
                            <UiTimePicker
                                id="ds-picker-time-start"
                                v-model="instructorStartTime"
                                label="Początek pracy"
                                context-label="Środa"
                                :max-exclusive="instructorEndTime"
                            />
                            <p class="text-muted-foreground text-xs">
                                Nie pozwala wejść poza koniec pracy.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-time-end">
                                Koniec pracy
                            </UiLabel>
                            <UiTimePicker
                                id="ds-picker-time-end"
                                v-model="instructorEndTime"
                                label="Koniec pracy"
                                context-label="Środa"
                                :min-exclusive="instructorStartTime"
                            />
                            <p class="text-muted-foreground text-xs">
                                Zabezpiecza kolejność godzin.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-time-disabled">
                                Godzina zablokowana
                            </UiLabel>
                            <UiTimePicker
                                id="ds-picker-time-disabled"
                                v-model="disabledTime"
                                label="Przerwa techniczna"
                                context-label="Niedostępne"
                                disabled
                            />
                            <p class="text-muted-foreground text-xs">
                                Stan niedostępny dla zamkniętych danych.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel>Zakres tygodnia</UiLabel>
                            <UiWeekPicker
                                v-model:open="demoWeekOpen"
                                :model-value="demoWeekSelected"
                                :week-range-label="demoWeekRangeLabel"
                                :min-value="WEEK_PICKER_CALENDAR_MIN"
                                :max-value="WEEK_PICKER_CALENDAR_MAX"
                                trigger-class="w-full max-w-none"
                                @calendar-update="handleDemoWeekUpdate"
                            />
                            <p class="text-muted-foreground text-xs">
                                Picker tygodnia używany przy kalendarzach.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-date-range">
                                Zakres dat
                            </UiLabel>
                            <UiDateRangePicker
                                id="ds-picker-date-range"
                                v-model="lessonDateRange"
                                clearable
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Dowolny zakres, np. trzy wybrane dni.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-date-range-empty">
                                Zakres dat opcjonalny
                            </UiLabel>
                            <UiDateRangePicker
                                id="ds-picker-date-range-empty"
                                v-model="optionalDateRange"
                                clearable
                                placeholder="Brak zakresu"
                                min="2026-09-07"
                                max="2026-09-30"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Pusty stan z ograniczeniem min/max.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-datetime-basic">
                                Data i godzina
                            </UiLabel>
                            <UiDateTimePicker
                                id="ds-picker-datetime-basic"
                                v-model="lessonStart"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Obecny picker łączony dla terminu jazdy.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-datetime-clearable">
                                Data i godzina opcjonalna
                            </UiLabel>
                            <UiDateTimePicker
                                id="ds-picker-datetime-clearable"
                                v-model="optionalLessonStart"
                                clearable
                                placeholder="Nie ustawiono terminu"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Pusty stan oraz ręczne czyszczenie.
                            </p>
                        </div>
                        <div class="space-y-1.5">
                            <UiLabel for="ds-picker-datetime-bounded">
                                Data i godzina z zakresem
                            </UiLabel>
                            <UiDateTimePicker
                                id="ds-picker-datetime-bounded"
                                v-model="boundedLessonStart"
                                min-date="2026-09-07"
                                max-date="2026-09-30"
                                trigger-class="max-w-none"
                            />
                            <p class="text-muted-foreground text-xs">
                                Ograniczony zakres dni.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="space-y-1.5 md:col-span-2">
                    <UiLabel for="ds-file">Dokument kursanta</UiLabel>
                    <UiInput
                        id="ds-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        class="cursor-pointer"
                    />
                    <p class="text-muted-foreground text-xs">
                        Upload skanu PKK, badań albo zgody opiekuna.
                    </p>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-invalid">Numer PKK</UiLabel
                    ><UiInput
                        id="ds-invalid"
                        model-value="123"
                        aria-invalid="true"
                        aria-describedby="ds-invalid-error"
                    />
                    <p
                        id="ds-invalid-error"
                        class="text-destructive text-xs"
                        role="alert"
                    >
                        Numer PKK musi zawierać 20 cyfr.
                    </p>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-readonly">Identyfikator kursanta</UiLabel
                    ><UiInput
                        id="ds-readonly"
                        model-value="KUR-2026-0184"
                        readonly
                    />
                    <p class="text-muted-foreground text-xs">
                        Pole tylko do odczytu pozostaje czytelne.
                    </p>
                </div>
                <div class="space-y-1.5">
                    <UiLabel for="ds-disabled">Zablokowane pole</UiLabel>
                    <UiInput
                        id="ds-disabled"
                        model-value="Wartość niedostępna"
                        class="cursor-not-allowed"
                        disabled
                    />
                    <p class="text-muted-foreground text-xs">
                        Stan dla braku uprawnień lub zamkniętego okresu.
                    </p>
                </div>
                <div class="space-y-2">
                    <UiLabel>Preferowany kontakt</UiLabel>
                    <UiRadioGroup v-model="notificationChannel" class="gap-2">
                        <label class="flex items-center gap-2 text-sm">
                            <UiRadioGroupItem value="sms" />
                            SMS
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <UiRadioGroupItem value="email" />
                            E-mail
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <UiRadioGroupItem value="phone" />
                            Telefon
                        </label>
                    </UiRadioGroup>
                </div>
                <div class="space-y-2 md:col-span-2">
                    <UiLabel>Zgody i ustawienia</UiLabel>
                    <div class="flex flex-wrap gap-4">
                        <label class="flex items-center gap-2 text-sm">
                            <UiCheckbox v-model="sms" />
                            Potwierdź SMS-em
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <UiSwitch v-model="urgent" />
                            Tryb pilny
                        </label>
                    </div>
                </div>
            </div>
            <template #footer
                ><div class="flex flex-wrap items-center justify-end gap-3">
                    <ActionGroup label="Akcje formularza" align="end"
                        ><UiButton variant="outline">Anuluj</UiButton
                        ><UiButton>Zapisz kursanta</UiButton></ActionGroup
                    >
                </div></template
            >
        </FormSection>
    </section>
</template>
