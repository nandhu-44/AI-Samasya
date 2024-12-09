
import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const handSigns = [
  { id: 1, name: 'Hello', thumbnail: '/signs/hello.png', videoUrl: '/signs/hello.mp4' },
  { id: 2, name: 'Thank You', thumbnail: '/signs/thankyou.png', videoUrl: '/signs/thankyou.mp4' },
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