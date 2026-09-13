# Wydawanie nowej wersji

Ta instrukcja dotyczy polecenia wydania wersji. Podczas zwykłej pracy dopisuj zmiany
do `## Unreleased` w [CHANGELOG.md](../CHANGELOG.md), zgodnie z [AGENTS.md](../AGENTS.md).

## Języki historii zmian

- `CHANGELOG.md`: cały plik po angielsku, łącznie z nagłówkami i wpisami w `## Unreleased`.
  Podsekcje: `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`,
  `Maintenance`, `Tests`, `Documentation`.
- Historia w UI: po polsku. W `src/release-notes.json` pisz po polsku `title` i każdy
  element `changes`; zachowaj polskie etykiety okna historii i przycisków. Przy wydaniu
  przetłumacz i skróć angielskie wpisy do opisów przydatnych użytkownikowi.
- Numery wersji muszą być zgodne w obu historiach. Kluczy JSON nie tłumaczymy.
  Test zgodności wersji nie wykrywa niewłaściwego języka, więc sprawdź treść ręcznie.

## Dobór numeru wersji

Stosujemy [Semantic Versioning 2.0.0](https://semver.org/lang/pl/): `MAJOR.MINOR.PATCH`.
W changelogu i tagach używamy prefiksu `v` (np. `v1.0.0`), a w plikach npm samego `1.0.0`.

Projekt nie udostępnia biblioteki ani zewnętrznego API. Na potrzeby SemVer kontraktem
kompatybilności są udokumentowane funkcje aplikacji i zachowanie istniejących danych
użytkownika: postępów, profili i ustawień. Zmiana wewnętrznego formatu danych z automatyczną,
bezstratną migracją zachowuje kompatybilność.

| Zmiana                                                                                            | Numer                                | Przykład po v1.0.0 |
| ------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------ |
| Niezgodna wstecz zmiana kontraktu, np. usunięcie funkcji lub brak migracji dotychczasowych danych | MAJOR; MINOR i PATCH wracają do zera | v2.0.0             |
| Nowa funkcja zgodna wstecz lub oznaczenie funkcji jako wycofywanej                                | MINOR; PATCH wraca do zera           | v1.1.0             |
| Poprawki błędów zachowujące kompatybilność                                                        | PATCH                                | v1.0.1             |

Dla wydania łączącego różne zmiany wybierz najwyższy wymagany poziom. Zmiany wyłącznie
dokumentacyjne, testowe lub porządkowe mogą poczekać w „Unreleased”; jeżeli są wydawane osobno,
konwencją projektu jest PATCH. Wersje przedpremierowe zapisuj np. jako `1.2.0-rc.1`.
Nie używaj ponownie już wydanego numeru i nie przesuwaj istniejących tagów.

Pierwszą wersją jest v1.0.0: obejmuje całą aplikację, profile, czytelną typografię
oraz historię zmian w UI. Wszystkie prace przed publikacją należą do tego wydania.
Historia wydań zaczyna się od v1.0.0 z 2026-09-13. Nie odtwarzaj wcześniejszych
wydań na podstawie commitów z etapu rozwoju aplikacji.

## Przygotowanie wydania

1. Sprawdź `git status`, historię zmian, dostępne tagi i ostatnią wersję changelogu.
   Porównaj numer w `package.json` z głównym polem `version` i `packages[""].version`
   w `package-lock.json`. Nie włączaj przypadkowych lokalnych zmian do wydania.
2. Porównaj sekcję „Unreleased” z różnicą względem tagu poprzedniego wydania. Sprawdź,
   czy każda zmiana przeznaczona do wydania ma odpowiedni wpis.
   Uzupełnij brakujące wpisy, połącz duplikaty i opisz ewentualne niezgodności oraz migrację.
3. Dobierz numer według zasad powyżej. Jeśli numer wskazany w poleceniu nie pasuje do
   zakresu zmian, wyjaśnij rozbieżność przed oznaczeniem wydania.
4. Przenieś gotowe wpisy z „Unreleased” do nowej sekcji `## vX.Y.Z — YYYY-MM-DD` bezpośrednio
   pod nią, z rzeczywistą datą wydania. Zachowaj na górze pustą sekcję `## Unreleased` dla
   kolejnych prac. Nie twórz drugiej sekcji dla już wydanej wersji. Nie przenoś wpisów
   zmian, których nie ma w wydawanym kodzie.
   Dodaj na początku `src/release-notes.json` obiekt z tym samym numerem w `version`
   (bez `v`), krótkim polskim tytułem `title` i listą opisów `changes`. Opisz korzyści
   i zmiany zachowania dla użytkownika, bez szczegółów implementacji. Dla wydania
   porządkowego wystarczy krótkie podsumowanie utrzymania aplikacji. Zachowaj starsze
   wpisy. Nie dodawaj tu
   sekcji roboczej ani przyszłych wersji. Test sprawdza zgodność
   listy wersji z changelogiem i najnowszego wpisu z `package.json`.
5. Zaktualizuj wersję w obu plikach npm, jeśli się zmienia. Pierwsze wydanie ma już
   numer `1.0.0`. Przykład przyszłego wydania `1.1.0`:

   ```sh
   npm version 1.1.0 --no-git-tag-version
   ```

   Polecenie ma zmienić wyłącznie metadane wersji; sprawdź diff, zwłaszcza lockfile.
   Nie zmieniaj przy tym wersji zależności ani kluczy/schematu localStorage.

6. Wykonaj sprawdzenia wydania:

   ```sh
   npm run format:check
   npm test
   VITE_BASE_PATH=/czytanki/ npm run test:e2e
   ```

   Testy E2E budują produkcyjną aplikację i uruchamiają desktopowy oraz mobilny Chromium.
   Jeśli przeglądarki brakuje, zainstaluj ją poleceniem `npx playwright install chromium`.
   Sprawdź też ręcznie zmienione przepływy, jeśli automatyczne testy ich nie pokrywają.
   Zapisz datę, wersję, faktyczne wyniki i ograniczenia w `docs/QA.md`; nie przepisuj
   wyników poprzedniej wersji jako nowych. Nie oznaczaj wydania z niezaliczonymi kontrolami.
   Zweryfikuj numer i historię w stopce oraz okno nowości po uruchomieniu ze stanem
   `lastLaunchedVersion` poprzedniej wersji w testowej przeglądarce. Okno ma uwzględniać
   pominięte wydania, nie powtarzać się przy ponownym uruchomieniu i działać offline.

7. Sprawdź końcowy diff i spójność numeru wersji, zakresu changelogu oraz raportu QA.
   Potwierdź, że `CHANGELOG.md` jest po angielsku, a tytuły, opisy i etykiety historii
   widoczne w aplikacji są po polsku.
   Samo przeniesienie wpisów i podbicie numeru nie wymaga osobnego wpisu w changelogu.

## Oznaczenie i publikacja

Jeżeli zlecono tylko przygotowanie lub weryfikację, zakończ na gotowym diffie.
Commit, tag i publikację wykonuj dopiero w zakresie polecenia wydania.

1. Utwórz commit wydania `chore: release vX.Y.Z` z przygotowanymi zmianami i adnotowany
   tag `vX.Y.Z` na tym commicie. Nie taguj innego stanu niż zweryfikowany.
2. Jeśli polecenie obejmuje publikację, wypchnij commit na `master` i konkretny tag
   wydania. Push na `master` uruchamia istniejący workflow GitHub Pages; sam tag nie
   uruchamia wdrożenia. `package.json` ma `private: true`, więc nie używaj `npm publish`.
3. Poczekaj na wynik workflow i sprawdź aplikację pod adresem
   [Czytanki](https://bukowskiadam.github.io/czytanki/). Publikację uznaj za zakończoną
   dopiero po pomyślnym wdrożeniu. W podsumowaniu podaj numer, commit/tag, wyniki kontroli
   i status publikacji. Jeżeli zlecono tylko przygotowanie, zakończ na gotowym diffie
   i wyraźnie podaj, że wersja nie została opublikowana.
