"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

const BrailleTranslatePage = () => {
  const [videoURL, setVideoURL] = useState("");
  const [error, setError] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const downloadBrailleFile = () => {
    if (fileURL) {
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "translation.brf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleTranslate = async () => {
    setError("");
    setFileURL("");
    setIsLoading(true);

    if (!videoURL) {
      setError("Please provide a valid YouTube URL.");
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const ur = `http://localhost:8000/brl/translate/?url=${encodeURIComponent(videoURL)}`;
      const response = await fetch(ur, {
        method: "GET",
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.translation) {
        throw new Error('Invalid response format');
      }

      // Convert translation to string and handle potential JSON object
      let translationText;
      if (typeof data.translation === 'object') {
        translationText = JSON.stringify(data.translation, null, 2);
      } else {
        translationText = String(data.translation);
      }
      
      // Remove any "[object Object]" strings that might appear
      translationText = translationText.replace(/\[object Object\]/g, '');
      
      // Create the .brf file
      const blobContent = translationText.replace(/\n/g, "\r\n");
      const blob = new Blob([blobContent], {
        type: "text/plain",
        endings: "native",
      });

      const url = URL.createObjectURL(blob);
      setFileURL(url);
    } catch (err) {
      console.error("Full error details:", err);
      setError(err.message || "Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200 p-6">
      <Card className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          YouTube Braille Translator
        </h1>

        <div className="space-y-4">
          <Input
            placeholder="Enter YouTube video URL..."
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={handleTranslate}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Translating..." : "Translate to Braille"}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        {fileURL && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">Translation Result:</h2>
            <Button onClick={downloadBrailleFile} className="mt-2">
              Download .brf file
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BrailleTranslatePage;
