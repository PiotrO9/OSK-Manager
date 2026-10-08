# Scenariusze wspólne: logowanie, konto i uprawnienia

Wykonuj na odizolowanym środowisku z rzeczywistym backendem. Zapisz wersję FE i BE, identyfikator zestawu danych oraz wynik każdego przypadku w przebiegu audytu. Dane logowania trzymaj poza repozytorium. Konta `manager-A`, `instructor-A`, `student-A` oznaczają trzy aktywne konta testowe; `manager-B` należy do innej szkoły. Wymagania `REQ-COM-*` mają wpisy w `requirements.md`; źródła niżej potwierdzają implementację, a nie wynik testu.

## COM-01 — Logowanie każdej roli i właściwa strona startowa [P0]

- **Wymaganie:** `REQ-COM-01` — aktywny użytkownik może rozpocząć sesję w swojej roli.
- **Dane/warunki:** aktywne konta `manager-A`, `instructor-A`, `student-A`; czysta sesja przeglądarki dla każdego przejścia.
- **Kroki i wynik:** (1) Otwórz `/login`, wpisz poprawne dane `manager-A`, wybierz „Zaloguj się”. Oczekuj strony startowej lub `/manager/osk`, jeśli menedżer nie ma domyślnej OSK; widoczna jest rola menedżera. (2) Wyloguj się i powtórz dla `instructor-A`. Oczekuj strony startowej z panelem instruktora, w tym odnośnikiem „Mój terminarz”. (3) Powtórz dla `student-A`. Oczekuj panelu kursanta. (4) Dla każdej roli odśwież stronę. Sesja i właściwy panel pozostają dostępne.
- **Stan końcowy/powtórzenie:** wyloguj ostatnie konto; bez zmian w danych biznesowych.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/auth/useLoginPage.ts`, `app/components/dashboard/InstructorDashboardContent.vue`, `BE/src/routes/auth.routes.ts`.

## COM-02 — Walidacja formularza i błędne dane logowania [P0]

- **Wymaganie:** `REQ-COM-02` — niepoprawne dane nie tworzą sesji, a formularz wskazuje przyczynę.
- **Dane/warunki:** wylogowana przeglądarka; znany adres konta testowego i celowo błędne hasło.
- **Kroki i wynik:** (1) Wyślij puste pola. Przy e-mailu widać „Podaj adres e-mail”, przy haśle „Podaj hasło”; użytkownik pozostaje na `/login`. (2) Wpisz `abc` i niepuste hasło, wyślij. Widać „Nieprawidłowy format e-mail”. (3) Wpisz poprawny adres i błędne hasło. Widać błąd logowania, nie powstaje dostęp do chronionej strony. (4) Popraw hasło i wyślij. Następuje poprawne logowanie bez konieczności przeładowania formularza.
- **Stan końcowy/powtórzenie:** wyloguj się. Nie wymaga resetu bazy.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/auth/useLoginPage.ts`, `app/components/auth/LoginForm.vue`.

## COM-03 — Powrót do żądanej strony po zalogowaniu [P1]

- **Wymaganie:** `REQ-COM-03` — po autoryzacji użytkownik wraca do dostępnej dla siebie strony.
- **Dane/warunki:** wylogowana przeglądarka; konto instruktora z dostępem do `/my-lessons`.
- **Kroki i wynik:** (1) Otwórz bezpośrednio `/my-lessons`. Następuje przekierowanie na `/login`. (2) Zaloguj się jako `instructor-A`. Otwiera się `/my-lessons`. (3) Odśwież stronę. Nadal widoczny jest terminarz instruktora. (4) Powtórz z adresem `/my-reviews`.
- **Stan końcowy/powtórzenie:** wyloguj się; bez zmian w bazie.
- **Źródła:** `FE/OSK-Manager-FE/app/middleware/auth.global.ts`, `app/composables/auth/useLoginPage.ts`, `app/composables/auth/useAuthReturnTo.ts`.

## COM-04 — Wylogowanie kończy dostęp do danych [P0]

- **Wymaganie:** `REQ-COM-04` — wylogowanie kończy sesję użytkownika.
- **Dane/warunki:** zalogowany `instructor-A` na `/my-lessons`.
- **Kroki i wynik:** (1) Wybierz „Wyloguj” w powłoce aplikacji. Otwiera się `/login`. (2) Spróbuj wejść przez historię przeglądarki na `/my-lessons` i odśwież stronę. Następuje przekierowanie do logowania; chronione dane nie są dostępne. (3) Zaloguj się ponownie; dostęp wraca tylko dla własnej roli.
- **Stan końcowy/powtórzenie:** wyloguj się; bez resetu bazy.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/auth/useLogout.ts`, `app/middleware/auth.global.ts`, `BE/src/routes/auth.routes.ts`.

## COM-05 — Dostęp według roli, również przez bezpośredni URL [P0]

- **Wymaganie:** `REQ-COM-05` — funkcje danej roli są niedostępne dla innych ról.
- **Dane/warunki:** aktywne konta każdej roli; osobna sesja dla każdej próby.
- **Kroki i wynik:** (1) Jako `student-A` otwórz `/my-reviews`, `/events` oraz `/manager/instructors`. (2) Jako `instructor-A` otwórz `/book-lesson` i `/manager/schedule`. (3) Jako `manager-A` otwórz `/my-reviews` i `/my-lessons`. W każdym przypadku niedozwolona strona nie pokazuje chronionych danych ani formularza zapisu; następuje przekierowanie na dozwoloną stronę lub czytelna odmowa. (4) Dla istotnych prób sprawdź w narzędziach przeglądarki, że chroniony API również odmawia dostępu, jeśli żądanie zostało wysłane.
- **Stan końcowy/powtórzenie:** bez zmian w bazie. Powtarzaj po każdej zmianie uprawnień.
- **Źródła:** `FE/OSK-Manager-FE/app/middleware/instructor.ts`, `app/middleware/manager-or-instructor.ts`, `app/middleware/student-or-instructor.ts`, `BE/src/routes/lesson-ratings.routes.ts`, `BE/src/routes/schedule.routes.ts`, `BE/src/middleware/auth.middleware.ts`.
- **Uwaga:** dokładny adres przekierowania zależy od konkretnego middleware; kryterium odbioru stanowi brak dostępu do danych i zapisu.

## COM-06 — Własny profil i edycja pól dostępnych dla roli [P1]

- **Wymaganie:** `REQ-COM-06` — użytkownik widzi własne dane, a edytowalne pola zapisują się trwale.
- **Dane/warunki:** osobno `manager-A`, `instructor-A`, `student-A`, konta nie będące sesją demo; zanotuj oryginalne wartości.
- **Kroki i wynik:** (1) Otwórz „Moje konto” (`/account`). Widoczne są dane zalogowanego użytkownika, nie poprzedniej sesji. (2) Dla menedżera wybierz „Edytuj”, zmień imię i nazwisko, zapisz. Po odświeżeniu widnieją nowe wartości. (3) Dla instruktora i kursanta osobno zmień telefon i opis, zapisz i odśwież. Nowe wartości są zachowane; imię i nazwisko nie są dostępne do edycji z tego formularza. (4) Zaloguj inne konto i sprawdź, że nie odziedziczyło zmian.
- **Stan końcowy/powtórzenie:** przywróć pierwotne wartości dla każdego konta lub odtwórz zestaw kont. Nie wpisuj prawdziwych danych osobowych.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/account/index.vue`, `app/composables/account/useAccountInlineProfileEdit.ts`, `BE/src/controllers/auth/profile.handlers.ts`.

## COM-07 — Niezapisane zmiany profilu [P1]

- **Wymaganie:** `REQ-COM-07` — przypadkowe opuszczenie edycji nie gubi zmian bez ostrzeżenia.
- **Dane/warunki:** dowolne konto z edytowalnym profilem; znana wartość początkowa.
- **Kroki i wynik:** (1) Otwórz edycję i zmień jedno pole bez zapisu. (2) Wybierz inną stronę lub „Anuluj”. Pojawia się potwierdzenie odrzucenia zmian. (3) Odmów. Edycja i wpisana wartość pozostają. (4) Ponów akcję, potwierdź odrzucenie. Po powrocie do profilu widoczna jest wartość początkowa. (5) Powtórz przy próbie odświeżenia karty.
- **Stan końcowy/powtórzenie:** brak zapisu i resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/account/index.vue`, `app/composables/account/useAccountInlineProfileEdit.ts`.

## COM-08 — Zdjęcie profilowe i walidacja pliku [P2]

- **Wymaganie:** `REQ-COM-08` — obsługiwane zdjęcie zapisuje się, a niepoprawne pliki są odrzucane.
- **Dane/warunki:** konto inne niż demo; mały plik PNG/JPEG/WebP, plik tekstowy i obraz większy niż 5 MB; brak danych wrażliwych na zdjęciu.
- **Kroki i wynik:** (1) Na `/account` wybierz „Zmień zdjęcie” i poprawny plik. Po zapisie widoczny jest obraz; po odświeżeniu pozostaje. (2) Wybierz plik tekstowy. Pojawia się komunikat „Nieobsługiwany format”; poprzednie zdjęcie pozostaje. (3) Wybierz obraz >5 MB. Pojawia się „Plik za duży”; poprzednie zdjęcie pozostaje.
- **Stan końcowy/powtórzenie:** przywróć obraz testowy zgodny ze stanem bazowym; plik w storage może wymagać osobnego sprzątania.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/account/useAccountAvatarUpload.ts`, `app/components/account/AccountProfileAvatarSection.vue`, `BE/src/routes/auth.routes.ts`.

## COM-09 — Wygasła sesja [P1]

- **Wymaganie:** `REQ-COM-09` — po utracie sesji chronione dane nie pozostają dostępne.
- **Dane/warunki:** zalogowany `instructor-A` lub `student-A` w osobnej karcie oraz `manager-A` z dostępem do `/manager/accounts` w tej samej OSK; wyłącznie konta testowe.
- **Kroki i wynik:** (1) Otwórz chronioną stronę konta testowego. (2) W panelu menadżera zablokuj to konto. (3) W pierwszej karcie odśwież chronioną stronę i spróbuj pobrać dane przez API. FE wraca do logowania, a API odmawia dostępu; wcześniej otwarty token nie wystarcza. (4) Odblokuj konto z panelu menadżera. Stara sesja nadal nie odzyskuje dostępu; wymagane jest nowe logowanie.
- **Stan końcowy/powtórzenie:** konto odblokowane; wyloguj obie sesje. Nie używaj konta jedynego menadżera do unieważniania.
- **Źródła:** `FE/OSK-Manager-FE/app/middleware/auth.global.ts`, `FE/OSK-Manager-FE/app/pages/manager/accounts/index.vue`, `BE/src/services/managerAccounts.service.ts`, `BE/src/middleware/auth.middleware.ts`.

## COM-10 — Izolacja danych kont i OSK [P0]

- **Wymaganie:** `REQ-COM-10` — użytkownik widzi tylko dane przypisane do własnego konta i uprawnionej szkoły.
- **Dane/warunki:** dwie niezależne szkoły A/B z różnymi menedżerami, instruktorami i kursantami; rozpoznawalne nazwy testowe; żadna osoba nie jest przypisana do obu szkół.
- **Kroki i wynik:** (1) Zaloguj `instructor-A`, otwórz `/my-lessons`, `/events`, `/my-reviews`. Pozycje szkoły B nie występują. (2) Zaloguj `student-A`, otwórz `/my-lessons` i dostępne dla niego widoki. Dane B nie występują. (3) Jako `manager-A` użyj w URL identyfikatora szkoły B tam, gdzie widok przyjmuje `schoolId` (np. `/events?schoolId=<ID-B>`). Wgląd i zapisy dla B są odrzucone. (4) Powtórz po odświeżeniu; dane B nadal niewidoczne.
- **Stan końcowy/powtórzenie:** tylko odczyt; bez resetu.
- **Źródła:** `FE/OSK-Manager-FE/app/composables/events/useEventsDayPage.ts`, `BE/src/services/schedule/access.ts`, `BE/src/routes/schedule.routes.ts`, `BE/src/middleware/auth.middleware.ts`.
- **Uwaga:** jeśli jakakolwiek relacja między szkołami jest zamierzona, opisz ją w danych testowych przed oceną scenariusza.

## COM-11 — Samodzielne odzyskanie hasła [P0]

- **Wymaganie:** `REQ-COM-11` — aktywny użytkownik może ustawić nowe hasło przez link i odzyskać dostęp.
- **Dane/warunki:** aktywne testowe konto z działającą skrzynką e-mail i znanym hasłem początkowym; druga, zalogowana sesja tego samego konta. Skonfiguruj `FRONTEND_URL` i dostarczanie poczty w odizolowanym środowisku. Nie zapisuj linku ani tokenów w repozytorium.
- **Kroki i wynik:** (1) Na `/login` wybierz odzyskanie hasła, wpisz e-mail na `/forgot-password` i wyślij. UI pokazuje neutralne potwierdzenie wysłania. (2) Otwórz testową wiadomość i link `/reset-password`; wpisz dwukrotnie nowe hasło (min. 8 znaków), zatwierdź. (3) Stare hasło odrzucone, nowe pozwala zalogować się do właściwego panelu. (4) Odśwież wcześniej otwartą sesję: chronione dane są niedostępne, wymagane jest ponowne logowanie. (5) Ponowne użycie tego samego linku nie zmienia hasła.
- **Stan końcowy/powtórzenie:** przywróć hasło testowe przez nowy link lub odtwórz konto; wyloguj sesje.
- **Źródła:** `FE/OSK-Manager-FE/app/pages/forgot-password.vue`, `FE/OSK-Manager-FE/app/pages/reset-password.vue`, `BE/src/controllers/auth/recovery.handlers.ts`.

## COM-12 — Brak dostępu dla konta zablokowanego i zarchiwizowanego [P0]

- **Wymaganie:** `REQ-COM-12` — dezaktywacja konta odcina wszystkie drogi do chronionych danych.
- **Dane/warunki:** dwa osobne konta testowe kursanta/instruktora w OSK `manager-A`; jedno bez aktywnych zobowiązań do archiwizacji. Zanotuj identyfikatory i wcześniejsze sesje.
- **Kroki i wynik:** (1) Jako menadżer zablokuj pierwsze konto na `/manager/accounts`. Logowanie tym kontem, odświeżenie istniejącej sesji i żądanie API z poprzednim tokenem są odrzucone. (2) Odblokuj je; stare sesje nadal nie działają, ale nowe logowanie się udaje. (3) Zarchiwizuj drugie konto przez panel. Próby logowania, odświeżenia i użycia poprzedniego tokenu nadal są odrzucane; konto pozostaje oznaczone jako archiwalne.
- **Stan końcowy/powtórzenie:** pierwsze konto odblokowane, drugie trwale archiwalne w tym panelu; odtwórz drugie konto świeżym testowym e-mailem na następny przebieg.
- **Źródła:** `BE/src/controllers/auth/session.handlers.ts`, `BE/src/middleware/auth.middleware.ts`, `BE/src/services/managerAccounts.service.ts`, `FE/OSK-Manager-FE/app/components/manager/accounts/ManagerAccountEditor.vue`.

## COM-13 — Dane logowania przed uruchomieniem JavaScript [P0]

- **Wymaganie:** `REQ-COM-13` — hasło nie trafia do adresu URL ani historii przeglądarki, gdy kod klienta jeszcze się ładuje lub jest niedostępny.
- **Dane/warunki:** wylogowana przeglądarka, testowe dane logowania; zablokuj ładowanie skryptów aplikacji w narzędziach przeglądarki.
- **Kroki i wynik:** (1) Otwórz `/login`, wpisz testowy e-mail i hasło. Przycisk „Zaloguj się” pozostaje nieaktywny przed hydracją. (2) Spróbuj wysłać formularz. Adres nadal ma postać `/login`, bez parametrów `email` i `password`; żądanie GET z tymi danymi nie jest wysyłane. (3) Przywróć skrypty, odśwież stronę i zaloguj się zwykłym sposobem. Logowanie działa.
- **Stan końcowy/powtórzenie:** wyloguj się; bez zmian w danych biznesowych.
- **Źródła:** `FE/OSK-Manager-FE/app/components/auth/LoginForm.vue`, `FE/OSK-Manager-FE/e2e/specs/ui/auth-session.spec.ts`.
