import React from 'react';
import PlayList from './PlayList';

export const testData = {
  top_songs: {
    "spotify:track:3VCXx37jNGNOMns6z2OnvJ": {
      info: {
        track_name: "Swing Lynn",
        artist_name: "Harmless",
        album_name: "I'm Sure",
        timestamp_first_played: "2024-04-09T01:52:17Z"
      },
      type: "track",
      plays: [
        {
          start_time: "April 8, 2024 at 9:46:55 PM",
          end_time: "April 8, 2024 at 9:52:17 PM",
          reason_start: "Previous track finished",
          reason_end: "Track finished",
          offline: "Online",
          shuffle: "Shuffled",
          played_duration: "5:21",
          type: "track"
        }
      ],
      hidden: [],
      skipped: []
    },

    "spotify:track:2LGdO5MtFdyphi2EihANZG": {
      info: {
        track_name: "Knee Socks",
        artist_name: "Arctic Monkeys",
        album_name: "AM",
        timestamp_first_played: "2024-04-09T02:05:00Z"
      },
      type: "track",
      plays: [
        {
          start_time: "June 12, 2024 at 7:06:45 AM",
          end_time: "June 12, 2024 at 7:11:03 AM",
          reason_start: "Previous track finished",
          reason_end: "Track finished",
          offline: "Online",
          shuffle: "Shuffled",
          played_duration: "4:18",
          type: "track"
        }
      ],
      hidden: [
        {
          start_time: "August 5, 2024 at 9:54:59 PM",
          end_time: "August 5, 2024 at 9:59:17 PM",
          reason_start: "Previous track finished",
          reason_end: "Track finished",
          offline: "Online",
          shuffle: "Not Shuffled",
          played_duration: "4:18",
          type: "track"
        }
      ],
      skipped: [
        {
          start_time: "April 8, 2024 at 10:26:58 PM",
          end_time: "April 8, 2024 at 10:27:07 PM",
          reason_start: "App loaded",
          reason_end: "Playback stopped",
          offline: "Online",
          shuffle: "Shuffled",
          played_duration: "0:08",
          type: "track"
        }
      ]
    },

    "spotify:track:3aI2wWEeNmtYDvsAyJahyi": {
      info: {
        track_name: "Next Exit",
        artist_name: "Vacations",
        album_name: "No Place Like Home",
        timestamp_first_played: "2024-04-09T02:27:09Z"
      },
      type: "track",
      plays: [
        {
          start_time: "April 10, 2024 at 3:44:33 PM",
          end_time: "April 10, 2024 at 3:47:52 PM",
          reason_start: "App loaded",
          reason_end: "Track finished",
          offline: "Online",
          shuffle: "Not Shuffled",
          played_duration: "3:18",
          type: "track"
        },
        {
          start_time: "April 22, 2024 at 1:48:28 PM",
          end_time: "April 22, 2024 at 1:51:49 PM",
          reason_start: "Previous track finished",
          reason_end: "Track finished",
          offline: "Online",
          shuffle: "Not Shuffled",
          played_duration: "3:21",
          type: "track"
        }
      ],
      hidden: [],
      skipped: [
        {
          start_time: "April 12, 2024 at 4:11:27 PM",
          end_time: "April 12, 2024 at 4:11:32 PM",
          reason_start: "Play button pressed",
          reason_end: "Playback stopped",
          offline: "Online",
          shuffle: "Not Shuffled",
          played_duration: "0:05",
          type: "track"
        }
      ]
    }
  }
};

const page = () => {
  return (
    <div>
      <PlayList top_songs={testData.top_songs} />
    </div>
  )
}

export default page;