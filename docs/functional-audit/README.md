# Audyt funkcjonalny OSK Manager

Instrukcja uruchomienia izolowanego stosu: [environment.md](environment.md).

Ten katalog jest instrukcją przygotowania i wykonania testów odbiorowych aplikacji
OSK Manager. Celem jest sprawdzenie zadań kursanta, instruktora i menadżera oraz
spójności danych między nimi przed opisaniem wyników w pracy inżynierskiej.
Scenariusze są instrukcjami do wykonania; ich istnienie nie oznacza, że aplikacja
już przeszła test.

## Punkt odniesienia i zakres

Inwentaryzację dokumentacji rozpoczęto 2026-10-08 na FE
`581d56e24d1f21e594605e9d4aa22dc02fba2999` i BE
`cf191dda8f1529fc996edfd20b63b0e1d37c2de6`. Przed wykonaniem przebiegu
zapisz **aktualne** commity obu repozytoriów w `runs/`. Jeśli równoległe zadanie
zmieni funkcję, przejrzyj jej wymaganie i scenariusz przed testem. Źródłem
oczekiwanego zachowania są wymagania po rozstrzygnięciu decyzji, a aktualny kod
i testy służą do inwentaryzacji.

W czasie przygotowania dokumentacji katalog BE zawierał niezapisane w commicie
zmiany dotyczące kont i autoryzacji. Po zakończeniu tej równoległej pracy
ponownie przejrzyj `COM-01`–`COM-10`, `MGR-INS-01/03`, `MGR-STU-01`, odpowiednie
wymagania i dane kont. Sam commit BE nie opisuje tych zmian roboczych.

Zakres obejmuje ekrany produkcyjne i odpowiadające im przepływy FE → BFF → BE →
baza: logowanie i konto, pulpit każdej roli, OSK, instruktorzy, kursanci, kursy,
pojazdy, dostępność, wydarzenia, lekcje, płatności i opinie. Obejmuje puste stany,
walidację, błędy, dostęp według roli, izolację szkół, odświeżenie danych i podstawową
obsługę na wąskim ekranie. `/design-system` służy do prezentacji komponentów,
więc nie jest osobnym procesem użytkownika. Pomysły z `../../../../docs/APP_CHANGE_NOTES.md`
pozostają poza odbiorem bieżącej wersji, dopóki nie zostaną wdrożone i dopisane
do wymagań.

## Mapa zasobów

| Zasób                                              | Co zawiera                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [Wymagania](requirements.md)                       | Identyfikatory, źródła, statusy i decyzje do podjęcia               |
| [Checklista](checklist.md)                         | Wynik ręczny i opcjonalny automatyczny każdego scenariusza          |
| [Dane testowe](test-data.md)                       | Nazwane stany początkowe i specyfikację przyszłego narzędzia danych |
| [Scenariusze wspólne](scenarios/common.md)         | Logowanie, sesję, konto i uprawnienia                               |
| [Scenariusze menadżera](scenarios/manager.md)      | Zarządzanie OSK, ludźmi, kursami, pojazdami i harmonogramem         |
| [Scenariusze instruktora](scenarios/instructor.md) | Terminarz, wydarzenia i opinie                                      |
| [Scenariusze kursanta](scenarios/student.md)       | Kursy, rezerwacje, lekcje i opłaty                                  |
| [Procesy między rolami](scenarios/cross-role.md)   | Spójność danych i pełne zadania                                     |
| [Rejestr problemów](findings.md)                   | Jeden wpis na problem oraz historię naprawy i ponownego testu       |
| [Przebiegi](runs/README.md)                        | Wyniki dla konkretnych wersji, środowisk i dat                      |

## Pokrycie ekranów produkcyjnych

| Obszar i trasy FE                                                                     | Scenariusze główne                                    |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `/login`, `/account`, `/`                                                             | `COM-01`–`COM-10`, `MGR-DASH-01`, `INS-01`, `STU-01`  |
| `/manager/osk`, `/manager/osk/new`                                                    | `MGR-OSK-01`–`MGR-OSK-03`, `MGR-MOB-01`               |
| `/manager/instructors` i podstrony `new`, `[id]`, `availability`, `schedule`, `slots` | `MGR-INS-01`–`MGR-INS-05`                             |
| `/manager/students`, `/manager/students/[userId]`                                     | `MGR-STU-01/02`, `MGR-PAY-01`                         |
| `/manager/courses` i podstrony `new`, `[id]`                                          | `MGR-CRS-01`–`MGR-CRS-03`                             |
| `/vehicles` i podstrony `new`, `[id]`, `edit`                                         | `MGR-VEH-01/02`                                       |
| `/manager/schedule`, `/manager/lessons/[id]/edit`                                     | `MGR-SCH-01`, `MGR-LES-01`–`MGR-LES-04`               |
| `/events`, `/manager/events/[id]/edit`                                                | `INS-05`, `MGR-EVT-01/02`                             |
| `/manager/reviews`, `/my-reviews`                                                     | `MGR-REV-01`, `INS-06/07`, `XR-05`                    |
| `/my-courses`, `/book-lesson`, `/my-lessons`, `/my-payments`                          | `STU-02`–`STU-19`, `INS-02`–`INS-04`, `XR-02`–`XR-05` |

Trasy z parametrem `[id]` oznaczają szczegóły konkretnego rekordu. Testy
uprawnień `COM-05`, `COM-10`, `INS-09` i `XR-06` obejmują również bezpośredni
adres strony oraz odpowiadające mu API.

## Kolejność pracy

1. Sprawdź mapę wymagań i rozstrzygnij decyzje wpływające na wyniki P0.
2. Przejrzyj checklisty po zakończeniu równoległych zmian w kodzie. Zaktualizuj
   kroki i źródła dla zmienionych funkcji.
3. Użyj `test-data.md` i [instrukcji narzędzia danych](../../../../BE/docs/AUDIT_DATA_TOOLING.md)
   do przygotowania stanów. Automatycznie dostępnych jest siedem presetów;
   pozostałe wymagają ręcznego przygotowania lub rozszerzenia narzędzia.
   Zweryfikuj każdy zestaw na odizolowanym środowisku.
4. Wykonaj ścieżkę podstawową, zapisując przebieg w `runs/`.
5. Wykonaj wszystkie P0 i P1, następnie P2. Błędy zapisz w `findings.md` i
   powiąż z przebiegiem. Po naprawie rozpocznij nowy przebieg dla ponownego testu.
6. Zapisz podsumowanie, zakres niewykonany, znane ograniczenia i decyzję o
   gotowości wersji. Posłuży ono jako materiał do rozdziału o testach.

## Ścieżka podstawowa

To krótki przebieg po większej zmianie; pełny odbiór wymaga również pozostałych
scenariuszy. Zachowaj kolejność i odtwórz dane zgodnie z `test-data.md`:

1. `COM-01` — logowanie wszystkich trzech ról.
2. `MGR-OSK-01`, `MGR-INS-01`, `MGR-INS-04`, `MGR-VEH-01` — OSK,
   instruktor, jego dostępność i pojazd.
3. `MGR-CRS-01`, `MGR-STU-01` — kurs i przypisanie kursanta.
4. `STU-02` oraz `XR-01` — widoczność kursu u kursanta.
5. `STU-04` oraz `XR-02` — rezerwacja jazdy i widoczność u instruktora oraz menadżera.
6. `MGR-PAY-01`, `STU-15` oraz `XR-04` — utworzenie i odczyt opłaty.
7. `COM-04` — wylogowanie i brak dostępu do chronionych danych po zakończeniu sesji.

Lista odsyła do testów i nie powiela kroków. Rezerwacja w `STU-04` może
korzystać z osobno przygotowanego `booking-ready`, jeśli wcześniejsze kroki
tworzą inny stan niż wymagany w tym scenariuszu.

## Zasady oceny

- **P0:** podstawowy proces, spójność danych lub ochrona dostępu; wymagany do odbioru.
- **P1:** ważna funkcja lub istotny wariant błędny; wymagany do pełnego odbioru.
- **P2:** uzupełniający wariant, jakość obsługi lub rzadszy przypadek graniczny;
  wynik zapisuje się, a decyzję o ewentualnym odłożeniu uzasadnia.
- Scenariusz jest `zaliczony` wyłącznie wtedy, gdy wszystkie jego obserwowalne
  wyniki są spełnione po wykonaniu kroków. Błąd daje `niezaliczony` i wpis w
  rejestrze; brak danych, środowiska lub rozstrzygnięcia daje `zablokowany`.
- Wersja może zostać odebrana po zaliczeniu wszystkich P0 i P1, zamknięciu
  błędów blokujących i wysokich oraz zapisaniu decyzji dla otwartych P2.
  Każdy wyjątek wymaga jawnego uzasadnienia w podsumowaniu przebiegu.
- Nowy pomysł na funkcję trafia do `../../../../docs/APP_CHANGE_NOTES.md`. Problem ujawniony
  przez istniejącą funkcję trafia do `findings.md`.

## Metoda i ograniczenia dowodów

Test odbiorowy należy wykonywać w przeglądarce na odizolowanym środowisku
połączonym z rzeczywistym backendem i bazą. Suita Playwright UI uruchamia BFF
z mockiem i sprawdza interfejs oraz routing; nie potwierdza przepływu przez BE
i bazę. Suita full-stack zawiera testy `@smoke` i `@audit` dla logowania, OSK,
rezerwacji, płatności i granic ról. Jej uruchomienie wymaga dedykowanego
środowiska zgodnie z `../E2E_TESTING.md` oraz
`environment.md`. Wyniki testów automatycznych wpisuje
się do podsumowania osobno od ręcznych scenariuszy odbiorowych.

Nie wpisuj do repozytorium haseł, tokenów, zrzutów z danymi osobowymi ani
rzeczywistych danych kursantów. Wymagane dowody przechowuj w bezpiecznym miejscu
i odsyłaj do ich oczyszczonej wersji.

## Kryterium gotowości dokumentacji

Dokumentacja jest gotowa do projektowania narzędzi danych, gdy każda funkcja w
zakresie ma wymaganie i scenariusz albo uzasadnione wyłączenie, wyniki P0 i P1
są jednoznaczne, stany danych są nazwane, a źródła i odnośniki są spójne.
Nierozstrzygnięte decyzje pozostają widoczne w `requirements.md`; przed wykonaniem
powiązanego testu trzeba ustalić oczekiwany wynik.
