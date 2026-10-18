# Ponowny test automatów po korekcie — 2026-10-18

- Zakres: siedem nieudanych przypadków z [wcześniejszego przebiegu](2026-10-18-all-automatic-recheck.md) oraz pozostałe scenariusze pełnego stosu.
- Środowisko: lokalny, izolowany `audit-local-stack` z Supabase, FE na porcie 3200 i lokalnym BE. Każdy zestaw danych pełnego stosu odtwarzano przed jego przebiegiem; projektu DEV nie używano.
- Zmiany: dostosowanie testów do powiadomienia rezerwacji, list wyboru i kalendarza płatności, dialogów kont oraz przekierowania po ponownym logowaniu. Domyślną liczbę procesów Playwright UI ograniczono do dwóch. Nie zmieniano kodu produktu.

| Zestaw                                                | Wynik                         |
| ----------------------------------------------------- | ----------------------------- |
| Playwright full stack `@smoke`                        | 3/3 zaliczone                 |
| MGR-OSK-01                                            | 1/1 zaliczony                 |
| MGR-ACC-01–05, w kolejności na jednym `account-ready` | 5/5 zaliczone                 |
| COM-05                                                | 3/3 zaliczone                 |
| COM-02                                                | 1/1 zaliczony                 |
| COM-03, COM-04, COM-13                                | 4/4 zaliczone                 |
| STU-04/STU-05                                         | 1/1 zaliczony                 |
| XR-04/MGR-PAY-01                                      | 1/1 zaliczony                 |
| **Pełny stos łącznie**                                | **19/19 zaliczonych**         |
| Playwright UI, domyślne `npm run test:e2e:ui`         | 45/45 zaliczonych             |
| FE Vitest                                             | 902/902 zaliczone, 180 plików |
| FE typecheck i Prettier dla zmienionych specyfikacji  | zaliczone                     |

Pierwsza próba Playwright UI z 10 procesami zakończyła się wynikiem 37/45 i błędami lokalnego serwera testowego. Cały zestaw przeszedł 45/45 po ograniczeniu równoległości do dwóch procesów, także przy domyślnym poleceniu. W tym przebiegu nie ponawiano testów BE, ponieważ zmieniono jedynie testy, konfigurację Playwright i dokumentację.

Wyniki ręczne w checkliście są osobne i pozostały bez zmian.
