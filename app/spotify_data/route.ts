import fs from "fs";
const JSZip = require("jszip");
import type {
  BaseProcessedEntry,
  ProcessedEntry,
  SpotifyPlayEntry,
} from "@/lib/db";
import { COUNTRY_CODE_TO_NAME } from "@/lib/db";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const format_date = (date_str: string) => {
  const date = new Date(date_str);

  try {
    return formatter.format(date);
  } catch (e) {
    console.error("This is the problem date:", date);
    console.error("This is the problem date string: ", date_str);
  }
};

function millisToMinutesAndSeconds(millis: number) {
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.round((millis % 60000) / 1000);
  return seconds === 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

const start_end_data = JSON.parse(
  fs.readFileSync("config/spotify_start_and_end.json", "utf-8")
);

const reasons_start = start_end_data.reasons_start;
const reasons_end = start_end_data.reasons_end;

const calculate_start_end = (entry: SpotifyPlayEntry) => {
  const end = new Date(entry.ts);
  const start = new Date(end.getTime() - entry.ms_played);
  //Using .ts, when event is finished
  // From spotify: ts is "Date and time of when the stream ended in UTC format."

  const start_time = format_date(start.toISOString());
  const end_time = format_date(entry.ts);

  return [start_time, end_time];
};

const map_to_object = (map: Map<any, any>) => Object.fromEntries(map.entries());

const process_entry = (entry: SpotifyPlayEntry): ProcessedEntry => {
  const [start_time, end_time] = calculate_start_end(entry);

  const baseEntry = {
    start_time: start_time ?? "",
    end_time: end_time ?? "",
    reason_start: reasons_start[entry.reason_start] || entry.reason_start,

    reason_end: reasons_end[entry.reason_end] || entry.reason_end,
    offline: entry.offline ? "Offline" : "Online",
    //hidden: entry.incognito_mode ? "Yes Hidden" : "Not Hidden",
    shuffle: entry.shuffle ? "Shuffled" : "Not Shuffled",

    //skipped: entry.skipped ? "Yes Skipped" : "Not Skipped",

    played_duration: millisToMinutesAndSeconds(entry.ms_played),
  } satisfies Omit<BaseProcessedEntry, "uri">;

  if (entry.master_metadata_track_name) {
    // Track data

    return {
      ...baseEntry,

      type: "track",
      //uri: entry.spotify_track_uri ?? "",
    };
  } else if (entry.episode_name) {
    //Podcast data

    return {
      ...baseEntry,
      type: "episode",
      episode_name: entry.episode_name,
      podcast_name: entry.episode_show_name,
      //uri: entry.spotify_episode_uri ?? "",
    };
  } else {
    // Audiobook data
    return {
      ...baseEntry,

      type: "audiobook",
      title: entry.audiobook_title,
      //uri: entry.audiobook_uri ?? "",
      chapter_title: entry.audiobook_chapter_title,
      chapter_uri: entry.audiobook_chapter_uri,
    };
  }
};

const process_data_total = (data: SpotifyPlayEntry[]) => {
  const total_songs = new Map();
  const total_artists = new Map();
  const total_albums = new Map();
  const total_countries = new Map();
  
  const total_discovered_per_month = new Map<string, string[][]>([
      ["January",   [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["February",  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["March",     [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["April",     [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["May",       [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["June",      [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["July",      [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["August",    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["September", [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["October",   [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["November",  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
      ["December",  [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]],
  ]);

  for (const entry of data) {
    const processed = process_entry(entry);

    if (processed.type === "track") {
      const artistName = entry.master_metadata_album_artist_name;
      const trackName = entry.master_metadata_track_name;
      const albumName = entry.master_metadata_album_album_name;
      const uri = entry.spotify_track_uri || "";

      //Song map
      if (!total_songs.has(uri)) {
        total_songs.set(uri, {
          info: {
            track_name: trackName,
            artist_name: artistName,
            album_name: albumName,
            timestamp_first_played: entry.ts,
          },
          type: "track",
          plays: [],
          hidden: [],
          skipped: [],
        });

        const discovery_date = new Date(entry.ts);
        const discovery_month = discovery_date.toLocaleString('default', {month: 'long'});
        const discovery_day = discovery_date.getDate() - 1; 

        //Discovered map
        const monthData = total_discovered_per_month.get(discovery_month);

        if (monthData && monthData[discovery_day]) {
            monthData[discovery_day].push(uri);
        }
      }

      //Artist map
      let artist = total_artists.get(artistName);
      if (!artist) {
        artist = { plays: 0, songs: {} };
        total_artists.set(artistName, artist);
      }
      if (!artist.songs[uri]) {
        artist.songs[uri] = {
          uri: uri,
          title: entry.master_metadata_track_name,
          plays: 0,
        };
      }
      artist.plays++;
      artist.songs[uri].plays++;

      //Album map
      let album = total_albums.get(albumName);
      if (!album) {
        album = {
          artist: artistName,
          plays: 0,
          songs: {},
        };
        total_albums.set(albumName, album);
      }
      if (!album.songs[uri]) {
        album.songs[uri] = {
          //uri: uri,
          title: entry.master_metadata_track_name,
          plays: 0,
        };
      }
      album.plays++;
      album.songs[uri].plays++;

      //countries
      //codes possible are:
      const country_name = COUNTRY_CODE_TO_NAME[entry.conn_country] ?? "unknown country";
      let country = total_countries.get(entry.conn_country);

      if (!country) {
        country = {
          country: country_name,
          plays: 0,
          songs: {},
        };
        total_countries.set(entry.conn_country, country);
      }

      if (!country.songs[uri]) {
        country.songs[uri] = {
          //uri: uri,
          title: entry.master_metadata_track_name,
          plays: 0,
        };
      }
      country.plays++;
      country.songs[uri].plays++;

      if (entry.incognito_mode) {
        //total_songs.get(processed.uri).hidden += 1;

        total_songs.get(uri).hidden.push(processed);
      } else if (entry.skipped) {
        //total_songs.get(processed.uri).skipped += 1;
        total_songs.get(uri).skipped.push(processed);
      } else {
        total_songs.get(uri).plays.push(processed);
      }
    } else if (processed.type === "audiobook") {
    } /*processed.type === "podcast" */ else {
    }

    if (!(entry.reason_start in reasons_start)) {
      reasons_start[entry.reason_start] =
        "UNCLARIFIED_REASON" + entry.reason_start;
    }
    if (!(entry.reason_end in reasons_end)) {
      reasons_end[entry.reason_end] = "UNCLARIFIED_REASON" + entry.reason_end;
    }
  }

  if (
    Object.keys(start_end_data.reasons_start).length !==
      Object.keys(reasons_start).length ||
    Object.keys(start_end_data.reasons_end).length !==
      Object.keys(reasons_end).length
  ) {
    start_end_data.reasons_start = reasons_start;
    start_end_data.reasons_end = reasons_end;
    fs.writeFileSync(
      "config/spotify_start_and_end.json",
      JSON.stringify(start_end_data, null, 2),
      "utf-8"
    );
  }

  //For debugging purposes
  /*
  fs.writeFileSync("config/orderings.json", JSON.stringify(
      {
        top_songs: map_to_object(total_songs),
        top_artists: map_to_object(total_artists),
        top_albums: map_to_object(total_albums),
        top_countries: map_to_object(total_countries),
        total_discovered_per_month: map_to_object(total_discovered_per_month),
        reasons_start,
        reasons_end,
      }, null, 2), "utf-8"
    );*/

    /*
  const sorted_songs = Array.from(total_songs.entries()).sort(
    (a, b) => b[1].plays.length - a[1].plays.length
  );*/

  return {
        top_songs: map_to_object(total_songs),
        top_songs_ordered: sort_total_songs(total_songs),
        //top_artists: map_to_object(total_artists),
        //top_albums: map_to_object(total_albums),
        //top_countries: map_to_object(total_countries),
        //total_discovered_per_month: map_to_object(total_discovered_per_month),
        //reasons_start,
        //reasons_end,
      };
};

const sort_total_songs = (
  total_songs: Map<
    string,
    {
      info: {
        track_name: string;
        artist_name: string;
        album_name: string;
        timestamp_first_played: string;
      };
      type: "track";
      plays: any[];
      hidden: any[];
      skipped: any[];
    }
  >
) => {
  return [...total_songs.entries()]
    .sort((a, b) => {
      const aTotal =
        a[1].plays.length + a[1].hidden.length + a[1].skipped.length;
      const bTotal =
        b[1].plays.length + b[1].hidden.length + b[1].skipped.length;

      return bTotal - aTotal;
    })
    .map(([uri, song]) => [
      uri,
      {
        ...song,
        plays: [...song.plays].reverse(),
        hidden: [...song.hidden].reverse(),
        skipped: [...song.skipped].reverse(),
      },
    ]);
};

export async function POST(request: Request) {
  const data = await request.formData();

  const file: File | null = data.get("file") as unknown as File;

  console.log("This is the file");
  console.log(file);

  // ✅ Convert File -> ArrayBuffer (what JSZip can read)
  const arrayBuffer = await file.arrayBuffer();

  // ✅ Await the zip load (don’t use .then in a route handler)
  const zip = await JSZip.loadAsync(arrayBuffer);

  const allEntries = [];
  for (const [path, zf] of Object.entries(zip.files)) {
    if (zf.dir) continue; // skip folders
    if (!path.toLowerCase().endsWith(".json")) continue; //Skip the pdf in the files, or just all non-json files.

    const text = await zf.async("string");

    if (!text.trim()) {
      console.log("Skipping empty file:", path);
      continue;
    }

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        allEntries.push(...parsed);
      } else {
        allEntries.push(parsed);
      }
    } catch (err) {
      console.log("Invalid JSON, skipping:", path);
      continue;
    }
  }

  const result = process_data_total(allEntries);

  return Response.json(result);
  //console.log(result.length);

  /*
  fs.writeFileSync(
    "consolidated_spotify_extended_streaming_history.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );*/
}
