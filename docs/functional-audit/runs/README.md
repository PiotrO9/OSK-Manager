# Przebiegi audytu

Każdy przebieg ma osobny plik `YYYY-MM-DD-nazwa-przebiegu.md` utworzony ze wzoru
poniżej. Nie nadpisuj wcześniejszych wyników po poprawce; utwórz nowy przebieg.
Scenariusze pozostają w `../scenarios/`, zbiorczy postęp w `../checklist.md`,
a problemy w `../findings.md`. Test ręczny jest wymagany dla każdego scenariusza;
automat jest dodatkowy i opcjonalny. Historycznych przebiegów nie przepisuj na
nowy format ani nie uznawaj ich wyników automatycznych za ręczne.

## Wzór pliku przebiegu

```md
# Przebieg: YYYY-MM-DD — nazwa

- Data i osoba wykonująca:
- Wersja FE (commit):
- Wersja BE (commit):
- Środowisko / URL:
- Zestaw danych i jego wersja:
- Zakres: ścieżka podstawowa / pełny audyt / ponowny test / wskazane ID
- Konfiguracja istotna dla testu, bez sekretów:

| Scenariusz | Ręcznie (wymagane) | Automatycznie (opcjonalne) | Dowód / F-ID | Uwagi i powód braku automatu |
| --- | --- | --- | --- | --- |
| COM-... | niewykonany | — | — | — |

## Podsumowanie

- Ręcznie zaliczonych / niezaliczonych / zablokowanych / niewykonanych:
- Automatycznie zaliczonych / niezaliczonych / bez wyniku / bez próby:
- Decyzja o odbiorze i uzasadnienie:
- Scenariusze wymagające powtórzenia:
```

Wyniki ręczne: `zaliczony`, `niezaliczony`, `zablokowany`, `niewykonany`.
`Zablokowany` oznacza brak możliwości wykonania testu, np. brak danych,
niedostępne środowisko lub nierozstrzygniętą regułę. Błąd aplikacji ujawniony
w wykonanych krokach oznacza wynik `niezaliczony` i wpis w `findings.md`.
Wyniki automatyczne: `zaliczony`, `niezaliczony`, `nie udało się`, `pominięty`
albo `—` (bez próby). `Nie udało się` oznacza, że automat nie dostarczył
wiarygodnego wyniku, np. przez błąd środowiska; `pominięty` oznacza świadomą
rezygnację z automatyzacji. Przy obu wpisz konkretny powód w uwagach. Błąd
aplikacji wykryty przez poprawnie działający automat oznacz `niezaliczony`.
Nie przenoś wyniku automatycznego do ręcznego. Po zakończeniu przebiegu
zaktualizuj odpowiednie wiersze w `../checklist.md` i odsyłaj z nich do przebiegu.
Zrzuty i logi przechowuj bez haseł, tokenów i danych osobowych; w tabeli podawaj
odnośniki do bezpiecznych dowodów.
