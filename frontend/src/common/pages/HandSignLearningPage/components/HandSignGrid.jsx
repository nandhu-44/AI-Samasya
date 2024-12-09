
import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const handSigns = [
  { id: 1, name: 'Hello', thumbnail: '/signs/hello.png', videoUrl: '/signs/hello.mp4' },
  { id: 2, name: 'Hi', thumbnail: '/signs/hi.png', videoUrl: '/signs/hi.mp4' },
  { id: 3, name: 'You Good', thumbnail: '/signs/good.png', videoUrl: '/signs/good.mp4' },
  { id: 4, name: 'What\'s up', thumbnail: '/signs/what.png', videoUrl: '/signs/what.mp4' },
  { id: 5, name: 'How you', thumbnail: '/signs/how.png', videoUrl: '/signs/how.mp4' },
  // Add more signs here
];

const HandSignGrid = ({ onSelectSign }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {handSigns.map((sign) => (
        <Card 
          key={sign.id}
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => onSelectSign(sign)}
        >
          <CardHeader>
            <img src={sign.thumbnail} alt={sign.name} className="w-full h-48 object-cover rounded" />
            <CardTitle className="text-center mt-2">{sign.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default HandSignGrid;