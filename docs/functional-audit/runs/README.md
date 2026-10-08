# Przebiegi audytu

Każdy przebieg ma osobny plik `YYYY-MM-DD-nazwa-przebiegu.md` utworzony ze wzoru
poniżej. Nie nadpisuj wcześniejszych wyników po poprawce; utwórz nowy przebieg.
Scenariusze pozostają w `../scenarios/`, a problemy w `../findings.md`.

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

| Scenariusz | Wynik       | Dowód / F-ID | Uwagi |
| ---------- | ----------- | ------------ | ----- |
| COM-...    | niewykonany | —            | —     |

## Podsumowanie

- Zaliczonych:
- Niezaliczonych:
- Zablokowanych:
- Niewykonanych:
- Decyzja o odbiorze i uzasadnienie:
- Scenariusze wymagające powtórzenia:
```

Dozwolone wyniki: `zaliczony`, `niezaliczony`, `zablokowany`, `niewykonany`.
`Zablokowany` oznacza brak możliwości wykonania testu, np. brak danych,
niedostępne środowisko lub nierozstrzygniętą regułę. Błąd aplikacji ujawniony
w wykonanych krokach oznacza wynik `niezaliczony` i wpis w `findings.md`.
Zrzuty i logi przechowuj bez haseł, tokenów i danych osobowych; w tabeli podawaj
odnośniki do bezpiecznych dowodów.
