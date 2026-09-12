# Pickery daty i czasu

Ten dokument jest źródłem prawdy dla pól wyboru daty, czasu, zakresu dat i terminu w OSK Managerze.

## Zasada główna

W nowych i przebudowywanych widokach używaj wyłącznie kanonicznych komponentów:

- `UiDatePicker` — pojedyncza data w formacie `YYYY-MM-DD`.
- `UiTimePicker` — pojedyncza godzina w formacie `HH:mm`.
- `UiDateTimePicker` — jeden termin logiczny `YYYY-MM-DDTHH:mm`, pokazany jako dwa spójne pola: data i godzina.
- `UiDateRangePicker` — dowolny zakres dat `{ start, end }`, np. 3 wybrane dni albo cały miesiąc.
- `UiWeekPicker` — sztywny tydzień używany w kalendarzach tygodniowych.

Nie dodawaj nowych komponentów z dopiskiem `V2`. Nowe pickery są główną wersją. Nie wracaj do natywnych `input[type="date"]`, `input[type="time"]` ani do starych prostych pickerów, jeżeli przypadek da się pokryć komponentami powyżej.

## Gdzie są komponenty

| Komponent | Plik | Model |
| --- | --- | --- |
| `UiDatePicker` | [`DatePicker.vue`](../app/components/shadcn/date-picker/DatePicker.vue) | `string`, `YYYY-MM-DD` albo pusty string |
| `UiTimePicker` | [`TimePicker.vue`](../app/components/shadcn/time-picker/TimePicker.vue) | `string`, `HH:mm` |
| `UiDateTimePicker` | [`DateTimePicker.vue`](../app/components/shadcn/date-time-picker/DateTimePicker.vue) | `string`, `YYYY-MM-DDTHH:mm` albo pusty string |
| `UiDateRangePicker` | [`DateRangePicker.vue`](../app/components/shadcn/date-range-picker/DateRangePicker.vue) | `{ start: string; end: string }` |
| `UiWeekPicker` | [`WeekPicker.vue`](../app/components/shadcn/week-picker/WeekPicker.vue) | `DateValue[]` + event `calendarUpdate` |

Przykłady wizualne są w `/design-system`, sekcja `Formularze`.

## Importy

W komponentach produktu preferuj jawne importy. Ułatwia to audyt migracji i zmniejsza ryzyko pomylenia wariantów.

```vue
<script setup lang="ts">
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiDateRangePicker from '~/components/shadcn/date-range-picker/DateRangePicker.vue';
import UiDateTimePicker from '~/components/shadcn/date-time-picker/DateTimePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import UiWeekPicker from '~/components/shadcn/week-picker/WeekPicker.vue';
</script>
```

## Dobór komponentu

| Przypadek | Użyj | Uwagi |
| --- | --- | --- |
| Data badania, data przeglądu, data urodzenia | `UiDatePicker` | Jeden dzień. Picker wygląda jak zakresowy kalendarz, ale pozwala wybrać tylko jedną datę. |
| Godzina pracy, początek/koniec dostępności | `UiTimePicker` | Używaj `minExclusive` i `maxExclusive`, gdy kolejność godzin ma znaczenie. |
| Termin jazdy lub wydarzenia jako jedna wartość | `UiDateTimePicker` | UI działa jak dwa pola. Kliknięcie daty otwiera kalendarz, kliknięcie godziny otwiera zegar. Po wyborze daty automatycznie otwiera się picker godziny. |
| Termin przechowywany jako osobna data i osobna godzina | `UiDatePicker` + `UiTimePicker` | Lepsze niż `UiDateTimePicker`, jeśli model domenowy ma osobne pola. |
| Dowolny zakres dat | `UiDateRangePicker` | Ręczny wybór końca zakresu zamyka popup. Presety zaznaczają zakres i zostawiają popup otwarty. |
| Tydzień w kalendarzu | `UiWeekPicker` | Tylko dla pełnego tygodnia. Do customowego zakresu użyj `UiDateRangePicker`. |

## Przykłady użycia

Pojedyncza data:

```vue
<UiDatePicker
    id="vehicle-inspection-date"
    v-model="inspectionDate"
    :min="todayDate"
    clearable
    placeholder="Wybierz datę"
/>
```

Godzina z zabezpieczeniem kolejności:

```vue
<UiTimePicker
    id="availability-start"
    v-model="startTime"
    label="Początek pracy"
    :max-exclusive="endTime"
/>

<UiTimePicker
    id="availability-end"
    v-model="endTime"
    label="Koniec pracy"
    :min-exclusive="startTime"
/>
```

Data i godzina jako jeden termin:

```vue
<UiDateTimePicker
    id="lesson-start"
    v-model="lessonStart"
    :min-date="minLessonDate"
    :max-date="maxLessonDate"
    :minute-options="[0, 15, 30, 45]"
/>
```

Dowolny zakres dat:

```vue
<script setup lang="ts">
import type { UiDateRangePickerValue } from '~/components/shadcn/date-range-picker';

const dateRange = ref<UiDateRangePickerValue>({
    start: '2026-09-10',
    end: '2026-09-17',
});
</script>

<template>
    <UiDateRangePicker
        id="report-range"
        v-model="dateRange"
        clearable
        placeholder="Wybierz zakres"
    />
</template>
```

## Zachowania, których pilnujemy

- `UiDatePicker` zamyka popup po wyborze dnia.
- `UiDateTimePicker` pokazuje datę i godzinę jako dwa pola tej samej kontrolki; po wyborze daty zamyka kalendarz i otwiera zegar.
- `UiDateRangePicker` zamyka popup po ręcznym wybraniu końca zakresu.
- Presety w `UiDateRangePicker`, np. `3 dni` i `Ten miesiąc`, nie zamykają popupu; użytkownik może od razu poprawić zakres.
- `UiTimePicker` powinien blokować niedozwolone wartości przez `minExclusive`, `maxExclusive`, `hourOptions` i `minuteOptions`, zamiast czekać wyłącznie na walidację formularza.
- Pola opcjonalne dostają `clearable` i sensowny `placeholder`.

## Dostępność i walidacja

- Przekazuj `id` zgodny z `UiLabel for`.
- Przy błędach przekazuj `ariaInvalid` / `ariaDescribedby` w pickerach daty i `invalid` / `describedby` w `UiTimePicker`.
- Walidację domenową trzymaj przy formularzu lub composable. Picker ma blokować oczywiste przypadki UI, ale nie zastępuje reguł API.
- Dla zakresów pilnuj w modelu obu pól: pusty zakres to zwykle `{ start: '', end: '' }`, a nie `null`.

## Migracja starego użycia

1. Ustal typ wartości: sama data, sama godzina, data+godzina, zakres dat czy tydzień.
2. Dobierz komponent z tabeli powyżej.
3. Przenieś ograniczenia `min`, `max`, kolejność godzin i opcjonalność na propsy nowego pickera.
4. Zachowaj format danych oczekiwany przez API albo composable.
5. Dodaj przykład do `/design-system`, jeśli pojawia się nowy wariant użycia.

Po migracji w kodzie nie powinny zostawać nazwy `DatePickerV2`, `DateTimePickerV2`, `date-picker-v2` ani `date-time-picker-v2`.
