import { useEffect, useState } from 'react';
import { allCards, type ReadingCard } from '../data';
import type { Settings } from '../storage';
import { Icon } from './Icon';
import { Fox } from './Illustrations';
import { Dialog } from './Dialog';
export type Session = { id: string; title: string; cards: ReadingCard[]; levelId: number };
export function ReadingSession({
  session,
  settings,
  favorites,
  onFavorite,
  onSpeak,
  onComplete,
  onExit,
}: {
  session: Session;
  settings: Settings;
  favorites: string[];
  onFavorite: (id: string) => void;
  onSpeak: (text: string) => void;
  onComplete: () => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [hint, setHint] = useState(false);
  const [phase, setPhase] = useState<'read' | 'remember' | 'choose' | 'done'>('read');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showAgain, setShowAgain] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const card = session.cards[index];
  const target = session.cards[Math.min(2, session.cards.length - 1)];
  const [options] = useState(() =>
    [
      target,
      ...[...session.cards, ...allCards.filter((item) => item.levelId === target.levelId)]
        .filter(
          (item, index, items) =>
            item.text !== target.text &&
            items.findIndex((candidate) => candidate.text === item.text) === index,
        )
        .slice(0, 2),
    ]
      .map((item) => ({ item, order: Math.random() }))
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.item),
  );
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setHint(false);
  }, [index, phase]);
  const display = (text: string) => (settings.uppercase ? text.toLocaleUpperCase('pl-PL') : text);
  const exit = () => (phase === 'done' ? onExit() : setConfirmExit(true));
  const next = () => {
    if (index < session.cards.length - 1) setIndex(index + 1);
    else setPhase('remember');
  };
  return (
    <main className="session-page">
      <header className="session-header">
        <button className="icon-button" aria-label="Zakończ sesję" onClick={exit}>
          <Icon name="close" />
        </button>
        <div>
          <span className="eyebrow">POZIOM {session.levelId} · CZYTAMY RAZEM</span>
          <h2>{session.title}</h2>
        </div>
        <span className="session-count">
          {phase === 'read'
            ? `${index + 1} / ${session.cards.length}`
            : phase === 'done'
              ? 'Brawo!'
              : 'Mała zabawa'}
        </span>
      </header>
      <div
        className="session-progress"
        role="progressbar"
        aria-label="Postęp sesji"
        aria-valuemin={0}
        aria-valuemax={session.cards.length + 1}
        aria-valuenow={
          phase === 'read'
            ? index
            : phase === 'done'
              ? session.cards.length + 1
              : session.cards.length
        }
      >
        <span
          style={{
            width: `${((phase === 'read' ? index : phase === 'done' ? session.cards.length + 1 : session.cards.length) / (session.cards.length + 1)) * 100}%`,
          }}
        />
      </div>
      {phase === 'read' && (
        <div className="reading-content">
          <p className="reading-instruction">Spójrz na tekst. Przeczytajcie go razem.</p>
          <div className={`reading-card ${settings.largeText ? 'large-type' : ''}`} key={card.id}>
            <button
              className={`favorite-button icon-button ${favorites.includes(card.id) ? 'is-favorite' : ''}`}
              aria-label={favorites.includes(card.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              aria-pressed={favorites.includes(card.id)}
              onClick={() => onFavorite(card.id)}
            >
              <Icon name="heart" />
            </button>
            <p
              aria-live="polite"
              className={`reading-text ${card.text.length > 65 ? 'long' : card.text.length > 30 ? 'medium' : ''}`}
            >
              {display(card.text)}
            </p>
            <button className="listen-button" onClick={() => onSpeak(card.text)}>
              <Icon name="volume" /> Posłuchaj
            </button>
          </div>
          <div className="hint-area">
            {hint ? (
              <div className="hint-revealed">
                <span aria-hidden="true">{card.emoji}</span>
                <p>{card.hint}</p>
              </div>
            ) : (
              <button className="text-button muted" onClick={() => setHint(true)}>
                <Icon name="eye" size={19} /> Pokaż podpowiedź
              </button>
            )}
          </div>
          <div className="reading-controls">
            <button
              className="secondary-button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <Icon name="left" /> Wstecz
            </button>
            <div className="card-dots" aria-hidden="true">
              {session.cards.map((item, i) => (
                <span key={item.id} className={i === index ? 'active' : i < index ? 'seen' : ''} />
              ))}
            </div>
            <button className="primary-button" onClick={next}>
              {index === session.cards.length - 1 ? 'Czas na zabawę' : 'Następna karta'}
              <Icon name="arrow" />
            </button>
          </div>
          <p className="session-reassurance">
            <Icon name="leaf" size={15} /> Bez pośpiechu. Każdy ma swoje tempo.
          </p>
        </div>
      )}
      {phase === 'remember' && (
        <div className="exercise-content">
          <span className="pill peach">
            <Icon name="sparkles" size={16} /> Mała zabawa na koniec
          </span>
          <h1>Zapamiętaj ten tekst</h1>
          <p>Przyjrzyj mu się. Za chwilę poszukasz go wśród innych.</p>
          <div className={`memory-card ${settings.largeText ? 'large-type' : ''}`}>
            <p>{display(target.text)}</p>
            <button className="listen-button" onClick={() => onSpeak(target.text)}>
              <Icon name="volume" /> Posłuchaj
            </button>
          </div>
          <button className="primary-button" onClick={() => setPhase('choose')}>
            Pamiętam! Szukam <Icon name="arrow" />
          </button>
        </div>
      )}
      {phase === 'choose' && (
        <div className="exercise-content">
          <span className="pill peach">
            <Icon name="sparkles" size={16} /> Mała zabawa na koniec
          </span>
          <h1>Gdzie jest nasz tekst?</h1>
          <p>Dotknij tekstu z poprzedniej karty.</p>
          <div className={`answer-options ${settings.largeText ? 'large-type' : ''}`}>
            {options.map((option) => (
              <button
                key={option.id}
                className={wrongId === option.id ? 'try-again' : ''}
                onClick={() => {
                  if (option.id === target.id) {
                    onComplete();
                    setPhase('done');
                  } else setWrongId(option.id);
                }}
              >
                {display(option.text)}
              </button>
            ))}
          </div>
          <p className="answer-feedback" aria-live="polite">
            {wrongId
              ? 'Spróbuj jeszcze raz. Możesz też podejrzeć nasz tekst.'
              : 'Dasz radę, spokojnie się rozejrzyj.'}
          </p>
          <button className="text-button" onClick={() => setShowAgain(!showAgain)}>
            <Icon name="eye" size={18} />
            {showAgain ? 'Ukryj tekst' : 'Chcę zobaczyć jeszcze raz'}
          </button>
          {showAgain && <p className="memory-reminder">{display(target.text)}</p>}
        </div>
      )}
      {phase === 'done' && (
        <div className="completion">
          <div className="celebration-stars">
            <Icon name="star" size={35} />
            <Icon name="star" size={53} />
            <Icon name="star" size={35} />
          </div>
          <Fox reading className="completion-fox" />
          <span className="eyebrow">KOLEJNY MAŁY KROK ZA TOBĄ</span>
          <h1>Pięknie ci poszło!</h1>
          <p>
            {session.cards.length === 1 ? 'Jedna karta' : `${session.cards.length} kart`} i mnóstwo
            powodów do dumy.
            <br />
            Leo cieszy się, że czytacie razem.
          </p>
          <div className="reward-pill">
            <Icon name="star" size={21} /> +3 gwiazdki za wspólne czytanie
          </div>
          <button className="primary-button" onClick={onExit}>
            Wracam do mojej przygody <Icon name="arrow" />
          </button>
        </div>
      )}
      {confirmExit && (
        <Dialog title="Czas na przerwę?" onClose={() => setConfirmExit(false)}>
          <div className="exit-dialog">
            <p>Ukończenie całego zestawu zapisuje postęp. Ulubione karty są już zapisane.</p>
            <button className="primary-button" onClick={() => setConfirmExit(false)}>
              Czytam dalej
            </button>
            <button className="secondary-button" onClick={onExit}>
              Kończę na dziś
            </button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
