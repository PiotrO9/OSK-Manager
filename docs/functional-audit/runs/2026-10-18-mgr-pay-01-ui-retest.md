# Ponowny test UI MGR-PAY-01 — 2026-10-18

- FE: `4545116` oraz lokalna poprawka `e2e/specs/ui/manager-student-payment-create.spec.ts`.
- BE: nieuczestniczący w tym przebiegu; API było pozorowane.
- Środowisko: lokalny Nuxt i Playwright Chromium na porcie 3200.
- Polecenie celowane: `npm run test:e2e:ui -- manager-student-payment-create.spec.ts --workers=1` z `E2E_PORT=3200`.
- Wynik celowany: **2/2 zaliczone**. Scenariusz błędu zapisu potwierdził zachowanie danych formularza, komunikat błędu, drugą próbę i wyczyszczenie formularza po sukcesie.
- Cała suita UI: `npm run test:e2e:ui -- --workers=2` z `E2E_PORT=3200` — **45/45 zaliczone**.

Test wybiera termin przyciskiem „Dzisiaj” w kalendarzu, a metodę płatności przez listę opcji. Datę oczekiwaną w żądaniu wyznacza dla strefy Europe/Warsaw. Sprawdzenia widocznych wartości używają tekstu kontrolek zamiast `toHaveValue()`. Zmieniono też oczekiwanie komunikatu po błędzie API na aktualny tekst „Nie udało się dodać płatności.” Nie zmieniano kodu aplikacji.

Wynik dotyczy UI z pozorowanym API. Nie zastępuje ręcznego wyniku MGR-PAY-01 ani testu pełnego stosu.
