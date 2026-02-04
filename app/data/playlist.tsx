'use client';
import {useEffect} from 'react'

type song = {
    uri: string;
    plays: number;
    title: string;
}

const PlayList = ({song_list}: {song_list: song[]}) => {

    useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const uri = entry.target.getAttribute('data-uri');
          console.log('VISIBLE:', uri);

          // Prefetch here
        }
      });
    }, { rootMargin: '300px' });

    const elements = document.querySelectorAll('[data-song]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);


  return (
    <div>
      {song_list.map((element) => (
        <div
          key={element.uri}
          data-song
          data-uri={element.uri}
          className="p-2 border mb-2"
        >
          {element.uri} and {element.plays} and {element.title}
          <button>+</button>
        </div>
      ))}
    </div>
  )

}

export default PlayList;