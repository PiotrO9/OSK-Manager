# Scenariusze obejmujące kilka ról

Te scenariusze sprawdzają spójność jednego procesu widzianego przez różnych
użytkowników. Krótsze testy poszczególnych funkcji znajdują się w plikach ról.
Przed przebiegiem zapisz wersje FE i BE oraz identyfikator zestawu danych w `runs/`.

## XR-01 — Od nowego OSK do kursu widocznego dla kursanta

- **Priorytet:** P0
- **Wymagania:** `REQ-XR-01`
- **Role:** menadżer, kursant
- **Dane:** `manager-only`; unikalne dane nowej szkoły, instruktora, pojazdu,
  kursu i kursanta. Przygotowanie tego stanu jest wymaganiem dla przyszłego narzędzia.
- **Zależności:** brak OSK przypisanego do menadżera; dostępna kategoria kursu.

1. Zaloguj się jako menadżer. W OSK utwórz szkołę i skonfiguruj pola wymagane przez formularz.
   **Oczekiwane:** szkoła jest widoczna na liście i po odświeżeniu strony.
2. Dodaj instruktora z kwalifikacją do wybranej kategorii, ustaw dostępność i
   dodaj pojazd do OSK. Otwórz Kursy i utwórz kurs dla tej szkoły.
   **Oczekiwane:** zasoby i kurs występują w kontekście nowego OSK.
3. Otwórz Kursanci, zarejestruj nowego kursanta i przypisz go do kursu.
   **Oczekiwane:** menadżer widzi kurs oraz przypisanie kursanta po ponownym odczycie.
4. Wyloguj się i zaloguj jako przypisany kursant. Otwórz „Moje kursy”.
   **Oczekiwane:** widoczny jest ten sam kurs właściwego OSK; nie pojawiają się kursy
   innych użytkowników.

**Stan końcowy:** OSK, zasoby, kurs i przypisanie istnieją. **Powtórzenie:** odtwórz
`manager-only` albo użyj nowych jednoznacznie nazwanych kont, OSK i kursu.
**Źródła:** `app/pages/manager/osk/index.vue`, `app/pages/manager/courses/new.vue`,
`app/pages/manager/students/index.vue`, `app/pages/my-courses.vue` w FE.

## XR-02 — Rezerwacja jazdy widoczna w trzech rolach

- **Priorytet:** P0
- **Wymagania:** `REQ-XR-02`
- **Role:** kursant, instruktor, menadżer
- **Dane:** `booking-ready`; termin w przyszłości, w dostępności instruktora i OSK.
- **Zależności:** aktywny kurs praktyczny i godziny możliwe do wykorzystania.

1. Jako kursant otwórz „Rezerwuj jazdę”, wybierz kurs, wolny termin i potwierdź.
   Zapisz datę, godzinę i instruktora.
   **Oczekiwane:** pojawia się potwierdzenie, a jazda występuje dokładnie raz w „Moich lekcjach”.
2. Odśwież stronę i sprawdź ten sam termin.
   **Oczekiwane:** zapis utrzymuje się; dostępne godziny kursu odzwierciedlają rezerwację.
3. Zaloguj się jako przypisany instruktor i otwórz „Moje lekcje”.
   **Oczekiwane:** widoczna jest ta sama jazda, godzina i kursant.
4. Zaloguj się jako menadżer właściwego OSK i otwórz Harmonogram OSK.
   **Oczekiwane:** ta sama jazda pojawia się przy właściwym instruktorze i terminie.
5. Jako kursant ponownie otwórz listę terminów kursu.
   **Oczekiwane:** zarezerwowany termin nie jest oferowany ponownie dla kolidującego zasobu.

**Stan końcowy:** nowa jazda. **Powtórzenie:** odtwórz `booking-ready`.
**Źródła:** `app/pages/book-lesson.vue`, `app/pages/my-lessons.vue`,
`app/pages/manager/schedule/index.vue` w FE; `BE/src/routes/lessons.routes.ts`.

## XR-03 — Zmiana lub anulowanie jazdy aktualizuje wszystkie widoki

- **Priorytet:** P0
- **Wymagania:** `REQ-XR-03`
- **Role:** kursant, instruktor, menadżer
- **Dane:** `lesson-scheduled`; zaplanowana jazda w przyszłości.
- **Decyzja potrzebna:** szczegółowe granice czasu i uprawnienia do anulowania
  są oznaczone w wymaganiach do potwierdzenia. Wykonaj tylko dostępny wariant.

1. Jako kursant otwórz „Moje lekcje” i anuluj jazdę, jeżeli interfejs oferuje akcję.
   Potwierdź operację.
   **Oczekiwane:** status jazdy zmienia się po odświeżeniu zgodnie z przyjętą regułą.
2. Jako instruktor sprawdź „Moje lekcje”, a jako menadżer Harmonogram OSK.
   **Oczekiwane:** oba widoki pokazują spójny status i nie przedstawiają jazdy jako aktywnej.
3. Sprawdź możliwość ponownej rezerwacji terminu.
   **Oczekiwane:** termin wraca do dostępnych tylko wtedy, gdy żaden inny zasób
   lub reguła dostępności go nie blokuje.

**Stan końcowy:** jazda anulowana. **Powtórzenie:** odtwórz `lesson-scheduled`.
**Źródła:** `app/pages/my-lessons.vue`, `app/pages/manager/schedule/index.vue` w FE;
`BE/src/services/lesson/`.

## XR-04 — Opłata menadżera widoczna dla kursanta

- **Priorytet:** P0
- **Wymagania:** `REQ-XR-04`
- **Role:** menadżer, kursant
- **Dane:** `payment-ready`; kursant przypisany do kursu bez opłaty o wybranej
  jednoznacznej kwocie i terminie.

1. Jako menadżer otwórz szczegóły kursanta, sekcję płatności i dodaj opłatę
   dla wskazanego kursu. Zapisz kwotę, termin oraz status.
   **Oczekiwane:** w sekcji kursanta występuje dokładnie jedna nowa opłata.
2. Odśwież stronę. **Oczekiwane:** kwota, termin i status nie zmieniają się.
3. Jako kursant otwórz „Moje opłaty”, także po odświeżeniu.
   **Oczekiwane:** ta sama opłata jest widoczna dokładnie raz przy właściwym kursie.

**Stan końcowy:** nowa opłata. **Powtórzenie:** odtwórz `payment-ready`.
**Źródła:** `app/pages/manager/students/[userId].vue`, `app/pages/my-payments.vue` w FE;
`BE/src/routes/students.routes.ts`.

## XR-05 — Ocena zakończonej jazdy widoczna dla instruktora i menadżera

- **Priorytet:** P1
- **Wymagania:** `REQ-XR-05`
- **Role:** kursant, instruktor, menadżer
- **Dane:** `lesson-completed-unrated`; zakończona jazda kwalifikująca się do oceny.

1. Jako kursant otwórz „Moje lekcje” i wystaw ocenę zakończonej jeździe.
   **Oczekiwane:** aplikacja potwierdza zapis, a ocena pozostaje widoczna po odświeżeniu.
2. Jako instruktor otwórz „Moje opinie”.
   **Oczekiwane:** nowa ocena jest uwzględniona na liście i w podsumowaniu.
3. Jako menadżer otwórz „Opinie”, wybierz właściwe OSK i instruktora.
   **Oczekiwane:** ocena i podsumowanie są spójne z widokiem instruktora.

**Stan końcowy:** jazda oceniona. **Powtórzenie:** odtwórz
`lesson-completed-unrated`. **Źródła:** `app/pages/my-lessons.vue`,
`app/pages/my-reviews.vue`, `app/pages/manager/reviews/index.vue` w FE;
`BE/src/routes/lesson-ratings.routes.ts`.

## XR-06 — Izolacja danych między szkołami

- **Priorytet:** P0
- **Wymagania:** `REQ-XR-06`
- **Role:** dwóch menadżerów, kursant i instruktor jednej szkoły
- **Dane:** `two-schools-isolated`.

1. Jako menadżer szkoły A odczytaj listę kursantów, instruktorów, kursów,
   pojazdów i harmonogram A. Zapisz identyfikatory przykładowych rekordów.
2. Zaloguj się jako menadżer szkoły B i otwórz odpowiadające listy.
   **Oczekiwane:** rekordy A nie pojawiają się w B.
3. Otwórz bezpośredni adres szczegółu rekordu A, będąc zalogowanym jako menadżer B.
   **Oczekiwane:** brak dostępu i brak ujawnienia danych A.
4. Jako kursant lub instruktor A sprawdź swoje widoki.
   **Oczekiwane:** dane B nie są widoczne.

**Stan końcowy:** brak zmian. **Powtórzenie:** bez resetu, jeśli nic nie zapisano.
**Źródła:** middleware stron `app/pages/manager/`, `BE/src/routes/`,
`BE/src/middleware/auth.middleware.ts`.
