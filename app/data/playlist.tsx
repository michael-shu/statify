'use client';

import { useMemo, useState } from 'react';

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

type TopSong = {
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

type TopSongs = Record<string, TopSong>;

type SongEvent = PlayEntry & {
  category: 'played' | 'skipped' | 'hidden';
  sort_time: number;
};

type SongRow = {
  uri: string;
  info: TopSong['info'];
  type: string;
  total_events: number;
  events: SongEvent[];
};

const toTimestamp = (dateString: string) => {
  const parsed = new Date(dateString).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const buildSongRows = (top_songs: TopSongs): SongRow[] => {
  const rows: SongRow[] = Object.entries(top_songs).map(([uri, song]) => {
    const events: SongEvent[] = [
      ...song.plays.map((entry) => ({
        ...entry,
        category: 'played' as const,
        sort_time: toTimestamp(entry.start_time),
      })),
      ...song.skipped.map((entry) => ({
        ...entry,
        category: 'skipped' as const,
        sort_time: toTimestamp(entry.start_time),
      })),
      ...song.hidden.map((entry) => ({
        ...entry,
        category: 'hidden' as const,
        sort_time: toTimestamp(entry.start_time),
      })),
    ].sort((a, b) => b.sort_time - a.sort_time);

    return {
      uri,
      info: song.info,
      type: song.type,
      total_events: events.length,
      events,
    };
  });

  return rows.sort((a, b) => b.total_events - a.total_events);
};

const categoryClasses: Record<SongEvent['category'], string> = {
  played: 'bg-green-100 text-green-800 border-green-200',
  skipped: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hidden: 'bg-purple-100 text-purple-800 border-purple-200',
};

const DetailLine = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1">
      <div className="font-medium text-slate-600">{label}</div>
      <div className="text-slate-900 break-words">{value}</div>
    </div>
  );
};

const EventRow = ({
  event,
  eventKey,
}: {
  event: SongEvent;
  eventKey: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${categoryClasses[event.category]}`}
            >
              {event.category}
            </span>
            <span className="text-sm font-medium text-slate-900">
              {event.start_time}
            </span>
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {event.played_duration}
          </div>
        </div>

        <span className="shrink-0 text-xl text-slate-500">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <DetailLine label="Event ID" value={eventKey} />
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

const SongCard = ({ song }: { song: SongRow }) => {
  const [open, setOpen] = useState(false);
  const topTenEvents = song.events.slice(0, 10);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">
            {song.info.track_name}
          </div>
          <div className="text-sm text-slate-600">
            {song.info.artist_name} • {song.info.album_name}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Total Plays
            </div>
            <div className="text-lg font-bold text-slate-900">
              {song.total_events}
            </div>
          </div>
          <span className="text-2xl text-slate-500">
            {open ? '▴' : '▾'}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="mb-3 text-sm font-semibold text-slate-700">
            10 Most Recent Events
          </div>

          <div className="space-y-3">
            {topTenEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                No events found.
              </div>
            ) : (
              topTenEvents.map((event, index) => (
                <EventRow
                  key={`${song.uri}-${event.category}-${event.start_time}-${index}`}
                  event={event}
                  eventKey={`${song.uri}-${index}`}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PlayList = ({ top_songs }: { top_songs: TopSongs }) => {
  const songs = useMemo(() => buildSongRows(top_songs), [top_songs]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Songs</h1>
          <p className="mt-1 text-slate-600">
            Expand a song to see its 10 most recent events. Expand an event to
            see full details.
          </p>
        </div>

        <div className="space-y-4">
          {songs.map((song) => (
            <SongCard key={song.uri} song={song} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayList;