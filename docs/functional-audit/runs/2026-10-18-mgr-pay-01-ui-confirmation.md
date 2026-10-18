# Ponowne potwierdzenie UI MGR-PAY-01 — 2026-10-18

- FE: `4545116` oraz lokalne zmiany testu `e2e/specs/ui/manager-student-payment-create.spec.ts`.
- Środowisko: lokalny Nuxt i Playwright Chromium na porcie 3200; API płatności pozorowane.
- Polecenie: `npm run test:e2e:ui -- manager-student-payment-create.spec.ts --grep 'BUG-04 preserves a payment draft' --workers=1` z `E2E_PORT=3200`.
- Wynik: **1/1 zaliczony**, kod zakończenia 0, czas 24,1 s.

Test wybrał datę i metodę płatności, wysłał pierwsze żądanie `POST`, sprawdził zachowanie szkicu po błędzie API, a następnie ponowił zapis i sprawdził wyczyszczenie formularza. Oczekiwane dane żądania i liczba dwóch żądań `POST` są asercjami testu.

To ponowny test UI na mocku. Nie jest nowym testem ręcznym ani testem pełnego stosu FE → BFF → BE → baza.
