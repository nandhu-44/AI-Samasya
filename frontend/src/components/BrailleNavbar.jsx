"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const BrailleTranslatePage = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    try {
      const response = await fetch(
        `/translate/?url=${encodeURIComponent(inputText)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({ text: inputText }),
        }
      );
      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Translation failed");
      }

      // Get the JSON response
      const data = await response.json();
      setTranslatedText(data.translation); // Update the translated text with the response
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Error translating video");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200 p-6">
      <Card className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Braille Translator</h1>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter text to translate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px]"
          />
          <Button onClick={handleTranslate} className="w-full">
            Translate to Braille
          </Button>
        </div>

        {translatedText && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Translation Result:</h2>
            <p className="text-xl braille-font">{translatedText}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BrailleTranslatePage;
