'use client';
import { useMemo, useRef, useState } from 'react';

type PlayEntry = {
  start_time: string;
  end_time: string;
  reason_start: string;
  reason_end: string;
  offline: string;
  shuffle: string;
  played_duration: string;
  type: string;
};

type SongEntry = {
  info: {
    track_name: string;
    artist_name: string;
    album_name: string;
    timestamp_first_played: string;
  };
  type: string;
  plays: PlayEntry[];
  hidden: PlayEntry[];
  skipped: PlayEntry[];
};

type ResultType = {
  top_songs: Record<string, SongEntry>;
};

type SongEvent = PlayEntry & {
  category: 'played' | 'hidden' | 'skipped';
  sort_time: number;
};

type SortedSong = {
  uri: string;
  info: SongEntry['info'];
  type: string;
  plays: PlayEntry[];
  hidden: PlayEntry[];
  skipped: PlayEntry[];
  total_count: number;
  events: SongEvent[];
};

const parseDisplayDate = (value: string) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sort_total_songs = (top_songs: Record<string, SongEntry>): SortedSong[] => {
  return Object.entries(top_songs)
    .map(([uri, song]) => {
      const events: SongEvent[] = [
        ...song.plays.map((entry) => ({
          ...entry,
          category: 'played' as const,
          sort_time: parseDisplayDate(entry.start_time),
        })),
        ...song.hidden.map((entry) => ({
          ...entry,
          category: 'hidden' as const,
          sort_time: parseDisplayDate(entry.start_time),
        })),
        ...song.skipped.map((entry) => ({
          ...entry,
          category: 'skipped' as const,
          sort_time: parseDisplayDate(entry.start_time),
        })),
      ].sort((a, b) => b.sort_time - a.sort_time);

      return {
        uri,
        ...song,
        total_count: song.plays.length + song.hidden.length + song.skipped.length,
        events,
      };
    })
    .sort((a, b) => b.total_count - a.total_count);
};

const categoryClasses: Record<SongEvent['category'], string> = {
  played: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  hidden: 'bg-violet-100 text-violet-800 border-violet-200',
  skipped: 'bg-amber-100 text-amber-800 border-amber-200',
};

const DetailLine = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-1">
    <div className="font-medium text-slate-500">{label}</div>
    <div className="break-words text-slate-900">{value}</div>
  </div>
);

const EventCard = ({ event }: { event: SongEvent }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${categoryClasses[event.category]}`}
            >
              {event.category}
            </span>
            <span className="text-sm font-medium text-slate-900">
              {event.start_time}
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {event.played_duration}
          </div>
        </div>

        <span className="shrink-0 text-lg text-slate-500">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <DetailLine label="Time Started" value={event.start_time} />
          <DetailLine label="Time Ended" value={event.end_time} />
          <DetailLine label="Category" value={event.category} />
          <DetailLine label="Reason Started" value={event.reason_start} />
          <DetailLine label="Reason Stopped" value={event.reason_end} />
          <DetailLine label="Duration" value={event.played_duration} />
          <DetailLine label="Shuffle" value={event.shuffle} />
          <DetailLine label="Offline" value={event.offline} />
          <DetailLine label="Type" value={event.type} />
        </div>
      )}
    </div>
  );
};

const SongCard = ({ song, rank }: { song: SortedSong; rank: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="min-w-0 flex items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {rank}
          </div>

          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">
              {song.info.track_name}
            </div>
            <div className="truncate text-sm text-slate-500">
              {song.info.artist_name} • {song.info.album_name}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Total Events
            </div>
            <div className="text-xl font-bold text-cyan-700">
              {song.total_count}
            </div>
          </div>
          <span className="text-xl text-slate-500">{open ? '▴' : '▾'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <DetailLine label="Artist" value={song.info.artist_name} />
            <DetailLine label="Album" value={song.info.album_name} />
            <DetailLine label="First Played" value={song.info.timestamp_first_played} />
            <DetailLine label="Completed Plays" value={song.plays.length} />
            <DetailLine label="Hidden Plays" value={song.hidden.length} />
            <DetailLine label="Skipped Plays" value={song.skipped.length} />
            <DetailLine label="URI" value={song.uri} />
          </div>

          <div className="mb-3 text-sm font-semibold text-slate-700">
            10 Most Recent Events
          </div>

          <div className="space-y-3">
            {song.events.slice(0, 10).map((event, index) => (
              <EventCard
                key={`${song.uri}-${event.category}-${event.start_time}-${index}`}
                event={event}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const sendTiming = async (payload: Record<string, any>) => {
  try {
    await fetch('/api/timing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to send timing:', err);
  }
};

const Upload = () => {
  const [isUploading, setUploading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const songs = useMemo(() => {
    if (!result) return [];
    return sort_total_songs(result.top_songs);
  }, [result]);

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          id="fileUpload"
          name="fileUpload"
          className="hidden"
          disabled={isUploading}
          onChange={async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);

  const start = performance.now();

  try {
    const data = new FormData();
    data.set('file', file);

    const requestStart = performance.now();

    const res = await fetch('/spotify_data', {
      method: 'POST',
      body: data,
    });

    const requestEnd = performance.now();

    const jsonParseStart = performance.now();
    const json = await res.json();
    const jsonParseEnd = performance.now();

    setResult(json);

    const end = performance.now();

    await sendTiming({
      kind: 'frontend_upload',
      file_name: file.name,
      file_size: file.size,
      total_ms: end - start,
      request_ms: requestEnd - requestStart,
      json_parse_ms: jsonParseEnd - jsonParseStart,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Upload failed:', err);

    await sendTiming({
      kind: 'frontend_upload_error',
      error: String(err),
      timestamp: new Date().toISOString(),
    });
  } finally {
    setUploading(false);
  }
}}
        />

        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-slate-100">
            Upload your Spotify export
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Upload your data, then browse songs sorted by total events.
          </p>

          <button
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-3 font-medium text-white transition-all duration-150 hover:border-white/20 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      </div>

      {songs.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Songs Loaded</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {songs.length}
            </div>
          </div>

          <div className="space-y-4">
            {songs.map((song, index) => (
              <SongCard key={song.uri} song={song} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;