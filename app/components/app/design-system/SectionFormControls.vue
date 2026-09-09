<script setup lang="ts">
import { Search } from 'lucide-vue-next';

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
const startTime = shallowRef('08:00');
const lessonStart = shallowRef('2026-09-10T08:00');
const notificationChannel = shallowRef('sms');
const sms = shallowRef(true);
const urgent = shallowRef(false);
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
