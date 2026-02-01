import fs from "fs";
var JSZip = require('jszip')

const get_filenames = () => {
  const file_names = fs.readdirSync("./spotify_extended_streaming_history/");

  const result = file_names.filter((file_name) => file_name.endsWith("json"))

  return result;
};

const format_date = (date_str: string, timeZone = "America/New_York") => {
  const date = new Date(date_str);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  try {
    return formatter.format(date);
  } catch (e) {
    console.error("This is the problem date:", date);
    console.error("This is the problem date string: ", date_str);
  }
};

const start_end_data = JSON.parse(
  fs.readFileSync("config/spotify_start_and_end.json", "utf-8")
);

const reasons_start = start_end_data.reasons_start;
const reasons_end = start_end_data.reasons_end;

function millisToMinutesAndSeconds(millis: number) {
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.round((millis % 60000) / 1000);
  return seconds === 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

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
type SpotifyPlayEntry = {
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

type BaseProcessedEntry = {
  uri: string;

  start_time: string | null;
  end_time: string | null;

  reason_start: string;
  reason_end: string;

  offline: "Online" | "Offline";
  hidden: "Hidden" | "Not Hidden";
  shuffle: "Shuffled" | "Not Shuffled";
  skipped: "Skipped" | "Not Skipped";

  played_duration: string; // "2:16"
};

type TrackProcessedEntry = BaseProcessedEntry & {
  type: "track";
  track_name: string | null;
  artist_name: string | null;
  album_name: string | null;
};

type PodcastProcessedEntry = BaseProcessedEntry & {
  type: "episode";
  episode_name: string | null;
  podcast_name: string | null;
};

type AudiobookProcessedEntry = BaseProcessedEntry & {
  type: "audiobook";
  title: string | null;
  chapter_title: string | null;
  chapter_uri: string | null;
};

type ProcessedEntry =
  | TrackProcessedEntry
  | PodcastProcessedEntry
  | AudiobookProcessedEntry;

const process_entry = (entry: SpotifyPlayEntry): ProcessedEntry => {
  const start_time = !entry.offline_timestamp
    ? null
    : format_date(new Date(entry.offline_timestamp * 1000).toISOString());

  /*
  //Visual of above code line

  //Offline timestamp. Sometimes null.
  if (entry.offline_timestamp == null) {
    start_time = null;
  } else {
    //If given null, it will give December 31, 1969 at 7:00 PM, so no need to calculate
    start_time = format_date(
      new Date(entry.offline_timestamp * 1000).toISOString()
    );
  }*/

  //Using .ts, when event is sent and logged in server
  const end_time = format_date(entry.ts);

  const baseEntry = {
    start_time: start_time ?? "",
    end_time: end_time ?? "",
    reason_start: reasons_start[entry.reason_start] || entry.reason_start,

    reason_end: reasons_end[entry.reason_end] || entry.reason_end,
    offline: entry.offline ? "Offline" : "Online",
    hidden: entry.incognito_mode ? "Hidden" : "Not Hidden",
    shuffle: entry.shuffle ? "Shuffled" : "Not Shuffled",

    skipped: entry.skipped ? "Skipped" : "Not Skipped",

    played_duration: millisToMinutesAndSeconds(entry.ms_played),
  } satisfies Omit<BaseProcessedEntry, "uri">;

  if (entry.master_metadata_track_name) {
    // Track data

    return {
      ...baseEntry,

      type: "track",
      track_name: entry.master_metadata_track_name,
      artist_name: entry.master_metadata_album_artist_name,
      album_name: entry.master_metadata_album_album_name,
      uri: entry.spotify_track_uri ?? "",
    };
  } else if (entry.episode_name) {
    //Podcast data

    return {
      ...baseEntry,
      type: "episode",
      episode_name: entry.episode_name,
      podcast_name: entry.episode_show_name,
      uri: entry.spotify_episode_uri ?? "",
    };
  } else {
    // Audiobook data
    return {
      ...baseEntry,

      type: "audiobook",
      title: entry.audiobook_title,
      uri: entry.audiobook_uri ?? "",
      chapter_title: entry.audiobook_chapter_title,
      chapter_uri: entry.audiobook_chapter_uri,
    };
  }
};

const process_data_total = (data: any) => {

  const total_songs = new Map();
    for (const entry of data) {
      const processed = process_entry(entry);

      if (!total_songs.has(processed.uri)) {
        if (processed.type === "track") {
          total_songs.set(processed.uri, {
            info: {
              track_name: processed.track_name,
              artist_name: processed.artist_name,
              album_name: processed.album_name,
            },
            type: "track",
            plays: [],
          });
        } else if (processed.type === "audiobook") {
          total_songs.set(processed.uri, {
            info: {
              title: processed.chapter_title,
              chapter_title: processed.chapter_title,
              chapter_uri: processed.chapter_uri,
            },
            type: "audiobook",
            plays: [],
          });
        } else {
          total_songs.set(processed.uri, {
            info: {
              episode_name: processed.episode_name,
              podcast_name: processed.podcast_name,
            },
            type: "podcast",
            plays: [],
          });
        }
      }

      total_songs.get(processed.uri).plays.push(processed);

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
      "spotify_start_and_end.json",
      JSON.stringify(start_end_data, null, 2),
      "utf-8"
    );
  }

  const sorted_songs = Array.from(total_songs.entries()).sort((a, b) => b[1].plays.length - a[1].plays.length);

  return sorted_songs;
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

   console.log(result.length);

   fs.writeFileSync(
    "consolidated_spotify_extended_streaming_history.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );
};