# COM-09 — automatyczny przebieg wygasłej sesji

- Data i wykonawca: 2026-10-14, Codex (Playwright CLI, Chromium).
- Wersje: uruchomione procesy FE i BE nie zostały przypisane do dokładnych commitów; w chwili zapisu HEAD FE to `c19c792`, BE to `62c0ff4`.
- Środowisko: istniejące lokalne FE `http://127.0.0.1:3000` i BE `http://127.0.0.1:3001`, baza DEV. Izolowany stos Supabase nie uruchomił się, ponieważ silnik Docker Desktop był niedostępny.
- Dane: menedżer `manager001@post.pl`, OSK Warszawa Demo 1, instruktor `instructor001@post.pl`. Użyto dwóch odrębnych sesji Chromium. Hasła i tokeny nie są zapisane w tym pliku.
- Zakres: [COM-09](../scenarios/common.md).

| Kontrola | Wynik automatyczny |
| --- | --- |
| Instruktor otwiera `/my-lessons`, menedżer blokuje jego konto | Panel pokazał status „Zablokowane”. |
| Żądanie `/api/auth/me` ze starej sesji | `403` podczas blokady. |
| Samoczynna kontrola w tle bez kliknięcia i odświeżenia strony instruktora | Strona przeszła z `/my-lessons` na `/login`; w historii żądań widoczne `403` dla `/api/auth/me`. |
| Bezpośrednie wejście na `/my-lessons` przy zablokowanym koncie | Końcowy adres `/login`; chroniona strona nie była dostępna. |
| Odblokowanie i próba użycia starej sesji | Panel pokazał konto aktywne, lecz stare żądanie `/api/auth/me` zwróciło `401` i wejście na `/my-lessons` zakończyło się na `/login`. |
| Nowe logowanie po odblokowaniu | Zadziałało; otwarto `/my-lessons`. |
| Nawigacja przy poprawnej sesji i zasymulowanym `503` na `/api/auth/me` | Przejście z `/my-lessons` do `/my-reviews` zadziałało; okresowe żądanie zwróciło `503`, lecz sesja pozostała aktywna. Po usunięciu symulacji `/api/auth/me` zwróciło `200`. |

## Podsumowanie

- Ręcznie: niewykonany. Ten przebieg nie zastępuje wymaganej kontroli ręcznej.
- Automatycznie: zaliczony w sprawdzonym zakresie.
- Nie zarejestrowano osobnej klatki zasłony prywatności między odpowiedzią `403` a przekierowaniem; potwierdzono samoczynne przekierowanie i odmowę dostępu. Nie zmierzono dokładnego czasu kontroli sesji ani pierwszej klatki po wejściu na chroniony adres.
- Po teście odblokowano konto i wylogowano obie sesje.
