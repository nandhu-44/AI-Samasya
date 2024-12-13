
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const BrailleInput = ({ value, onChange, onTranslate }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Braille Translator</h2>
      <Textarea
        placeholder="Enter text to translate..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px]"
      />
      <Button 
        onClick={() => onTranslate(value)}
        className="w-full"
      >
        Translate
      </Button>
    </div>
  );
};

export default BrailleInput;