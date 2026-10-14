# Przebieg: 2026-10-14 — MGR-REV-01, opinie o zakończonych jazdach

- Data i wykonawca: 2026-10-14, użytkownik (ręczny test i potwierdzenie pomyślnego wyniku); Codex (przygotowanie danych i zapis wyniku).
- Środowisko: lokalna aplikacja `http://localhost:3000` i odizolowana baza testowa.
- Dane: menedżer `manager001@post.pl`; `OSK Warszawa Demo 1` z ocenami oraz przygotowana pusta `OSK Audyt Opinie B`. Haseł nie zapisano.
- Punkt kontrolny: ocena 5/5 jazdy z Janem Instruktorem z 9.10.2026 o 10:00, komentarz „Test XR-05: opinia widoczna w trzech rolach”. Przed testem odczyt API zwrócił 2 opinie dla pierwszej szkoły z ostatnich 7 dni, 1 po wybraniu Jana oraz 0 opinii dla drugiej szkoły.
- Zakres: wybór szkoły i okresu, filtrowanie po instruktorze, porównanie ocenionej i nieocenionej jazdy, odświeżenie widoku oraz izolacja opinii między szkołami zgodnie ze [scenariuszem](../scenarios/manager.md).

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / uwagi |
| --- | --- | --- | --- |
| `MGR-REV-01` | zaliczony — użytkownik potwierdził 2026-10-14, że test przeszedł pomyślnie | — | Potwierdzenie użytkownika w rozmowie. Odczyty API wykorzystano do przygotowania danych; nie zastępują testu ręcznego. |

## Podsumowanie

- Ręcznie: 1 zaliczony, 0 niezaliczonych, 0 zablokowanych, 0 niewykonanych.
- Decyzja: `MGR-REV-01` zaliczony na podstawie potwierdzenia użytkownika.
- Stan końcowy: test był odczytowy i nie wymaga przywrócenia danych.
