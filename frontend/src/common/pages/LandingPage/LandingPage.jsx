"use client";
import HomeComponent from "@/common/components/HomeComponent";
import Onboarding from "@/common/components/Onboarding";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";

const LandingPage = () => {
    const [isOnboarded, setIsOnboarded] = useState(null);

    useEffect(() => {
        try {
            const onboardingData = localStorage.getItem("onboardingData");
            setIsOnboarded(onboardingData);
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            setIsOnboarded(null);
        }
    }, []);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200 flex ">
            {isOnboarded
                ? (
                    <div className="w-full h-full">
                        <HomeComponent />
                    </div>
                )
                : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Onboarding />
                    </div>
                )}
            <Toaster />
        </div>
    );
};

export default LandingPage;
