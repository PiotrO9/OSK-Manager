# Design system — zakres T01 i utrzymanie

Data aktualizacji: 2026-10-06. Status: T01 zaakceptowane i ukończone; odbiór i wyniki weryfikacji w UI_REFRESH_PLAN.md. Niniejszy zakres zastępuje wcześniejszy plan przebudowy z 2026-09-09.

## Cel i decyzje

Warsztat /design-system pokazuje aktualne komponenty, stany i kompozycje ekranów OSK Managera. Obowiązują Satoshi, paleta Cobalt + Graphite + Orange oraz oba motywy.

Decyzja użytkownika z 2026-10-05: przyciski demonstracyjne pokazują wygląd i mogą pozostać bez działania. Nie dodawać zapisu, przypisania kursu ani procesu rezerwacji tylko na potrzeby pokazu. Nawigacja warsztatu, zakładki, wybór motywu i scenariusza służą oglądaniu przykładów. Istniejące lokalne interakcje kontrolek mogą pozostać.

## Mapa implementacji

| Obszar               | Implementacja                                                                          | Odpowiedzialność                                                                |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Rama                 | app/pages/design-system.vue, app/layouts/design-system.vue, DesignSystemNavigation.vue | Sekcje, hash, zgodność z ?section, jeden main, skip link, dostęp do menu mobile |
| Zakładki             | SectionScreenPatterns.vue                                                              | Reka UI Tabs, klawiatura, fokus, powiązanie paneli                              |
| Scenariusze          | DesignSystemScenarioControls.vue, app/data/design-system/scenarios.ts                  | Wybór danych, loading, error, empty/no-results i wariantów domenowych           |
| Fundamenty           | Colors.vue, Typography.vue, SectionSpacing.vue                                         | Rzeczywiste wartości CSS, typografia, odstępy, promienie, wysokości             |
| Formularze           | SectionFormControls.vue                                                                | Aktualne UiDatePicker, UiTimePicker i pozostałe pickery                         |
| Dane                 | SectionData.vue                                                                        | Próbki składników listy, liczniki wyniku i kontekstowe stany                    |
| Harmonogram          | SectionSchedule.vue, scheduleDemo.ts                                                   | Rzeczywisty kalendarz W18 z danymi rodzica i wyborem scenariusza                |
| W07                  | examples/DesignSystemStudentsExample.vue                                               | Jeden panel CRM, filtry, search, statystyki strony, lista/karty i paginacja     |
| W08                  | examples/DesignSystemStudentProfileExample.vue                                         | Aktualna kartoteka z czterema zakładkami, notatka prezentacyjna przez slot      |
| W27                  | examples/DesignSystemStudentBookingExample.vue                                         | Kurs, saldo godzin, nakładające się sloty, podgląd dialogu i wyniku             |
| Manager — rezerwacja | examples/DesignSystemBookingExample.vue                                                | Istniejący krótki formularz managera                                            |
| W29                  | examples/DesignSystemPaymentsExample.vue                                               | MyPaymentsFilters i StudentPaymentsList; stany listy i podsumowania             |

Ścieżki Section\* i examples odnoszą się do app/components/app/design-system.

## Wspólne komponenty i kompatybilność

- ManagerStudentNotesContent renderuje notatkę i edytor z propsów; emituje edit/save/cancel/update:draftNotes. ManagerStudentNotes zachowuje API i dotychczasowy zapis.
- ManagerStudentDetailsContent udostępnia sloty notes i header-actions z dotychczasową zawartością domyślną. Warsztat zastępuje je prezentacją bez API.
- getMyPaymentsToolbarSummary w app/utils/payments/myPaymentsPage.ts jest wspólną funkcją prezentacji dla useMyPaymentsPage i warsztatu.
- StudentPaymentsList przyjmuje opcjonalną referenceDate. Brak tej wartości zachowuje klasyfikowanie według bieżącego dnia. Kartoteka przekazuje ją opcjonalnie przez paymentsReferenceDate.
- StudentLessonBookingFeedbackBanner udostępnia slot action z dotychczasowym linkiem domyślnym.
- Dane/loading/error w managerskiej sekcji płatności obejmują cały panel, aby podsumowanie i edytor nie pokazywały danych podczas błędu lub ładowania.

## Dane i czas

Fixture są syntetyczne, typowane i znajdują się w app/data/design-system. Dniem odniesienia jest 2026-09-10. Statusy płatności oraz podsumowania używają tej samej daty. Pusty scenariusz ma zerowe saldo i brak najbliższego terminu. Sloty rezerwacji i zajęcia harmonogramu przesuwają się z wybranym tygodniem. Nie montować composables stron uruchamiających domenowe API.

## Tokeny

- app/assets/css/osk-design-tokens.css jest źródłem wartości palety, fontu i tokenów semantycznych light/dark.
- tailwind.css importuje ten plik; zachowuje mapowanie tokenów do utility, wykresy i style aplikacji. Nuxt ładuje jeden punkt wejścia CSS.
- colors.ts zawiera nazwy, role i identyfikatory zmiennych. Colors.vue odczytuje aktywne wartości CSS po montowaniu i zmianie motywu.
- Orange jest skalą warning. Semantyczny accent jest tłem interakcji.
- Nie przywracać usuniętej strony palety ani osobnego scope z konkurującymi wartościami. Nie wprowadzać drugiego systemu motywu.

## Kolejność

1. Uzgodnić zakres i kontrakty z aktualnym kodem.
2. Nawigacja sekcji, zakładki i semantyka strony.
3. Scenariusze, dane i wspólne funkcje prezentacji.
4. Lista, kartoteka, opłaty i rezerwacja kursanta.
5. Tokeny i fundamenty.
6. Weryfikacja, dokumentacja i akceptacja T01.

## Kryteria odbioru

- Akcje demonstracyjne pozostają podglądem; warsztat nie wywołuje domenowych żądań ani zapisów.
- Sekcje działają po wejściu przez hash i ?section. Router zachowuje pozostałe parametry.
- Zakładki działają z klawiatury; istnieje widoczny fokus, jeden main i link pomijający nawigację.
- Liczniki oraz statusy są zgodne z pokazywanymi danymi. Loading/error nie prezentuje podsumowania jako aktualnej wartości.
- Przykłady W07/W08/W27/W29 używają aktualnych komponentów aplikacji. W18 zachowuje grupowanie równoczesnych zajęć.
- Desktop 1440/1024, tablet 768, telefon 390, oba motywy; brak poziomego overflow strony. Długie dane i powiększenie 200% uwzględnione w odbiorze.
- Font Satoshi ładuje się; kolory próbek odpowiadają CSS; czytelność tekstu oraz portale sprawdzone w obu motywach.
- W08 zachowuje zapis/anulowanie notatek, W29 zachowuje formatowanie i filtry. Globalne kolory zachowują dotychczasowe wartości.
- Vitest, typecheck, lint i build uruchomione; zastane problemy opisane oddzielnie. Playwright używa istniejącej izolowanej sesji mock.
- T01 odhaczyć dopiero po wdrożeniu, sprawdzeniu i akceptacji użytkownika.
