"use client";
import React, { useState } from 'react';
import HandSignGrid from './components/HandSignGrid';
import LearningInterface from './components/LearningInterface';
import { Card } from "@/components/ui/card";

const HandSignLearningPage = () => {
  const [selectedSign, setSelectedSign] = useState(null);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200 p-6">
      {!selectedSign ? (
        <HandSignGrid onSelectSign={setSelectedSign} />
      ) : (
        <Card className="p-6">
          <LearningInterface 
            sign={selectedSign} 
            onBack={() => setSelectedSign(null)}
          />
        </Card>
      )}
    </div>
  );
};

export default HandSignLearningPage;