import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";

const HomeComponent = () => {
  const { speak, speaking } = useVoiceAssistance();

  const handleHover = (text) => {
    if (!speaking) {
      speak(text);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("onboardigData");
    window?.location.reload();
  };

  return (
    <Card className="border-none flex flex-col shadow-lg bg-gradient-to-br from-white to-purple-50 p-4 m-8">
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

      <Button
        onMouseEnter={() => handleHover("Reset Preferences")}
        onClick={handleReset}
        className="border-red-200 text-white bg-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Reset Preferences
      </Button>
    </Card>
  );
};

export default HomeComponent;
