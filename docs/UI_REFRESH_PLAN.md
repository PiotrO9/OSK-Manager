# OSK Manager — mapa widoków i plan kolejnej rundy zmian UI

Data rozeznania: 2026-09-09. Status: inwentaryzacja kodu zakończona; W07 `/manager/students` zaakceptowany i odhaczony dla nowej rundy UI.

Rekomendacja: zacząć od listy kursantów, sprawdzić wybrany kierunek na szczegółach kursanta i harmonogramie OSK, a następnie przenosić zaakceptowane wzorce na kolejne moduły. Rozwijać istniejący design system i uwzględnić wcześniejsze wdrożenia.

## Checklista widoków — bieżący postęp

To główna lista do odhaczania kolejnej rundy odświeżania UI. Każdy z 32 widoków ma jedno pole i identyfikator zgodny ze szczegółową inwentaryzacją poniżej.

Jeżeli szukasz listy widoków do przerobienia, zacznij tutaj. To jest bieżące źródło prawdy dla rundy odświeżania UI: po każdej zaakceptowanej zmianie aktualizuj poniższy wpis W/D/F/T, dopisz datę, zakres i ważne decyzje.

`[ ]` oznacza widok jeszcze niedomknięty w tej rundzie. Po wdrożeniu, sprawdzeniu i zaakceptowaniu poprawionego widoku zmień jego pole na `[x]`, dopisz datę oraz krótko opisz zmianę. Sama makieta lub analiza nie wystarcza do odhaczenia. Uwzględnij powiązane dialogi, formularze i warianty ról wymienione w inwentaryzacji.

Po zakończeniu pracy nad widokiem AI powinno zaktualizować tę checklistę oraz jego status w tabeli inwentaryzacji na „gotowe — DATA”. Przy częściowym wykonaniu zostaw `[ ]` i dopisz, co pozostało. Jeżeli po przeglądzie widok nie wymaga zmian, można oznaczyć go `[x]` z datą i adnotacją „sprawdzony i zaakceptowany bez zmian”. Nie przenoś automatycznie ukończenia z poprzedniego trackera.

### Kursanci

- [x] **W07 — Lista kursantów** — `/manager/students` — 2026-09-10: zaakceptowany jako wykonany w nowej rundzie UI; układ CRM, wyszukiwarka, szybkie i zaawansowane filtry oraz adapter filtrów zostają wzorcem dla kolejnych list.
- [ ] **W08 — Szczegóły kursanta** — `/manager/students/:userId` — profil, notatki, status procesu, kursy, harmonogram i płatności.

### Instruktorzy

- [ ] **W09 — Lista instruktorów** — `/manager/instructors` — razem z dialogiem dodawania instruktora.
- [ ] **W10 — Szczegóły instruktora** — `/manager/instructors/:id` — razem z edycją i potwierdzeniem usunięcia.
- [ ] **W11 — Dostępność instruktora** — `/manager/instructors/:id/availability`.
- [ ] **W12 — Terminarz instruktora** — `/manager/instructors/:id/schedule` — razem z dodawaniem i usuwaniem bloków.
- [ ] **W13 — Wolne sloty instruktora** — `/manager/instructors/:id/slots`.

### Kursy

- [ ] **W14 — Lista kursów** — `/manager/courses`.
- [ ] **W15 — Szczegóły kursu** — `/manager/courses/:id` — razem z przypisaniem instruktora.
- [ ] **W16 — Nowy kurs** — `/manager/courses/new`.

### Harmonogramy i wydarzenia

- [ ] **W06 — Wydarzenia dnia** — `/events` — wariant managera i instruktora.
- [ ] **W18 — Harmonogram OSK** — `/manager/schedule`.
- [ ] **W19 — Edycja wydarzenia** — `/manager/events/:id/edit` — razem z uczestnikami teorii i usuwaniem wydarzenia.
- [ ] **W20 — Edycja jazdy** — `/manager/lessons/:id/edit`.

### Pojazdy

- [ ] **W05 — Lista pojazdów** — `/vehicles` — razem ze statusem, wyborem domyślnego pojazdu i usuwaniem.
- [ ] **W24 — Szczegóły pojazdu** — `/vehicles/:id`.
- [ ] **W25 — Edycja pojazdu** — `/vehicles/:id/edit` — razem ze zmianą zdjęcia.
- [ ] **W26 — Nowy pojazd** — `/vehicles/new`.

### Szkoły i opinie managera

- [ ] **W17 — Szkoły jazdy** — `/manager/osk` — razem z dodawaniem, edycją, wyborem domyślnej szkoły i usuwaniem.
- [ ] **W21 — Opinie o lekcjach** — `/manager/reviews`.

### Własne kursy, lekcje i rozliczenia

- [ ] **W04 — Moje kursy** — `/my-courses`.
- [ ] **W27 — Rezerwacja jazdy** — `/book-lesson` — widok kursanta.
- [ ] **W28 — Moje lekcje** — `/my-lessons` — wariant kursanta i instruktora; anulowanie jazdy i wystawianie opinii.
- [ ] **W29 — Moje opłaty** — `/my-payments` — widok kursanta.
- [ ] **W30 — Moje opinie** — `/my-reviews` — widok instruktora.

### Pulpit, konto i logowanie

- [ ] **W01 — Pulpit** — `/` — warianty ról; u managera także dialogi rezerwacji jazdy, tworzenia teorii i wyboru uczestników.
- [ ] **W02 — Konto użytkownika** — `/account` — razem z edycją profilu i avatarem.
- [ ] **W03 — Logowanie** — `/login`.

### Przekierowania

- [ ] **W22 — Przejście do dodawania instruktora** — `/manager/instructors/new` — ekran przejściowy prowadzący do listy.
- [ ] **W23 — Przejście do listy OSK** — `/manager/osk/new` — ekran przejściowy prowadzący do listy.

### Widoki pomocnicze

- [ ] **T01 — Design system** — `/design-system`.
- [ ] **T02 — Test palety** — `/palette-test`.

Nawigacja, layouty, globalne błędy i powiadomienia są opisane oddzielnie w sekcji 2.6. Sprawdzaj je przy zmianach ekranów, na które wpływają. Powyższa lista liczy strony; dialogi i formularze pozostają częścią ich akceptacji.

## 1. Zakres, źródła i sposób czytania

Dokument powstał na podstawie aktualnych plików frontendu w `D:/CODE/OSK-Manager/FE/OSK-Manager-FE`, w tym niezacommitowanych zmian obecnych podczas analizy. Przejrzano strony, middleware, nawigację, layouty, istotne komponenty, composables oraz wcześniejszą dokumentację UI. Nie uruchamiano aplikacji ani nie oceniano wizualnie wcześniejszych makiet. Nie zmieniano kodu, zależności ani dotychczasowych dokumentów.

- **[KOD]** — ustalenie potwierdzone w aktualnym kodzie; nie oznacza potwierdzenia działania w przeglądarce.
- **[DOK]** — deklaracja z wcześniejszej dokumentacji; może wymagać aktualizacji.
- **[DO SPRAWDZENIA]** — hipoteza lub punkt przeglądu działającego UI.
- **[PROPOZYCJA]** — rekomendacja kolejności lub sposobu pracy, a nie zaakceptowany projekt.

W tabelach status **„do przeglądu” dotyczy nowej rundy UI**. Nie oznacza, że ekran nie został wcześniej zaimplementowany. Oznaczenia M, A, I, S i D oznaczają odpowiednio role `MANAGER`, `ADMIN`, `INSTRUCTOR`, `STUDENT`, `DEMO`. „Sesja” oznacza brak dodatkowego middleware roli, przy wymaganym uwierzytelnieniu. Opis dostępu dotyczy frontendu; nie jest audytem autoryzacji API.

Ścieżki URL z `:id` i `:userId` są wzorcami, wymagają rzeczywistych identyfikatorów. Parametry zapytania, zwłaszcza `schoolId`, są częścią kontekstu procesu, a nie osobnymi ekranami. W opisach komponentów nazwy odnoszą się do katalogu `app/components` frontendu.

### Co już istnieje

| Źródło                                                                                                | Znaczenie dla dalszej pracy                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Wzorce komponentów](../docs/UI_COMPONENT_PATTERNS.md)                                                | Bieżące zasady komponentów, hierarchii, stanów oraz przenoszenia wzorca W07 na kolejne listy.                                                                         |
| [Plan design systemu z 2026-09-09](../docs/DESIGN_SYSTEM_REBUILD_PLAN.md)                             | **[DOK]** Satoshi, Cobalt + Graphite + Orange, jasny i ciemny motyw. Dokument daje decyzjom fontu i kolorów pierwszeństwo nad starszymi propozycjami wizualnymi.      |
| [Obecne tokeny](../app/assets/css/osk-design-tokens.css) i [Tailwind](../app/assets/css/tailwind.css) | **[KOD]** Satoshi i wartości nowej palety są już obecne. Nie należy odczytywać statusu „bez implementacji” w planie design systemu jako opisu całego aktualnego kodu. |

Ten dokument jest mapą i checklistą **kolejnej rundy**. Przy następnych zmianach aktualizować status tutaj, a zaakceptowane reguły dopisywać do istniejącej dokumentacji frontendu, zamiast utrzymywać sprzeczne zestawy zasad.

## 2. Inwentaryzacja stron

**[KOD] 32 pliki w `app/pages`: 28 ekranów produktu, 2 strony przekierowujące i 2 widoki pomocnicze.** Warianty ról, dialogi i formularze osadzone na stronach opisano dodatkowo, bez zwiększania liczby adresów.

### 2.1. Ekrany wspólne i wejście do aplikacji — 6

| ID / widok            | URL           | Plik źródłowy                                 | Rola / dostęp FE                                                   | Cel i główne akcje                                                                                                                                      | Typ, komponenty i powiązania                                                                                                                                                                     | Status       |
| --------------------- | ------------- | --------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| W01 Pulpit            | `/`           | [index.vue](../app/pages/index.vue)           | Sesja; osobne warianty M, S/I i pozostałych ról                    | M: domyślna szkoła, sprawy wymagające obsługi, dostępne okna i rozpoczęcie rezerwacji. S/I: przypisane szkoły. Pozostałe role: treść zastępcza.         | Dashboard; `ManagerDefaultSchoolCard`, `ManagerAttentionItemsPanel`, `ManagerDashboardAvailabilitySection`, `UserDrivingSchoolsSection`; powiązany z OSK, harmonogramami i dialogami rezerwacji. | do przeglądu |
| W02 Konto użytkownika | `/account`    | [index.vue](../app/pages/account/index.vue)   | Sesja; edycja zależy od roli i trybu demo                          | Profil, avatar i PKK kursanta. M/A: edycja imienia i nazwiska; S/I: telefonu i bio; zapis/anulowanie edycji inline.                                     | Szczegóły + formularz; `AccountPageHeader`, `AccountProfileCard`, `AccountProfileAvatarSection`; dane sesji i panel boczny.                                                                      | do przeglądu |
| W03 Logowanie         | `/login`      | [login.vue](../app/pages/login.vue)           | Publiczny                                                          | Logowanie, błędy formularza, powrót do żądanej strony; warunkowe wypełnienie kont demo.                                                                 | Formularz uwierzytelnienia; `LoginLayout`, `LoginPanel`, `LoginForm`; `useLoginPage`, `useAuthReturnTo`.                                                                                         | do przeglądu |
| W04 Moje kursy        | `/my-courses` | [my-courses.vue](../app/pages/my-courses.vue) | Sesja; przycisk rezerwacji tylko S                                 | Przegląd kursów, postępu i godzin; S przechodzi do rezerwacji jazdy.                                                                                    | Lista + podsumowanie; `PageHeader`, `StatusBadge`, `MyCoursesList`; `/book-lesson`.                                                                                                              | do przeglądu |
| W05 Pojazdy           | `/vehicles`   | [index.vue](../app/pages/vehicles/index.vue)  | Sesja; funkcje zarządcze w tym widoku warunkowane dokładnie rolą M | Lista pojazdów szkoły; M: tryb zarządzania, tworzenie, szczegóły/edycja, status, wybór domyślnego, usuwanie. Pozostali potrzebują kontekstu `schoolId`. | Lista + panel statusów; `VehiclesListPanel`, `VehiclesListDesktopTable`, `VehiclesListMobileCards`, `VehicleManagerStatusGrid`, `VehicleDeleteDialog`; W24–W26.                                  | do przeglądu |
| W06 Wydarzenia dnia   | `/events`     | [index.vue](../app/pages/events/index.vue)    | M/A/I, middleware `manager-or-instructor`                          | Wybór dnia, filtr statusu, siatka/lista zależna od roli i szerokości, obsługa statusów i wejść w edycję według uprawnień.                               | Harmonogram dzienny; `EventsDayNavigation`, `EventsDaySummary`, `EventsDaySchedulePanel`, `EventsDayScheduleGrid`; edycja wydarzeń/jazd.                                                         | do przeglądu |

### 2.2. Widoki zarządcze — 18

Wszystkie poniższe strony mają middleware `manager`, które dopuszcza **M i A**. Widoczność poszczególnych akcji lub zawartości może być dodatkowo ograniczona w komponentach/composables.

| ID / widok                  | URL                                     | Plik źródłowy                                                                  | Rola | Cel i główne akcje                                                                                                                                                                 | Typ, komponenty i powiązania                                                                                                                                                                                                                                | Status              |
| --------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| W07 Kursanci                | `/manager/students`                     | [index.vue](../app/pages/manager/students/index.vue)                           | M/A  | Wybór OSK i kursu, czyszczenie filtra, paginacja, rejestracja kursanta, przypisanie kursu, otwarcie szczegółów. Wyszukiwanie tekstowe i szybkie filtry wykonywane przed paginacją. | Lista; `ManagerStudentsPageHeader`, `ManagerStudentsStats`, `ManagerStudentsFilters`, `ManagerStudentsList` (tabela desktop i karty mobilne), `ManagerStudentsPagination`; dialogi D01–D02, W08.                                                            | gotowe — 2026-09-10 |
| W08 Szczegóły kursanta      | `/manager/students/:userId`             | [[userId].vue](../app/pages/manager/students/%5BuserId%5D.vue)                 | M/A  | Profil, status procesu, notatki, tydzień zajęć, kursy i płatności; zapis notatki, dodanie/edycja opłaty i oznaczanie opłacenia. Zachować `schoolId`.                               | Szczegóły + formularze inline; `ManagerStudentProfileCard`, `ManagerStudentOverviewCard`, `ManagerStudentProcessStatus`, `ManagerStudentNotes`, `ManagerStudentScheduleSection`, `ManagerStudentPaymentsSection`, `ManagerStudentCoursesSection`; W07, W29. | do przeglądu        |
| W09 Instruktorzy            | `/manager/instructors`                  | [index.vue](../app/pages/manager/instructors/index.vue)                        | M/A  | Wybór szkoły, przegląd instruktorów i kwalifikacji, tworzenie konta instruktora, przejście do szczegółów.                                                                          | Lista; `ManagerInstructorsStatsGrid`, `ManagerInstructorsListCard`, `ManagerInstructorsDesktopTable`, `ManagerInstructorsMobileCards`; D03, W10–W13.                                                                                                        | do przeglądu        |
| W10 Szczegóły instruktora   | `/manager/instructors/:id`              | [index.vue](../app/pages/manager/instructors/%5Bid%5D/index.vue)               | M/A  | Profil, kwalifikacje, oceny i dostępność; edycja/usunięcie, przejścia do kalendarzy.                                                                                               | Szczegóły; `ManagerInstructorDetailsContent`, `ManagerInstructorProfileCard`, `ManagerInstructorWeeklyAvailabilityPreview`, `SummaryStrip`; D04–D05, W11–W13.                                                                                               | do przeglądu        |
| W11 Dostępność instruktora  | `/manager/instructors/:id/availability` | [availability.vue](../app/pages/manager/instructors/%5Bid%5D/availability.vue) | M/A  | Zarządzanie tygodniową dostępnością instruktora i podgląd wynikających z niej wolnych okien.                                                                                       | Formularz harmonogramu + kalendarz; `ManagerInstructorAvailabilityEditor`, `ManagerInstructorAvailabilityDayRow`, `ManagerInstructorWeeklyCalendar`; W10, W12, W13.                                                                                         | do przeglądu        |
| W12 Terminarz instruktora   | `/manager/instructors/:id/schedule`     | [schedule.vue](../app/pages/manager/instructors/%5Bid%5D/schedule.vue)         | M/A  | Przegląd tygodnia, dodawanie bloków czasu, zmiany statusów wydarzeń, usuwanie bloków i przejścia do edycji.                                                                        | Harmonogram + formularz; `ManagerInstructorScheduleContextCard`, `ManagerInstructorScheduleWeekSection`, `ManagerInstructorEventFormSection`, `ManagerInstructorEventDeleteDialog`; W19–W20.                                                                | do przeglądu        |
| W13 Wolne sloty instruktora | `/manager/instructors/:id/slots`        | [slots.vue](../app/pages/manager/instructors/%5Bid%5D/slots.vue)               | M/A  | Podgląd dostępnych okien i zmiana tygodnia; powrót do profilu lub przejście do terminarza.                                                                                         | Kalendarz dostępności; `ManagerInstructorWeeklyCalendar`, `PageHeader`; W10–W12. Sam podgląd slotów nie jest dialogiem rezerwacji.                                                                                                                          | do przeglądu        |
| W14 Kursy                   | `/manager/courses`                      | [index.vue](../app/pages/manager/courses/index.vue)                            | M/A  | Wybór szkoły, przegląd kursów, otwarcie szczegółów i tworzenia kursu.                                                                                                              | Lista; `ManagerCoursesListPanel`, `ManagerCoursesStats`, `ManagerCoursesDesktopTable`, `ManagerCoursesMobileCards`; W15–W16.                                                                                                                                | do przeglądu        |
| W15 Szczegóły kursu         | `/manager/courses/:id`                  | [[id].vue](../app/pages/manager/courses/%5Bid%5D.vue)                          | M/A  | Parametry kursu, powiązane dane i zmiana przypisanego instruktora z obsługą ograniczeń zapisu.                                                                                     | Szczegóły + formularz; `ManagerCourseDetailContainer`, `ManagerCourseProfileCard`, `ManagerCourseOverviewCard`, `ManagerCourseInstructorAssignmentCard`; W14, W09, W07.                                                                                     | do przeglądu        |
| W16 Nowy kurs               | `/manager/courses/new`                  | [new.vue](../app/pages/manager/courses/new.vue)                                | M/A  | Utworzenie kursu: szkoła, parametry szkolenia, instruktor, ustawienia teorii, walidacja i zapis.                                                                                   | Formularz; `CourseCreateForm`, `CourseCreateBasicFields`, `CourseCreateInstructorField`, `CourseCreateTheoryFields`, `CourseCreateFormActions`; W14–W15.                                                                                                    | do przeglądu        |
| W17 Szkoły jazdy            | `/manager/osk`                          | [index.vue](../app/pages/manager/osk/index.vue)                                | M/A  | Lista szkół i podsumowania, dodawanie/edycja, wybór domyślnej szkoły, usuwanie.                                                                                                    | Lista kart; `ManagerOskListGrid`, `FilterBar`, `SummaryStrip`, `StatusBadge`; D06–D07; szkoła jest kontekstem innych modułów.                                                                                                                               | do przeglądu        |
| W18 Harmonogram OSK         | `/manager/schedule`                     | [index.vue](../app/pages/manager/schedule/index.vue)                           | M/A  | Tygodniowy plan szkoły, zmiana tygodnia, otwarcie odpowiedniej edycji po wybraniu zajęć/bloku; kontekst szkoły z parametru lub domyślnej OSK.                                      | Kalendarz; `ManagerSchoolScheduleCalendar`, `ManagerScheduleWeekToolbar`, `ManagerScheduleMetaBar`, `ManagerSchoolScheduleCalendarGrid`, `ManagerScheduleLessonBlock`; W19–W20.                                                                             | do przeglądu        |
| W19 Edycja wydarzenia       | `/manager/events/:id/edit`              | [edit.vue](../app/pages/manager/events/%5Bid%5D/edit.vue)                      | M/A  | Edycja typu, zasobów i czasu bloku, status, usuwanie, uczestnicy dla teorii, powrót do harmonogramu.                                                                               | Formularz; `ManagerEventEditContainer`, `ManagerEventEditFormSection`, `ManagerEventTimeFields`, `ManagerEventResourceFields`, `ManagerEventTheoryStudentsSection`; W06, W12, W18.                                                                          | do przeglądu        |
| W20 Edycja jazdy            | `/manager/lessons/:id/edit`             | [edit.vue](../app/pages/manager/lessons/%5Bid%5D/edit.vue)                     | M/A  | Wczytanie zarezerwowanej jazdy, zmiana danych formularza i czasu, zapis/anulowanie; obsługa braku jazdy i błędów.                                                                  | Formularz; `ManagerLessonEditContainer`, `ManagerLessonEditHeader`, `ManagerLessonEditForm`, `ManagerLessonEditActions`, `FormSection`; W06, W12, W18.                                                                                                      | do przeglądu        |
| W21 Opinie o lekcjach       | `/manager/reviews`                      | [index.vue](../app/pages/manager/reviews/index.vue)                            | M/A  | Przegląd ocen i podsumowania, wybór okresu. Kontekst szkoły/instruktora jest ustalany w logice strony; nie zakładać istnienia wszystkich filtrów w UI.                             | Lista + podsumowanie; `LessonRatingsSummary`, `LessonRatingsTable`, `UiSelect`; W30, kontekst OSK/instruktora.                                                                                                                                              | do przeglądu        |
| W24 Szczegóły pojazdu       | `/vehicles/:id`                         | [index.vue](../app/pages/vehicles/%5Bid%5D/index.vue)                          | M/A  | Dane pojazdu, zdjęcie, status i przejście do edycji/listy; zachowanie kontekstu szkoły.                                                                                            | Szczegóły; `VehicleDetailsContent`, `ErrorState`, `LoadingState`; W05, W25.                                                                                                                                                                                 | do przeglądu        |
| W25 Edycja pojazdu          | `/vehicles/:id/edit`                    | [edit.vue](../app/pages/vehicles/%5Bid%5D/edit.vue)                            | M/A  | Edycja danych i zdjęcia, zapis/anulowanie; wymagany kontekst `schoolId`.                                                                                                           | Formularz; `VehicleForm`, `VehicleFormFields`, `VehicleEditPhotoSection`, `FormSection`, `ActionGroup`; W05, W24.                                                                                                                                           | do przeglądu        |
| W26 Nowy pojazd             | `/vehicles/new`                         | [new.vue](../app/pages/vehicles/new.vue)                                       | M/A  | Utworzenie pojazdu w szkole, walidacja, zapis i powrót na listę; wymagany `schoolId`.                                                                                              | Formularz; `VehicleForm`, `VehicleFormFields`, `FormSection`, `ActionGroup`; W05.                                                                                                                                                                           | do przeglądu        |

### 2.3. Widoki kursanta i instruktora — 4

| ID / widok           | URL            | Plik źródłowy                                   | Rola / dostęp FE                        | Cel i główne akcje                                                                                                                                                | Typ, komponenty i powiązania                                                                                                                                                         | Status       |
| -------------------- | -------------- | ----------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| W27 Rezerwacja jazdy | `/book-lesson` | [book-lesson.vue](../app/pages/book-lesson.vue) | S, middleware `student`                 | Wybór dostępnego kursu, tygodnia i slotu; rezerwacja, komunikat wyniku i odświeżenie slotów.                                                                      | Rezerwacja; `StudentLessonBookingCourseSelect`, `StudentLessonBookingSelectedCourseSummary`, `StudentLessonBookingWeekNav`, `StudentLessonBookingSlotList`; W04, W28.                | do przeglądu |
| W28 Moje lekcje      | `/my-lessons`  | [my-lessons.vue](../app/pages/my-lessons.vue)   | S/I, middleware `student-or-instructor` | Tydzień własnych lekcji i wydarzeń. S: rezerwacja, anulowanie dopuszczalnej jazdy, opinia po zakończeniu. I: własny terminarz i dostępne akcje statusów wydarzeń. | Harmonogram + formularz opinii; `MyLessonsSummaryPanel`, `MyLessonsSchedulePanel`, `StudentScheduleGroupedList`, `StudentCancelLessonDialog`, `StudentLessonRatingsPanel`; W27, W30. | do przeglądu |
| W29 Moje opłaty      | `/my-payments` | [my-payments.vue](../app/pages/my-payments.vue) | S, middleware `student`                 | Podgląd należności, terminów i opłaconych pozycji; nie jest to formularz płatności online.                                                                        | Lista + podsumowanie; `PageHeader`, `SummaryStrip`, `StudentPaymentsList`; ta sama prezentacja listy jest używana w W08.                                                             | do przeglądu |
| W30 Moje opinie      | `/my-reviews`  | [my-reviews.vue](../app/pages/my-reviews.vue)   | I, middleware `instructor`              | Podgląd ocen i komentarzy dotyczących własnych zakończonych lekcji.                                                                                               | Lista + podsumowanie; `LessonRatingsSummary`, `LessonRatingsTable`; W21 oraz opinie dodawane w W28.                                                                                  | do przeglądu |

### 2.4. Strony przekierowujące — 2

Numery W22–W23 należą do procesu zarządczego, ale zostały wydzielone, aby nie planować dla nich nowych pełnych formularzy.

| ID / widok                             | URL                        | Plik źródłowy                                       | Rola / dostęp FE | Zachowanie i powiązania                                                                                                                                                                                           | Typ                                             | Status       |
| -------------------------------------- | -------------------------- | --------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------ |
| W22 Przejście do dodawania instruktora | `/manager/instructors/new` | [new.vue](../app/pages/manager/instructors/new.vue) | M/A              | Po 1400 ms od montowania przejście do `/manager/instructors`, z zachowaniem query. Docelowy composable otwiera tworzenie, gdy jest `prefillSchoolId`. `PageHeader`, `ActionGroup`; W09, D03.                      | Przekierowanie z widocznym ekranem przejściowym | do przeglądu |
| W23 Przejście do listy OSK             | `/manager/osk/new`         | [new.vue](../app/pages/manager/osk/new.vue)         | M/A              | Po 1400 ms przejście do `/manager/osk`. Tworzenie szkoły jest dialogiem na liście. Tekst strony mówi o modalu, ale samo przekierowanie nie przekazuje flagi jego otwarcia. `PageHeader`, `ActionGroup`; W17, D06. | Przekierowanie z widocznym ekranem przejściowym | do przeglądu |

### 2.5. Widoki pomocnicze — 2

| ID / widok        | URL              | Plik źródłowy                                       | Dostęp FE                  | Cel i akcje                                                                                                                                              | Typ / komponenty                                                                                                                                                       | Status       |
| ----------------- | ---------------- | --------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| T01 Design system | `/design-system` | [design-system.vue](../app/pages/design-system.vue) | Sesja, bez dodatkowej roli | Przegląd fundamentów, kontrolek, danych, harmonogramów, komunikatów i wzorców ekranów; wybór sekcji przez `?section=...`, przełącznik motywu w layoucie. | Warsztat UI; `DesignSystemNavigation`, `Colors`, `Typography`, `SectionScreenPatterns` i pozostałe sekcje. Dane demonstracyjne nie dowodzą istnienia funkcji produktu. | do przeglądu |
| T02 Test palety   | `/palette-test`  | [palette-test.vue](../app/pages/palette-test.vue)   | Publiczny                  | Podgląd jasnej/ciemnej palety, przejście do design systemu.                                                                                              | Demo kolorów; `PalettePreviewShowcase`, layout `design-system`; osobny cookie i `data-theme`.                                                                          | do przeglądu |

### 2.6. Powierzchnie globalne bez osobnej trasy

| Powierzchnia                         | Źródło                                                                                                                                                                                  | Znaczenie / akcje                                                                                                                                      | Status       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Rama aplikacji i nawigacja           | [app-shell.vue](../app/layouts/app-shell.vue), [AppShellSidebar.vue](../app/components/app/AppShellSidebar.vue), [appShellSidebarNav.ts](../app/utils/navigation/appShellSidebarNav.ts) | Nawigacja zależna od roli, zwijanie panelu, konto i wylogowanie; wpływa na przestrzeń każdego ekranu produktu poza logowaniem.                         | do przeglądu |
| Layout warsztatu i layout domyślny   | [design-system.vue](../app/layouts/design-system.vue), [default.vue](../app/layouts/default.vue)                                                                                        | Warsztat i paleta współdzielą layout. Layout domyślny ma `AppFooter`; bieżące strony jawnie wybierają inne layouty albo wyłączają automatyczny layout. | do przeglądu |
| Globalny błąd / 404                  | [error.vue](../app/error.vue)                                                                                                                                                           | Powrót do strony głównej i ponowienie; teksty domyślne po angielsku i własne klasy kolorystyczne. Nie liczyć jako plik w `app/pages`.                  | do przeglądu |
| Powiadomienia i ogłaszanie nawigacji | [app.vue](../app/app.vue), [ToastStack.vue](../app/components/app/ToastStack.vue)                                                                                                       | `ToastStack` i `NuxtRouteAnnouncer`; komunikaty sukcesu/błędu oraz zmiany strony.                                                                      | do przeglądu |

## 3. Dialogi i istotne formularze wewnątrz widoków

Poniższe pozycje są częścią wskazanych ekranów, nie nowymi trasami. Uwzględniać je przy akceptacji całego procesu.

| ID / proces                            | Gdzie / rola                            | Źródło                                                                                                                   | Co musi pozostać                                                                            | Status       |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------ |
| D01 Rejestracja kursanta               | W07, M/A                                | [ManagerStudentFormDialog.vue](../app/components/manager/students/ManagerStudentFormDialog.vue)                          | Wybór szkoły, pola obecnego formularza, walidacja, stan zapisu i błąd API.                  | do przeglądu |
| D02 Przypisanie kursu                  | W07, M/A                                | [ManagerStudentAssignCourseDialog.vue](../app/components/manager/students/ManagerStudentAssignCourseDialog.vue)          | Tożsamość kursanta, kursy właściwej szkoły, zapis, brak kursów i błędy.                     | do przeglądu |
| D03 Nowy instruktor                    | W09, M/A                                | [ManagerInstructorFormDialog.vue](../app/components/manager/instructors/ManagerInstructorFormDialog.vue)                 | Kontekst szkoły, dane i kwalifikacje, walidacja, zapis; wejście przez W22 zależne od query. | do przeglądu |
| D04 Edycja instruktora                 | W10, M/A                                | [ManagerInstructorEditDialog.vue](../app/components/manager/instructors/ManagerInstructorEditDialog.vue)                 | Aktualne dane, walidacja, zapis/anulowanie; bazuje na `ManagerInstructorEditForm`.          | do przeglądu |
| D05 Usunięcie instruktora              | W10, M/A                                | [ManagerInstructorDeleteDialog.vue](../app/components/manager/instructors/ManagerInstructorDeleteDialog.vue)             | Jednoznaczna tożsamość, potwierdzenie, oczekiwanie i obsługa błędu.                         | do przeglądu |
| D06 Dodanie/edycja OSK                 | W17, M/A                                | [ManagerOskSchoolFormDialog.vue](../app/components/manager/osk/ManagerOskSchoolFormDialog.vue)                           | Dane szkoły, tryb tworzenia/edycji, domyślna szkoła i ograniczenia tej zmiany.              | do przeglądu |
| D07 Usunięcie OSK                      | W17, M/A                                | [ManagerOskDeleteDialog.vue](../app/components/manager/osk/ManagerOskDeleteDialog.vue)                                   | Potwierdzenie właściwej szkoły, blokada wielokrotnego zapisu i błędy.                       | do przeglądu |
| D08 Usunięcie pojazdu                  | W05, akcja M                            | [VehicleDeleteDialog.vue](../app/components/vehicles/VehicleDeleteDialog.vue)                                            | Identyfikacja pojazdu, potwierdzenie i wynik usunięcia.                                     | do przeglądu |
| D09 Wybór rodzaju zajęć w wolnym oknie | Kalendarz dostępności na W01, wariant M | [ManagerAvailabilitySlotChoiceDialog.vue](../app/components/manager/events/ManagerAvailabilitySlotChoiceDialog.vue)      | Wybrany slot, przejście do rezerwacji jazdy lub tworzenia teorii.                           | do przeglądu |
| D10 Rezerwacja jazdy przez managera    | Jak D09                                 | [ManagerLessonBookingDialog.vue](../app/components/manager/lessons/ManagerLessonBookingDialog.vue)                       | Slot, kursant/kurs, instruktor, pojazd, walidacja, zapis i odświeżenie kalendarza.          | do przeglądu |
| D11 Utworzenie teorii                  | Jak D09                                 | [ManagerTheoryEventCreateDialog.vue](../app/components/manager/events/ManagerTheoryEventCreateDialog.vue)                | Kontekst szkoły i slotu, pola teorii, zapis, dalszy wybór uczestników.                      | do przeglądu |
| D12 Dobór uczestników wydarzenia       | Kalendarz dostępności na W01, wariant M | [ManagerEventStudentPickerDialog.vue](../app/components/manager/events/ManagerEventStudentPickerDialog.vue)              | Wyszukiwanie i wybór uprawnionych kursantów, pojemność wydarzenia, zatwierdzenie.           | do przeglądu |
| D13 Usunięcie wydarzenia               | W12 i W19, M/A                          | [ManagerInstructorEventDeleteDialog.vue](../app/components/manager/events/ManagerInstructorEventDeleteDialog.vue)        | Kontekst bloku/czasu, potwierdzenie, anulowanie i wynik operacji.                           | do przeglądu |
| D14 Anulowanie własnej jazdy           | W28, S                                  | [StudentCancelLessonDialog.vue](../app/components/student/schedule/StudentCancelLessonDialog.vue)                        | Wybrana jazda, warunki dostępności anulowania, potwierdzenie i odświeżenie.                 | do przeglądu |
| F01 Notatka o kursancie                | W08, M/A                                | [ManagerStudentNotes.vue](../app/components/manager/students/ManagerStudentNotes.vue)                                    | Edycja inline, zapis/anulowanie i błąd.                                                     | do przeglądu |
| F02 Obsługa należności kursanta        | W08, M/A                                | [ManagerStudentPaymentsSection.vue](../app/components/manager/students/ManagerStudentPaymentsSection.vue)                | Tworzenie opłaty, edycja, zmiany opłacona/nieopłacona, powiązanie z planem płatności.       | do przeglądu |
| F03 Opinia o zakończonej jeździe       | W28, S                                  | [StudentLessonRatingForm.vue](../app/components/student/lesson-ratings/StudentLessonRatingForm.vue)                      | Ocena, komentarz, zapis i dotychczasowe warunki dostępności.                                | do przeglądu |
| F04 Dostępność tygodniowa              | W11, M/A                                | [ManagerInstructorAvailabilityEditor.vue](../app/components/manager/instructors/ManagerInstructorAvailabilityEditor.vue) | Okna dla dni tygodnia, zapis/usuwanie według istniejącej logiki i odświeżenie podglądu.     | do przeglądu |
| F05 Profil użytkownika i avatar        | W02, sesja                              | [useAccountPage.ts](../app/composables/account/useAccountPage.ts)                                                        | Edycja inline według roli, osobny upload avatara, ograniczenia demo.                        | do przeglądu |

**[KOD]** Dialogi D09–D12 są składane w [ManagerSchoolWeeklyAvailabilityCalendar.vue](../app/components/manager/instructors/ManagerSchoolWeeklyAvailabilityCalendar.vue), używanym przez sekcję dostępności pulpitu. Nie przypisywać ich automatycznie wszystkim kalendarzom tylko na podstawie podobnych nazw.

**[KOD]** Rezerwacja kursanta w W27 jest akcją na liście slotów, zakończoną komunikatem i odświeżeniem. W [useStudentLessonBookingPage.ts](../app/composables/lessons/useStudentLessonBookingPage.ts) nie ma osobnej strony potwierdzenia. Jej dodanie byłoby zmianą procesu.

W repo są też [AccountProfileNamesFormDialog.vue](../app/components/app/AccountProfileNamesFormDialog.vue), [AccountProfileContactFormDialog.vue](../app/components/app/AccountProfileContactFormDialog.vue) i [ManagerLessonRatingsFilters.vue](../app/components/manager/reviews/ManagerLessonRatingsFilters.vue). Nie znaleziono ich użycia w aktualnych stronach/komponentach produktu. Nie zaliczono ich do czynnych dialogów/filtrów; sama obecność pliku nie oznacza dostępnego widoku.

## 4. Istniejący system UI i możliwości ponownego użycia

### Fundamenty i komponenty

**[KOD]** [package.json](../package.json) deklaruje Nuxt 4, Vue 3, TypeScript, Tailwind 4, shadcn-nuxt, Reka UI i Lucide. [nuxt.config.ts](../nuxt.config.ts) ustawia autoimporty komponentów i ładuje kolejno `tailwind.css`, a potem `osk-design-tokens.css`. Nie potrzeba nowej biblioteki UI do rozpoczęcia odświeżania.

| Warstwa                     | Co jest potwierdzone w kodzie                                                                                                                                                                                                             | Źródło / zastosowanie                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kolory i font               | Lokalny Satoshi, palety primary/secondary/success/warning/danger/info, tokeny powierzchni, tekstu, obramowania, focusu i sidebaru, wariant `.dark`. Bazowy `--radius: 0.5rem`.                                                            | [osk-design-tokens.css](../app/assets/css/osk-design-tokens.css), [tailwind.css](../app/assets/css/tailwind.css).                                     |
| Prymitywy                   | Przyciski, input/textarea, select/native-select, checkbox, radio, switch, kalendarze, date/time picker, dialog, sheet, popover, tooltip, sidebar.                                                                                         | [components/shadcn](../app/components/shadcn); publiczne propsy i eventy zachować przy stylowaniu.                                                    |
| Nagłówki i akcje            | `PageHeader`, `ActionGroup` z miejscem na akcje oraz kontekst. Część stron ma własne nagłówki.                                                                                                                                            | [PageHeader.vue](../app/components/app/ui/PageHeader.vue), [ActionGroup.vue](../app/components/app/ui/ActionGroup.vue).                               |
| Listy                       | `FilterBar`, `DataTableShell` z toolbar, desktop/mobile, paginacją i stanami danych. Shell nie dodaje sam wyszukiwania, sortowania ani paginacji biznesowej.                                                                              | [FilterBar.vue](../app/components/app/ui/FilterBar.vue), [DataTableShell.vue](../app/components/app/ui/DataTableShell.vue).                           |
| Formularze i podsumowania   | `FormSection`, `SummaryStrip`; formularze domenowe współdzielą pola lub podsekcje.                                                                                                                                                        | [FormSection.vue](../app/components/app/ui/FormSection.vue), [SummaryStrip.vue](../app/components/app/ui/SummaryStrip.vue).                           |
| Statusy i stany danych      | `StatusBadge` obsługuje neutral/info/success/warning/danger i wariant subtelny. Są `LoadingState`, `EmptyState`, `ErrorState`, ale używane są też lokalne szkielety i komunikaty.                                                         | [StatusBadge.vue](../app/components/app/ui/StatusBadge.vue), [components/app/ui](../app/components/app/ui).                                           |
| Wzorce ekranów w warsztacie | Przykłady listy kursantów, profilu, rezerwacji i płatności. Można wykorzystać je do sprawdzania kompozycji i stanów.                                                                                                                      | [SectionScreenPatterns.vue](../app/components/app/design-system/SectionScreenPatterns.vue), [examples](../app/components/app/design-system/examples). |
| Współdzielenie domenowe     | Ten sam `VehicleForm` dla tworzenia/edycji; `StudentPaymentsList` w profilu kursanta i jego własnych opłatach; `LessonRatingsSummary`/`LessonRatingsTable` u managera i instruktora; kalendarz slotów w dostępności i osobnym podglądzie. | Źródła przy odpowiednich W05–W30. Każda zmiana wymaga sprawdzenia obu kontekstów.                                                                     |

**[KOD]** Nazwy `DetailLayout`, `EntitySummaryCard` i `ScheduleLayout` występują jako planowane wzorce w starszej dokumentacji, ale nie znaleziono odpowiadających im komponentów/użyć pod tymi nazwami w `app`. Nie traktować ich jak gotowych importów ani nie tworzyć automatycznie przed pierwszą potrzebą.

### Responsywność — co wynika z kodu

| Obszar                       | Potwierdzenie                                                                                                                                                                                                          | Co sprawdzić w przeglądarce                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista kursantów              | [ManagerStudentsList.vue](../app/components/manager/students/ManagerStudentsList.vue) od 2026-09-09 przełącza tabelę i karty według szerokości kontenera (`@3xl`, 768 px), uwzględniając miejsce zajęte przez sidebar. | Sprawdzone szerokości viewportu 390, 960 i 1100 px; brak poziomego przepełnienia, akcje dostępne. Przykłady długiego nazwiska i brakujących danych sprawdzone w design systemie. |
| Instruktorzy, kursy, pojazdy | Oddzielne komponenty `DesktopTable` i `MobileCards`.                                                                                                                                                                   | Czy mobile pokazuje wszystkie potrzebne informacje i pozwala wykonać te same dopuszczalne akcje.                                                                                 |
| Kalendarz szkoły             | [ManagerSchoolScheduleCalendarGrid.vue](../app/components/manager/schedule/ManagerSchoolScheduleCalendarGrid.vue) ma minimalną szerokość 720 px.                                                                       | Przewijanie, czytelność nakładających się zajęć, wybieranie bloków dotykiem i klawiaturą.                                                                                        |
| Sloty instruktora            | [ManagerInstructorWeeklyCalendar.vue](../app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue) używa poziomego przewijania i minimum 820 px, albo 560 px dla compact.                                | Wygoda pracy na telefonie; istnienie przewijania nie dowodzi, że kalendarz jest wygodny.                                                                                         |
| Wydarzenia dnia              | [useEventsDayPage.ts](../app/composables/events/useEventsDayPage.ts) rozróżnia kompaktowy viewport i efektywny tryb listy/siatki.                                                                                      | Zachowanie przy zmianie szerokości i roli, zachowanie filtrów oraz statusów.                                                                                                     |
| Formularze i dialogi         | W kodzie są responsywne siatki, limity szerokości i przewijanie dialogów.                                                                                                                                              | Klawiatura ekranowa, widoczność błędów, dostęp do zapisu i anulowania, focus po zamknięciu.                                                                                      |

### Rozbieżności do uwzględnienia w odświeżaniu

1. **[KOD] Wspólne tokeny i lokalne kolory współistnieją.** `ManagerStudentsList` ma statusy w klasach emerald/slate, a [ManagerInstructorWeeklyCalendar.vue](../app/components/manager/instructors/ManagerInstructorWeeklyCalendar.vue) używa m.in. `bg-white` i sky. Wspólny `StatusBadge` już używa semantycznych palet. **[DO SPRAWDZENIA]** rzeczywisty kontrast i spójność obu motywów.
2. **[KOD] Podstawowe tokeny są zadeklarowane w obu globalnych CSS.** Obecność dwóch źródeł oznacza zależność od kolejności importu. Nie jest sama w sobie dowodem błędu; przy późniejszej edycji trzeba sprawdzić oba pliki.
3. **[KOD] Różne promienie i lokalne wysokości kontrolek.** Wspólny `DataTableShell` ma `rounded-lg`; listy domenowe często `rounded-2xl`, a pola lokalnie `h-11 rounded-xl`. **[PROPOZYCJA]** ustalić wariant standard/compact na rzeczywistych listach i formularzach, bez globalnego zamieniania wszystkich klas naraz.
4. **[KOD] Motyw warsztatu i palety ma różne mechanizmy.** [useDarkMode.ts](../app/composables/core/useDarkMode.ts) korzysta z `.dark` i localStorage; `/palette-test` ma cookie `osk-palette-preview-mode` i `data-theme`. **[DO SPRAWDZENIA]** przejścia między stronami, odświeżenie i stan motywu w CRM.
5. **[KOD] Role w menu i renderowaniu nie są wszędzie równoważne.** Middleware `manager` dopuszcza M/A, lecz pulpit i zarządzanie pojazdami sprawdzają dokładnie M; pozycje OSK/pojazdów w menu również są dodawane tylko dla M. `/my-courses` i `/vehicles` nie mają middleware roli. Źródła: [authRole.ts](../app/utils/auth/authRole.ts), [auth.global.ts](../app/middleware/auth.global.ts), [appShellSidebarNav.ts](../app/utils/navigation/appShellSidebarNav.ts), [useVehiclesListPage.ts](../app/composables/vehicles/useVehiclesListPage.ts). **[DO SPRAWDZENIA]** docelowe zachowanie ADMIN; nie zmieniać uprawnień przy okazji stylowania.
6. **[KOD] Część tekstów UI opisuje implementację.** Np. opisy `FormSection` na W25–W26 mówią o „walidacji i flow”, a globalny błąd jest po angielsku. **[PROPOZYCJA]** przy odświeżaniu tych ekranów zastosować krótkie teksty opisujące zadanie użytkownika.
7. **[DOK/KOD] Historyczne opisy nie zawsze oddają dzisiejsze funkcje.** Tracker konta wspomina brak akcji zapisu profilu w poprzedniej iteracji; aktualny W02 ma edycję inline. Plan design systemu opisuje starszy stan fundamentów, choć część nowych elementów jest już w kodzie. Aktualny kod trzeba sprawdzać przed każdą makietą.
8. **[KOD] Makieta listy kursantów musi respektować realny zakres.** Są filtry OSK/kursu i paginacja; brak tekstowego szukania. Statystyki rozróżniają sumę wyników od aktywnych/z PKK na bieżącej stronie. Nie zmieniać ich znaczenia wizualną etykietą „wszyscy”. Źródła: [ManagerStudentsStats.vue](../app/components/manager/students/ManagerStudentsStats.vue), [ManagerStudentsFilters.vue](../app/components/manager/students/ManagerStudentsFilters.vue).

## 5. Grupy wzorców i kompletne procesy

| Grupa                      | Widoki                                                 | Wspólne elementy                                                                | Co powinno pozostać specyficzne                                                                               |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Listy administracyjne      | W07, W09, W14, W05                                     | Nagłówek, kontekst OSK, podsumowanie, tabela/karty, akcje, stany danych.        | Rzeczywiste filtry i paginacja; status pojazdu, kwalifikacje instruktora i dane kursanta mają inną semantykę. |
| Profile i szczegóły        | W08, W10, W15, W24, W02                                | Hierarchia danych identyfikacyjnych, panel główny/poboczny, sekcje i akcje.     | Płatności i proces kursanta, przypisanie instruktora kursu, zdjęcie pojazdu, uprawnienia konta.               |
| Formularze i dialogi       | W16, W19–W20, W25–W26, D01–D14, F01–F05                | Etykiety, błędy przy polach, akcje zapisu/anulowania, stan oczekiwania i focus. | Kolejność i zależności pól, walidacja domenowa, rodzaj operacji i ograniczenia edycji.                        |
| Czas i dostępność          | W06, W11–W13, W18, W27–W28, sekcja W01                 | Nawigacja daty/tygodnia, legenda, typ zajęć, status, stan braku terminów.       | Dostępność cykliczna, wolny slot, blok instruktora i zarezerwowana jazda są różnymi obiektami.                |
| Płatności i opinie         | W08/F02, W29, W21, W30, W28/F03                        | Skanowalne listy, kwoty/daty/oceny, podsumowania i stany.                       | Odczyt kursanta/instruktora versus akcje managera; brak płatności online.                                     |
| Szkoły, pulpit i otoczenie | W17, W01–W03, W22–W23, layouty, T01–T02, globalny błąd | Kontekst szkoły, nawigacja, tożsamość użytkownika, kolory i komunikaty.         | Pulpit zależny od roli; strony demonstracyjne nie są ekranami produktu.                                       |

Procesy do sprawdzania łącznie:

- **Kursant:** W07 → D01 albo D02 → odświeżona lista → W08 → notatka/płatność. Zachować `userId`, szkołę i znaczenie liczników.
- **Instruktor:** W09 → D03 → W10 → D04/D05 albo W11/W13/W12. Dostępność cykliczna i terminarz zajęć wymagają osobnego nazwania.
- **Rezerwacja managera:** W01 → wolne okno → D09 → D10 albo D11 → D12 dla doboru uczestników teorii → odświeżenie kalendarza. Nie zakładać, że ten proces uruchamia się w każdym kalendarzu.
- **Obsługa zajęć managera:** W06/W18/W12 → W19 dla wydarzenia albo W20 dla jazdy → zapis/anulowanie/powrót. Typ obiektu i kontekst szkoły decydują o celu; sprawdzać historię przeglądarki i datę po powrocie.
- **Rezerwacja kursanta:** W04 → W27 → wybór kursu i slotu → wynik rezerwacji → W28; później D14 lub F03, kiedy pozwalają reguły.
- **Kurs:** W14 → W16 → wynik zapisu; W14 → W15 → przypisanie instruktora. Sprawdzić osobno kursy z ustawieniami teorii.
- **Pojazd:** W05 → W26 lub W24 → W25 → lista; osobno status, domyślny pojazd i D08. Zachować `schoolId`.
- **Kontekst szkoły:** W17 → D06 → ustawienie domyślnej → W01 i inne moduły. Zmiana szkoły może zmienić dane widoczne na wielu stronach.
- **Logowanie i konto:** wejście na chroniony URL → W03 → powrót; W02 → edycja właściwa dla roli → odświeżenie danych profilu/avataru.

## 6. Proponowana kolejność nowej rundy

**[PROPOZYCJA]** Priorytety poniżej wynikają z ponownego użycia wzorców i zależności. Nie mamy danych o częstotliwości użycia ani informacji, które ekrany najbardziej przeszkadzają użytkownikom. Jeżeli głównym problemem jest codzienna obsługa grafiku lub telefon, etap kalendarzy należy przesunąć wcześniej.

| Etap                                 | Zakres                                                       | Wynik do oceny                                                                                    | Zależności i wpływ                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E0 Punkt odniesienia                 | W07, W08, W18 i odpowiednie przykłady T01                    | Aktualne zrzuty desktop/mobile, lista realnych problemów, potwierdzenie przyjętych fundamentów.   | Zestawić kod z działającym ekranem; nie zaczynać ponownego wyboru fontu i palety, jeżeli dotychczasowe decyzje nadal obowiązują.                                                 |
| E1 Ekran wzorcowy                    | W07; D01–D02 jako konieczny kontekst                         | Dwa warianty listy kursantów z tym samym zakresem danych i akcji; wybór jednego i jego wdrożenie. | Rozwijać istniejące `PageHeader`, `FilterBar`, `DataTableShell`, `StatusBadge`, stany. Sprawdzić także innych konsumentów zmienionego komponentu.                                |
| E2 Sprawdzenie na innych typach      | W08 oraz W18                                                 | Ocena, czy kierunek działa dla rozbudowanych szczegółów i kalendarza. Wdrażać każdy ekran osobno. | W08 sprawdzi karty, hierarchię, notatki i płatności; W18 gęstość, kolory typów/statusów i przewijanie. Dopiero potem utrwalić reguły całej rundy.                                |
| E3 Listy i szczegóły administracyjne | W09–W10, W14–W16, W05 i W24–W26                              | Kolejne małe zadania: lista → szczegóły → formularz/dialog.                                       | Korzystać z E1/E2; uwzględnić D03–D05/D08 i wszystkie współdzielone pola. Nie robić trzech modułów w jednej dużej zmianie.                                                       |
| E4 Czas i rezerwacje managera        | W06, W11–W13, W19–W20, sekcja dostępności W01, D09–D13       | Spójny proces przeglądania dostępności, rezerwacji i edycji zajęć.                                | W06 ma historyczny status „w toku”, więc najpierw ustalić pozostały zakres. Zachować różnice obiektów i reguły czasu; oprzeć się na E2.                                          |
| E5 Kursant i instruktor              | W04, W27–W30, W21, D14/F03                                   | Własne kursy, lekcje, rezerwacja, opłaty i opinie.                                                | Mniejsza gęstość może być uzasadniona zadaniem, ale stylistyka pozostaje wspólna. Zmiany opinii/płatności sprawdzić również w widokach managera.                                 |
| E6 Domknięcie otoczenia              | W17, pozostałe warianty W01, W02–W03, W22–W23, błąd globalny | Spójny kontekst szkoły, konto, wejście/wyjście i sytuacje wyjątkowe.                              | Login i fundamenty mają aktualne niezacommitowane zmiany — rozpocząć od sprawdzenia ich aktualnego stanu. Shell kontrolować od E0, nie odkładać blokujących problemów na koniec. |
| Ciągle                               | T01–T02 i dokumentacja wzorców                               | Zaakceptowane reguły, przykłady i odnotowane odstępstwa.                                          | Aktualizować przy zatwierdzeniu wzorca, a nie dopiero po przebudowie całej aplikacji.                                                                                            |

### Dlaczego te trzy ekrany na start

- **Ekran do dwóch wariantów: W07 `/manager/students`.** Ma kontekst OSK, filtry, podsumowania, tabelę i mobilne karty, paginację, akcje w wierszu oraz dialogi. To szeroki przekrój list administracyjnych. Dostępne są wcześniejsze materiały i przykład w design systemie, więc porównanie może dotyczyć konkretnych ulepszeń.
- **Próba szczegółów: W08 `/manager/students/:userId`.** Sprawdza dłuższą stronę z profilem, procesem, notatkami, harmonogramem i należnościami. Nie wystarczy powiększyć karty z listy.
- **Próba kalendarza: W18 `/manager/schedule`.** Sprawdza szeroki układ, gęstą informację, legendę, statusy i obsługę czasu. Pozwoli wcześnie zauważyć, że zasady ustalone dla tabel nie rozwiązują wszystkich problemów grafiku.

## 7. Checklisty postępu i akceptacji

Wszystkie pola są początkowo puste, bo dotyczą nowej rundy. „Przegląd” oznacza działający ekran; inwentaryzacja jego kodu została wykonana w tym dokumencie. „Wzorce” oznacza zapis reguł lub świadomego odstępstwa. Jeśli element nie dotyczy etapu, wpisać „nie dotyczy” z krótkim powodem.

| Etap                            | Przegląd UI / problemy | Propozycja i wybór               | Wdrożenie             | Desktop i mobile | Akcje i stany danych                 | Zapis wzorców        |
| ------------------------------- | ---------------------- | -------------------------------- | --------------------- | ---------------- | ------------------------------------ | -------------------- |
| E0 Punkt odniesienia            | [ ]                    | [ ]                              | nie dotyczy — analiza | [ ]              | [ ]                                  | [ ]                  |
| E1 Lista kursantów              | [x] 2026-09-09         | [x] 2026-09-10 zaakceptowano W07 | [x] 2026-09-09        | [x] 2026-09-09   | [x] zakres kontroli w sekcjach 10-11 | [x] wzorzec zapisany |
| E2 Szczegóły i kalendarz        | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |
| E3 Listy administracyjne        | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |
| E4 Czas i rezerwacje            | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |
| E5 Kursant i instruktor         | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |
| E6 Otoczenie aplikacji          | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |
| T01–T02 Dokumentacja i warsztat | [ ]                    | [ ]                              | [ ]                   | [ ]              | [ ]                                  | [ ]                  |

Każde pojedyncze zadanie wdrożeniowe powinno mieć następujący zakres akceptacji:

- [ ] Zapisano aktualny cel ekranu, rolę, istniejące dane/akcje i konkretne problemy zaobserwowane w UI.
- [ ] Wybrano propozycję na desktop/mobile; dla następnych podobnych ekranów wystarczy adaptacja zaakceptowanego wzorca.
- [ ] Użyto obecnego fontu/palety i istniejących komponentów, a odstępstwa mają uzasadnienie.
- [ ] Wdrożono wybrany zakres bez utraty pól, akcji, uprawnień i kontekstu routingu.
- [ ] Sprawdzono desktop, telefon i szerokość pośrednią z otwartym/zamkniętym sidebarem; oba motywy przyjęte w planie design systemu.
- [ ] Sprawdzono puste dane, brak wyników filtra, ładowanie, błąd i retry oraz brak kontekstu szkoły/obiektu tam, gdzie występują.
- [ ] Sprawdzono walidację, zapisywanie, sukces, błąd zapisu, anulowanie i potwierdzenie usunięcia tam, gdzie występują.
- [ ] Przeszedł cały główny proces: wejście → akcja → wynik → powrót; sprawdzono role z różnymi akcjami.
- [ ] Sprawdzono długie nazwiska/maile, brak zdjęcia, dużą liczbę danych; dla czasu także przełom tygodnia i zajęcia nakładające się.
- [ ] Sprawdzono klawiaturę, focus, etykiety, statusy niezależne od samego koloru i dostęp do akcji przy przewijaniu.
- [ ] Zweryfikowano innych konsumentów zmienionego komponentu wspólnego. Zakres kontroli zapisano w raporcie zadania.
- [ ] Uruchomiono sprawdzenia odpowiednie do implementacji; zapisano wykonane komendy i faktyczne wyniki. Sama zmiana dokumentacji nie wymaga uruchamiania testów aplikacji.
- [ ] Zapisano zaakceptowany wzorzec, zrzuty/odnośniki, datę i decyzje; zaktualizowano status konkretnego W/D/F i etapu. Nowsze ustalenia jawnie zastępują starsze tylko w zmienionym zakresie.

## 8. Informacje potrzebne od właściciela produktu

Do wykonania tego spisu nie była potrzebna odpowiedź na poniższe pytania. Będą przydatne przed wyborem wariantu:

1. Która rola i które 2–3 czynności są teraz najważniejsze, oraz co konkretnie przeszkadza w obecnym UI? Z repo nie wynika rzeczywista częstotliwość pracy.
2. Jakie urządzenie i typowa liczba kursantów/zajęć dominują w codziennym użyciu? To pomoże ustalić gęstość i scenariusze porównania.
3. Czy ustalenia Satoshi + Cobalt/Graphite/Orange + oba motywy nadal obowiązują? Domyślnie kontynuować je; użytkownik musi doprecyzować tylko zmianę kierunku. Zachowanie roli ADMIN można doprecyzować osobno, jeżeli jest używana produktowo.

## 9. Jeden konkretny następny krok

**W07 `/manager/students` został zaakceptowany jako wykonany dla nowej rundy UI.** Na prośbę użytkownika wdrożono bezpośrednio jeden wariant do iteracji, zamiast przygotowywać dwie osobne makiety. Zaakceptowany kierunek należy teraz sprawdzić na W08 albo kolejnej liście administracyjnej.

Kryteria porównania: czytelność kursanta i kontaktu, widoczność szkoły/kursu, dostępność głównej akcji oraz akcji wiersza, uczciwe znaczenie liczników, liczba widocznych wierszy i wygoda użycia na telefonie. Warianty nie powinny różnić się zakresem funkcjonalnym; wyszukiwarka lub dodatkowe filtry wymagają osobnej decyzji produktowej.

## 10. W07 — wdrożony wariant CRM, 2026-09-09

Cel: manager ma szybko znaleźć kursanta na liście, odczytać kontakt, otworzyć profil lub przypisać kurs.

Problemy zaobserwowane w działającym widoku:

1. Cztery duże karty statystyk wypychały listę poniżej pierwszego ekranu.
2. Nagłówki „Kursanci” i „Lista kursantów” powtarzały tę samą informację.
3. Zagnieżdżone ramki i duży blok filtrów zajmowały miejsce potrzebne na rekordy.
4. Dwa obramowane przyciski w każdym wierszu konkurowały z danymi kursanta.
5. Zakres liczników PKK i aktywnych kursantów nie był dostatecznie czytelny: dotyczą bieżącej strony.

Wdrożenie: nagłówek z jednym głównym przyciskiem → wspólny panel szkoły i filtra kursu → cienki pasek liczników → tabela → paginacja. Nazwisko otwiera profil, PKK jest pod nazwiskiem, a przypisanie kursu pozostaje osobną akcją. Na telefonie tabela przechodzi w karty z pełnymi danymi i przyciskami. W porównanym widoku desktop tabela zaczyna się około 200 px wyżej. Zachowano font i paletę obecnego design systemu oraz routing ze `schoolId`, kontrakty API, formularze i uprawnienia. Dodano czyszczenie istniejącego filtra kursu oraz przycisk powrotu do wszystkich kursów w pustych wynikach. Opis rejestracji używa języka użytkownika zamiast nazw API.

Weryfikacja:

- `nuxi typecheck` — kod wyjścia 0.
- Vitest: 6 plików, 36 testów zaliczonych (`useManagerStudentsData`, `useManagerStudentsListActions`, `useManagerStudentsPageInit`, `useManagerStudentRegistration`, `useManagerStudentCourseAssignment`, `managerStudentFormDialog`).
- ESLint, Prettier i `git diff --check` dla zmiany.
- Przeglądarka: desktop, viewporty 390/960/1100 px, jasny i ciemny motyw; brak poziomego przepełnienia i uciętych akcji w sprawdzonych szerokościach.
- Sprawdzone: paginacja 20 + 1 rekord, ładowanie, pusty wynik kursu, czyszczenie filtra, otwarcie profilu z kontekstem OSK, walidacja pustego formularza, otwarcie i anulowanie dialogów oraz odblokowanie przypisania po wyborze kursu.
- Przykład wspólnej listy w design systemie: długie nazwisko, brak telefonu/PKK, nieaktywny status i wyłączone linki profilu.
- Nie wykonano rzeczywistej rejestracji ani przypisania kursanta w przeglądarce; obsługę zapisu pokrywają istniejące testy jednostkowe. Nie symulowano w przeglądarce awarii API i retry.
- Świeże wejście na listę na desktopie: brak ostrzeżeń i błędów konsoli. Podczas testów wystąpiły ostrzeżenia hydratacji w niezmienianym mobilnym sidebarze przy pełnym przeładowaniu oraz w kontrolkach daty strony design systemu; wymagają osobnej diagnozy.

Status: **zaakceptowany i odhaczony 2026-09-10**. Wzorzec zapisano w `UI_COMPONENT_PATTERNS.md`; można go przenosić na kolejne listy z uwzględnieniem różnic domenowych.

## 11. W07 — wyszukiwarka i szybkie filtry, 2026-09-09

Użytkownik zaakceptował obecny kierunek wizualny i odrzucił zmianę wyglądu na podstawie Dribbble. Zachowano układ, dodając kompaktowy pasek wyszukiwania i przyciski Wszyscy / Bez PKK / Bez kursu / Z zaległościami / Bez zaplanowanej jazdy. Po późniejszym dopięciu filtrów zaawansowanych i adaptera UI widok został odhaczony jako wykonany dla nowej rundy.

Plan następnej iteracji — opcjonalnego kreatora reguł `Pole → Warunek → Wartość`, działającego razem z obecnymi filtrami — znajduje się w [`STUDENT_ADVANCED_FILTERS_IMPLEMENTATION_PLAN.md`](./STUDENT_ADVANCED_FILTERS_IMPLEMENTATION_PLAN.md). Implementacja została rozpoczęta i wdrożona 2026-09-10; widok wymaga jeszcze oceny użytkownika oraz pełnej weryfikacji przeglądarkowej na zalogowanej sesji managera.

Wyszukiwanie obejmuje imię, nazwisko, e-mail, telefon i PKK, ignoruje wielkość liter i wymaga dopasowania każdego wpisanego słowa. Limit: 120 znaków; opóźnienie po wpisywaniu: 350 ms. Zmiana zapytania lub szybkiego filtra wraca na pierwszą stronę i unieważnia wcześniejsze żądanie. Filtry łączą się z wybraną szkołą i kursem. Wszyscy resetuje szybki filtr; przy pustym wyniku Wyczyść filtry usuwa także tekst i kurs.

Filtrowanie oraz zliczanie są wykonywane przez backend przed paginacją. Bez kursu oznacza brak przypisania do nieusuniętego kursu w wybranej OSK. Zaległości używają istniejącego modelu płatności kursów i daty UTC zgodnej z podsumowaniem płatności (termin dzisiejszy nie jest zaległością). Brak zaplanowanej jazdy oznacza brak przyszłej, nieusuniętej jazdy PRACTICE ze statusem SCHEDULED w tej OSK. Zmieniono FE, BFF i BE, bez migracji bazy.

Weryfikacja rozszerzenia: 45 testów FE i 12 testów BE (w tym kontrakty OpenAPI), kontrola typów FE/BE, ESLint oraz `git diff --check` przeszły. W przeglądarce sprawdzono pełne nazwisko (4 wyniki), wyszukiwanie e-maila osoby z drugiej strony (1 wynik), połączenie z Bez PKK (pusty wynik), reset, przełączanie wszystkich szybkich filtrów oraz mobile 390 px (brak przepełnienia, przyciski 44 px). Brak błędów konsoli w tej karcie. Dane demonstracyjne nie zawierały pozytywnego przykładu zaległości; warunek zaległości i granicę daty sprawdzono testem backendu. Nie zmieniano danych kursantów.

Iteracja 2026-09-10: aktywne reguły zaawansowane są prezentowane jako segmenty `Pole`, `Warunek`, `Wartość` bez znaków między segmentami. Kliknięcie treści reguły otwiera edycję, a osobny `×` usuwa regułę. Przy zmianie warunku edytor zachowuje wartość, jeśli nowy warunek nadal używa wartości tego samego typu; wartość jest czyszczona tylko przy przejściu na warunek bez wartości, np. `jest pusty` albo `nie ma kursu`. Szczegóły decyzji i testów są zapisane w [`STUDENT_ADVANCED_FILTERS_IMPLEMENTATION_PLAN.md`](./STUDENT_ADVANCED_FILTERS_IMPLEMENTATION_PLAN.md).

Iteracja reużywalności 2026-09-10: wspólna część UI filtrów została wydzielona do `AppAdvancedFilters` i `AppAdvancedFilterSegments`. Widok kursantów używa teraz adaptera `ManagerStudentsAdvancedFilters`, który dostarcza tylko reguły, segmenty i edytor właściwe dla kursantów. Ten sam shell można zastosować w kolejnych listach po przygotowaniu ich własnego adaptera domenowego.

## 12. Zasady przenoszenia wzorca W07 na kolejne widoki, 2026-09-10

Praktyczne reguły wynikające z `/manager/students` są zapisane w [`UI_COMPONENT_PATTERNS.md`](./UI_COMPONENT_PATTERNS.md), sekcja „Zasady przenoszenia W07 na kolejne widoki list”. Traktuj je jako start dla list takich jak W09 instruktorzy, W14 kursy, W05 pojazdy, W17 OSK, W21 opinie oraz W29/W30 widoki własne. Dla szczegółów, formularzy i harmonogramów użyj tych zasad tylko w zakresie wspólnej hierarchii, stanów i separacji odpowiedzialności; układ domenowy dopasuj do typu widoku.
