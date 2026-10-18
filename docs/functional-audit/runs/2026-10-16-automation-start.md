# Przebieg: 2026-10-16 — rozpoczęcie ponownego audytu automatycznego

- Wersja FE: `4545116` oraz zmiany robocze testów opisane poniżej.
- Wersja BE: `374f453`.
- Zakres: `COM-03`, `COM-04`, `COM-13`.
- Testy ręczne i ich wyniki pozostają w poprzednich przebiegach.

| Scenariusz | Wynik automatyczny | Dowód i ograniczenie |
| --- | --- | --- |
| COM-03 | nie udało się | Dwa przypadki pełnego stosu dodano w `e2e/specs/full/common-session-audit.spec.ts`. Runner zatrzymał się na `supabase status`, ponieważ Docker Engine jest niedostępny. |
| COM-04 | nie udało się | Przypadek dwóch kart, historii i ponownego logowania dodano w tym samym pliku. Runner zatrzymał się przed uruchomieniem przeglądarki z powodu niedostępnego Docker Engine. |
| COM-13 | zaliczony w sprawdzonym zakresie; pełny stos: nie udało się | Test UI bez skryptów sprawdził metodę POST, nieaktywny przycisk, próbę wysłania Enterem, czysty URL i brak żądania GET z danymi. `npm run test:e2e:ui -- --grep "formularz logowania nie wysyła hasła przed hydracją"`: 1/1 zaliczony. Przypadek pełnego stosu jest dodany, ale nie uruchomił się z powodu niedostępnego Docker Engine. |

Playwright wykrył cztery nowe przypadki pełnego stosu (`--list`). `npm run typecheck`, ESLint wskazanych plików i Prettier zakończyły się poprawnie. Próba `run-audit.mjs school-operational common-session-audit.spec.ts` zakończyła się przed resetem danych i przed startem aplikacji: `supabase status` nie mógł połączyć się z `dockerDesktopLinuxEngine`.

Nie przypisano wyniku `zaliczony` żadnemu nowemu przypadkowi pełnego stosu. Pozostałe scenariusze nie były częścią tego przebiegu.
