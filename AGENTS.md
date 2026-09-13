# Instrukcje dla agentów

## Changelog przy każdej zmianie

- Każda zmiana w repozytorium musi mieć wpis w [CHANGELOG.md](CHANGELOG.md), w sekcji
  `## Unreleased`. Dotyczy to funkcji, poprawek, refaktoryzacji, zależności, konfiguracji,
  CI, testów i dokumentacji. Uzupełnij wpis w tym samym zestawie zmian, przed zakończeniem pracy.
- Cały `CHANGELOG.md` pisz **po angielsku**: wstęp, nagłówki, statusy i wpisy.
  Sekcja robocza ma dokładny nagłówek `## Unreleased` (dawniej „Robocze”).
  Pisz krótko i konkretnie: co się zmieniło i jaki jest skutek dla użytkownika lub
  utrzymania projektu. Opisuj stan faktyczny, bez planowanych i niewykonanych prac.
- Używaj pasujących podsekcji: `Added`, `Changed`, `Fixed`, `Deprecated`,
  `Removed`, `Security`, `Maintenance`, `Tests`, `Documentation`.
  Dodawaj tylko potrzebne podsekcje; powiązane zmiany można opisać jednym wpisem.
- Jeśli rozwijasz tę samą zmianę, zaktualizuj istniejący wpis roboczy zamiast go dublować.
  Korekta samego wpisu changelogu nie wymaga osobnego wpisu o tej korekcie.
- Zachowuj wpisy innych autorów. Nie dopisuj nowych prac do zamkniętych wersji i nie
  zmieniaj ich numerów ani dat. Oczywiste błędy opisu można poprawić bez zmiany zakresu wydania.
- Changelog jest główną historią zmian. `docs/QA.md` przechowuje wyniki weryfikacji;
  raport QA lub dokument funkcji nie zastępuje wpisu w changelogu.
- Historię zmian w UI pisz **po polsku**. W `src/release-notes.json` zarówno `title`,
  jak i każdy element `changes` muszą być po polsku; polskie pozostają też etykiety
  okna historii i przycisków. Nie kopiuj angielskich wpisów do UI bez przetłumaczenia
  i dostosowania do użytkownika. Klucze JSON i numery wersji pozostają bez tłumaczenia.
- Nowe wpisy do `src/release-notes.json` dodawaj podczas przygotowania wydania,
  na podstawie angielskiego changelogu.
  Nie pokazuj w aplikacji sekcji „Unreleased”, opisów CI, commitów ani wewnętrznych
  szczegółów implementacji. Numer aplikacji pochodzi z `package.json`.
- Zwykła realizacja zadania nie zmienia numeru wersji, nie przenosi wpisów z sekcji
  „Unreleased” i nie tworzy tagów. Wydanie wykonuj na polecenie wydania wersji, zgodnie
  z osobną instrukcją [docs/RELEASE.md](docs/RELEASE.md).

## Weryfikacja

Dobieraj sprawdzenia do zmiany i raportuj rzeczywiste wyniki. Przy zmianach wyłącznie
dokumentacyjnych sprawdź formatowanie i poprawność lokalnych odnośników; przy zmianie
metadanych wersji również zgodność `package.json` i `package-lock.json`.

Przy zmianie changelogu lub wydaniu sprawdź oba języki: `CHANGELOG.md` po angielsku,
a tytuły i opisy w `src/release-notes.json` oraz etykiety historii w UI po polsku.
Test zgodności wersji nie sprawdza języka — zweryfikuj go podczas przeglądu treści.
