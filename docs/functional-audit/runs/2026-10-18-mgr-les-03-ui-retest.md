# Ponowny test UI MGR-LES-03 — 2026-10-18

- FE: `4545116` oraz lokalna poprawka `e2e/specs/ui/manager-lesson-instructor-change.spec.ts`.
- BE: nieuczestniczący w tym przebiegu; API było pozorowane.
- Środowisko: lokalny Nuxt i Playwright Chromium na porcie 3200.
- Polecenie: `npm run test:e2e:ui -- manager-lesson-instructor-change.spec.ts --workers=1` z `E2E_PORT=3200`.
- Wynik: **2/2 zaliczone**. Test zmiany instruktora potwierdził żądanie `PATCH` i widok nowego instruktora; drugi test potwierdził blokadę zmiany po rozpoczęciu jazdy.

Przed poprawką test zmiany instruktora zatrzymywał się na selektorze przycisku „Zapisz zmiany”. Po zmianie selektora na „Zapisz” dotarł do końcowego sprawdzenia tekstu „Prowadzący kurs: Jan Kowalski.”, którego aktualny formularz już nie pokazuje. Usunięto tę nieaktualną asercję. Nie zmieniano kodu aplikacji.

Wynik dotyczy UI z pozorowanym API. Nie zastępuje ręcznego wyniku MGR-LES-03 ani testu pełnego stosu.
