# Prompt utrzymania design systemu T01

Pracuj w FE/OSK-Manager-FE. Przeczytaj DESIGN_SYSTEM_REBUILD_PLAN.md, UI_COMPONENT_PATTERNS.md i aktualny wpis T01 w UI_REFRESH_PLAN.md. Kod i kontrakty komponentów są źródłem prawdy.

## Uzgodniony zakres

Warsztat /design-system pokazuje istniejące prymitywy i aktualne kompozycje W07, W08, W18, W27 i W29. Korzysta z Satoshi, globalnych tokenów CSS oraz motywów light/dark.

Przyciski demonstracyjne mają prezentować wygląd; mogą pozostać bez handlerów. To decyzja użytkownika z 2026-10-05. Nie implementuj operacji biznesowych na potrzeby showcase. Działają nawigacja sekcji, zakładki, wybór motywu i scenariusza. Zachowaj istniejące lokalne interakcje.

## Architektura

- Strona składa sekcje; dane demonstracyjne należą do app/data/design-system.
- Reuse aktualnych komponentów; warstwy prezentacyjne są wspólne z aplikacją.
- ManagerStudentNotesContent pokazuje notatkę bez API; zapis pozostaje w ManagerStudentNotes. Sloty kartoteki zachowują dotychczasowe domyślne zachowanie.
- Płatności używają wspólnego getMyPaymentsToolbarSummary. Opcjonalna referenceDate stabilizuje przykład, pozostawiając bieżącą datę w aplikacji.
- Wartości CSS należą do osk-design-tokens.css; tailwind.css je importuje i mapuje. Dane katalogu kolorów nie powielają hexów.
- Używaj Composition API, script setup, TypeScript, Reka UI i aktualnych pickerów. Nie reinstaluj prymitywów ani nie twórz globalnego demo-mode.

## Weryfikacja i domknięcie

Zachowaj obce zmiany. Uruchom kontrole odpowiednie do zakresu: typecheck, Vitest, lint, build oraz e2e/specs/ui/design-system.spec.ts w trybie mock. Sprawdź mobile/desktop, oba motywy, zakładki klawiaturą, bezpośrednie linki, stany, portale, zgodność próbek z CSS, font i brak domenowych żądań. Sprawdź regresję W08 i W29.

Podgląd i testy przeglądarkowe wykonuj headless. Korzystaj z konfiguracji Playwrighta dla izolowanego mock; port 3001 należy do backendu. Nie wyłączaj middleware ani nie używaj prawdziwych zapisów do testów.

Aktualizuj bieżące docs, zapisując wyniki oraz zastane problemy. T01 zostało zaakceptowane przez użytkownika 2026-10-06. Commit, push i deploy wymagają osobnego polecenia.
