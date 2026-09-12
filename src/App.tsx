import { useEffect, useState } from 'react';
import { polishPlural, cardCount } from './format';
import { allCards, allLessons, levels, type Level, type ReadingCard } from './data';
import {
  completeLesson,
  dateKey,
  defaultProgress,
  getStreak,
  getLongestStreak,
  parseProgress,
  STORAGE_KEY,
  type Progress,
  type Settings,
} from './storage';
import { Icon, type IconName } from './components/Icon';
import { ForestScene, Fox } from './components/Illustrations';
import { Dialog } from './components/Dialog';
import { ReadingSession, type Session } from './components/ReadingSession';
type Page = 'home' | 'levels' | 'library' | 'progress';
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const navigation: { id: Page; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Moja przygoda', icon: 'home' },
  { id: 'levels', label: 'Poziomy nauki', icon: 'map' },
  { id: 'library', label: 'Biblioteczka', icon: 'book' },
  { id: 'progress', label: 'Moje sukcesy', icon: 'trophy' },
];
const pageTitles = {
  home: 'Moja przygoda',
  levels: 'Poziomy nauki',
  library: 'Biblioteczka',
  progress: 'Moje sukcesy',
};
function loadProgress() {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY));
  } catch {
    return structuredClone(defaultProgress);
  }
}
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [libraryFavorites, setLibraryFavorites] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [progress]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const navigate = (next: Page) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const favorite = (id: string) =>
    setProgress((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setToast('To urządzenie nie obsługuje odsłuchu. Przeczytajcie tekst razem.');
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang.toLowerCase().startsWith('pl'));
    if (voices.length > 0 && !voice) {
      setToast('Aby słuchać po polsku, dodaj polski głos w ustawieniach mowy urządzenia.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = progress.settings.speechRate;
    if (voice) utterance.voice = voice;
    utterance.onerror = (event) => {
      if (!['interrupted', 'canceled'].includes(event.error))
        setToast('Odsłuch jest teraz niedostępny. Spróbuj ponownie lub przeczytajcie razem.');
    };
    window.speechSynthesis.speak(utterance);
  };
  const startSession = (next: Session) => {
    setSelectedLevel(null);
    setSession(next);
  };
  const startNext = () => {
    const next = allLessons.find((item) => !progress.completed.includes(item.id)) || allLessons[0];
    startSession({ ...next, levelId: next.cards[0].levelId });
  };
  const finish = () => {
    if (!session) return;
    setProgress((current) =>
      completeLesson(
        current,
        session.id,
        session.cards.map((item) => item.id),
      ),
    );
  };
  const today = progress.activity[dateKey()] || 0;
  const starCount = progress.earnedStars;
  const streak = getStreak(progress.activity);
  const goalPercent = Math.min(100, (today / progress.settings.dailyGoal) * 100);
  const install = async () => {
    if (!installPrompt) {
      setInstallHelp(true);
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setToast('Czytanki zostały dodane do twoich aplikacji.');
    setInstallPrompt(null);
  };
  if (session)
    return (
      <>
        <ReadingSession
          key={session.id}
          session={session}
          settings={progress.settings}
          favorites={progress.favorites}
          onFavorite={favorite}
          onSpeak={speak}
          onComplete={finish}
          onExit={() => {
            setSession(null);
            navigate('home');
          }}
        />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
        {storageError && (
          <div className="storage-warning" role="status">
            Postęp nie może zostać zapisany. Sprawdź miejsce i ustawienia pamięci przeglądarki.
          </div>
        )}
      </>
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigate('home')}
          aria-label="Czytanki — strona główna"
        >
          <span className="brand-mark">
            <Icon name="book" size={28} />
          </span>
          <span>
            czytanki<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="sidebar-label">MAŁY KROK, WIELKA PRZYGODA</div>
        <nav aria-label="Nawigacja główna">
          {navigation.map((item) => (
            <button
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => {
                if (item.id === 'library') setLibraryFavorites(false);
                navigate(item.id);
              }}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {page === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="daily-goal">
            <div className="goal-heading">
              <span className="small-icon">
                <Icon name="sun" size={22} />
              </span>
              <strong>Mała chwila każdego dnia</strong>
            </div>
            <p>
              {today >= progress.settings.dailyGoal
                ? 'Dzisiejszy cel już za tobą. Brawo!'
                : 'Kilka słów dziś. Wielka radość jutro.'}
            </p>
            <div className="goal-bar">
              <span style={{ width: `${goalPercent}%` }} />
            </div>
            <div className="goal-caption">
              <span>Twój dzienny cel</span>
              <strong>
                {Math.min(today, progress.settings.dailyGoal)} / {progress.settings.dailyGoal} kart
              </strong>
            </div>
          </div>
          <button className="parent-nav" onClick={() => setSettingsOpen(true)}>
            <Icon name="settings" size={21} /> Strefa rodzica <Icon name="right" size={16} />
          </button>
          <div className="sidebar-footer">
            <span className="tiny-dot" /> Przestrzeń na małe odkrycia
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Czytamy i odkrywamy</span>
            <Icon name="right" size={15} />
            <strong>{pageTitles[page]}</strong>
          </div>
          <button className="mobile-brand" onClick={() => navigate('home')}>
            <Icon name="book" size={25} /> czytanki.
          </button>
          <div className="topbar-actions">
            <span className="stat-chip stars" title="Gwiazdki za ukończone sesje">
              <Icon name="star" size={19} />
              <strong>{starCount}</strong>
              <span>{polishPlural(starCount, ['gwiazdka', 'gwiazdki', 'gwiazdek'])}</span>
            </span>
            <span className="stat-chip streak" title="Kolejne dni wspólnego czytania">
              <Icon name="flame" size={19} />
              <strong>{streak}</strong>
              <span>{streak === 1 ? 'dzień' : 'dni'}</span>
            </span>
            <button
              className="profile-button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Otwórz profil i ustawienia"
            >
              <Fox />
            </button>
          </div>
        </header>
        <main id="main" className="main-content">
          {page === 'home' && (
            <>
              <div className="greeting">
                <div>
                  <h1>
                    {progress.settings.name
                      ? `Cześć, ${progress.settings.name}!`
                      : 'Cześć, odkrywco!'}{' '}
                    <span className="greeting-sun">✺</span>
                  </h1>
                  <p>Dobry dzień na kolejną małą przygodę.</p>
                </div>
                <span className="gentle-pill">
                  <Icon name="leaf" size={15} /> W twoim tempie
                </span>
              </div>
              <section className="hero">
                <div className="hero-copy">
                  <span className="eyebrow">
                    <span /> ODKRYWAJ ŚWIAT SŁOWO PO SŁOWIE
                  </span>
                  <h2>
                    Wielka przygoda
                    <br />
                    zaczyna się <em>od słowa.</em>
                  </h2>
                  <p>
                    Czytaj, odkrywaj i rośnij razem z Leo.
                    <br />
                    Każde słowo to początek pięknej historii.
                  </p>
                  <button className="primary-button" onClick={startNext}>
                    {progress.completed.length ? 'Czytamy dalej' : 'Zaczynamy przygodę'}
                    <Icon name="arrow" size={20} />
                  </button>
                  <div className="hero-footnote">
                    <span className="mini-avatars">
                      <span>🦊</span>
                      <span>🐻</span>
                      <span>🐰</span>
                    </span>
                    <span>Małe kroki. Dużo radości.</span>
                  </div>
                </div>
                <div className="hero-art">
                  <ForestScene />
                  <span className="leo-caption">
                    Hej, jestem Leo! Poczytamy?{' '}
                    <svg width="34" height="26" viewBox="0 0 34 26" fill="none" aria-hidden="true">
                      <path
                        d="M2 2q28-4 27 19m-7-6 7 8 4-9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
              </section>
              <section className="levels-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      Twoja czytelnicza ścieżka <span className="subtle-count">6 poziomów</span>
                    </h2>
                    <p>Od pierwszych słów do własnych wielkich historii.</p>
                  </div>
                  <button className="text-button" onClick={() => navigate('levels')}>
                    Zobacz poziomy <Icon name="arrow" size={18} />
                  </button>
                </div>
                <div className="level-grid">
                  {levels.map((level) => (
                    <LevelCard
                      key={level.id}
                      level={level}
                      progress={progress}
                      onOpen={() => setSelectedLevel(level)}
                    />
                  ))}
                </div>
              </section>
              <div className="home-bottom">
                <section className="daily-card">
                  <span className="daily-illustration" aria-hidden="true">
                    ☀
                  </span>
                  <div>
                    <span className="eyebrow">MAŁA CZYTANKA NA DZIŚ</span>
                    <h3>„Mały kot śpi na kocu.”</h3>
                    <p>Jedno zdanie, a tyle do wyobrażenia!</p>
                  </div>
                  <button
                    className="round-button"
                    aria-label="Otwórz czytankę na dziś"
                    onClick={() => {
                      const lesson = allLessons.find((item) => item.id === '4-1')!;
                      startSession({ ...lesson, levelId: 4 });
                    }}
                  >
                    <Icon name="arrow" />
                  </button>
                </section>
                <section className="parent-tip">
                  <span className="tip-icon">
                    <Icon name="heart" size={24} />
                  </span>
                  <div>
                    <h3>Najlepiej czyta się razem</h3>
                    <p>5 minut bliskości znaczy więcej niż pośpiech.</p>
                    <button className="text-button" onClick={() => setSettingsOpen(true)}>
                      Wskazówki dla rodzica <Icon name="arrow" size={16} />
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {page === 'levels' && (
            <>
              <PageIntro
                eyebrow="KAŻDA PODRÓŻ ZACZYNA SIĘ OD KROKU"
                title="Wybierz swoją przygodę"
                text="Zacznij tam, gdzie czujesz się dobrze. Wszystkie krainy stoją przed tobą otworem."
              />
              <div className="level-grid full-levels">
                {levels.map((level) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    progress={progress}
                    onOpen={() => setSelectedLevel(level)}
                    detailed
                  />
                ))}
              </div>
              <div className="info-note">
                <Icon name="leaf" />
                <p>
                  Nie trzeba przechodzić poziomów po kolei. Wracajcie do ulubionych zestawów i
                  dobierajcie trudność do nastroju dziecka.
                </p>
              </div>
            </>
          )}
          {page === 'library' && (
            <Library
              progress={progress}
              initialFavorites={libraryFavorites}
              onFavorite={favorite}
              onSpeak={speak}
              onStart={(cards) =>
                startSession({
                  id: `practice-${Date.now()}`,
                  title: 'Moje wybrane czytanki',
                  levelId: cards[0].levelId,
                  cards,
                })
              }
            />
          )}
          {page === 'progress' && (
            <ProgressPage
              progress={progress}
              onStart={startNext}
              onFavorites={() => {
                setLibraryFavorites(true);
                navigate('library');
              }}
            />
          )}
          <footer className="page-footer">
            <span>
              <Icon name="sprout" size={16} /> Małe kroki budują wielkie historie.
            </span>
            <button onClick={() => void install()}>
              <Icon name="download" size={15} /> Zainstaluj Czytanki
            </button>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Nawigacja mobilna">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? 'active' : ''}
            onClick={() => {
              if (item.id === 'library') setLibraryFavorites(false);
              navigate(item.id);
            }}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} size={22} />
            <span>
              {item.id === 'home'
                ? 'Przygoda'
                : item.id === 'levels'
                  ? 'Poziomy'
                  : item.id === 'progress'
                    ? 'Sukcesy'
                    : item.label}
            </span>
          </button>
        ))}
      </nav>
      {selectedLevel && (
        <Dialog title={selectedLevel.title} onClose={() => setSelectedLevel(null)} wide>
          <div className={`level-dialog-intro ${selectedLevel.color}`}>
            <div className="level-icon">
              <Icon name={selectedLevel.icon as IconName} size={34} />
            </div>
            <div>
              <span className="eyebrow">POZIOM {selectedLevel.id}</span>
              <p>{selectedLevel.description}</p>
            </div>
          </div>
          <div className="lesson-list">
            {selectedLevel.lessons.map((lesson, index) => {
              const done = progress.completed.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  className="lesson-row"
                  onClick={() => startSession({ ...lesson, levelId: selectedLevel.id })}
                >
                  <span className={`lesson-number ${done ? 'done' : ''}`}>
                    {done ? <Icon name="check" /> : `0${index + 1}`}
                  </span>
                  <span>
                    <strong>{lesson.title}</strong>
                    <small>6 kart · ok. 3–5 minut{done ? ' · Ukończono' : ''}</small>
                  </span>
                  <Icon name={done ? 'reset' : 'arrow'} size={21} />
                </button>
              );
            })}
          </div>
          <p className="dialog-footnote">
            <Icon name="heart" size={15} /> Wspólnie, spokojnie, bez ocen.
          </p>
        </Dialog>
      )}
      {settingsOpen && (
        <SettingsDialog
          settings={progress.settings}
          onChange={(settings) => setProgress((current) => ({ ...current, settings }))}
          onClose={() => setSettingsOpen(false)}
          onReset={() => {
            setProgress(structuredClone(defaultProgress));
            setToast('Postępy i ustawienia zostały wyzerowane. Nowa przygoda czeka!');
            setSettingsOpen(false);
          }}
        />
      )}
      {installHelp && (
        <Dialog title="Czytanki zawsze pod ręką" onClose={() => setInstallHelp(false)}>
          <div className="install-copy">
            <span className="install-icon">
              <Icon name="download" size={32} />
            </span>
            <p>Dodaj aplikację do ekranu początkowego, aby wygodnie wracać do czytania.</p>
            <h3>iPhone lub iPad</h3>
            <p>
              Otwórz stronę w Safari, wybierz „Udostępnij”, a następnie „Do ekranu początkowego”.
            </p>
            <h3>Android lub komputer</h3>
            <p>
              W menu przeglądarki wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”,
              jeśli opcja jest dostępna.
            </p>
            <div className="info-note">
              <Icon name="leaf" />
              <p>
                Po pierwszym otwarciu wersji produkcyjnej karty działają również offline. Odsłuch
                zależy od głosów dostępnych na urządzeniu.
              </p>
            </div>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {storageError && (
        <div className="storage-warning" role="status">
          Postęp nie może zostać zapisany. Sprawdź miejsce i ustawienia pamięci przeglądarki.
        </div>
      )}
    </div>
  );
}
function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function LevelCard({
  level,
  progress,
  onOpen,
  detailed = false,
}: {
  level: Level;
  progress: Progress;
  onOpen: () => void;
  detailed?: boolean;
}) {
  const completed = level.lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  return (
    <button className={`level-card ${level.color} ${detailed ? 'detailed' : ''}`} onClick={onOpen}>
      <div className="level-card-top">
        <span className="level-icon">
          <Icon name={level.icon as IconName} size={29} />
        </span>
        <span className="level-number">POZIOM {level.id}</span>
        <span className="level-card-arrow">
          <Icon name="external" size={19} />
        </span>
      </div>
      <h3>{level.title}</h3>
      <p>{detailed ? level.description : level.subtitle}</p>
      <div className="level-card-bottom">
        <span>{completed ? `${completed} z 4 zestawów` : '4 zestawy · 24 karty'}</span>
        {completed === 4 ? (
          <Icon name="checks" size={17} />
        ) : (
          <span className="level-segments" aria-label={`Ukończono ${completed} z 4 zestawów`}>
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={n <= completed ? 'filled' : ''} />
            ))}
          </span>
        )}
      </div>
    </button>
  );
}
function Library({
  progress,
  initialFavorites,
  onFavorite,
  onSpeak,
  onStart,
}: {
  progress: Progress;
  initialFavorites: boolean;
  onFavorite: (id: string) => void;
  onSpeak: (text: string) => void;
  onStart: (cards: ReadingCard[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [levelId, setLevelId] = useState(0);
  const [onlyFavorites, setOnlyFavorites] = useState(initialFavorites);
  const [visible, setVisible] = useState(18);
  const normalize = (text: string) =>
    text
      .toLocaleLowerCase('pl-PL')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l');
  const filtered = allCards.filter(
    (card) =>
      (!levelId || card.levelId === levelId) &&
      (!onlyFavorites || progress.favorites.includes(card.id)) &&
      normalize(card.text).includes(normalize(query)),
  );
  return (
    <>
      <PageIntro
        eyebrow="SŁOWA, DO KTÓRYCH CHCE SIĘ WRACAĆ"
        title="Twoja biblioteczka"
        text="144 karty pełne małych odkryć. Znajdź coś ciekawego i czytajcie razem."
      />
      <div className="library-toolbar">
        <label className="search-field">
          <Icon name="search" size={20} />
          <input
            aria-label="Szukaj słowa lub zdania"
            placeholder="Szukaj słowa lub zdania…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(18);
            }}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Wyczyść wyszukiwanie"
              onClick={() => setQuery('')}
            >
              <Icon name="close" size={17} />
            </button>
          )}
        </label>
        <button
          className={`filter-button ${onlyFavorites ? 'selected' : ''}`}
          aria-pressed={onlyFavorites}
          onClick={() => {
            setOnlyFavorites(!onlyFavorites);
            setVisible(18);
          }}
        >
          <Icon name="heart" size={19} /> Ulubione <span>{progress.favorites.length}</span>
        </button>
      </div>
      <div className="level-filters" aria-label="Filtruj według poziomu">
        {[{ id: 0, title: 'Wszystkie poziomy' }, ...levels].map((level) => (
          <button
            key={level.id}
            className={levelId === level.id ? 'selected' : ''}
            aria-pressed={levelId === level.id}
            onClick={() => {
              setLevelId(level.id);
              setVisible(18);
            }}
          >
            {level.id ? `Poziom ${level.id}` : level.title}
          </button>
        ))}
      </div>
      <div className="library-summary">
        <span>
          Znalezione karty: <strong>{filtered.length}</strong>
        </span>
        {filtered.length > 0 && (
          <button className="text-button" onClick={() => onStart(filtered.slice(0, 6))}>
            Czytaj wybrane ({Math.min(6, filtered.length)}) <Icon name="play" size={16} />
          </button>
        )}
      </div>
      {filtered.length ? (
        <>
          <div className="library-grid">
            {filtered.slice(0, visible).map((card) => (
              <article className="library-card" key={card.id}>
                <div className="library-card-meta">
                  <span>POZIOM {card.levelId}</span>
                  <button
                    className={`icon-button ${progress.favorites.includes(card.id) ? 'is-favorite' : ''}`}
                    aria-label={`${progress.favorites.includes(card.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}: ${card.text}`}
                    aria-pressed={progress.favorites.includes(card.id)}
                    onClick={() => onFavorite(card.id)}
                  >
                    <Icon name="heart" size={19} />
                  </button>
                </div>
                <p>{card.text}</p>
                <div className="library-card-actions">
                  <button
                    className="text-button muted"
                    onClick={() => onSpeak(card.text)}
                    aria-label={`Posłuchaj: ${card.text}`}
                  >
                    <Icon name="volume" size={18} /> Posłuchaj
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => onStart([card])}
                    aria-label={`Czytaj: ${card.text}`}
                  >
                    <Icon name="arrow" size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {filtered.length > visible && (
            <button className="secondary-button load-more" onClick={() => setVisible(visible + 18)}>
              Pokaż więcej kart <Icon name="right" size={18} />
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Icon name={onlyFavorites ? 'heart' : 'search'} size={43} />
          <h2>
            {onlyFavorites ? 'Tu zamieszkają ulubione czytanki' : 'Tej czytanki jeszcze tu nie ma'}
          </h2>
          <p>
            {onlyFavorites
              ? 'Dotknij serduszka przy karcie, żeby łatwo do niej wrócić.'
              : 'Spróbuj innego słowa albo wybierz wszystkie poziomy.'}
          </p>
          <button
            className="secondary-button"
            onClick={() => {
              setQuery('');
              setLevelId(0);
              setOnlyFavorites(false);
            }}
          >
            Pokaż wszystkie karty
          </button>
        </div>
      )}
    </>
  );
}
function ProgressPage({
  progress,
  onStart,
  onFavorites,
}: {
  progress: Progress;
  onStart: () => void;
  onFavorites: () => void;
}) {
  const streak = getStreak(progress.activity);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      key: dateKey(date),
      day: date.toLocaleDateString('pl-PL', { weekday: 'short' }),
      date: date.getDate(),
    };
  });
  const badges = [
    {
      name: 'Pierwszy krok',
      description: 'Ukończ pierwszy zestaw',
      icon: 'sprout' as const,
      unlocked: progress.completed.some((id) => allLessons.some((lesson) => lesson.id === id)),
      color: 'mint',
    },
    {
      name: 'Przyjaciel słów',
      description: 'Poznaj 24 różne karty',
      icon: 'book' as const,
      unlocked: progress.readCards.length >= 24,
      color: 'peach',
    },
    {
      name: 'Mały odkrywca',
      description: 'Czytaj przez 3 dni z rzędu',
      icon: 'flame' as const,
      unlocked: getLongestStreak(progress.activity) >= 3,
      color: 'lavender',
    },
    {
      name: 'Wielka przygoda',
      description: 'Ukończ wszystkie 24 zestawy',
      icon: 'crown' as const,
      unlocked: allLessons.every((lesson) => progress.completed.includes(lesson.id)),
      color: 'sand',
    },
  ];
  return (
    <>
      <PageIntro
        eyebrow="KAŻDA PRÓBA TO POWÓD DO DUMY"
        title="Zobacz, ile już za tobą!"
        text="Tu zbieramy małe sukcesy i wielką radość ze wspólnego czytania."
      />
      <div className="progress-stats">
        <div>
          <span className="stat-icon mint">
            <Icon name="book" size={26} />
          </span>
          <strong>{progress.readCards.length}</strong>
          <p>Poznane karty</p>
        </div>
        <div>
          <span className="stat-icon sand">
            <Icon name="star" size={26} />
          </span>
          <strong>{progress.earnedStars}</strong>
          <p>Zebrane gwiazdki</p>
        </div>
        <div>
          <span className="stat-icon peach">
            <Icon name="flame" size={26} />
          </span>
          <strong>{streak}</strong>
          <p>Dni z rzędu</p>
        </div>
        <button onClick={onFavorites}>
          <span className="stat-icon rose">
            <Icon name="heart" size={26} />
          </span>
          <strong>{progress.favorites.length}</strong>
          <p>
            Ulubione czytanki <Icon name="arrow" size={15} />
          </p>
        </button>
      </div>
      <section className="activity-panel">
        <div className="section-heading">
          <div>
            <h2>Chwile z czytaniem</h2>
            <p>Nie musisz czytać codziennie, żeby robić postępy.</p>
          </div>
          <span className="gentle-pill">Ostatnie 7 dni</span>
        </div>
        <div className="week-activity">
          {days.map((day) => (
            <div key={day.key} className={day.key === dateKey() ? 'today' : ''}>
              <span>{day.day}</span>
              <div className={progress.activity[day.key] ? 'day-circle completed' : 'day-circle'}>
                {progress.activity[day.key] ? <Icon name="check" size={23} /> : day.date}
              </div>
              <small>
                {progress.activity[day.key] ? cardCount(progress.activity[day.key]) : '—'}
              </small>
            </div>
          ))}
        </div>
      </section>
      <div className="section-heading badges-heading">
        <div>
          <h2>Małe powody do dumy</h2>
          <p>Odznaki pojawiają się wraz z kolejnymi odkryciami.</p>
        </div>
      </div>
      <div className="badge-grid">
        {badges.map((badge) => (
          <div className={`badge-card ${badge.unlocked ? 'unlocked' : ''}`} key={badge.name}>
            <div className={`badge-medal ${badge.color}`}>
              <Icon name={badge.icon} size={36} />
            </div>
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            <span>{badge.unlocked ? 'Zdobyta! ✨' : 'Jeszcze przed tobą'}</span>
          </div>
        ))}
      </div>
      <div className="progress-cta">
        <Fox reading />
        <div>
          <h2>Kolejna historia czeka na ciebie</h2>
          <p>Leo już otworzył książkę. Dołączysz?</p>
        </div>
        <button className="primary-button" onClick={onStart}>
          Czytamy razem <Icon name="arrow" size={18} />
        </button>
      </div>
    </>
  );
}
function SettingsDialog({
  settings,
  onChange,
  onClose,
  onReset,
}: {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const update = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  return (
    <Dialog title="Strefa rodzica" onClose={onClose}>
      <div className="settings-content">
        <div className="parent-intro">
          <span className="tip-icon">
            <Icon name="heart" />
          </span>
          <p>
            Najważniejsze są ciekawość i wspólny czas.
            <br />
            <strong>Podążaj za tempem swojego dziecka.</strong>
          </p>
        </div>
        <h3>Po swojemu</h3>
        <label className="setting-label" htmlFor="child-name">
          Imię lub pseudonim odkrywcy <span>(opcjonalnie)</span>
        </label>
        <input
          className="name-input"
          id="child-name"
          maxLength={30}
          value={settings.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder="Jak się do ciebie zwracać?"
        />
        <div className="setting-row">
          <div>
            <strong>Jeszcze większe litery</strong>
            <small>Większy tekst na kartach do czytania</small>
          </div>
          <button
            role="switch"
            aria-checked={settings.largeText}
            aria-label="Jeszcze większe litery"
            className={`toggle ${settings.largeText ? 'on' : ''}`}
            onClick={() => update({ largeText: !settings.largeText })}
          >
            <span />
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Wielkie litery</strong>
            <small>POKAŻ TEKST DRUKOWANYMI LITERAMI</small>
          </div>
          <button
            role="switch"
            aria-checked={settings.uppercase}
            aria-label="Wielkie litery"
            className={`toggle ${settings.uppercase ? 'on' : ''}`}
            onClick={() => update({ uppercase: !settings.uppercase })}
          >
            <span />
          </button>
        </div>
        <div className="setting-row">
          <label htmlFor="speech-rate">
            <strong>Tempo czytania</strong>
            <small>Odsłuch korzysta z polskiego głosu urządzenia</small>
          </label>
          <select
            id="speech-rate"
            value={settings.speechRate}
            onChange={(event) => update({ speechRate: Number(event.target.value) })}
          >
            <option value={0.65}>Bardzo spokojnie</option>
            <option value={0.85}>Spokojnie</option>
            <option value={1}>Naturalnie</option>
          </select>
        </div>
        <div className="setting-row">
          <label htmlFor="daily-goal">
            <strong>Mały dzienny cel</strong>
            <small>Zaproszenie do zabawy, bez obowiązku</small>
          </label>
          <select
            id="daily-goal"
            value={settings.dailyGoal}
            onChange={(event) => update({ dailyGoal: Number(event.target.value) })}
          >
            <option value={6}>6 kart</option>
            <option value={12}>12 kart</option>
            <option value={18}>18 kart</option>
          </select>
        </div>
        <h3>Jak czytać razem?</h3>
        <ol className="parent-tips">
          <li>
            Zacznijcie od znanych słów. Czytaj na głos i daj dziecku czas, żeby przyjrzało się
            całemu tekstowi.
          </li>
          <li>Podpowiedź odsłaniajcie po obejrzeniu słowa. Porozmawiajcie o tym, co ono znaczy.</li>
          <li>
            Wybierajcie krótkie sesje i kończcie, gdy dziecko traci ochotę. Można powtarzać ulubione
            zestawy.
          </li>
          <li>
            Łączcie zabawę w rozpoznawanie słów z poznawaniem liter, głosek i wspólnym czytaniem
            książek.
          </li>
        </ol>
        <p className="research-note">
          Czytanki są pomocą do wspólnej zabawy w czytanie. Inspiracja:{' '}
          <a
            href="https://ies.ed.gov/ncee/WWC/PracticeGuide/21/Published"
            target="_blank"
            rel="noreferrer"
          >
            zalecenia IES dotyczące nauki czytania <Icon name="external" size={13} />
          </a>
          .
        </p>
        <div className="privacy-note">
          <Icon name="leaf" size={20} />
          <p>
            Bez kont i reklam. Imię, ulubione i postępy są zapisane tylko w tej przeglądarce.
            Usunięcie danych przeglądarki usuwa też postępy. Ustawienia zapisują się automatycznie.
          </p>
        </div>
        {resetConfirm ? (
          <div className="reset-confirm" role="alert">
            <strong>Usunąć wszystkie postępy i ulubione?</strong>
            <p>Tej zmiany nie można cofnąć.</p>
            <div>
              <button className="secondary-button" onClick={() => setResetConfirm(false)}>
                Zachowaj dane
              </button>
              <button className="danger-button" onClick={onReset}>
                Usuń dane
              </button>
            </div>
          </div>
        ) : (
          <button className="reset-link" onClick={() => setResetConfirm(true)}>
            <Icon name="reset" size={16} /> Zacznij od nowa — wyzeruj dane
          </button>
        )}
      </div>
    </Dialog>
  );
}
