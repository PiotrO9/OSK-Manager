# Ponowny audyt automatyczny — 2026-10-18

- FE: `4545116` oraz lokalne zmiany testów i narzędzi audytu.
- BE: `374f453`.
- Środowisko: lokalny, izolowany `audit-local-stack` (Supabase, FE, BFF, BE i DB); testy UI używały pozorowanego API. FE działał na porcie 3200, bo port 3100 był zajęty przez inny proces.
- Każdy zestaw danych pełnego stosu odtworzono osobno przed właściwym testem. Nie użyto współdzielonego projektu DEV.

## Wyniki

| Zestaw | Wynik |
| --- | --- |
| FE Vitest | 902/902 zaliczone (180 plików) |
| BE Vitest | 475/475 zaliczone (65 plików) |
| BE integration | 39/39 zaliczone (5 plików) |
| Playwright UI na mocku | 45/45 zaliczone |
| Playwright full stack `@smoke` i `@audit` | 12/19 zaliczonych, 7 niezaliczonych |

## Niezaliczone przypadki pełnego stosu

| ID | Miejsce zatrzymania | Stan ustalenia |
| --- | --- | --- |
| STU-04/STU-05 | Po `POST /api/lessons/me` test nie znalazł oczekiwanego komunikatu „Zarezerwowano jazdę:” z linkiem „Moje lekcje”. Widok pokazywał już 1 zarezerwowaną godzinę. | Zapis najpewniej nastąpił; trzeba sprawdzić prezentację potwierdzenia i oczekiwanie testu. |
| XR-04/MGR-PAY-01 | Test szuka natywnego elementu `option` w planie płatności, który jest obecnie niestandardową listą wyboru. | Nieaktualny selektor; dalszy przepływ nie został sprawdzony. |
| MGR-ACC-02 | Po zmianie e-maila test nie znalazł oczekiwanego komunikatu statusu. | Wynik zapisu i stan sesji wymagają sprawdzenia. |
| MGR-ACC-03 | Test nie znalazł napisu „Zablokowane” w `header` po operacji blokady. | Trzeba sprawdzić aktualny układ i wynik operacji. |
| MGR-ACC-04 | Test nie znalazł przycisku „Wyślij reset hasła” przy późniejszym sprawdzeniu jego stanu. | Trzeba sprawdzić aktualną etykietę i cały przepływ resetu. |
| MGR-ACC-05 | Test oczekuje angielskiego tekstu `active school obligations`; aplikacja pokazała polski komunikat „Konto ma aktywne zobowiązania w szkole. Zakończ je przed archiwizacją.” | Nieaktualne oczekiwanie tekstu; dalszy przepływ nie został sprawdzony. |
| COM-04 | Po kliknięciu „Wyloguj” adres pozostał na `/my-lessons` zamiast przejść na `/login`. Ten sam wynik wystąpił w osobnym ponowieniu. | Powtarzalne niepowodzenie wymagające analizy wylogowania. |

`MGR-ACC-03`–`05` uruchomiono oddzielnie po przerwaniu serii `describe.serial` przez `MGR-ACC-02`; każdy otrzymał świeży zestaw `account-ready`. Pozostałe przypadki pełnego stosu: smoke 3/3, MGR-OSK-01 1/1, MGR-ACC-01 1/1, COM-05 3/3, COM-02 1/1, COM-03 2/2 i COM-13 1/1.

Wyniki ręczne z checklisty pozostają osobne. Ta weryfikacja nie daje podstaw do stwierdzenia, że wszystkie automaty przechodzą.
