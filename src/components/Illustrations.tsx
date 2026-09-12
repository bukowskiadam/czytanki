import { useId } from 'react';
export function Fox({
  className = '',
  reading = false,
}: {
  className?: string;
  reading?: boolean;
}) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path d="M135 146c23-33 54-30 52-5-2 28-28 41-53 29" fill="#D77549" />
      <path d="M171 122c21-3 25 22 8 36-4-12-9-15-17-17" fill="#FFF7E7" />
      <ellipse cx="99" cy="140" rx="48" ry="45" fill="#E58A50" />
      <ellipse cx="100" cy="145" rx="29" ry="33" fill="#FFF5E5" />
      <path d="M47 83 39 20c-1-9 4-12 11-6l39 31M112 46l39-31c7-6 13-3 12 6l-8 65" fill="#DF7745" />
      <path d="m49 32 4 39 24-20M125 50l24-20-5 41" fill="#633D32" />
      <path d="M38 83c0-33 29-47 63-47s63 17 63 48c0 30-35 52-63 52S38 114 38 83" fill="#EB9159" />
      <path
        d="M40 80c25-4 44 10 61 32 14-22 35-35 61-31-3 28-35 52-61 52-27 0-57-22-61-53"
        fill="#FFF5E5"
      />
      <path
        d="M63 79c4-6 10-6 14 0m48 0c4-6 10-6 14 0"
        stroke="#493F34"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="56" cy="91" rx="9" ry="5" fill="#EFAD8B" />
      <ellipse cx="146" cy="91" rx="9" ry="5" fill="#EFAD8B" />
      <path d="M94 108q7-6 14 0-1 10-7 10t-7-10" fill="#493F34" />
      <path
        d="M101 118v5m0-1q-7 6-12 0m12 0q7 6 12 0"
        stroke="#493F34"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {reading ? (
        <>
          <path d="M48 136q26-9 53 6 27-15 53-6v43q-25-6-53 6-28-12-53-6z" fill="#397965" />
          <path d="M54 132q25-6 47 9 23-15 47-9v40q-24-5-47 9-23-14-47-9z" fill="#FFFAE9" />
          <path
            d="M101 141v39m-37-35 24 7m-24 4 24 7m26-11 24-7m-24 18 24-7"
            stroke="#D6CFB2"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="155" rx="10" ry="14" fill="#E58A50" />
          <ellipse cx="151" cy="155" rx="10" ry="14" fill="#E58A50" />
        </>
      ) : (
        <>
          <ellipse cx="66" cy="171" rx="18" ry="10" fill="#694934" />
          <ellipse cx="129" cy="171" rx="18" ry="10" fill="#694934" />
        </>
      )}
    </svg>
  );
}
export function ForestScene() {
  const id = useId();
  return (
    <svg
      className="forest-scene"
      viewBox="0 0 600 370"
      fill="none"
      aria-label="Lis Leo czyta książkę wśród zielonych wzgórz"
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="300" y1="0" x2="300" y2="370" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E7EFE1" />
          <stop offset="1" stopColor="#D4E4D1" />
        </linearGradient>
      </defs>
      <path
        d="M90 200C45 94 131 31 239 57 305-15 490-15 537 97c102 55 88 204-18 236H99C4 300 5 231 90 200"
        fill={`url(#${id})`}
      />
      <circle cx="454" cy="72" r="36" fill="#F8D987" />
      <circle cx="454" cy="72" r="46" stroke="#F6DE9F" strokeDasharray="3 11" strokeWidth="2" />
      <path
        d="M154 86c11-20 25-18 34-4 21-10 32 0 31 11h-79c-1-7 5-10 14-7M356 39c8-15 21-12 26-3 15-5 26 1 25 10h-61c-1-5 3-8 10-7"
        fill="#FAFBEF"
      />
      <path d="M52 275q118-130 237-20 106-126 294-39v113H51" fill="#B6CEAA" />
      <path d="M53 303q139-91 263-15 131-85 267-26v72H53" fill="#A0BE96" />
      <path d="M83 326q168-75 453 5-157 60-453-5" fill="#CCE0B9" />
      <path d="M393 329q-59-13-64-43-5-22 42-32-75 5-70 37 4 28 35 44" fill="#F2E6BF" />
      <g>
        <path d="M493 100v199" stroke="#637C52" strokeWidth="8" strokeLinecap="round" />
        <path d="m493 80-63 114h32l-45 60h150l-43-60h31z" fill="#7F9D71" />
        <path d="m492 106-36 78h21l-29 53h44" fill="#8AA97C" />
        <path d="M119 143v153" stroke="#6D8156" strokeWidth="7" strokeLinecap="round" />
        <path d="m119 116-43 85h24l-34 48h106l-31-48h23z" fill="#93AB7C" />
      </g>
      <g transform="translate(215 140) scale(.96)">
        <path d="M139 148c23-33 54-30 52-5-2 28-28 41-53 29" fill="#D77549" />
        <path d="M171 122c21-3 25 22 8 36-4-12-9-15-17-17" fill="#FFF7E7" />
        <ellipse cx="99" cy="140" rx="48" ry="45" fill="#E58A50" />
        <path
          d="M47 83 39 20c-1-9 4-12 11-6l39 31M112 46l39-31c7-6 13-3 12 6l-8 65"
          fill="#DF7745"
        />
        <path d="m49 32 4 39 24-20M125 50l24-20-5 41" fill="#6A483B" />
        <path
          d="M38 83c0-33 29-47 63-47s63 17 63 48c0 30-35 52-63 52S38 114 38 83"
          fill="#EB9159"
        />
        <path
          d="M40 80c25-4 44 10 61 32 14-22 35-35 61-31-3 28-35 52-61 52-27 0-57-22-61-53"
          fill="#FFF5E5"
        />
        <path
          d="M63 79c4-6 10-6 14 0m48 0c4-6 10-6 14 0"
          stroke="#493F34"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="56" cy="91" rx="9" ry="5" fill="#EFAD8B" />
        <ellipse cx="146" cy="91" rx="9" ry="5" fill="#EFAD8B" />
        <path d="M94 108q7-6 14 0-1 10-7 10t-7-10" fill="#493F34" />
        <path
          d="M101 117v6m0-1q-7 6-12 0m12 0q7 6 12 0"
          stroke="#493F34"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M48 136q26-9 53 6 27-15 53-6v43q-25-6-53 6-28-12-53-6z" fill="#397965" />
        <path d="M54 132q25-6 47 9 23-15 47-9v40q-24-5-47 9-23-14-47-9z" fill="#FFFAE9" />
        <path
          d="M101 141v39m-37-35 24 7m-24 4 24 7m26-11 24-7m-24 18 24-7"
          stroke="#D6CFB2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="155" rx="10" ry="14" fill="#E58A50" />
        <ellipse cx="151" cy="155" rx="10" ry="14" fill="#E58A50" />
      </g>
      <g transform="translate(151 252)">
        <ellipse cx="34" cy="38" rx="34" ry="25" fill="#A18C68" />
        <path d="m2 32 2-19 12 3 3-15 15 11L46 0l4 16 16-3-3 21" fill="#A18C68" />
        <path d="M37 36q26-21 39 6-18 23-39 11" fill="#EED9B1" />
        <circle cx="58" cy="39" r="2.5" fill="#4B4939" />
        <circle cx="77" cy="42" r="3" fill="#4B4939" />
        <path
          d="M15 24v6m12-12v7m-8 14v6m16-16v7"
          stroke="#7D6D53"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <g stroke="#69855D" strokeWidth="3" strokeLinecap="round">
        <path d="M103 324v-18m0 12-8-8m8 4 8-8M439 315v-22m0 15-9-7m9 1 8-8M544 302v-18m0 10-8-7" />
      </g>
      <g fill="#FFF7D7">
        <circle cx="102" cy="303" r="6" />
        <circle cx="438" cy="290" r="6" />
        <circle cx="542" cy="282" r="5" />
      </g>
      <g fill="#E3B955">
        <circle cx="102" cy="303" r="2" />
        <circle cx="438" cy="290" r="2" />
      </g>
      <path
        d="M184 152c-21-20-32-4-14 7-21 5-17 21 1 10 8 16 19 8 11-5 20-4 18-20 2-12"
        fill="#E3BA69"
      />
      <path d="m176 158 10-10" stroke="#8C8052" strokeWidth="2" />
      <g fill="#A5BB8D">
        <ellipse cx="61" cy="275" rx="12" ry="27" transform="rotate(-35 61 275)" />
        <ellipse cx="82" cy="278" rx="10" ry="24" transform="rotate(25 82 278)" />
      </g>
      <g transform="translate(426 161) rotate(12)">
        <rect width="74" height="45" rx="13" fill="#FFFDF2" />
        <path d="m21 45-4 11 18-11" fill="#FFFDF2" />
        <path
          d="m22 26 9-14 7 14m-13-5h10m8-4h11m-11 8h11"
          stroke="#667D58"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <g fill="#789568">
        <path d="m239 105 3-8 3 8 8 3-8 3-3 8-3-8-8-3zM397 116l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" />
      </g>
    </svg>
  );
}
