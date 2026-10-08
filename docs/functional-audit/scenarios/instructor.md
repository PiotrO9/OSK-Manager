# Scenariusze instruktora

Wykonuj na odizolowanym środowisku z prawdziwym backendem. Użyj konta `instructor-A` przypisanego do szkoły A; do porównań przygotuj też `instructor-B` i dane szkoły B. Daty testowych lekcji i wydarzeń wybierz względem dnia wykonania testu i zanotuj je w przebiegu. Wymagania `REQ-INS-*` są kandydatami do `requirements.md`. Lista źródeł wskazuje aktualny kod, który nie zastępuje decyzji o oczekiwanej regule biznesowej.

## INS-01 — Panel instruktora i skróty [P0]

- **Wymaganie:** `REQ-INS-01` — instruktor widzi podsumowanie własnej pracy i może przejść do terminarza oraz opinii.
- **Dane/warunki:** `instructor-A` z co najmniej jedną przyszłą jazdą i wydarzeniem; znane liczby pozycji na dziś i w najbliższych 14 dniach.
- **Kroki i wynik:** (1) Zaloguj się jako instruktor i otwórz `/`. Widoczne są „Mój terminarz”, „Moje opinie”, najbliższa pozycja i podsumowania. (2) Porównaj najbliższą pozycję oraz liczniki z przygotowanymi danymi. (3) Kliknij oba skróty. Otwierają odpowiednio `/my-lessons` i `/my-reviews`.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/components/dashboard/InstructorDashboardContent.vue`, `app/composables/dashboard/useRoleDashboardPage.ts`.

## INS-02 — Tygodniowy terminarz: lista, kalendarz i nawigacja [P0]

- **Wymaganie:** `REQ-INS-02` — instruktor widzi swoje jazdy i wydarzenia w wybranym tygodniu.
- **Dane/warunki:** w tygodniu T znana jazda z kursantem i wydarzenie instruktora, w T+1 inna pozycja; osobny instruktor ma pozycję o tej samej godzinie.
- **Kroki i wynik:** (1) Otwórz `/my-lessons`; ustaw tydzień T. W kalendarzu są tylko pozycje `instructor-A` z poprawnymi datami i godzinami. (2) Przełącz „Lista”. Widoczne są te same pozycje, pogrupowane według dnia; jazda pokazuje kursanta, wydarzenie typ i status. (3) Wybierz następny i poprzedni tydzień oraz „Dzisiaj”. Zakres dat i zawartość zmieniają się zgodnie z wybranym tygodniem. (4) Odśwież stronę i sprawdź brak cudzych pozycji.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/my-lessons.vue`, `app/composables/lessons/useMyLessonsPage.ts`, `app/components/student/schedule/MyLessonsSchedulePanel.vue`, `app/components/student/schedule/InstructorScheduleGroupedList.vue`, `BE/src/routes/schedule.routes.ts`.

## INS-03 — Pusty tydzień w terminarzu [P1]

- **Wymaganie:** `REQ-INS-02` — pusty zakres jest zrozumiały i nie pokazuje danych z poprzedniego tygodnia.
- **Dane/warunki:** tydzień bez pozycji dla `instructor-A` i sąsiedni tydzień z pozycją.
- **Kroki i wynik:** (1) Otwórz tydzień z pozycją, przełącz na „Lista”. (2) Przejdź do pustego tygodnia. Pojawia się „Brak lekcji” oraz informacja o braku lekcji i wydarzeń w tym tygodniu; poprzednie pozycje znikają. (3) Wróć do poprzedniego tygodnia. Pozycje wracają bez duplikatów.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/components/student/schedule/InstructorScheduleGroupedList.vue`, `app/composables/lessons/useMyLessonsPage.ts`.

## INS-04 — Zmiana statusu własnego wydarzenia [P0]

- **Wymaganie:** `REQ-INS-03` — instruktor może oznaczyć status własnego wydarzenia, a zmiana jest trwała.
- **Dane/warunki:** wydarzenie `E-A` o statusie „Zaplanowane”, przypisane do `instructor-A`; zanotowany pierwotny status.
- **Kroki i wynik:** (1) Na `/my-lessons` przełącz „Lista” i znajdź `E-A`. (2) Wybierz „Zrealizowane”. Podczas zapisu kontrolka jest zablokowana; potem pojawia się potwierdzenie i nowy status. (3) Odśwież stronę. Status pozostaje „Zrealizowane”. (4) Otwórz `/events` dla daty `E-A`. Wydarzenie ma ten sam status. (5) Sprawdź, że status jazdy jest wyświetlany jako etykieta, bez analogicznej kontrolki edycji w tym widoku.
- **Stan końcowy/powtórzenie:** przywróć „Zaplanowane” albo odtwórz wydarzenie testowe. Scenariusz zmienia dane.
- **Źródła:** `FE/OSK-Manager-FE/app/components/student/schedule/InstructorScheduleGroupedList.vue`, `app/composables/lessons/useMyLessonsEventStatus.ts`, `BE/src/routes/events.routes.ts`.
- **Do decyzji:** czy instruktor ma mieć prawo przejścia między wszystkimi statusami „Zaplanowane”, „Zrealizowane”, „Nie stawił się”, „Anulowane”, także po dacie wydarzenia; obecne UI pokazuje wszystkie opcje. Po rozstrzygnięciu dopisz przypadki niedozwolonych przejść.

## INS-05 — Wydarzenia dnia, daty i filtr statusu [P1]

- **Wymaganie:** `REQ-INS-04` — instruktor przegląda własne wydarzenia i jazdy dla wybranego dnia.
- **Dane/warunki:** dzień D z jazdą i wydarzeniami o różnych statusach; dzień D+1 bez wydarzeń; zanotowane oczekiwane pozycje.
- **Kroki i wynik:** (1) Otwórz `/events?date=<D>`; nagłówek „Moje wydarzenia” i plan dnia pokazują własne pozycje D z datą, godziną, typem i statusem. (2) Wybierz filtr jednego statusu. Zostają tylko pozycje o tym statusie, licznik odpowiada liście. (3) Przy braku dopasowań pojawia się „Brak wydarzeń dla wybranego statusu”; zmiana filtra przywraca listę. (4) Przejdź do D+1 przyciskiem dnia lub kalendarzem. Pojawia się „Brak wydarzeń w wybranym dniu”. (5) Użyj „Dzisiaj” i odśwież; wybrana data w adresie i widoku są zgodne.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/events/index.vue`, `app/composables/events/useEventsDayPage.ts`, `app/components/events/EventsDaySchedulePanel.vue`.

## INS-06 — Opinie o własnych lekcjach, filtr i anonimowość [P1]

- **Wymaganie:** `REQ-INS-05` — instruktor widzi własne oceny i anonimowe komentarze, z poprawnym podsumowaniem.
- **Dane/warunki:** `instructor-A` ma co najmniej dwie oceny w różnych terminach, `instructor-B` ma odrębną ocenę; znane oceny i daty, w tym jedna starsza niż 30 dni.
- **Kroki i wynik:** (1) Otwórz `/my-reviews`. Lista zawiera oceny `instructor-A`, ich termin i komentarz, jeśli został zapisany; nie zawiera danych identyfikujących autora ani opinii `instructor-B`. (2) Porównaj średnią i liczbę ocen z danymi. (3) Wybierz „Ostatni tydzień”, potem „Ostatni miesiąc”, następnie „Wszystkie”. Każda lista i podsumowanie odpowiada wybranemu okresowi; po zmianie filtra numer strony wraca do 1. (4) Dla okresu bez ocen widoczny jest komunikat o braku opinii.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/my-reviews.vue`, `app/components/instructor/reviews/MyReviewsList.vue`, `app/composables/lessons/useMyReviewsPage.ts`, `BE/src/routes/lesson-ratings.routes.ts`.

## INS-07 — Stronicowanie opinii [P2]

- **Wymaganie:** `REQ-INS-05` — lista opinii pozwala przejrzeć więcej niż jedną stronę bez pomijania i powtarzania wpisów.
- **Dane/warunki:** co najmniej 21 ocen dla `instructor-A` w filtrze „Wszystkie”; znane identyfikatory pierwszego i ostatniego wpisu. To duży zestaw danych i można oznaczyć przypadek jako zablokowany, dopóki nie istnieje jego przygotowanie.
- **Kroki i wynik:** (1) Otwórz `/my-reviews`. Widoczna jest strona 1 z maksymalnie 20 ocenami; „Poprzednia” jest niedostępna. (2) Wybierz „Następna”. Numer strony zmienia się na 2, pojawiają się dalsze oceny bez duplikatów z pierwszej strony. (3) Wróć na stronę 1. Zawartość odpowiada początkowej liście.
- **Stan końcowy/powtórzenie:** odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/lessons/useMyReviewsPage.ts`, `app/components/instructor/reviews/MyReviewsList.vue`.

## INS-08 — Błąd odczytu i ponowienie [P1]

- **Wymaganie:** `REQ-INS-06` — błąd pobrania danych jest widoczny i można ponowić próbę.
- **Dane/warunki:** środowisko testowe z kontrolowanym chwilowym błędem odpowiedzi dla odczytu opinii albo wydarzeń; nie przerywaj działania wspólnej bazy.
- **Kroki i wynik:** (1) Wywołaj błąd pojedynczego odczytu i otwórz `/my-reviews` albo `/events`. Widać komunikat błędu, bez prezentowania starych danych jako bieżących. (2) Przywróć odpowiedź i wybierz „Spróbuj ponownie”/„Odśwież”. Właściwe dane pojawiają się bez ponownego logowania. (3) Powtórz przy wąskiej szerokości ekranu, jeśli błąd wystąpił w widoku mobilnym.
- **Stan końcowy/powtórzenie:** usuń wymuszenie błędu; bez resetu rekordów.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/lessons/useMyReviewsPage.ts`, `app/composables/events/useEventsDayPage.ts`, `app/components/events/EventsDaySchedulePanel.vue`.
- **Uwaga:** dla `/my-lessons` implementacja pokazuje błąd, ale bez przycisku ponowienia; odświeżenie strony jest bieżącą drogą retry. Nie łącz tych zachowań w jeden wynik.

## INS-09 — Własność danych i uprawnienia do operacji menedżera [P0]

- **Wymaganie:** `REQ-INS-07` — instruktor nie może modyfikować cudzych wydarzeń ani zasobów zastrzeżonych dla menedżera.
- **Dane/warunki:** `instructor-A`, `instructor-B`, wydarzenie każdego z nich oraz szkoła A; identyfikatory testowe, bez danych produkcyjnych.
- **Kroki i wynik:** (1) Jako `instructor-A` otwórz `/events` i `/my-lessons`; nie widać wydarzenia `instructor-B`. (2) Otwórz URL formularza menedżera, np. `/manager/instructors` lub `/manager/schedule`; nie otrzymujesz dostępu do danych ani edycji. (3) W narzędziach do testów API spróbuj zmienić status wydarzenia `instructor-B` tokenem `instructor-A` i ponownie odczytaj je jako `instructor-B`. Żądanie jest odrzucone, pierwotny status pozostaje. (4) Spróbuj operacji tworzenia wydarzenia menedżerskiego tokenem instruktora; żądanie jest odrzucone.
- **Stan końcowy/powtórzenie:** tylko odrzucone zapisy; bez resetu. Jeśli jakikolwiek zapis się udał, przywróć stan i wpisz błąd P0.
- **Źródła:** `FE/OSK-Manager-FE/app/middleware/manager-or-instructor.ts`, `app/middleware/instructor.ts`, `BE/src/routes/events.routes.ts`, `BE/src/middleware/auth.middleware.ts`.

## INS-10 — Nieudany zapis statusu wydarzenia [P1]

- **Wymaganie:** `REQ-INS-03` — niepowodzenie zmiany statusu nie zostawia w interfejsie fałszywego stanu.
- **Dane/warunki:** własne wydarzenie `E-A` o znanym statusie; kontrolowany jednorazowy błąd żądania `PATCH /api/events/bulk-status` w środowisku testowym.
- **Kroki i wynik:** (1) Otwórz `E-A` w liście `/my-lessons`; wymuś błąd najbliższego zapisu. (2) Wybierz inny status. Pojawia się komunikat o nieudanej zmianie; po zakończeniu żądania kontrolka wraca do poprzedniego statusu. (3) Usuń wymuszenie błędu, odśwież i sprawdź ten sam pierwotny status. (4) Ponów zmianę. Nowy status zapisuje się dokładnie raz i pozostaje po odświeżeniu.
- **Stan końcowy/powtórzenie:** przywróć status początkowy lub odtwórz wydarzenie. Scenariusz zmienia dane dopiero przy udanym ponowieniu.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/lessons/useMyLessonsEventStatus.ts`, `BE/src/routes/events.routes.ts`.

## INS-11 — Praca instruktora na wąskim ekranie [P2]

- **Wymaganie:** `REQ-INS-08` — podstawowe widoki instruktora pozwalają wykonać zadanie na telefonie.
- **Dane/warunki:** te same dane co w `INS-02`, `INS-04`, `INS-05`, `INS-06`; przeglądarka o szerokości 375–390 px.
- **Kroki i wynik:** (1) Zaloguj się jako instruktor, otwórz nawigację i przejdź do `/my-lessons`, `/events`, `/my-reviews` oraz `/account`. Każda strona ma czytelny nagłówek i dostępne kontrolki bez poziomego przewijania całej strony. (2) W `/my-lessons` przełącz listę i kalendarz, wybierz inny tydzień. Pozycje nadal mają czytelną datę i godzinę. (3) W `/events` wybierz dzień i filtr statusu. (4) W `/my-reviews` zmień okres. (5) Na `/account` rozpocznij edycję telefonu i anuluj. Żadna kontrolka nie zasłania przycisku potrzebnego do zakończenia czynności.
- **Stan końcowy/powtórzenie:** brak zapisu; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/components/student/schedule/MyLessonsSchedulePanel.vue`, `app/components/events/EventsDaySchedulePanel.vue`, `app/components/instructor/reviews/MyReviewsList.vue`, `app/pages/account/index.vue`.
