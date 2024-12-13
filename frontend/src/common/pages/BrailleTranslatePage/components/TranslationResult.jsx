
import React from 'react';

const TranslationResult = ({ translation }) => {
  if (!translation) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Translation Result:</h3>
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-lg braille-font">{translation}</p>
      </div>
    </div>
  );
};

export default TranslationResult;