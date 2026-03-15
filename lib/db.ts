// lib/db.ts
//import { openDB } from 'idb';

/*
 {
        "ts": "2016-12-17T23:35:02Z",
        "platform": "Windows 10 (10.0.14393; x64)",
        "ms_played": 74990,
        "conn_country": "US",
        "ip_addr": "67.80.182.105",
        "master_metadata_track_name": "I Know What's Real",
        "master_metadata_album_artist_name": "A Boogie Wit da Hoodie",
        "master_metadata_album_album_name": "Artist",
        "spotify_track_uri": "spotify:track:2LrOjkIlb6yzYYpfp5zBZC",
        "episode_name": null,
        "episode_show_name": null,
        "spotify_episode_uri": null,
        "audiobook_title": null,
        "audiobook_uri": null,
        "audiobook_chapter_uri": null,
        "audiobook_chapter_title": null,
        "reason_start": "clickrow",
        "reason_end": "endplay",
        "shuffle": false,
        "skipped": false,
        "offline": false,
        "offline_timestamp": null,
        "incognito_mode": false
}
 */
export type SpotifyPlayEntry = {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr: string;

  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;

  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;

  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;

  reason_start: string;
  reason_end: string;

  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  offline_timestamp: number | null;
  incognito_mode: boolean;
};

export type BaseProcessedEntry = {
  start_time: string | null;
  end_time: string | null;

  reason_start: string;
  reason_end: string;

  offline: "Online" | "Offline";
  //hidden: "Yes Hidden" | "Not Hidden";
  shuffle: "Shuffled" | "Not Shuffled";
  //skipped: "Yes Skipped" | "Not Skipped";

  played_duration: string; // "2:16"
};

export type TrackProcessedEntry = BaseProcessedEntry & {
  type: "track";
};

export type PodcastProcessedEntry = BaseProcessedEntry & {
  type: "episode";
  episode_name: string | null;
  podcast_name: string | null;
};

export type AudiobookProcessedEntry = BaseProcessedEntry & {
  type: "audiobook";
  title: string | null;
  chapter_title: string | null;
  chapter_uri: string | null;
};

export type ProcessedEntry =
  | TrackProcessedEntry
  | PodcastProcessedEntry
  | AudiobookProcessedEntry;

  /*
    8 playlists
    //So then each song should have its own entry, and we just need to plug and play. But it'll be
    //hard to keep track of all of these albums while adding to songs, so perhaps each time
    //we see a new album, we add it to the playlist. Perhaps the whole playlist has all of the songs then, and
    //we serve a sliver to the front end? No. Just serve the whole thing. But this is going to get really difficult.
    //LIke burdensome in temrs of how to send it. Perhaps we zip what weve made, send it over, then unzip. Not
    //even sure if thats faster

    1. Most played while hidden(top 100 slice, probably not that many more. MOre on click.)
    2. Most played songs(top 100 slice, more on click)
    3. Most played artists (each artist will have their top 10 songs stored) (top 10 slice, more on click)
    4. Most played albums (all songs in the album will have their own plays)
    5. Most skipped songs (should store skipped, not skipped in info, and count as we add it. probaly number of plays as well just for ease of syntax. Or
    is that really bad because I'm adding an extra row, so say 200k songs 200k extra rows. Yeah lets not and just get length of entry.)
    6. If we hvae most skipped, then we can obviously have least skipped
    7. All countries you've used spotify in, and their top 10 songs (could be interesting, but US will
    always be on top, or wherever you live. So perhaps default exclude the top country? No better to include it always. 
    Make a joke out of it like "US (duh?) ")
    8. Which month you've discovered music that you've listened to the most (include all 12)? But need to find the earliest possible entry of each song. So best to start
    processing from earlier months in order to get the list proper. Then, once its been seen once, we add to both
    the song list and a separate month list, in which it goes into 
    february: {
        total_plays: xx,
        discovered: [
            {
                song uri:  sdfsdf,
                date_discovered,
                plays: 1232
            } 
        ]
    }
    so the exact same as songs but just with an extra thing of each month. 12 entries. and perhaps we store length of
    plays because each song will have different plays so we dont wnat to have to add them up
    */

    //No, send one gigantic thing. Songs. Each artist will have a list of their songs, but it'll just be ids. 
    //Like 
    /*
    {
    artist: "booboo",
    total_plays: 345
    songs: [
        {uri: "sdfsdfsd", plays: 2343} 
        using this, just go to songs thing, lookup is O(1) and then we pull extra info as needed. Save on space.
    ]
    }

    {
    album: xxx,
    artist: "booboo",
    songs: [
        {uri: "sdfsdf", plays: 2}
        {uri: "ererer", plays: 200}
        etc..
        ]
    }
    */
    //So, we'll have 1 gigantic things. 
    //5 and 6 are simple, just resort based on skipped/not skipped, so just serve as is. Make the client do some computing.

    //7, we'll just store the top 10 songs per country. 
    //8, we'll also just store the top 10 per month. (space constraints getting very large)

    //Get client to pull as needed, when its loading in stuff. ANd use song array as final source of truth.

export type view = {
    type: string;
    ordering: any;
    //For albums: 
    /**
     * KEY: "album_name":
     * DATA: {
     * artist: "xyz_person"
     * Songs: [
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232},
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232},
     *  ...
     * ]
     * }
     */

    //For artists: 
    /**
     * KEY: "artist_name"
     * DATA: {
     * songs: [
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232},
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232},
     *  ...
     * ]
     * }
     */

    //For country:
    /**
     * KEY: "US" | "JP" | etc.. (TODO: store a long list of all possible country codes that spotify uses,
     * iterate over all of them (max 138 or so, negligible))
     * DATA: {
     * songs: [
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232},
     * 
     * ]
     * }
     */

    //For month: 
    /**
     * KEY: 1-12
     * DATA: {
     * songs: [
     *  {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232, first_listened: entry.ts},
     * ]
     * }
     */

    // {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232}
    //For artists: {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232}
    //For hidden: Just sort the songs array by # of hidden, we'lll store it in info
    //For most/least skipped: Song aray by # of skipped, store in info
    //For country: {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232}

    //For month: {song_uri: "xdsdf", song_name: "sdfsdf", plays: 3232}
    //Use song_uri to import all data from indexeddb
}
    /**
     * 8 current playlists
     * 1. Most played songs
     * 2. Most played albums (each will have all their songs, ordered by plays)
     * 3. Most played artists (each will have top 10 songs)
     * 4. Most played hidden
     * 5. Most skipped songs(trivial, sort by number stored in info)
     * 6. Least skipped songs(trivial, just go reverse order of 5)
     * 7. Top countries (make a joke about the first one like "duh" or "obviously" because it's gonna be the same as 1...)
     *  -- Store the top 10 songs for each country(lets just do all countries, because most people wont have more than 1)
     *  --If they dont have more than 1, then just dont even include it lmao
     * 8.Store the top 10 most discovered per month (this means we must parse backwards, from earliest to latest, 
     */

// ISO 3166-1 alpha-2 country codes
export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  AD: "Andorra",
  AE: "United Arab Emirates",
  AF: "Afghanistan",
  AG: "Antigua and Barbuda",
  AI: "Anguilla",
  AL: "Albania",
  AM: "Armenia",
  AO: "Angola",
  AQ: "Antarctica",
  AR: "Argentina",
  AS: "American Samoa",
  AT: "Austria",
  AU: "Australia",
  AW: "Aruba",
  AX: "Åland Islands",
  AZ: "Azerbaijan",

  BA: "Bosnia and Herzegovina",
  BB: "Barbados",
  BD: "Bangladesh",
  BE: "Belgium",
  BF: "Burkina Faso",
  BG: "Bulgaria",
  BH: "Bahrain",
  BI: "Burundi",
  BJ: "Benin",
  BL: "Saint Barthélemy",
  BM: "Bermuda",
  BN: "Brunei Darussalam",
  BO: "Bolivia (Plurinational State of)",
  BQ: "Bonaire, Sint Eustatius and Saba",
  BR: "Brazil",
  BS: "Bahamas",
  BT: "Bhutan",
  BV: "Bouvet Island",
  BW: "Botswana",
  BY: "Belarus",
  BZ: "Belize",

  CA: "Canada",
  CC: "Cocos (Keeling) Islands",
  CD: "Congo, Democratic Republic of the",
  CF: "Central African Republic",
  CG: "Congo",
  CH: "Switzerland",
  CI: "Côte d'Ivoire",
  CK: "Cook Islands",
  CL: "Chile",
  CM: "Cameroon",
  CN: "China",
  CO: "Colombia",
  CR: "Costa Rica",
  CU: "Cuba",
  CV: "Cabo Verde",
  CW: "Curaçao",
  CX: "Christmas Island",
  CY: "Cyprus",
  CZ: "Czechia",

  DE: "Germany",
  DJ: "Djibouti",
  DK: "Denmark",
  DM: "Dominica",
  DO: "Dominican Republic",
  DZ: "Algeria",

  EC: "Ecuador",
  EE: "Estonia",
  EG: "Egypt",
  EH: "Western Sahara",
  ER: "Eritrea",
  ES: "Spain",
  ET: "Ethiopia",

  FI: "Finland",
  FJ: "Fiji",
  FK: "Falkland Islands (Malvinas)",
  FM: "Micronesia (Federated States of)",
  FO: "Faroe Islands",
  FR: "France",

  GA: "Gabon",
  GB: "United Kingdom of Great Britain and Northern Ireland",
  GD: "Grenada",
  GE: "Georgia",
  GF: "French Guiana",
  GG: "Guernsey",
  GH: "Ghana",
  GI: "Gibraltar",
  GL: "Greenland",
  GM: "Gambia",
  GN: "Guinea",
  GP: "Guadeloupe",
  GQ: "Equatorial Guinea",
  GR: "Greece",
  GS: "South Georgia and the South Sandwich Islands",
  GT: "Guatemala",
  GU: "Guam",
  GW: "Guinea-Bissau",
  GY: "Guyana",

  HK: "Hong Kong",
  HM: "Heard Island and McDonald Islands",
  HN: "Honduras",
  HR: "Croatia",
  HT: "Haiti",
  HU: "Hungary",

  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IM: "Isle of Man",
  IN: "India",
  IO: "British Indian Ocean Territory",
  IQ: "Iraq",
  IR: "Iran (Islamic Republic of)",
  IS: "Iceland",
  IT: "Italy",

  JE: "Jersey",
  JM: "Jamaica",
  JO: "Jordan",
  JP: "Japan",

  KE: "Kenya",
  KG: "Kyrgyzstan",
  KH: "Cambodia",
  KI: "Kiribati",
  KM: "Comoros",
  KN: "Saint Kitts and Nevis",
  KP: "Korea (Democratic People's Republic of)",
  KR: "Korea, Republic of",
  KW: "Kuwait",
  KY: "Cayman Islands",
  KZ: "Kazakhstan",

  LA: "Lao People's Democratic Republic",
  LB: "Lebanon",
  LC: "Saint Lucia",
  LI: "Liechtenstein",
  LK: "Sri Lanka",
  LR: "Liberia",
  LS: "Lesotho",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  LY: "Libya",

  MA: "Morocco",
  MC: "Monaco",
  MD: "Moldova, Republic of",
  ME: "Montenegro",
  MF: "Saint Martin (French part)",
  MG: "Madagascar",
  MH: "Marshall Islands",
  MK: "North Macedonia",
  ML: "Mali",
  MM: "Myanmar",
  MN: "Mongolia",
  MO: "Macao",
  MP: "Northern Mariana Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MS: "Montserrat",
  MT: "Malta",
  MU: "Mauritius",
  MV: "Maldives",
  MW: "Malawi",
  MX: "Mexico",
  MY: "Malaysia",
  MZ: "Mozambique",

  NA: "Namibia",
  NC: "New Caledonia",
  NE: "Niger",
  NF: "Norfolk Island",
  NG: "Nigeria",
  NI: "Nicaragua",
  NL: "Netherlands (Kingdom of the)",
  NO: "Norway",
  NP: "Nepal",
  NR: "Nauru",
  NU: "Niue",
  NZ: "New Zealand",

  OM: "Oman",

  PA: "Panama",
  PE: "Peru",
  PF: "French Polynesia",
  PG: "Papua New Guinea",
  PH: "Philippines",
  PK: "Pakistan",
  PL: "Poland",
  PM: "Saint Pierre and Miquelon",
  PN: "Pitcairn",
  PR: "Puerto Rico",
  PS: "Palestine, State of",
  PT: "Portugal",
  PW: "Palau",
  PY: "Paraguay",

  QA: "Qatar",

  RE: "Réunion",
  RO: "Romania",
  RS: "Serbia",
  RU: "Russian Federation",
  RW: "Rwanda",

  SA: "Saudi Arabia",
  SB: "Solomon Islands",
  SC: "Seychelles",
  SD: "Sudan",
  SE: "Sweden",
  SG: "Singapore",
  SH: "Saint Helena, Ascension and Tristan da Cunha",
  SI: "Slovenia",
  SJ: "Svalbard and Jan Mayen",
  SK: "Slovakia",
  SL: "Sierra Leone",
  SM: "San Marino",
  SN: "Senegal",
  SO: "Somalia",
  SR: "Suriname",
  SS: "South Sudan",
  ST: "Sao Tome and Principe",
  SV: "El Salvador",
  SX: "Sint Maarten (Dutch part)",
  SY: "Syrian Arab Republic",
  SZ: "Eswatini",

  TC: "Turks and Caicos Islands",
  TD: "Chad",
  TF: "French Southern Territories",
  TG: "Togo",
  TH: "Thailand",
  TJ: "Tajikistan",
  TK: "Tokelau",
  TL: "Timor-Leste",
  TM: "Turkmenistan",
  TN: "Tunisia",
  TO: "Tonga",
  TR: "Türkiye",
  TT: "Trinidad and Tobago",
  TV: "Tuvalu",
  TW: "Taiwan, Province of China",
  TZ: "Tanzania, United Republic of",

  UA: "Ukraine",
  UG: "Uganda",
  UM: "United States Minor Outlying Islands",
  US: "United States of America",
  UY: "Uruguay",
  UZ: "Uzbekistan",

  VA: "Holy See",
  VC: "Saint Vincent and the Grenadines",
  VE: "Venezuela (Bolivarian Republic of)",
  VG: "Virgin Islands (British)",
  VI: "Virgin Islands (U.S.)",
  VN: "Viet Nam",
  VU: "Vanuatu",

  WF: "Wallis and Futuna",
  WS: "Samoa",

  YE: "Yemen",
  YT: "Mayotte",

  ZA: "South Africa",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

/*
export const dbPromise = openDB('spotify-db', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('files');
    }
    if (oldVersion < 2) {
      db.createObjectStore('songs', { keyPath: 'uri' });
      db.createObjectStore('views', { keyPath: 'id' });
    }
  },
});
*/