# OSK Manager UI Redesign Guidelines

Ten dokument opisuje kierunek redesignu UI aplikacji OSK Manager. Ma byc uzywany jako staly kontekst dla AI i developera podczas przerabiania istniejacych widokow.

## Cel redesignu

Redesign dotyczy warstwy UI/UX, a nie przebudowy produktu.

Nie zmieniamy idei istniejacych widokow, przeplywow biznesowych ani zakresu funkcjonalnosci. Obecne ekrany maja zostac zachowane znaczeniowo, ale przeprojektowane wizualnie: uklad elementow, hierarchia informacji, wyglad komponentow, spacing, typografia, tabele, formularze, karty, statusy i akcje.

Kazdy widok nalezy traktowac jako dzialajacy modul OSK Managera, ktory ma dostac lepsza prezentacje danych i bardziej spojny interfejs.

## Kierunek wizualny

Glowne referencje stylu:

- https://dribbble.com/shots/25159930-School-management-Students
- https://dribbble.com/shots/25163726-School-management-Teachers

Referencje domenowe i produktowe:

- https://oskadmin.pl/
- https://www.jazdeo.com/

Te linki nie sa instrukcja kopiowania layoutu 1:1. Sa odniesieniem dla poziomu minimalizmu, gestosci informacji, sposobu prezentacji danych i ogolnego charakteru panelu administracyjnego.

Zaakceptowane mockupy robocze dla widokow znajduja sie w `docs/ui-redesign-mockups/`. Sa najblizszym wzorcem kompozycji, spacingu, gestosci i stylu dla implementacji, ale nie sa zrodlem prawdy o funkcjach ani danych.

Interfejs powinien byc:

- jasny, minimalistyczny i profesjonalny;
- operacyjny, czyli nastawiony na codzienna prace w szkole jazdy;
- czytelny przy duzej liczbie danych;
- mniej sztywny niz prosty kafelkowy dashboard;
- bardziej dopracowany niz generyczny starter shadcn;
- spokojny wizualnie, ale nie pusty.

## Zakres zmian

Przy redesignie mozna zmieniac:

- layout widoku;
- hierarchie informacji;
- grupowanie danych;
- komponenty UI;
- wyglad tabel, list, formularzy, kart i dialogow;
- spacing, typografie, kolory i statusy;
- sposob prezentacji akcji uzytkownika;
- responsywne uklady desktop/mobile.

Nie nalezy zmieniac bez wyraznej potrzeby:

- sensu danego widoku;
- przeplywu biznesowego;
- istniejacych akcji;
- danych wymaganych przez backend;
- logiki uprawnien;
- routingu;
- kontraktow API i BFF;
- nazewnictwa domenowego.

## Zasady pracy nad widokiem

Przed edycja konkretnego widoku:

1. Zrozum, jaka role pelni widok w OSK Managerze.
2. Wypisz najwazniejsze informacje i akcje uzytkownika.
3. Zachowaj wszystkie istniejace stany: loading, empty, error, success, disabled.
4. Popraw UI bez zmiany funkcjonalnosci.
5. Sprawdz, czy podobny wzorzec istnieje juz w innych widokach.
6. Jesli wzorzec bedzie uzywany wielokrotnie, wydziel komponent globalny.
7. Otworz odpowiadajacy mockup desktop i mobile z `docs/ui-redesign-mockups/`.
8. Porownaj mockup z aktualnym kodem widoku i oznacz elementy, ktorych nie ma w danych/API.

Podczas redesignu:

- projektuj pod realna prace managera, instruktora i kursanta;
- pokazuj dane w sposob skanowalny;
- tworz wyrazna hierarchie: naglowek, kontekst, filtry, dane, akcje;
- utrzymuj gestosc informacji zblizona do referencji Dribbble;
- unikaj ekranow zlozonych z samych duzych kart statystyk;
- preferuj tabele, listy, osie czasu, kalendarze i panele szczegolow tam, gdzie pomagaja w pracy;
- zachowuj spojnosc miedzy widokami.
- nie dodawaj do aplikacji fikcyjnych danych, licznikow, filtrow, akcji ani sekcji tylko dlatego, ze sa na mockupie;
- jezeli mockup pokazuje brakujacy element, zapisz go jako brak/decyzje w `UI_REDESIGN_IMPLEMENTATION_TODO.md` i nie renderuj go na stronie.

## Workflow redesignu widoku

Przy kazdym widoku wykonaj:

1. Zidentyfikuj cel widoku i role uzytkownika, ktora z niego korzysta.
2. Wypisz glowne akcje uzytkownika, np. dodanie, edycja, filtrowanie, przypisanie, anulowanie.
3. Wypisz dane, ktore musza zostac pokazane po redesignie.
4. Wypisz wszystkie stany widoku: loading, empty, error, disabled, success.
5. Sprawdz, czy istniejacy komponent globalny pasuje do ukladu.
6. Jesli wzorzec bedzie powtarzalny, zaproponuj albo wydziel komponent reuzywalny.
7. Porownaj widok z mockupem PNG i oddziel styl do wdrozenia od brakujacych danych/funkcji.
8. Przebuduj tylko UI, bez zmiany logiki biznesowej.
9. Zweryfikuj desktop i mobile.
10. Upewnij sie, ze zadna akcja, informacja ani stan widoku nie zniknely.
11. Zapisz w trackerze braki, ktorych nie wolno bylo mockowac.

Ten workflow jest wazniejszy niz szybkie "upiekszenie" ekranu. Redesign ma poprawic uzywalnosc dzialajacego modulu.

## Kryteria akceptacji redesignu

Widok po redesignie jest poprawny, jezeli:

- zachowuje wszystkie istniejace akcje;
- zachowuje wszystkie dane widoczne przed redesignem;
- zachowuje obsluge wszystkich istniejacych stanow;
- nie zawiera danych ani akcji wymyslonych na podstawie mockupu;
- ma odnotowane braki, jezeli mockup pokazuje cos, czego aktualny widok/API jeszcze nie wspiera;
- ma czytelna hierarchie informacji;
- korzysta z globalnych komponentow tam, gdzie to mozliwe;
- ma spojny spacing, typografie, akcje i statusy;
- dziala na desktopie i mobile;
- nie wyglada jak landing page;
- nie wyglada jak generyczny template bez zwiazku z OSK;
- nie zawiera dekoracji bez funkcji;
- nie pogarsza dostepnosci ani czytelnosci danych.

Jesli ktorys punkt nie jest spelniony, nalezy poprawic widok albo jasno opisac powod odstepstwa.

## Reguly wizualne

Stosuj te reguly jako praktyczne ograniczenia podczas wdrazania:

- Preferuj jasne tlo i subtelne granice.
- Uzywaj kart tylko tam, gdzie grupuja realna informacje.
- Nie zagniezdzaj kart w kartach.
- Nie buduj widoku z samych duzych kafelkow.
- Przyciski glowne stosuj oszczednie.
- Statusy pokazuj przez wspolny `StatusBadge`.
- Ikony maja wspierac skanowanie, nie byc dekoracja.
- Tabele powinny byc zwarte, ale czytelne.
- Opisy stron powinny byc krotkie i praktyczne.
- Kolor ma wspierac hierarchie i statusy, nie dominowac widoku.
- Elementy interaktywne musza miec czytelne stany hover, focus, disabled i loading.

## Globalne komponenty

Redesign powinien prowadzic do powstania lub konsekwentnego uzywania globalnych komponentow UI. Jezeli ten sam uklad albo zachowanie pojawia sie w wiecej niz jednym miejscu, nalezy rozwazyc wydzielenie komponentu.

Preferowane obszary do wspolnych komponentow:

- naglowki stron;
- paski filtrow;
- tabele danych;
- karty podsumowania;
- panele szczegolow encji;
- status badge;
- empty states;
- loading states;
- error states;
- formularze;
- dialogi;
- akcje w tabelach;
- uklady kalendarzy i harmonogramow.

Szczegolowe wzorce komponentow sa opisane w `UI_COMPONENT_PATTERNS.md`.

## Ton UI

OSK Manager ma wygladac jak narzedzie pracy dla szkoly jazdy:

- rzeczowe;
- uporzadkowane;
- nowoczesne;
- wiarygodne;
- szybkie w skanowaniu;
- bez marketingowej narracji.

Teksty w UI powinny byc krotkie i uzytkowe. Nie nalezy dodawac opisow funkcji tylko po to, aby wypelnic ekran. Jezeli tekst nie pomaga uzytkownikowi podjac decyzji albo wykonac akcji, prawdopodobnie jest zbedny.

## Czego unikac

Unikaj:

- przebudowywania funkcjonalnosci pod pretekstem redesignu;
- wymyslania nowego flow bez potrzeby;
- implementowania fikcyjnych danych z mockupu;
- mockowania brakujacych API, statystyk, statusow albo sekcji w docelowym widoku;
- duzych pustych kafelkow;
- przesadnego card-based layoutu;
- dashboardow opartych tylko na stat cards;
- przypadkowych gradientow;
- dekoracji bez funkcji;
- efektu "AI dashboard template";
- landing page'owego stylu wewnatrz aplikacji;
- osobnego stylowania kazdego widoku od zera;
- niespojnych rozmiarow przyciskow, badge'y, tabel i formularzy;
- ukrywania waznych akcji w miejscach trudnych do znalezienia.

## Zakazane zmiany bez osobnej zgody

Nie zmieniaj bez wyraznej zgody:

- nazw routow;
- struktury routingu;
- kontraktow API i BFF;
- nazw pol formularzy, jezeli sa powiazane z logika lub walidacja;
- logiki uprawnien;
- middleware;
- schematow walidacji;
- modelu danych;
- flow biznesowego;
- semantyki statusow;
- tlumaczen w sposob zmieniajacy sens funkcji;
- zachowania akcji zapisujacych, usuwajacych lub anulujacych dane.

Jezeli redesign wymaga zmiany z tej listy, najpierw opisz ryzyko i popros o osobna decyzje.

## Priorytet

Najwazniejsze sa:

1. Zachowanie funkcjonalnosci.
2. Spojna prezentacja danych.
3. Reuzywalne komponenty.
4. Ergonomia codziennej pracy.
5. Minimalizm bez utraty informacji.

Jezeli trzeba wybrac miedzy efektem wizualnym a czytelnoscia danych, pierwszenstwo ma czytelnosc danych.

## Raport po redesignie

Po zakonczonej zmianie podaj:

- jakie widoki zmieniono;
- jakie komponenty globalne dodano lub wykorzystano;
- jakie wzorce zostaly zastosowane;
- czy zachowano wszystkie akcje i stany widoku;
- jak sprawdzono desktop i mobile;
- jakie testy albo komendy weryfikacyjne uruchomiono;
- czy zostaly ryzyka lub ograniczenia.

Raport powinien byc krotki, konkretny i powiazany z rzeczywistymi zmianami w kodzie.

## Przykladowy prompt dla AI

```text
Przerob UI tego widoku zgodnie z docs/UI_REDESIGN_GUIDELINES.md i docs/UI_COMPONENT_PATTERNS.md.

Nie zmieniaj idei widoku, routingu, kontraktow API ani logiki biznesowej.
Zachowaj wszystkie istniejace akcje i stany.
Zastosuj workflow i kryteria akceptacji z dokumentacji.
Popraw layout, hierarchie informacji, wyglad komponentow i responsywnosc.
Tam, gdzie pojawia sie powtarzalny wzorzec, wydziel albo uzyj globalnego komponentu.
Styl ma byc zblizony do referencji School management Students/Teachers: minimalistyczny, jasny, operacyjny i gesty informacyjnie.
```
