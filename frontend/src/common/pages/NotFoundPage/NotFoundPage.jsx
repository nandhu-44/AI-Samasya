"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";

const NotFoundPage = () => {
  const { speak, speaking } = useVoiceAssistance();

  const handleHover = (text) => {
    if (!speaking) {
      speak(text);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200">
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50 p-4 max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-20 h-20 text-purple-600 animate-pulse" />
          </div>
          <CardTitle
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            onMouseEnter={() => handleHover("404 - Page Not Found")}
          >
            404
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p
            className="text-gray-600 text-lg mb-8"
            onMouseEnter={() =>
              handleHover("Oops! The page you're looking for doesn't exist.")}
          >
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 flex items-center gap-2 w-full p-2"
              onMouseEnter={() => handleHover("Go Back Home")}
            >
              <Home className="w-4 h-4" />
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
