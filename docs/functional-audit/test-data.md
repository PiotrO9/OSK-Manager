# Dane do audytu funkcjonalnego

Ten dokument definiuje **stany początkowe**, a nie komendy ich tworzenia. Przy
wykonywaniu audytu należy wskazać odizolowany projekt bazy i Auth, identyfikator
zestawu oraz datę jego odtworzenia. Sześć zestawów z tabeli obsługuje endpoint
audytu; pozostałe wymagają przygotowania ręcznego albo dalszej rozbudowy narzędzia.

## Zasady wspólne

- Wszystkie konta są testowe. Dokumentacja zawiera identyfikator konta, rolę i
  relacje, bez haseł, tokenów ani rzeczywistych danych osobowych.
- Dane muszą być deterministyczne: ten sam zestaw daje te same role, relacje,
  stany i identyfikatory logiczne. Nie wymagamy stałych UUID, jeśli narzędzie
  zwraca mapę identyfikatorów po utworzeniu.
- Daty lekcji i wydarzeń wyznacza się względem dnia wykonania w strefie
  `Europe/Warsaw`. Zestaw z terminami musi zawierać termin w przyszłości w godzinach pracy
  OSK i instruktora oraz pozwalać na powtórzenie testu następnego dnia.
- W wariantach wieloszkolnych konta, kursy, pojazdy, lekcje i opinie muszą mieć
  jednoznaczną przynależność. Nazwy widoczne w UI powinny pomagać rozpoznać szkołę.
- Przed resetem zapisz wynik przebiegu i dowody. Nie resetuj bazy używanej przez
  równoległe zadanie. Testy zmieniające dane zaczynaj od świeżego zestawu lub
  przygotowanego wariantu z osobnymi rekordami.

## Katalog zestawów

| ID                         | Stan minimalny                                                                                                                                                                                                         | Scenariusze                                                     | Reset po teście                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| `accounts-only`            | Konto administratora technicznego, menadżera, instruktora i kursanta; bez OSK i danych operacyjnych. Konta ról nie muszą mieć jeszcze przypisania do szkoły.                                                           | wspólne logowanie, start bez OSK                                | po utworzeniu szkoły                        |
| `manager-only`             | Konto administratora technicznego i aktywnego menadżera bez OSK; dostępny słownik kategorii kursów, pozostałe konta ról powstają w przebiegu.                                                                          | `MGR-OSK-01`, `XR-01`                                           | po utworzeniu OSK                           |
| `school-empty`             | Menadżer i jedno jego OSK z ustawieniami; brak instruktorów, kursantów, pojazdów, kursów i wpisów operacyjnych.                                                                                                        | puste stany menadżera, dodawanie zasobów                        | po dodaniu zasobów                          |
| `manager-two-schools`      | Jeden menadżer jest właścicielem dwóch rozróżnialnych OSK z ustaloną szkołą domyślną; brak danych operacyjnych.                                                                                                        | `MGR-OSK-02`, wybór kontekstu                                   | po zmianie szkoły domyślnej lub danych      |
| `school-staffed`           | Jedno OSK, menadżer, dwóch instruktorów o rozróżnialnych kwalifikacjach i podstawowych godzinach pracy; brak kursantów i lekcji.                                                                                       | dostępność, kwalifikacje, dodawanie kursantów                   | po mutacji                                  |
| `school-operational`       | Jedno OSK, menadżer, dwóch instruktorów, dwa pojazdy, dwóch kursantów, kurs praktyczny i kurs teoretyczny; brak lekcji i płatności.                                                                                    | tworzenie kursów, pojazdy, zapisy                               | po mutacji                                  |
| `course-ready`             | `school-staffed` z kwalifikowanym instruktorem, pojazdem, jednym utworzonym kursem praktycznym i kontem nowego kursanta jeszcze bez przypisania.                                                                       | `MGR-STU-01`; przy `MGR-CRS-03` dodaj już przypisanego kursanta | po zapisie kursanta lub zmianie instruktora |
| `student-enrolled`         | `school-operational` z kursantami zapisanymi do kursu teorii; dodatkowy kursant spoza kursu jako kontrola uprawnień.                                                                                                   | `MGR-EVT-01`                                                    | po utworzeniu wydarzenia                    |
| `student-empty`            | Aktywny kursant bez przypisanych kursów, lekcji i płatności.                                                                                                                                                           | `STU-03`, `STU-06`, `STU-16`                                    | odczyt bez resetu                           |
| `student-course-mix`       | Kursant ma przynajmniej jeden aktywny kurs praktyczny, jeden ukończony lub nieaktywny oraz kurs teoretyczny; postęp i statusy mają znane wartości.                                                                     | `STU-01`–`STU-03`, `STU-06`                                     | odczyt bez resetu                           |
| `booking-ready`            | Jeden aktywny kursant przypisany do aktywnego kursu praktycznego, dostępny limit godzin, uprawniony instruktor, dostępny pojazd, co najmniej jeden wolny termin w przyszłości.                                         | `XR-02`, rezerwacja poprawna                                    | po rezerwacji                               |
| `booking-hours-low`        | `booking-ready` z pakietem, w którym pozostaje mniej godzin niż trwa jeden oferowany slot; stan ukończonych i już zaplanowanych minut jest podany osobno.                                                              | `STU-07`, `F-001`                                               | odczyt bez resetu                           |
| `booking-hours-zero`       | Aktywny kurs z całym pakietem wykorzystanym lub zarezerwowanym; kursant nie może dodać kolejnej jazdy.                                                                                                                 | `STU-06`                                                        | odczyt bez resetu                           |
| `booking-conflict`         | Stan `booking-ready` oraz drugi kursant lub zasób zajmujący wskazany termin; osobny wolny termin kontrolny.                                                                                                            | konflikt instruktora, pojazdu lub kursanta                      | po próbie zapisu, jeśli powstała zmiana     |
| `lesson-scheduled`         | Stan `booking-ready` z jedną już zaplanowaną jazdą w przyszłości oraz drugim wolnym terminem kontrolnym.                                                                                                               | `XR-03`, edycja i anulowanie                                    | po zmianie statusu/czasu                    |
| `student-schedule`         | Kursant ma jazdy w dwóch tygodniach o różnych statusach oraz wydarzenie teorii; jedna przyszła jazda jest możliwa do anulowania.                                                                                       | `STU-01`, `STU-10`–`STU-14`                                     | po anulowaniu lub ocenie                    |
| `lesson-completed-unrated` | Zakończona jazda przypisana do kursanta i instruktora, bez oceny; inne stare oceny dla kontroli podsumowania.                                                                                                          | `XR-05`, wystawianie i odczyt opinii                            | po wystawieniu oceny                        |
| `rated-lesson`             | Co najmniej jedna zakończona i oceniona jazda oraz druga jazda bez oceny, obie w jednym OSK.                                                                                                                           | `MGR-REV-01`                                                    | odczyt bez resetu                           |
| `payment-ready`            | Menadżer, kursant przypisany do kursu, plan płatności i brak opłaty o wybranej kwocie/terminie; inne opłaty jednoznacznie rozróżnialne.                                                                                | `MGR-PAY-01`, `XR-04`                                           | po utworzeniu opłaty                        |
| `account-ready`            | Dwie OSK, konta obu ról w każdej, aktywne zobowiązania jednego kursanta i instruktora oraz wolne konta do zmiany e-maila, resetu hasła i archiwizacji. Skrzynka lokalnego Mailpit odbiera link resetu.                 | `MGR-ACC-01`–`MGR-ACC-05`                                       | po każdej mutacji                           |
| `student-payments`         | Kursant ma opłatę `PAID` oraz dwie opłaty `PENDING`, jedną przed i jedną po terminie; osobny kursant ma własne opłaty kontrolne. FE prezentuje `PENDING` jako nieopłaconą (`UNPAID`) albo zaległą zależnie od terminu. | `STU-01`, `STU-15`, `STU-18`                                    | odczyt bez resetu                           |
| `instructor-schedule`      | Instruktor A ma jazdy i wydarzenia w dwóch tygodniach, dzień pusty i jeden wolny slot w przyszłości; instruktor B ma osobne pozycje. W OSK są uprawniony kursant z kursem i dostępny pojazd.                           | `INS-01`–`INS-05`, `INS-09`, `MGR-INS-05`                       | po zmianie statusu lub rezerwacji           |
| `instructor-reviews`       | Instruktor A ma oceny w różnych okresach, instruktor B osobną ocenę; wariant stronicowania ma co najmniej 21 ocen A.                                                                                                   | `INS-06`, `INS-07`                                              | odczyt bez resetu                           |
| `two-schools-isolated`     | Dwa OSK, osobni menadżerowie, instruktorzy, kursanci, kursy, pojazdy i co najmniej jedna lekcja w każdym OSK.                                                                                                          | `XR-06`, filtrowanie i odmowa dostępu                           | bez resetu przy odczycie                    |

## Dane i warianty do doprecyzowania po przeglądzie scenariuszy

Każdy scenariusz powinien wskazywać ID z powyższej tabeli. Jeśli potrzebuje
szczególnego stanu, należy dopisać konkretną różnicę, np. kursant z wyczerpanym
limitem godzin, instruktor na urlopie, pojazd niedostępny do określonej daty,
lekcja na granicy dozwolonego czasu odwołania albo OSK z niestandardowymi
godzinami pracy. Dla walidacji formularza zwykle wystarczy zestaw bazowy i ręczne
wpisanie niepoprawnych danych; nie trzeba tworzyć osobnego presetu.

Scenariusze `COM-09`, `INS-08`, `INS-10` i `STU-18` wymagają kontrolowanego
wygaśnięcia sesji albo jednorazowego błędu odpowiedzi. To zdolność środowiska
testowego lub przeglądarki, a nie wariant resetowania bazy. W przebiegu zapisz
sposób wymuszenia błędu i potwierdź, że po jego usunięciu aplikacja działa na
tym samym zestawie danych.

## Wymagania dla późniejszego narzędzia danych

1. Jawnie wybiera się **czyszczenie do poziomu** albo **utworzenie nazwanego zestawu**.
   Pierwsza operacja zachowuje istniejące dane wybranych klas; druga zapewnia
   konkretny stan także wtedy, gdy rekordów wcześniej nie było.
2. Warianty zachowania: konta menadżerów; menadżerowie i OSK; menadżerowie, OSK
   i instruktorzy wraz z wymaganymi relacjami; później zasoby i kursy bez danych
   operacyjnych. Konto administratora technicznego pozostaje dostępne w zwykłych
   wariantach.
3. Pełny reset wymaga oddzielnego, silniejszego potwierdzenia i opisu odtworzenia
   dostępu. Kontrakt określa osobno zakres tabel Prisma, Supabase Auth i plików.
4. Narzędzie zwraca nazwę zestawu, wersję, czasy wykonania, liczbę utworzonych,
   zachowanych i usuniętych rekordów oraz mapę identyfikatorów logicznych.
5. Kontrakt i testy narzędzia muszą potwierdzać spójność relacji, uprawnienia,
   ochronę środowiska i możliwość ponownego przygotowania tego samego stanu.

## Co zapewnia obecny endpoint

`POST /dev/reset-and-seed` (BE) wymaga `ADMIN` i jawnych zabezpieczeń pełnego
resetu opisanych w `../../../../BE/docs/AUDIT_DATA_TOOLING.md`; czyści
tabele aplikacji i tworzy dane demonstracyjne o zakresach `low/default/high`.
Nawet przy `low` plan obejmuje co najmniej jedno OSK, dwóch instruktorów i
dziesięciu kursantów. `randomSeed` stabilizuje rozkład danych w ramach tych
zakresów, lecz nie tworzy pustych etapów ani wskazanego wyżej scenariusza
`booking-conflict` na żądanie. Konta Supabase Auth są tworzone lub aktualizowane
dla znanych danych demo; pełne usunięcie kont Auth nie jest częścią tego resetu.

Źródła: `BE/src/routes/dev.routes.ts`, `BE/src/services/devResetSeed.service.ts`,
`BE/src/services/devResetSeed/config.ts`, `BE/src/services/devResetSeed/seedPlan.ts`,
`BE/src/services/devResetSeed/authUsers.ts` i `BE/prisma/schema.prisma`.

Nowe `POST /dev/audit/preview` i `POST /dev/audit/execute` obsługują poziomy
zachowania `managers`, `schools`, `instructors` i `full` oraz siedem
nazwanych zestawów: `manager-only`, `school-empty`, `school-staffed`,
`school-operational`, `booking-ready`, `payment-ready`, `account-ready`. Pozostałe
wiersze katalogu są nadal specyfikacją stanu; przed testem trzeba je utworzyć
ręcznie albo dopisać do narzędzia. `full` odtwarza techniczne konto administratora
w tej samej transakcji. API nie czyści kont Supabase Auth ani plików Storage.

`booking-ready` zwraca wskazany termin przyszłego dnia roboczego. Jego
faktyczną dostępność, rezerwację i trwałość po odświeżeniu potwierdzono na
izolowanej bazie w przebiegu z 2026-10-08. `payment-ready` nie tworzy jeszcze dodatkowych opłat
kontrolnych z tabeli powyżej.

Przypadki zarządzania kontami używają lokalnego presetu `account-ready` i skrzynki
Mailpit. Preset odtwarza dane aplikacji; kont Supabase Auth nie usuwa, a test
używa unikalnego adresu docelowego przy każdej zmianie e-maila.
