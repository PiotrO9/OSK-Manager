# F-001 — weryfikacja postępu i salda rezerwacji

- Data: 2026-10-16.
- Ustalenie: [F-001](../findings.md#f-001--procent-postępu-użyty-jako-liczba-wykorzystanych-godzin).
- Środowisko: lokalna aplikacja `http://localhost:3000`.
- Wersje przy weryfikacji: FE `a988599`, BE `374f453`.
- Konto i kurs: Kamil Kursant (`student001@post.pl`), „Kategoria A - grupa 1/1” w OSK Warszawa Demo 1.
- Zakres instrukcji: porównanie postępu w „Moje kursy” z saldem w „Rezerwuj jazdę”, rezerwacja godzinnego terminu, odświeżenie widoków i anulowanie jazdy testowej.
- Oczekiwany stan początkowy: 30 godz. programu, 3,5 godz. ukończonych, 7,5 godz. wszystkich nieanulowanych jazd, 22,5 godz. dostępnych do rezerwacji i 12% ukończenia.
- Oczekiwany stan po jednogodzinnej rezerwacji: 8,5 godz. zarezerwowanych i 21,5 godz. pozostałych; postęp ukończenia pozostaje 12%.
- Wynik ręczny: użytkownik potwierdził w rozmowie pomyślną weryfikację F-001. Nie przekazał osobnych wartości odczytanych po każdym kroku.
- Dodatkowy odczyt API po potwierdzeniu: `totalHours=30`, `completedMinutes=210`, `bookedMinutes=450`, `remainingBookableMinutes=1350`, `progress=12`.

Ustalenie zamknięto: obecny kontrakt rozróżnia procent ukończenia od salda minut dostępnych do rezerwacji.
