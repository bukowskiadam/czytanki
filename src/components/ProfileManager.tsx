import { useRef, useState } from 'react';
import { profileName, type ChildProfile } from '../profiles';
import './ProfileManager.css';

type Props = {
  profiles: ChildProfile[];
  activeProfileId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
};

export function ProfileManager({ profiles, activeProfileId, onSelect, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleting = profiles.find((profile) => profile.id === deleteId);
  return (
    <section className="profiles-panel" aria-labelledby="profiles-heading">
      <h3 id="profiles-heading">Kto dzisiaj czyta?</h3>
      <p>Każde dziecko ma własne postępy, ulubione i ustawienia.</p>
      <ul className="profiles-list">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <button
              type="button"
              className="profile-choice"
              aria-pressed={profile.id === activeProfileId}
              onClick={() => {
                setDeleteId(null);
                onSelect(profile.id);
              }}
            >
              <span className="profile-initial" aria-hidden="true">
                {profileName(profile).slice(0, 1).toLocaleUpperCase('pl')}
              </span>
              <span>
                <strong>{profileName(profile)}</strong>
                <small>{profile.id === activeProfileId ? 'Teraz czyta' : 'Wybierz profil'}</small>
              </span>
            </button>
            {profiles.length > 1 && (
              <button
                type="button"
                className="profile-remove"
                aria-label={`Usuń profil ${profileName(profile)}`}
                onClick={() => setDeleteId(profile.id)}
              >
                Usuń
              </button>
            )}
          </li>
        ))}
      </ul>
      {deleting && (
        <div className="profile-delete-confirm" role="alert">
          <strong>Usunąć profil „{profileName(deleting)}”?</strong>
          <p>
            Usuniesz jego postępy, ulubione i ustawienia. Tej zmiany nie można cofnąć. Pozostałe
            profile zostaną zachowane.
          </p>
          <div>
            <button type="button" className="secondary-button" onClick={() => setDeleteId(null)}>
              Zachowaj profil
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                onDelete(deleting.id);
                setDeleteId(null);
              }}
            >
              Usuń ten profil
            </button>
          </div>
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) {
            onAdd(name.trim());
            setName('');
            setDeleteId(null);
          }
        }}
      >
        <label className="setting-label" htmlFor="new-profile-name">
          Imię nowego dziecka
        </label>
        <div className="profile-create-row">
          <input
            id="new-profile-name"
            ref={nameInput}
            className="name-input"
            value={name}
            maxLength={30}
            required
            onChange={(event) => setName(event.target.value)}
            placeholder="Np. Maja"
          />
          <button className="secondary-button" type="submit" disabled={!name.trim()}>
            Dodaj profil
          </button>
        </div>
      </form>
      {profiles.length === 1 && (
        <p className="profile-help">
          Ostatni profil pozostaje w aplikacji. Jego postępy możesz wyzerować poniżej.
        </p>
      )}
    </section>
  );
}
