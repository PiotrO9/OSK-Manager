# Checklista audytu funkcjonalnego

To lista kontrolna wszystkich 80 scenariuszy. **Każdy punkt sprawdź ręcznie**
w aplikacji na odizolowanym środowisku. Automat jest dodatkowy i opcjonalny.
Kolumna ręczna zaczyna się od `☐` (niewykonany), a automatyczna od `—` (bez próby).
Po udanym teście ręcznym zmień `☐` na `☑ zaliczony` i dodaj odnośnik do
istniejącego pliku przebiegu w `runs/`. Przy innym wyniku wpisz jego nazwę
oraz odnośnik bez zaznaczania pola jako zaliczonego.

Wynik ręczny: `zaliczony`, `niezaliczony`, `zablokowany` albo `niewykonany`.
Wynik automatyczny: `zaliczony`, `niezaliczony`, `nie udało się`, `pominięty`
albo `—`. Przy `nie udało się` i `pominięty` dodaj w tej samej komórce
**konkretny powód**, np. `nie udało się — środowisko nie uruchomiło FE` lub
`pominięty — ocena czytelności wymaga obserwacji człowieka`. Nie myl awarii
aplikacji z nieudaną próbą uruchomienia automatu. Szczegóły i dowody zapisuj w
`runs/`, a błędy aplikacji w `findings.md`. Kolumna ręczna pozostaje niewykonana,
jeśli istnieje tylko wynik automatyczny. Wyniki z przebiegu 2026-10-08 są
historycznym dowodem automatycznym i nie oznaczają wykonania ręcznego.

## Szybki start — proponowana pierwsza kolejka

1. `COM-02` — walidacja i błędne logowanie.
2. `COM-01` — logowanie trzech ról.
3. `COM-04` — wylogowanie.
4. `COM-03` — powrót na żądaną stronę po zalogowaniu.
5. `STU-05` — zamknięcie dialogu rezerwacji bez zapisu; świeży `booking-ready`.
6. `MGR-OSK-01` — utworzenie pierwszej szkoły; świeży `manager-only`.

Pierwsze cztery testy dotyczą sesji i nie zmieniają danych biznesowych. Dwa
ostatnie wykonuj na osobno przygotowanych zestawach. Ta kolejność pomaga zacząć
od krótkich scenariuszy; nie zastępuje wymaganych danych i kroków w plikach
`scenarios/`.

Podczas wspólnego testowania podaj ID scenariusza. Przed wykonaniem sprawdzamy
środowisko, stan początkowy i oczekiwane wyniki. Następnie wykonujemy kroki
po kolei, zapisujemy obserwacje oraz dowody i dopiero po sprawdzeniu wszystkich
warunków nadajemy wynik ręczny w nowym pliku `runs/` oraz w poniższej tabeli.

## Wspólne — [kroki](scenarios/common.md)

| ID | Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) |
| --- | --- | --- | --- |
| COM-01 | Logowanie każdej roli i właściwa strona startowa | ☑ zaliczony ([przebieg 2026-10-10](runs/2026-10-10-com-01-manual.md)) | — |
| COM-02 | Walidacja formularza i błędne dane logowania | ☑ zaliczony ([przebieg 2026-10-10](runs/2026-10-10-com-02-manual.md)) | — |
| COM-03 | Powrót do żądanej strony po zalogowaniu | ☐ | — |
| COM-04 | Wylogowanie kończy dostęp do danych | ☐ | — |
| COM-05 | Dostęp według roli, również przez bezpośredni URL | ☐ | — |
| COM-06 | Własny profil i edycja pól dostępnych dla roli | ☐ | — |
| COM-07 | Niezapisane zmiany profilu | ☐ | — |
| COM-08 | Zdjęcie profilowe i walidacja pliku | ☐ | — |
| COM-09 | Wygasła sesja | ☐ | — |
| COM-10 | Izolacja danych kont i OSK | ☐ | — |
| COM-11 | Samodzielne odzyskanie hasła | ☐ | — |
| COM-12 | Brak dostępu dla konta zablokowanego i zarchiwizowanego | ☐ | — |
| COM-13 | Dane logowania przed uruchomieniem JavaScript | ☐ | — |

## Menedżer OSK — [kroki](scenarios/manager.md)

| ID | Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) |
| --- | --- | --- | --- |
| MGR-OSK-01 | Utworzenie pierwszej szkoły | ☐ | — |
| MGR-OSK-02 | Edycja i wybór szkoły domyślnej | ☐ | — |
| MGR-OSK-03 | Odrzucenie i potwierdzenie usunięcia OSK | ☐ | — |
| MGR-INS-01 | Rejestracja instruktora | ☐ | — |
| MGR-INS-02 | Walidacja i niezapisany formularz instruktora | ☐ | — |
| MGR-INS-03 | Edycja profilu i usunięcie instruktora | ☐ | — |
| MGR-INS-04 | Tygodniowa dostępność instruktora | ☐ | — |
| MGR-INS-05 | Terminarz i wolne sloty instruktora | ☐ | — |
| MGR-CRS-01 | Utworzenie kursu | ☐ | — |
| MGR-CRS-02 | Walidacja kursu i ograniczenie instruktora | ☐ | — |
| MGR-CRS-03 | Zmiana instruktora i przegląd uczestników kursu | ☐ | — |
| MGR-STU-01 | Rejestracja kursanta i przypisanie do kursu | ☐ | — |
| MGR-STU-02 | Wyszukiwanie, filtrowanie i szczegóły kursanta | ☐ | — |
| MGR-PAY-01 | Dodanie, edycja i rozliczenie płatności | ☐ | — |
| MGR-VEH-01 | Dodanie i edycja pojazdu | ☐ | — |
| MGR-VEH-02 | Status, domyślny pojazd i usunięcie | ☐ | — |
| MGR-SCH-01 | Tygodniowy harmonogram OSK i wybór szkoły | ☐ | — |
| MGR-LES-01 | Rezerwacja jazdy przez menedżera | ☐ | — |
| MGR-LES-02 | Konflikt rezerwacji i niedostępny pojazd | ☐ | — |
| MGR-LES-03 | Edycja jazdy i zmiana instruktora | ☐ | — |
| MGR-LES-04 | Anulowanie jazdy | ☐ | — |
| MGR-EVT-01 | Blok teorii i uczestnicy | ☐ | — |
| MGR-EVT-02 | Zmiana statusu, edycja i usunięcie bloku | ☐ | — |
| MGR-ACC-01 | Lista kont i granica szkoły | ☐ | — |
| MGR-ACC-02 | Dane podstawowe i zmiana e-maila | ☐ | — |
| MGR-ACC-03 | Blokada i odblokowanie konta | ☐ | — |
| MGR-ACC-04 | Wysłanie resetu hasła | ☐ | — |
| MGR-ACC-05 | Archiwizacja konta i aktywne zobowiązania | ☐ | — |
| MGR-REV-01 | Opinie o zakończonych jazdach | ☐ | — |
| MGR-DASH-01 | Pulpit i elementy wymagające uwagi | ☐ | — |
| MGR-MOB-01 | Podstawowe zadania menadżera na wąskim ekranie | ☐ | — |

## Instruktor — [kroki](scenarios/instructor.md)

| ID | Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) |
| --- | --- | --- | --- |
| INS-01 | Panel instruktora i skróty | ☐ | — |
| INS-02 | Tygodniowy terminarz: lista, kalendarz i nawigacja | ☐ | — |
| INS-03 | Pusty tydzień w terminarzu | ☐ | — |
| INS-04 | Zmiana statusu własnego wydarzenia | ☐ | — |
| INS-05 | Wydarzenia dnia, daty i filtr statusu | ☐ | — |
| INS-06 | Opinie o własnych lekcjach, filtr i anonimowość | ☐ | — |
| INS-07 | Stronicowanie opinii | ☐ | — |
| INS-08 | Błąd odczytu i ponowienie | ☐ | — |
| INS-09 | Własność danych i uprawnienia do operacji menedżera | ☐ | — |
| INS-10 | Nieudany zapis statusu wydarzenia | ☐ | — |
| INS-11 | Praca instruktora na wąskim ekranie | ☐ | — |

## Kursant — [kroki](scenarios/student.md)

| ID | Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) |
| --- | --- | --- | --- |
| STU-01 | Pulpit kursanta pokazuje jego najważniejsze dane | ☐ | — |
| STU-02 | Kursy, postęp i filtry | ☐ | — |
| STU-03 | Brak kursów oraz pusty wynik filtra | ☐ | — |
| STU-04 | Rezerwacja dostępnego terminu | ☐ | — |
| STU-05 | Rezygnacja w dialogu potwierdzenia | ☐ | — |
| STU-06 | Kurs nieuprawniony do rezerwacji | ☐ | — |
| STU-07 | Slot dłuższy niż pozostały pakiet | ☐ | — |
| STU-08 | Nawigacja tygodni, brak slotów i granice rezerwacji | ☐ | — |
| STU-09 | Termin zajęty między wyświetleniem a potwierdzeniem | ☐ | — |
| STU-10 | Własny harmonogram w kalendarzu i na liście | ☐ | — |
| STU-11 | Anulowanie przyszłej jazdy | ☐ | — |
| STU-12 | Wyjście z dialogu anulowania i lekcje nieanulowalne | ☐ | — |
| STU-13 | Ocena zakończonej jazdy | ☐ | — |
| STU-14 | Walidacja i niedostępność ponownej oceny | ☐ | — |
| STU-15 | Własne opłaty, statusy i filtry | ☐ | — |
| STU-16 | Brak opłat | ☐ | — |
| STU-17 | Numer PKK na koncie | ☐ | — |
| STU-18 | Błąd pobierania danych i ponowienie | ☐ | — |
| STU-19 | Rezerwacja i opłaty na wąskim ekranie | ☐ | — |

## Między rolami — [kroki](scenarios/cross-role.md)

| ID | Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) |
| --- | --- | --- | --- |
| XR-01 | Od nowego OSK do kursu widocznego dla kursanta | ☐ | — |
| XR-02 | Rezerwacja jazdy widoczna w trzech rolach | ☐ | — |
| XR-03 | Zmiana lub anulowanie jazdy aktualizuje wszystkie widoki | ☐ | — |
| XR-04 | Opłata menadżera widoczna dla kursanta | ☐ | — |
| XR-05 | Ocena zakończonej jazdy widoczna dla instruktora i menadżera | ☐ | — |
| XR-06 | Izolacja danych między szkołami | ☐ | — |
