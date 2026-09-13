import { APP_VERSION, getReleaseNotes } from '../releases';
import { Dialog } from './Dialog';
import './ReleaseHistory.css';

export function ReleaseHistory({
  previousVersion,
  onClose,
}: {
  previousVersion?: string;
  onClose: () => void;
}) {
  const releases = getReleaseNotes(previousVersion);
  return (
    <Dialog
      title={previousVersion ? 'Co nowego w Czytankach?' : 'Historia zmian'}
      onClose={onClose}
    >
      <div className="release-history">
        <p className="release-intro">
          {previousVersion
            ? `Korzystasz już z wersji v${APP_VERSION}. Zobacz, co zmieniło się od twojej ostatniej wizyty.`
            : `Czytanki v${APP_VERSION}. Zobacz, jak rozwija się nasza wspólna przygoda z czytaniem.`}
        </p>
        {releases.map((release) => (
          <section className="release-entry" key={release.version}>
            <span className="release-version">v{release.version}</span>
            <h3>{release.title}</h3>
            <ul>
              {release.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>
        ))}
        {!releases.length && <p>Pełną historię zmian znajdziesz w stopce aplikacji.</p>}
        <button className="primary-button release-close" onClick={onClose}>
          Wracam do czytania
        </button>
      </div>
    </Dialog>
  );
}
