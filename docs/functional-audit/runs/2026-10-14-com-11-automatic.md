# COM-11 — automatyczny przebieg odzyskiwania hasła

- Data i wykonawca: 2026-10-14, Codex (Node.js oraz Playwright, Chromium bez okna).
- Wersja FE: `7dedcc64dc530ad2a667e8ce2d9815dd5c4df147` oraz niezwiązane zmiany robocze. Wersja BE: `62c0ff41113312c16a7c5b3fab8584b7f45c2005` oraz niezwiązane zmiany robocze.
- Środowisko: działające lokalnie FE `http://127.0.0.1:3000`, BE `http://127.0.0.1:3001` i zdalna baza DEV. Nie jest to izolowany test odbiorowy.
- Dane: dwa utworzone tylko na czas prób konta `COM11` z losowymi hasłami. Oba konta usunięto z bazy aplikacji i Supabase Auth. Hasła, tokeny i linki nie zostały zapisane w repozytorium.
- Zakres: [COM-11](../scenarios/common.md), bez wysłania i odbioru wiadomości e-mail. Link recovery wygenerowano przez Supabase Admin API; w teście UI przekazano do strony sesję uzyskaną po weryfikacji linku. W ten sposób pominięto dostarczanie poczty i przekierowanie z wiadomości.

| Kontrola | Wynik automatyczny |
| --- | --- |
| Logowanie hasłem początkowym i odczyt `/auth/me` | `200`, sesja była aktywna przed resetem. |
| Link recovery i sesja z weryfikacji OTP | Wygenerowanie oraz jednorazowa weryfikacja powiodły się. |
| Zmiana hasła przez BE API | `200`, `changed: true`. |
| Dostęp poprzedniej sesji do `/auth/me` | `401` po zmianie hasła. |
| Logowanie starym i nowym hasłem | Stare: `401`; nowe: `200`. |
| Ponowne użycie linku | Supabase odrzucił ponowną weryfikację. |
| Formularz `/reset-password` w Chromium | Formularz zaakceptował nowe hasło i pokazał potwierdzenie; token został usunięty z adresu. |

## Wynik i ograniczenia

- Dwie próby automatyczne zakończyły się powodzeniem we wskazanym zakresie; sprzątanie kont zakończyło się powodzeniem.
- Nie sprawdzono formularza `/forgot-password`, wysłania wiadomości, jej dostarczenia, otwarcia linku z wiadomości ani przekierowania po kliknięciu. Te kroki wymagają kontrolowanej skrzynki lub lokalnego przechwytywania poczty i działającej konfiguracji wysyłki. Bez tego nie można uznać całego COM-11 za zaliczony.
- Wynik ręczny pozostaje niewykonany.
