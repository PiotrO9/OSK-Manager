# Ponowny audyt automatyczny — 2026-10-16

Wersja FE: `4545116` z lokalnymi zmianami testów. Wersja BE: `374f453`. Wyniki ręczne z checklisty pozostają osobne.

## Uruchomienia

- Playwright UI na mocku: 45 przypadków, 41 zaliczonych i 4 nieudane. Po poprawie selektora edycji instruktora dwa nieudane przypadki przeszły ponownie: 2/2. Łącznie 43 różne przypadki UI mają pozytywny wynik, dwa pozostają bez wyniku.
- Playwright full stack: 19 przypadków wykrytych przez `--list`; nie uruchomiono ich. `supabase status` i izolowany `run-audit.mjs` zatrzymały się przed startem przeglądarki, bo Docker Engine jest niedostępny.
- FE Vitest: 180 plików, 902 testy zaliczone. BE Vitest: 65 plików, 475 testów zaliczonych. Te testy potwierdzają logikę w swoim zakresie, nie zastępują przebiegu FE → BFF → BE → baza.
- BE integration: pominięty, ponieważ izolowana baza oraz `TEST_DATABASE_URL` są niedostępne.

## Wynik według 81 ID

„Częściowo zaliczony w UI” oznacza wyłącznie wskazaną część na mocku. Żaden z 81 pełnych scenariuszy odbiorowych nie otrzymał nowego wyniku automatycznego „zaliczony” na prawdziwym backendzie.
Podział: 12 z częściowym wynikiem UI, 13 z nieudaną próbą i 56 pominiętych.

| ID | Scenariusz | Wynik tego przebiegu | Powód lub sprawdzony zakres |
| --- | --- | --- | --- |
| COM-01 | Logowanie każdej roli i właściwa strona startowa | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| COM-02 | Walidacja formularza i błędne dane logowania | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| COM-03 | Powrót do żądanej strony po zalogowaniu | Częściowo zaliczony w UI | Przekierowanie przed logowaniem (`auth-session.spec.ts`); pełny E2E z prawdziwym logowaniem nieuruchomiony. |
| COM-04 | Wylogowanie kończy dostęp do danych | Częściowo zaliczony w UI | Wylogowanie, historia i druga karta na mocku (`auth-session.spec.ts`); pełny E2E nieuruchomiony. |
| COM-05 | Dostęp według roli, również przez bezpośredni URL | Częściowo zaliczony w UI | Odmowa trasy menadżera kursantowi na mocku (`auth-session.spec.ts`); pozostałe role i API nieuruchomione. |
| COM-06 | Własny profil i edycja pól dostępnych dla roli | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-07 | Niezapisane zmiany profilu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-08 | Zdjęcie profilowe i walidacja pliku | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-09 | Wygasła sesja | Częściowo zaliczony w UI | Zasłonięcie widoku po utracie sesji i błąd sieci na mocku (`auth-session.spec.ts`); blokada konta przez BE nieuruchomiona. |
| COM-10 | Izolacja danych kont i OSK | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-11 | Samodzielne odzyskanie hasła | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-12 | Brak dostępu dla konta zablokowanego i zarchiwizowanego | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| COM-13 | Dane logowania przed uruchomieniem JavaScript | Częściowo zaliczony w UI | Formularz bez JS: POST, brak GET z danymi i czysty URL (`auth-session.spec.ts`); pełny E2E nieuruchomiony. |
| MGR-OSK-01 | Utworzenie pierwszej szkoły | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-OSK-02 | Edycja i wybór szkoły domyślnej | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-OSK-03 | Odrzucenie i potwierdzenie usunięcia OSK | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-INS-01 | Rejestracja instruktora | Częściowo zaliczony w UI | Formularz rejestracji i walidacja na mocku (`manager-instructor-create.spec.ts`); zapis w BE nieuruchomiony. |
| MGR-INS-02 | Walidacja i niezapisany formularz instruktora | Częściowo zaliczony w UI | Walidacja, szkic i ochrona niezapisanych zmian na mocku (`manager-instructor-create.spec.ts`). |
| MGR-INS-03 | Edycja profilu i blokada instruktora | Częściowo zaliczony w UI | Edycja instruktora na mocku (`manager-instructor-edit.spec.ts`, 2/2 po poprawie selektora); blokada przez BE nieuruchomiona. |
| MGR-INS-04 | Tygodniowa dostępność instruktora | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-INS-05 | Terminarz i wolne sloty instruktora | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-CRS-01 | Utworzenie kursu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-CRS-02 | Walidacja kursu i ograniczenie instruktora | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-CRS-03 | Zmiana instruktora i przegląd uczestników kursu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-CRS-04 | Usunięcie pustego kursu i ochrona historii | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-STU-01 | Rejestracja kursanta i przypisanie do kursu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-STU-02 | Wyszukiwanie, filtrowanie i szczegóły kursanta | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-PAY-01 | Dodanie, edycja i rozliczenie płatności | Nie udało się | Test UI zatrzymał się przy próbie `.fill()` na przycisku kalendarza; pełny E2E nieuruchomiony. |
| MGR-VEH-01 | Dodanie i edycja pojazdu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-VEH-02 | Status, domyślny pojazd i usunięcie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-SCH-01 | Tygodniowy harmonogram OSK i wybór szkoły | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-LES-01 | Rezerwacja jazdy przez menedżera | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-LES-02 | Konflikt rezerwacji i niedostępny pojazd | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-LES-03 | Edycja jazdy i zmiana instruktora | Nie udało się | Test UI zatrzymał się na starej etykiecie „Zapisz zmiany”; wynik funkcji nie został sprawdzony. |
| MGR-LES-04 | Anulowanie jazdy | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-EVT-01 | Blok teorii i uczestnicy | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-EVT-02 | Zmiana statusu, edycja i usunięcie bloku | Częściowo zaliczony w UI | Zmiana czasu wydarzenia na mocku (`manager-event-edit-ref01.spec.ts`); pozostałe operacje nieuruchomione. |
| MGR-ACC-01 | Lista kont i granica szkoły | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-ACC-02 | Dane podstawowe i zmiana e-maila | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-ACC-03 | Blokada i odblokowanie konta | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-ACC-04 | Wysłanie resetu hasła | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-ACC-05 | Archiwizacja konta i aktywne zobowiązania | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| MGR-REV-01 | Opinie o zakończonych jazdach | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| MGR-DASH-01 | Pulpit i elementy wymagające uwagi | Częściowo zaliczony w UI | Pulpit menadżera na mocku (`dashboard.spec.ts`); rzeczywiste dane BE nieuruchomione. |
| MGR-MOB-01 | Podstawowe zadania menadżera na wąskim ekranie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-01 | Panel instruktora i skróty | Częściowo zaliczony w UI | Pulpit instruktora na mocku (`dashboard.spec.ts`); rzeczywiste dane BE nieuruchomione. |
| INS-02 | Tygodniowy terminarz: lista, kalendarz i nawigacja | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-03 | Pusty tydzień w terminarzu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-04 | Zmiana statusu własnego wydarzenia | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-05 | Wydarzenia dnia, daty i filtr statusu | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-06 | Opinie o własnych lekcjach, filtr i anonimowość | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-07 | Stronicowanie opinii | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-08 | Błąd odczytu i ponowienie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-09 | Własność danych i uprawnienia do operacji menedżera | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-10 | Nieudany zapis statusu wydarzenia | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| INS-11 | Praca instruktora na wąskim ekranie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-01 | Pulpit kursanta pokazuje jego najważniejsze dane | Częściowo zaliczony w UI | Pulpit kursanta na mocku (`dashboard.spec.ts`); rzeczywiste dane BE nieuruchomione. |
| STU-02 | Kursy, postęp i filtry | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-03 | Brak kursów oraz pusty wynik filtra | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-04 | Rezerwacja dostępnego terminu | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| STU-05 | Rezygnacja w dialogu potwierdzenia | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| STU-06 | Kurs nieuprawniony do rezerwacji | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-07 | Slot dłuższy niż pozostały pakiet | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-08 | Nawigacja tygodni, brak slotów i granice rezerwacji | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-09 | Termin zajęty między wyświetleniem a potwierdzeniem | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-10 | Własny harmonogram w kalendarzu i na liście | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-11 | Anulowanie przyszłej jazdy | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-12 | Wyjście z dialogu anulowania i lekcje nieanulowalne | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-13 | Ocena zakończonej jazdy | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-14 | Walidacja i niedostępność ponownej oceny | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-15 | Własne opłaty, statusy i filtry | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-16 | Brak opłat | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-17 | Numer PKK na koncie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-18 | Błąd pobierania danych i ponowienie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| STU-19 | Rezerwacja i opłaty na wąskim ekranie | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| XR-01 | Od nowego OSK do kursu widocznego dla kursanta | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| XR-02 | Rezerwacja jazdy widoczna w trzech rolach | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| XR-03 | Zmiana lub anulowanie jazdy aktualizuje wszystkie widoki | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| XR-04 | Opłata menadżera widoczna dla kursanta | Nie udało się | Istnieje test pełnego stosu, lecz lokalny Docker Engine jest niedostępny. |
| XR-05 | Ocena zakończonej jazdy widoczna dla instruktora i menadżera | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |
| XR-06 | Izolacja danych między szkołami | Pominięty | Brak testu E2E dla całego scenariusza; izolowany BE/Auth/DB jest niedostępny. |

## Pozostałe nieudane próby UI

- `MGR-LES-03`: test `manager-lesson-instructor-change.spec.ts` szuka przycisku „Zapisz zmiany”, podczas gdy aktualny formularz pokazuje „Zapisz”. W zrzucie po wyborze instruktora widnieje też komunikat o braku wolnych godzin; wynik zapisu nie jest ustalony.
- `MGR-PAY-01`: test `manager-student-payment-create.spec.ts` używa `.fill()` dla „Terminu płatności”, który jest teraz przyciskiem `UiDatePicker`. Nie rozpoczął próby zapisu.

Wynik pełnego stosu można ponowić po uruchomieniu lokalnego Docker Desktop i Supabase. Brak tej infrastruktury dotyczy całej listy; nie został potraktowany jako błąd produktu.
