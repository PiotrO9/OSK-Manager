# Scenariusze manualne: kursant

Stan odniesienia: przegląd kodu FE i BE z 2026-10-08. Scenariusze opisują widoczne zachowanie aktualnej aplikacji; żaden nie został tu wykonany. Testuj na osobnej bazie i zapisuj wynik w `../runs/`, a problem w `../findings.md`. `P0` oznacza podstawową ścieżkę odbiorową, `P1` ważny wariant, `P2` uzupełnienie. Identyfikatory `REQ-STU-*` są propozycją do wpisania w `../requirements.md`.

## Dane i sposób wykonania

- `student-empty`: aktywne konto kursanta bez przypisanych kursów i opłat.
- `student-course-mix`: kursant z aktywnym kursem praktycznym, ukończonym kursem oraz kursem teoretycznym; znane nazwy, statusy i liczby godzin.
- `booking-ready`: aktywny kurs praktyczny lub dodatkowy z wolnymi godzinami, instruktor uprawniony do typu kursu, pojazd i wolny termin w dniu pracy szkoły, w przyszłości i w dozwolonym oknie rezerwacji. Zanotuj dokładnie kurs, datę, godzinę, instruktora i długość slotu.
- `booking-hours-low`: aktywny kurs praktyczny, w którym suma nieanulowanych jazd pozostawia mniej godzin niż długość dostępnego slotu; zapisz osobno procent ukończenia zwracany przez API.
- `booking-hours-zero`: aktywny kurs praktyczny, którego wszystkie godziny są już zajęte przez jazdy nieanulowane; zapisz osobno procent ukończenia zwracany przez API.
- `student-schedule`: przyszła zaplanowana jazda praktyczna, zakończona jazda praktyczna bez oceny, zakończona jazda z oceną oraz zajęcia teoretyczne w znanych tygodniach.
- `student-payments`: opłata opłacona, nieopłacona przed terminem i zaległa, każda z rozpoznawalną kwotą i kursem.

Nazwy zestawów są wymaganiami dla przyszłego seeda, nie nazwami istniejących presetów. Tam, gdzie scenariusz potrzebuje błędu sieci lub wyścigu o slot, tester może użyć kontrolowanej blokady odpowiedzi w przeglądarce albo drugiego konta; nie zmieniaj produkcyjnych danych. Dla każdego przypadku zanotuj wersję FE/BE, identyfikator zestawu, datę, wynik `OK / błąd / zablokowane` i dowód. Potwierdzaj trwałość po odświeżeniu strony.

## Pulpit i kursy

### STU-01 — Pulpit kursanta pokazuje jego najważniejsze dane [P0]

- Wymagania: `REQ-STU-DASH`.
- Dane: `student-course-mix`, `student-schedule`, `student-payments`; zanotowane oczekiwane kurs, najbliższa pozycja i suma opłat.
- Kroki: (1) Zaloguj się jako kursant. (2) Otwórz `Pulpit`. (3) Odczytaj najbliższe zajęcia, postęp kursu, liczbę zajęć w najbliższych 14 dniach, kwotę „Do opłacenia” oraz sekcję szkół. (4) Przejdź z kafli do kursów, lekcji i opłat.
- Oczekiwane: wartości odpowiadają danym kursanta; kafle prowadzą do odpowiednich stron. Najbliższa pozycja i liczba zajęć dotyczą własnego harmonogramu. Po odświeżeniu dane pozostają spójne.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/components/dashboard/StudentDashboardContent.vue`, `FE/OSK-Manager-FE/app/pages/index.vue`.

### STU-02 — Kursy, postęp i filtry [P0]

- Wymagania: `REQ-STU-COURSES`.
- Dane: `student-course-mix` z co najmniej jednym kursem aktywnym i ukończonym.
- Kroki: (1) Otwórz `Moje kursy`. (2) Porównaj nazwy, typy, statusy oraz postęp i godziny z danymi zestawu. (3) Wybierz kolejno `Aktywne`, `Ukończone`, `Wszystkie`. (4) Odśwież stronę i użyj `Rezerwuj jazdę`.
- Oczekiwane: lista zawiera wyłącznie przypisane kursy; liczniki i wyniki filtrów zgadzają się z listą; postęp jest pokazany na właściwym kursie; przycisk otwiera `/book-lesson`.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/pages/my-courses.vue`, `app/composables/courses/useMyCoursesPage.ts`, `app/components/courses/MyCoursesList.vue` (ścieżki pod `FE/OSK-Manager-FE/`).

### STU-03 — Brak kursów oraz pusty wynik filtra [P1]

- Wymagania: `REQ-STU-COURSES`.
- Dane: `student-empty`; osobno `student-course-mix` z filtrem, którego wynik jest pusty.
- Kroki: (1) Na koncie bez kursów otwórz `Moje kursy`. (2) Na drugim koncie wybierz filtr bez wyników. (3) Kliknij `Pokaż wszystkie kursy`.
- Oczekiwane: pierwszy stan mówi „Brak przypisanych kursów”; drugi mówi „Brak kursów w tym widoku”, a przycisk przywraca listę wszystkich. Pusty widok nie pokazuje obcych kursów.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/composables/courses/useMyCoursesPage.ts`, `app/components/courses/MyCoursesList.vue`.

## Rezerwacja jazdy

### STU-04 — Rezerwacja dostępnego terminu [P0]

- Wymagania: `REQ-STU-BOOK`, `REQ-STU-SCHEDULE`.
- Dane: świeży `booking-ready` z dokładnie znanym slotem; konto kursanta z aktywnym uczestnictwem w kursie.
- Kroki: (1) Otwórz `Rezerwuj jazdę`. (2) Wybierz kurs. (3) Przejdź do tygodnia slotu strzałkami lub kalendarzem. (4) Wybierz slot i sprawdź w dialogu kurs, termin, czas, długość i instruktora. (5) Kliknij `Zarezerwuj jazdę`. (6) Otwórz `Moje lekcje` i właściwy tydzień. (7) Odśwież obie strony.
- Oczekiwane: po potwierdzeniu pojawia się komunikat z terminem i instruktorem; dokładnie jedna nowa zaplanowana jazda praktyczna jest widoczna w terminarzu i pozostaje po odświeżeniu. Zajęty slot znika z wolnych terminów lub nie daje się ponownie zarezerwować.
- Powtórzenie: przywróć `booking-ready` albo anuluj powstałą jazdę i upewnij się, że slot znów jest wolny.
- Źródła: `FE/OSK-Manager-FE/app/pages/book-lesson.vue`, `app/composables/lessons/useStudentLessonBookingPage.ts`, `app/components/student/lesson-booking/StudentLessonBookingConfirmDialog.vue`; `BE/src/services/lesson/bookingRules.ts`.

### STU-05 — Rezygnacja w dialogu potwierdzenia [P1]

- Wymagania: `REQ-STU-BOOK`.
- Dane: `booking-ready`.
- Kroki: (1) Wybierz slot. (2) W dialogu kliknij `Anuluj` lub zamknij dialog. (3) Sprawdź `Moje lekcje`; wróć do rezerwacji.
- Oczekiwane: nie powstaje jazda, a ten sam slot jest nadal dostępny.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingConfirmDialog.vue`, `app/composables/lessons/useStudentLessonBookingPage.ts`.

### STU-06 — Kurs nieuprawniony do rezerwacji [P0]

- Wymagania: `REQ-STU-BOOK-ELIGIBILITY`.
- Dane: `student-empty`, `booking-hours-zero`, oraz kurs teoretyczny lub nieaktywny ze `student-course-mix`.
- Kroki: (1) Otwórz `Rezerwuj jazdę` na każdym zestawie. (2) Sprawdź listę wyboru kursu i komunikat pustego stanu. (3) Przejdź do `Moje kursy`, aby potwierdzić statusy.
- Oczekiwane: można wybrać tylko aktywny kurs `PRACTICAL` lub `EXTRA` z dodatnimi pozostałymi godzinami. Brak takiego kursu powinien pokazać „Brak kursu do rezerwacji” albo „Wykorzystano dostępne godziny”, zależnie od danych. Nie można zarezerwować jazdy dla teorii, nieaktywnego uczestnictwa ani wyczerpanego pakietu. Znana rozbieżność obliczania godzin w FE wymaga odnotowania wyniku jako błędu, jeśli stan UI odbiega od rzeczywistego limitu BE (patrz niżej).
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts`; `BE/src/services/lesson/bookingAccess.ts`.

### STU-07 — Slot dłuższy niż pozostały pakiet [P1]

- Wymagania: `REQ-STU-BOOK-ELIGIBILITY`.
- Dane: `booking-hours-low`.
- Kroki: (1) Wybierz aktywny kurs. (2) Znajdź slot, którego długość przewyższa pozostałe godziny. (3) Spróbuj wybrać slot. (4) Sprawdź terminarz i postęp kursu.
- Oczekiwane: slot jest niedostępny do wyboru; próba nie tworzy rezerwacji; liczba godzin nie zmienia się. Jeśli interfejs dopuści kliknięcie, pokazuje komunikat o niewystarczających godzinach lub serwer odrzuca przekroczenie limitu. Porównaj wynik z sumą nieanulowanych jazd, nie z procentem postępu.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingSchedulePanel.vue`, `app/composables/lessons/useStudentLessonBookingPage.ts`; `BE/src/services/lesson/scheduleConflicts.ts`.

### STU-08 — Nawigacja tygodni, brak slotów i granice rezerwacji [P1]

- Wymagania: `REQ-STU-BOOK-WINDOW`.
- Dane: `booking-ready` oraz tydzień bez wolnych terminów; ustawienie szkoły `bookingMaxDaysAhead` zapisane w danych zestawu.
- Kroki: (1) Przejdź między tygodniami strzałkami i kalendarzem. (2) Otwórz tydzień bez slotów. (3) Spróbuj przejść do przeszłości i poza okno rezerwacji.
- Oczekiwane: zakres tygodnia i sloty aktualizują się zgodnie z wyborem; pusty tydzień pokazuje „Brak wolnych terminów w tym tygodniu”; przeszłość i daty poza dozwolonym oknem nie pozwalają utworzyć rezerwacji. Szkoła odrzuca także dzień poza ustawionymi dniami pracy.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/components/student/lesson-booking/StudentLessonBookingSchedulePanel.vue`, `app/composables/lessons/useStudentLessonBookingPage.ts`; `BE/src/services/lesson/bookingRules.ts`.

### STU-09 — Termin zajęty między wyświetleniem a potwierdzeniem [P1]

- Wymagania: `REQ-STU-BOOK-CONFLICT`.
- Dane: `booking-ready` oraz drugie uprawnione konto lub menedżer mogący zająć ten sam slot.
- Kroki: (1) Na koncie A otwórz dialog rezerwacji slotu. (2) Na koncie B zarezerwuj ten slot. (3) Na koncie A kliknij `Zarezerwuj jazdę`. (4) Odśwież terminarz A i B.
- Oczekiwane: rezerwacja A zostaje odrzucona komunikatem o niedostępnym/zajętym terminie; lista slotów jest aktualizowana; powstaje tylko rezerwacja B.
- Powtórzenie: przywróć `booking-ready`.
- Źródła: `FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts`; `BE/src/services/lesson/scheduleConflicts.ts`, `BE/src/services/lesson/bookingRules.ts`.

## Terminarz i anulowanie

### STU-10 — Własny harmonogram w kalendarzu i na liście [P0]

- Wymagania: `REQ-STU-SCHEDULE`.
- Dane: `student-schedule` z lekcjami praktycznymi i teorią w dwóch tygodniach.
- Kroki: (1) Otwórz `Moje lekcje`. (2) Sprawdź bieżący tydzień w `Kalendarz`. (3) Włącz `Lista`; użyj poprzedniego i następnego tygodnia oraz `Dzisiaj`. (4) Porównaj daty, godziny, typy, statusy, instruktora i pojazd z danymi zestawu. (5) Odśwież.
- Oczekiwane: oba widoki pokazują własne pozycje we właściwych tygodniach; lista grupuje je według dnia i pokazuje status. Brak danych w tygodniu daje pusty stan. Zmiana widoku nie zmienia danych.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/pages/my-lessons.vue`, `app/components/student/schedule/MyLessonsSchedulePanel.vue`, `app/components/student/schedule/StudentScheduleGroupedList.vue`, `app/composables/lessons/useMyLessonsPage.ts`.

### STU-11 — Anulowanie przyszłej jazdy [P0]

- Wymagania: `REQ-STU-CANCEL`.
- Dane: `student-schedule` z przyszłą jazdą praktyczną `SCHEDULED` należącą do kursanta.
- Kroki: (1) Otwórz `Moje lekcje` i przełącz na `Lista`. (2) Znajdź jazdę i kliknij `Anuluj`. (3) Sprawdź termin w dialogu. (4) Potwierdź. (5) Odśwież tydzień i sprawdź slot w rezerwacji.
- Oczekiwane: pokazuje się potwierdzenie, po zapisie komunikat powodzenia; pozycja ma status anulowany albo nie figuruje jako zaplanowana, a przy niej nie ma ponownie akcji `Anuluj`. Nie może powstać druga aktywna kopia tej samej jazdy.
- Powtórzenie: przywróć `student-schedule` lub utwórz nową przyszłą jazdę.
- Źródła: `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsCancellation.ts`, `app/components/student/schedule/StudentScheduleGroupedList.vue`; `BE/src/services/lesson/cancelLessons.ts`.

### STU-12 — Wyjście z dialogu anulowania i lekcje nieanulowalne [P1]

- Wymagania: `REQ-STU-CANCEL`.
- Dane: `student-schedule` z przyszłą jazdą, rozpoczętą lub przeszłą jazdą, jazdą `COMPLETED`/`CANCELLED` i pozycją teoretyczną.
- Kroki: (1) Otwórz anulowanie przyszłej jazdy, kliknij `Anuluj` w dialogu. (2) Sprawdź jej status. (3) Sprawdź akcje przy pozostałych pozycjach.
- Oczekiwane: zamknięcie dialogu zachowuje jazdę `SCHEDULED`; akcja anulowania występuje tylko przy własnej, przyszłej jazdzie praktycznej `SCHEDULED`. Rozpoczęta, zakończona, już anulowana i teoretyczna pozycja nie daje tej akcji.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/utils/schedule/studentScheduleGroupedList.ts`, `app/composables/lessons/useMyLessonsCancellation.ts`; `BE/src/services/lesson/cancelLessons.ts`.

## Opinie po jazdach

### STU-13 — Ocena zakończonej jazdy [P0]

- Wymagania: `REQ-STU-RATING`.
- Dane: `student-schedule` z własną zakończoną jazdą praktyczną bez oceny.
- Kroki: (1) W `Moje lekcje` przejdź do tygodnia jazdy. (2) W sekcji `Opinie po jazdach` wybierz `Do oceny`. (3) Wybierz ocenę 1–5, wpisz opcjonalny komentarz i kliknij `Dodaj opinię`. (4) Odśwież stronę i ponownie wybierz tę jazdę.
- Oczekiwane: jedna opinia zostaje zapisana; pozycja pokazuje ocenę `/5` i komentarz albo „Brak komentarza”; formularz dodania znika. Licznik lekcji do oceny zmniejsza się o jeden.
- Powtórzenie: przywróć jazdę bez oceny; ta sama jazda nie służy do ponownego pozytywnego testu.
- Źródła: `FE/OSK-Manager-FE/app/components/student/lesson-ratings/StudentLessonRatingsPanel.vue`, `app/components/student/lesson-ratings/StudentLessonRatingForm.vue`; `BE/src/services/lesson-rating/studentRatings.ts`.

### STU-14 — Walidacja i niedostępność ponownej oceny [P1]

- Wymagania: `REQ-STU-RATING`.
- Dane: `student-schedule` z jazdą zakończoną bez oceny, jazdą już ocenioną, jazdą przyszłą i teorią.
- Kroki: (1) Dla nieocenionej jazdy spróbuj wysłać pusty formularz. (2) Wybierz już ocenioną jazdę. (3) Sprawdź pozycję przyszłą i teorię.
- Oczekiwane: pusty formularz pokazuje „Wybierz ocenę od 1 do 5” i nic nie zapisuje; oceniona jazda pokazuje istniejącą opinię bez formularza; przyszła jazda i teoria nie pojawiają się na liście jazd do oceny. API nie dopuszcza drugiej opinii do tej samej jazdy.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/components/student/lesson-ratings/StudentLessonRatingsPanel.vue`, `app/components/student/lesson-ratings/StudentLessonRatingForm.vue`; `BE/src/services/lesson-rating/studentRatings.ts`.

## Opłaty i konto

### STU-15 — Własne opłaty, statusy i filtry [P0]

- Wymagania: `REQ-STU-PAYMENTS`.
- Dane: `student-payments` z opłatą `PAID`, `UNPAID` przed terminem i `UNPAID` po terminie.
- Kroki: (1) Otwórz `Moje opłaty`. (2) Porównaj nazwy kursów, kwoty, terminy, statusy i daty zapłaty z zestawem. (3) Wybierz `Do opłacenia`, `Wszystkie`, `Opłacone`. (4) Odśwież.
- Oczekiwane: w „Do opłacenia” są nieopłacone oraz zaległe, „Opłacone” zawiera tylko opłacone, a „Wszystkie” wszystkie własne pozycje; zaległa ma status „Zaległa”; liczniki i sumy odpowiadają danym. Kursant nie widzi opłat innej osoby.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/pages/my-payments.vue`, `app/composables/payments/useMyPaymentsPage.ts`, `app/utils/payments/myPaymentsPage.ts`, `app/components/student/payments/StudentPaymentsList.vue`.

### STU-16 — Brak opłat [P2]

- Wymagania: `REQ-STU-PAYMENTS`.
- Dane: `student-empty`.
- Kroki: (1) Otwórz `Moje opłaty`. (2) Przełącz wszystkie filtry.
- Oczekiwane: lista pokazuje „Brak opłat w tym widoku”, zera w licznikach i podsumowaniu; brak rekordów obcych kursantów.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/pages/my-payments.vue`, `app/composables/payments/useMyPaymentsPage.ts`.

### STU-17 — Numer PKK na koncie [P1]

- Wymagania: `REQ-STU-ACCOUNT`.
- Dane: kursant z numerem PKK; osobno kursant bez numeru.
- Kroki: (1) Otwórz `Konto` na obu kontach. (2) Sprawdź sekcję `Dane kursanta` i `Numer PKK`. (3) Odśwież.
- Oczekiwane: pierwsze konto widzi własny numer PKK; drugie widzi „Brak przypisanego PKK”. Widok nie oferuje edycji PKK kursantowi. Edycję wspólnych pól profilu obejmuje `scenarios/common.md`.
- Powtórzenie: odczyt; bez resetu.
- Źródła: `FE/OSK-Manager-FE/app/pages/account/index.vue`, `app/components/account/AccountStudentDataSection.vue`, `app/composables/account/useAccountPage.ts`.

### STU-18 — Błąd pobierania danych i ponowienie [P1]

- Wymagania: `REQ-STU-COURSES`, `REQ-STU-BOOK`, `REQ-STU-PAYMENTS`.
- Dane: `booking-ready` i `student-payments`; możliwość czasowego zablokowania pojedynczych odpowiedzi w przeglądarce testowej.
- Kroki: (1) Zablokuj pobranie własnych kursów i otwórz `Moje kursy`. (2) Odblokuj odpowiedź i użyj akcji ponowienia. (3) Powtórz dla pobrania slotów na `Rezerwuj jazdę` i dla `Moje opłaty`.
- Oczekiwane: każda strona pokazuje stan błędu bez fałszywych danych; ponowienie wczytuje aktualne dane. Błąd odczytu slotów nie tworzy rezerwacji.
- Powtórzenie: odblokuj odpowiedzi i odśwież; bez resetu bazy.
- Źródła: `FE/OSK-Manager-FE/app/pages/my-courses.vue`, `app/pages/book-lesson.vue`, `app/pages/my-payments.vue`, `app/composables/courses/useMyCoursesPage.ts`, `app/composables/lessons/useStudentLessonBookingPage.ts`, `app/composables/payments/useMyPaymentsPage.ts`.

### STU-19 — Rezerwacja i opłaty na wąskim ekranie [P2]

- Wymagania: `REQ-STU-MOBILE`.
- Dane: `booking-ready` i `student-payments`; przeglądarka o szerokości 375–390 px.
- Kroki: (1) Otwórz menu kursanta, `Rezerwuj jazdę` i wybór kursu. (2) Przejdź do następnego tygodnia, otwórz dialog potwierdzenia slotu i zamknij go bez zapisu. (3) Otwórz `Moje lekcje` i `Moje opłaty`; przełącz filtr opłat.
- Oczekiwane: wszystkie istotne pola, sloty, przyciski i kwoty są czytelne oraz dostępne bez poziomego przewijania całej strony; dialog i filtry działają. Zamknięcie dialogu nie tworzy jazdy.
- Powtórzenie: bez zmian danych.
- Źródła: `FE/OSK-Manager-FE/app/pages/book-lesson.vue`, `app/components/student/lesson-booking/StudentLessonBookingSchedulePanel.vue`, `app/pages/my-lessons.vue`, `app/pages/my-payments.vue`.

## Niejasności do rozstrzygnięcia przed oceną końcową

1. **Znana rozbieżność: procent używany jak liczba godzin.** BE `course/progress.ts` zwraca `progress` jako procent ukończonych jazd (0–100), a BE `lib/lesson-scheduling.ts` limituje sumę minut wszystkich nieanulowanych jazd. FE `useStudentLessonBookingPage.ts` i `utils/student/studentLessonBookingPage.ts` odejmują ten procent od `totalHours` jako „pozostałe godziny”. To może źle pokazać dostępny pakiet i blokować albo dopuszczać slot w UI. Przed odbiorem poprawić kontrakt/obliczenie i sprawdzić STU-04, STU-06 oraz STU-07; sam przegląd kodu nie jest wynikiem testu manualnego.
2. **Widoczność anulowanej jazdy po rezygnacji.** Interfejs pobiera ponownie tydzień; zależnie od API pozycja może pozostać ze statusem `CANCELLED` albo zniknąć z harmonogramu. Wymagany wynik biznesowy: nie może być aktywna. Przed odbiorem ustalić docelową prezentację. Źródło: `useMyLessonsCancellation.ts`, `BE/src/services/lesson/cancelLessons.ts`.
3. **Czy rezerwacja wymaga dodatkowej blokady przy nieopłaconym kursie?** Aktualnie sprawdzane są aktywny udział, typ kursu, godziny, termin i zasoby. Jeżeli opłata ma być warunkiem, to osobna decyzja produktowa i wymaganie. Źródło: `BE/src/services/lesson/bookingRules.ts`, `bookingAccess.ts`.
4. **Okno rezerwacji w UI i BE.** BE używa `schoolSettings.bookingMaxDaysAhead` (domyślnie 30) i dni pracy szkoły; potwierdź zgodność zakresu kalendarza FE z ustawieniem konkretnego OSK przed uznaniem STU-08 za zaliczony. Źródło: `BE/src/services/lesson/bookingRules.ts`, `FE/OSK-Manager-FE/app/utils/student/studentLessonBookingPage.ts`.
