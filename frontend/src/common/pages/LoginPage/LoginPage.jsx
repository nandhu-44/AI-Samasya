"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { speak, speaking } = useVoiceAssistance();

  const handleHover = (text) => {
    if (!speaking) {
      speak(text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        // Validate token structure
        if (!data.access || !data.refresh) {
          throw new Error("Invalid token structure");
        }
  
        // Save token with additional metadata
        const tokenData = {
          access: data.access,
          refresh: data.refresh,
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
          user: data.user || {}
        };
  
        localStorage.setItem("token", JSON.stringify(tokenData));
        localStorage.setItem("userInfo", JSON.stringify(data.user || {}));
  
        toast({
          title: "Success",
          description: "Login successful!",
        });
  
        window.location.href = "/";
      } else {
        // More specific error handling
        const errorMessage = data.detail || data.message || "Login failed";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle
            className="text-2xl text-center"
            onMouseEnter={() => handleHover("Login to your account")}
          >
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })}
                onMouseEnter={() => handleHover("Enter your username")}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })}
                onMouseEnter={() => handleHover("Enter your password")}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              onMouseEnter={() => handleHover("Click to login")}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
