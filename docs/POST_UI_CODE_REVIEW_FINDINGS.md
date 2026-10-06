# Przegląd kodu po UI refresh — ustalenia

Data: 2026-10-06. Stan kodu i pokrycie: [zakres](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_CODE_REVIEW_SCOPE.md). Kolejność prac: [plan](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/docs/POST_UI_REFACTOR_PLAN.md).

## Kryterium kwalifikacji

Problem musi mieć dowód w kodzie, konkretny koszt oraz minimalną zmianę, której korzyść uzasadnia ryzyko. Wielkość pliku, preferencja stylistyczna i sama możliwość zastosowania abstrakcji nie wystarczają. Naprawy błędów są rozdzielone od refaktorów zachowujących zachowanie.

## Wniosek

Nie ma obecnie uzasadnienia dla dużej przebudowy architektury. Rekomendowane są **dwa ograniczone refaktory**, osobna seria napraw konkretnych błędów i uporządkowanie istniejącej bramki jakości. Pozostałe pomysły są odłożone albo odrzucone.

„Historyczny” oznacza, że problemu nie należy przypisywać wdrożeniu UI. Reprodukcje lokalne wykorzystywały aktualne funkcje i kontrolowane zależności; nie dowodzą incydentu na produkcji ani działania rzeczywistej bazy. Koszt **mały** oznacza lokalną zmianę i kilka scenariuszy, **średni** — wielu konsumentów lub testy integracji. Ryzyko dotyczy proponowanej zmiany, a nie wagi problemu.

## Refaktory zachowujące zachowanie

### REF-01 — usunąć nieaktywny mechanizm freeWindows z W19

**Warto teraz. Koszt mały/średni, ryzyko średnie.**

Dowód: [useManagerEventEditForm.ts:43](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditForm.ts:43) ustawia prywatne `freeWindows=[]` i `freeWindowsUnavailable=false`, których nie aktualizuje. Przekazuje je do time picker/split, zawierających nieaktywne ograniczanie godzin. [useManagerEventEditTimeSplit.ts:38](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/events/useManagerEventEditTimeSplit.ts:38) uzależnia te gałęzie od niepustych windows. `useManagerEventSlots` nie ma odnalezionego konsumenta produkcyjnego, również po uwzględnieniu autoimportów Nuxt.

Koszt obecnego stanu: trzeba rozumieć dwa mechanizmy ograniczeń, choć działa availability-options. Część testów utrwala porzucony wariant. Minimalna zmiana: usunąć martwy tor i composable, uprościć argumenty pomocników. Zachować podział daty/godziny, hydratację, domyślny koniec, options, fallback i PATCH. Nie usuwać używanej funkcji domyślnego końca wyłącznie z powodu jej lokalizacji w starym utility.

Odbiór: najpierw testy charakteryzujące formularz dla options success/empty/error, zmiany daty/godziny, zachowania istniejącego terminu i zapisu. Dopiero potem usunięcie testów nieaktywnego wariantu. Konsument W19; pochodzenie FE `eee74e4`, dalsze zmiany `b803f5b` — powiązanie z wdrażaniem UI i nowej dostępności potwierdzone kodem.

### REF-02 — współdzielić domenowy odczyt aktywnego profilu kursanta

**Warto teraz po zabezpieczeniu kontraktów. Koszt mały, ryzyko średnie.**

Dowód: [profileMutations.ts:27](D:/CODE/OSK-Manager/BE/src/services/students/profileMutations.ts:27), ponownie przy PKK i notatkach, powiela projekcję i sekwencję walidacji z [courseParticipants.ts:9](D:/CODE/OSK-Manager/BE/src/services/students/courseParticipants.ts:9). Reguła jest utrzymywana w czterech miejscach używanych przez pięć operacji.

Minimalna zmiana: wydzielić istniejący `loadActiveStudentProfileId` do lokalnego modułu domeny. Zachować kolejność: brak/usunięty użytkownik → 404, nieaktywny → 403, zła rola/brak profilu → 400. Nie łączyć autoryzacji: ADMIN jest celowo dopuszczony tylko do części operacji. Nie mylić userId i studentProfileId.

Odbiór: błędy, identyfikacja i role dla notatek, PKK, przypisania OSK, przypisania kursu i statusu uczestnika; niezmienione komunikaty/odpowiedzi. Historyczne, m.in. BE `7df69de1`, bez bezpośredniej przyczyny w UI. Zakres to mały helper, bez ogólnego repozytorium CRUD.

## Naprawy błędów — osobny zakres

### BUG-01 — ponowny wybór zdjęcia pojazdu usuwa nowy plik

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: kod, headless Chromium z natywnym inputem i niezależna kontrola.**

[useVehicleEditPage.ts:152](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/vehicles/useVehicleEditPage.ts:152) resetuje zapamiętany input przed odczytaniem jego `files[0]`. Drugi wybór na tym samym elemencie kasuje nowy FileList. Reprodukcja: pierwszy plik → pending=true; drugi → pending=false, files=0 i „Nie wybrano pliku”. API zastąpiono atrapą.

Odczytać File przed resetem albo oddzielić sprzątanie preview od resetu kontrolki. Zachować revokeObjectURL, MIME, limit 5 MB, clear i retry. Testować drugi wybór, invalid→valid, ten sam plik i ponowienie uploadu. Obiekt testowy z niezależnymi `value`/`files` ukrywa usterkę. W25; regresja w FE `5dbc4ac`.

### BUG-02 — PATCH instruktora zastępuje pełne szczegóły niepełną odpowiedzią

**Warto teraz. Koszt mały, ryzyko niskie/średnie. Potwierdzenie: wykonanie normalizera na rzeczywistym kształcie kontraktu i niezależna kontrola.**

[useManagerInstructorDetailsEdit.ts:108](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/instructors/useManagerInstructorDetailsEdit.ts:108) zachowuje po zapisie tylko schoolId/avatarUrl. [commandHelpers.ts:122](D:/CODE/OSK-Manager/BE/src/services/instructor/commandHelpers.ts:122) nie zwraca phone/licenseNumber obecnych w GET. Normalizer zmienia je na „—”; nie oznacza to utraty danych w bazie. Fixture sukcesu zwraca bogatszy payload niż backend.

Jawnie adaptować PATCH i zachować pola dostępne tylko w GET albo odświeżyć detail. Nie scalać bezmyślnie `{...oldDetail,...patch}`: stary `name`/`experience` ma pierwszeństwo w normalizerze i może ukryć nowe dane. Testować rzeczywisty payload, zmianę imienia/doświadczenia, zachowanie telefonu/licencji, null i nieudany zapis. W10; historyczny FE `123c8d4`, późniejsze poprawki schoolId/avatar nie domknęły kontraktu.

W tym samym zadaniu poprawić wąski mock kontraktu: [mockInstructorsList.ts:157](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/instructors/mockInstructorsList.ts:157) zwraca kopię wiersza, którą mutuje PATCH, po czym ponownie odczytuje niezmieniony oryginał. Lokalna reprodukcja: zmienione imię/nazwisko pozostają stare w odpowiedzi i kolejnym GET. Mock dodatkowo zwraca pełny detail zamiast produkcyjnego partial PATCH. Regresja kopii pochodzi z UI/kontekstu szkoły FE `2b80645`. Naprawić zapis do store i fixture kontraktową, bez przebudowy wszystkich mocków.

Przed mutacją store zweryfikować wszystkie pola. Samo zastąpienie kopii referencją wprowadziłoby częściowy zapis: obecny kod zmienia nazwę przed sprawdzeniem qualifiedCourseTypeId. Test mieszanego PATCH z nowym nazwiskiem i nieznanym qualifiedCourseTypeId musi potwierdzić odrzucenie całej operacji bez zmiany store.

### BUG-03 — pulpit liczy statystyki z pierwszych 20 opinii

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: kontrolowane wykonanie i niezależna kontrola.**

[useRoleDashboardPage.ts:69](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/dashboard/useRoleDashboardPage.ts:69) liczy średnią z ratings, pomijając summary odpowiedzi. [RoleDashboardContent.vue:34](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/dashboard/RoleDashboardContent.vue:34) bierze długość tej strony. API domyślnie pobiera 20 rekordów, a BE już zwraca podsumowanie całości. Reprodukcja: 20 ocen po 5, summary average=3.2 i total=60 → dashboard pokazuje 5 i 20.

Użyć summary, bez pobierania wszystkich stron/nowego endpointu. Test: >20 opinii, różna średnia strony/całości, brak ocen, błąd/retry. W01/W30; styk FE `d7b1867` i paginacji `5499235`, powiązany z aktualizacjami UI.

### BUG-04 — błąd dodania płatności powoduje utratę szkicu

**Warto teraz. Koszt mały, ryzyko średnie. Potwierdzenie: wykonanie setup SFC i niezależna kontrola.**

[ManagerStudentPaymentsSection.vue:97](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/components/manager/students/ManagerStudentPaymentsSection.vue:97) zeruje kwotę, termin i metodę zaraz po emit. [useManagerStudentPayments.ts:138](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/students/useManagerStudentPayments.ts:138) obsługuje request asynchronicznie. Nie ma potwierdzenia sukcesu dla komponentu; przy błędzie formularz zostaje pusty.

Reset dopiero po jawnym sukcesie, prostym mechanizmem dopasowanym do obecnej kompozycji. Test błędu zachowującego dane, pojedynczego resetu po sukcesie i retry; sprawdzić W08 i T01. Historyczny FE `ef674933`, przed UI refresh.

### BUG-05 — watcher przerywa ręczny preflight rezerwacji

**Warto teraz. Koszt średni, ryzyko średnie. Potwierdzenie: rzeczywisty helper, reaktywność Vue i fetcher obsługujący abort.**

[useStudentLessonBookingPage.ts:413](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useStudentLessonBookingPage.ts:413) ustawia candidate i natychmiast wywołuje recheck. Watcher w [useDebouncedAbortableRequest.ts:84](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/schedule/useDebouncedAbortableRequest.ts:84) anuluje ręczne execute. Zwracany jest loading/checking zamiast rozstrzygnięcia; POST blokuje tylko unavailable. **Backend nadal waliduje rezerwację; nie wykazano podwójnej rezerwacji.**

Ustalić pierwszeństwo ręcznego execute albo skoordynować zmianę candidate w konsumencie. Samo auto:false nie usuwa anulowania. Test candidate+recheck w jednym ticku na prawdziwym helperze, unavailable bez POST, zmiany candidate, abort/cleanup. Zachować przyjęty fallback przy rzeczywistej niedostępności preflight. W27 i pozostali konsumenci helpera; FE `eee74e4`, W27 `b6cf2ae`/`ec4e6fc`.

### BUG-06 — anulowane wydarzenie nadal blokuje dostępność

**Warto teraz. Koszt mały/średni, ryzyko średnie. Potwierdzenie ścieżki kursanta: kod i dwa niezależne wykonania z query stubem; bez DB.**

[lesson-scheduling.ts:59](D:/CODE/OSK-Manager/BE/src/lib/lesson-scheduling.ts:59) szuka eventParticipant z nakładającym się eventem bez filtrów isActive/status. Usunięcie ustawia isActive=false, anulowanie status=CANCELLED; participants pozostają dla historii. Oba warianty nadal powodują 409. Inne walidatory wydarzeń prawidłowo filtrują te pola.

Drugi potwierdzony wariant: [vehicle/queries.ts:60](D:/CODE/OSK-Manager/BE/src/services/vehicle/queries.ts:60) uwzględnia isActive, lecz pomija status. Anulowany DRIVE usuwa auto z listy wolnych, chociaż właściwy zapis rezerwacji w vehicleAvailability prawidłowo ignoruje CANCELLED. Konsument useLessonBookingApi przekazuje availableVehicleIds do selektora, który blokuje wybór. Reprodukcja aktualnych funkcji z atrapą DB: pusta lista wolnych aut, a vehicleHasBookingConflict=false dla tego samego anulowanego wydarzenia; koordynator sprawdził oba zapytania i konsumenta. Historyczne BE `dbbecaed`.

Uzgodnić warunki „blokujące wydarzenie” z istniejącą regułą i dodać brakujące filtry w obu ścieżkach. Zachować historię uczestników. Test z uczestnikiem teorii i osobny test samochodu dla PLANNED / isActive=false / CANCELLED oraz stykających się przedziałów. Wcześniejsze testy DRIVE bez participant nie zabezpieczają ścieżki kursanta (historyczny BE `fc8936d`). Nie budować ogólnego silnika konfliktów przy okazji dwóch brakujących predykatów.

### BUG-07 — zajętość UTC porównywana ze slotami czasu polskiego

**Warto teraz. Koszt średni, ryzyko średnie. Potwierdzenie: aktualne funkcje z atrapą DB i niezależna kontrola.**

[busyLessons.ts:41](D:/CODE/OSK-Manager/BE/src/services/school-availability/busyLessons.ts:41) używa UTCHours, sloty windows są w czasie polskim. Lekcja 2026-10-06 08:00–09:00Z daje 480–540, a odpowiada slotowi 10:00–11:00, czyli 600–660. Porównanie nie wyklucza tego slotu, szczególnie u innego instruktora. Zakres pobierania lekcji także używa granic dnia UTC.

W tej ścieżce użyć istniejących konwersji polishScheduleTime i granic polskiego dnia. Testy: lato/zima, północ, DST, stykające się przedziały, drugi instruktor. Nie zastępować wszystkich operacji UTC — SQL DATE/TIME mają odrębną semantykę. Stary busyLessons BE `dbbecae`; luka w połączeniu z migracją windows w `d6b423f`.

### BUG-08 — alert braku dostępności ignoruje domyślny tydzień

**Kolejna partia napraw. Koszt mały/średni, ryzyko średnie. Potwierdzenie statyczne; bez DB/E2E.**

[manager-attention/items.ts:278](D:/CODE/OSK-Manager/BE/src/services/manager-attention/items.ts:278) ocenia brak datowanych workingHours. [windows.ts:95](D:/CODE/OSK-Manager/BE/src/services/instructor-availability/windows.ts:95) stosuje fallback do instructorWorkingHoursDefault. Instruktor z samym domyślnym tygodniem może dostać fałszywy alert.

Uwzględnić oba źródła konfiguracji. Nie zmieniać znaczenia na „wszystkie terminy zajęte” ani uruchamiać generatora slotów dla wszystkich. Test: defaults only, datowane only, brak obu, urlop, sortowanie/limit10/hiddenCount. Historyczne, m.in. BE `058a423`/`17062a0`.

### BUG-09 — edycja instruktora nie jest atomowa

**Naprawa niezawodności po teście awarii. Koszt średni, ryzyko średnie. Konstrukcja potwierdzona kodem; nie odtwarzano częściowego zapisu na DB.**

[instructor/commands.ts:87](D:/CODE/OSK-Manager/BE/src/services/instructor/commands.ts:87) zapisuje profil, użytkownika i kwalifikacje poza wspólną transakcją. Awaria późniejszego kroku może pozostawić wcześniejszy zapis mimo błędu endpointu.

Najpierw test wymuszonej awarii; potem objąć powiązane zapisy i odczyt wyniku transakcją. Zachować ownership, whitelistę, pustą aktualizację i kontrakt PATCH. Odbiór rollbacku wymaga izolowanej bazy; mock nie dowodzi atomowości. Historyczny BE `dbbecae`. Osobne zadanie od frontendowego BUG-02.

### BUG-10 — zmiana jednej granicy czasu lekcji generuje błędny PATCH

**Warto teraz. Koszt mały, ryzyko niskie. Potwierdzenie: oryginalny builder FE + oryginalny Zod BE w pamięci oraz kontrola koordynatora.**

[useManagerLessonEditForm.ts:130](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/app/composables/lessons/useManagerLessonEditForm.ts:130) niezależnie dodaje zmienione startTime/endTime. BFF przekazuje je, ale [lesson.schemas.ts:148](D:/CODE/OSK-Manager/BE/src/schemas/lesson.schemas.ts:148) wymaga pary. Wydłużenie 10:00–11:00 do 10:00–11:30 daje tylko endTime i błąd walidacji. Preflight używa pełnego okna i może wcześniej zaakceptować termin.

Przy zmianie dowolnej granicy wysłać obie. Zachować minimalny payload przy zmianie pojazdu/instruktora i brak zmian. Test każdej granicy osobno, obu i braku zmiany czasu oraz zgodności kontraktu BE. Bez nowego pakietu współdzielonego. W20; historyczne FE `3d466277` i BE `2d52f52a`.

## Jakość narzędzi i testów

### QUAL-01 — przywrócić przechodzącą bramkę formatowania

**Przed implementacją. Koszt mały, ryzyko niskie.** Zastany FE lint ma 13 błędów Prettier w pięciu plikach; BE format check wskazuje trzy pliki. Dokładna lista jest w mapie audytu. Sformatować tylko te pliki i sprawdzić diff, bez zmian całego repo i bez testów kosmetyki. Błędy istniały przed dokumentami audytu.

### QUAL-02 — spójny runtime deklaracji, CI i kontenerów

**Oddzielne zadanie narzędziowe. Koszt mały/średni, ryzyko średnie.** [FE package.json](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/package.json) wymaga Node >=24 <25; CI używa Node24, ale [FE Dockerfile](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/Dockerfile) i [BE Dockerfile](D:/CODE/OSK-Manager/BE/Dockerfile) używają 22.23. Wynik testów na24 nie potwierdza działania obrazu22. To niespójność konfiguracji, bez dowodu awarii produkcji.

Uzgodnić wersję zgodną z wymaganiami repo i sprawdzić oba buildy/start obrazów lokalnie. Bez publikacji, wdrożenia i zbiorczej aktualizacji zależności. FE Dockerfile sprzed bieżącego porównania (`ac14020`).

## Odłożone kandydatury

### LATER-01 — typowane powody błędów harmonogramu

**Po stabilizacji harmonogramu. Koszt średni, ryzyko średnie.** [check.ts:67](D:/CODE/OSK-Manager/BE/src/services/schedule-validation/check.ts:67) i dalsze mapowania opierają się na message/includes, m.in. „already in use”, „Student”, „package limit”. `options.ts` podobnie rozpoznaje zamknięty dzień szkoły. Zmiana tekstu może zmienić klasyfikację issue.

Jeśli realizowane: mały typ wewnętrznych powodów w tej domenie i mapper do istniejącego ScheduleAvailabilityIssue; zachowane status/payload/komunikaty HTTP. Najpierw testy każdego mapowania i błędów infrastruktury. Bez globalnego frameworka błędów. BE `d6b423f`; mniejszy priorytet niż odtworzone błędy.

### LATER-02 — dwa nieużywane dialogi konta

**Opcjonalne; mała korzyść. Koszt mały, ryzyko niskie.** AccountProfileNamesFormDialog i AccountProfileContactFormDialog nie mają odnalezionych konsumentów; konto korzysta z edycji inline. Przed usunięciem powtórzyć kontrolę autoimportów/dynamicznych odwołań. Wystarczy typecheck/build; bez testu „plik nie istnieje”.

Nie usuwać ManagerLessonRatingsFilters: wbrew starej notatce UI_REFRESH_PLAN jest obecnie używany przez manager/reviews. Historyczna lista nie jest aktualnym dowodem martwego kodu.

### LATER-03 — zgodność filtrów opinii w mock BFF

**Przy następnym zadaniu testowym opinii. Koszt mały/średni, ryzyko niskie dla produkcji.** [ratingsMockBff.ts](D:/CODE/OSK-Manager/FE/OSK-Manager-FE/server/utils/ratings/ratingsMockBff.ts) pomija period/dateFrom/dateTo managera. Własny mock dla last7days używa today-7 i tylko dolnej granicy; [BE dateFilters.ts](D:/CODE/OSK-Manager/BE/src/services/lesson-rating/dateFilters.ts) używa today-6 i <tomorrow. Reprodukcja managera: all i last7days zwracają te same czerwcowe rekordy w dniu audytu w październiku.

Deterministyczny czas/fixtures, zgodne granice i testy manager/own. Nie zmieniać przy okazji semantyki produkcyjnego last30days ani tworzyć wspólnego pakietu. To luka wiarygodności testów, nie wykazany błąd produkcyjnego filtrowania. Pochodzenie mieszane: dawny mock, W21 `c3dfb3a`, własne okresy W30 `5499235`. Mock instruktora jest częścią BUG-02.

## Co świadomie pozostawiamy

- Obecną architekturę Nuxt/Vue/BFF/BE i większość podziału composables. Wielkość pliku bez konkretnego kosztu nie uzasadnia zadania.
- Różne reguły ról, kontekst schoolId i model płatności. Ujednolicenie mogłoby zmienić produkt.
- W22, logowanie/konto, optionsMatrix i grupowe pobieranie kolizji pojazdów: nie znaleziono argumentu za dodatkową przebudową w przeczytanym zakresie.
- Prymitywy UI, osobne composables opinii i normalizery bez dowodu kosztownej duplikacji. Bez uniwersalnego CRUD/formularza i dodatkowego store.
- Wygląd, paletę, copy i globalny ekran błędu jako oddzielne zadania UI.
- Hipotezy o współbieżności uczestników wydarzeń i różnicach starszego POST/PUT jako punkty dalszego przeglądu, bez kwalifikowania ich jako potwierdzonych napraw.

## Odbiór

Żaden wpis nie gwarantuje braku regresji. Każde zadanie ma mały zakres, scenariusze zachowania i osobny odbiór. BUG-08/09 wymagają opisanych testów przed wdrożeniem. Jeśli dalszy kontekst obali założenie, zadanie należy ograniczyć albo usunąć, zamiast bronić wcześniejszej rekomendacji.
