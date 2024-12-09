import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Settings, HandMetal, FileText, Youtube, Brain } from "lucide-react";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";
import Link from "next/link";

const HomeComponent = () => {
  const { speak, speaking } = useVoiceAssistance();

  const handleHover = (text) => {
    if (!speaking) {
      speak(text);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("onboardingData");
    window?.location.reload();
  };

  return (
    <Card className="border-none flex flex-col shadow-lg bg-gradient-to-br from-white to-purple-50 p-4 my-10 mx-36">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 px-8 pt-8">
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => handleHover("Welcome to Sahaayi")}
        >
          <Home className="w-6 h-6 text-purple-600" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Sahaayi
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent 
        className="px-8 pb-8"
        onMouseEnter={() => handleHover("Your accessibility assistant is ready to help.")}
      >
        <p className="text-gray-600 text-lg">
          Your accessibility assistant is ready to help.
        </p>
      </CardContent>

      <CardContent className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-2  gap-6">
        <Link href="/learn-signs">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onMouseEnter={() => handleHover("Hand Signs Translation")}>
            <div className="flex flex-col items-center gap-4">
              <HandMetal className="w-12 h-12 text-purple-500" />
              <h2 className="text-xl font-semibold">Learn Hand Signs</h2>
              <p className="text-sm text-center text-gray-600">
                Translate hand gestures into text
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/pdf-chat">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onMouseEnter={() => handleHover("PDF Chat Assistant")}>
            <div className="flex flex-col items-center gap-4">
              <FileText className="w-12 h-12 text-blue-500" />
              <h2 className="text-xl font-semibold">PDF Chat</h2>
              <p className="text-sm text-center text-gray-600">
                Chat with your PDF documents
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/youtube-braille-translator">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onMouseEnter={() => handleHover("YouTube Braille Translator")}>
            <div className="flex flex-col items-center gap-4">
              <Youtube className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold">YouTube Converter</h2>
              <p className="text-sm text-center text-gray-600">
                Convert YouTube videos to Braille
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/mcq">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onMouseEnter={() => handleHover("MCQ Practice")}>
            <div className="flex flex-col items-center gap-4">
              <Brain className="w-12 h-12 text-green-500" />
              <h2 className="text-xl font-semibold">MCQ Practice</h2>
              <p className="text-sm text-center text-gray-600">
                Practice with interactive quizzes
              </p>
            </div>
          </Card>
        </Link>
      </CardContent>

      <Button
        onMouseEnter={() => handleHover("Reset Preferences")}
        onClick={handleReset}
        className="mt-4 border-red-200 text-white bg-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Reset Preferences
      </Button>
    </Card>
  );
};

export default HomeComponent;
