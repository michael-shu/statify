import React from 'react';
import fs from 'fs';
import path from 'path';

import type {ProcessedEntry} from '@/lib/db';

const file = fs.readFileSync(path.join(process.cwd(), "consolidated_spotify_extended_streaming_history.json"), 'utf8');
const data = JSON.parse(file);

function createPlaylists(song_data : ProcessedEntry[]) {

    for(const song_entry of song_data) {

    }

}

const page = () => {
  return (
    <div>Check the logs!</div>
  )
}

export default page;