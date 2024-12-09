"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVoiceAssistance } from "@/hooks/useVoiceAssistance";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    ChevronRight,
    Ear,
    Eye,
    FileText,
    Hand,
    HeadphonesIcon,
    MessageSquare,
    Printer,
    Volume2,
    VolumeX,
    Youtube,
} from "lucide-react";

const Onboarding = () => {
    const router = useRouter();
    const { speak, speaking } = useVoiceAssistance();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        specialNeed: "",
        services: [],
        voiceAssistance: false,
    });

    const specialNeeds = [
        "Visually Impaired",
        "Hearing impairity",
        "Speech impairity",
        "Both hearing and speech",
    ];

    const services = [
        "Youtube Summarizer",
        "PDF Chat (RAG)",
        "Braille printer",
        "Hand sign translation",
    ];

    const specialNeedsIcons = {
        "Visually Impaired": Eye,
        "Hearing impairity": Ear,
        "Speech impairity": MessageSquare,
        "Both hearing and speech": HeadphonesIcon,
    };

    const servicesIcons = {
        "Youtube Summarizer": Youtube,
        "PDF Chat (RAG)": FileText,
        "Braille printer": Printer,
        "Hand sign translation": Hand,
    };

    const handleSpecialNeedSelect = (need) => {
        setFormData((prev) => ({
            ...prev,
            specialNeed: need,
            voiceAssistance: need === "Visually Impaired"
                ? true
                : prev.voiceAssistance,
        }));
        setStep(2);
    };

    const handleServiceToggle = (service) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter((s) => s !== service)
                : [...prev.services, service],
        }));
    };

    const handleComplete = () => {
        localStorage.setItem("onboardingData", JSON.stringify(formData));
        window?.location.reload();
    };

    const handleHover = (text) => {
        if (!speaking) {
            speak(text);
        }
    };

    return (
        <Card className="w-full max-w-2xl border-none shadow-xl bg-white/70 backdrop-blur-sm mx-auto my-8">
            <CardHeader 
                className="pb-8 px-8 pt-8"
                onMouseEnter={() => handleHover(step === 1 ? "Special Needs Section" : step === 2 ? "Available Services Section" : "Voice Assistance Section")}
            >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {step === 1 && "Special Needs"}
                    {step === 2 && "Available Services"}
                    {step === 3 && "Voice Assistance"}
                </CardTitle>
                <CardDescription>
                    {step === 1 && "Please select your special need"}
                    {step === 2 && "Choose the services you'd like to use"}
                    {step === 3 && "Would you like to enable voice assistance?"}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                {step === 1 && (
                    <div className="flex flex-col space-y-4">
                        {specialNeeds.map((need) => {
                            const Icon = specialNeedsIcons[need];
                            return (
                                <Button
                                    key={need}
                                    variant={formData.specialNeed === need
                                        ? "default"
                                        : "outline"}
                                    className={`w-full justify-between h-auto py-6 px-6 text-lg transition-all duration-300 ${
                                        formData.specialNeed === need
                                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white ring-2 ring-purple-600 ring-offset-2 hover:ring-offset-2"
                                            : "hover:border-purple-400 hover:ring-2 hover:ring-purple-200 hover:ring-offset-1"
                                    }`}
                                    onClick={() =>
                                        handleSpecialNeedSelect(need)}
                                    onMouseEnter={() => handleHover(need)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5" />
                                        {need}
                                    </div>
                                    <ChevronRight
                                        className={`w-5 h-5 transition-transform ${
                                            formData.specialNeed === need
                                                ? "translate-x-1"
                                                : ""
                                        }`}
                                    />
                                </Button>
                            );
                        })}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex flex-col space-y-4">
                            {services.map((service) => {
                                const Icon = servicesIcons[service];
                                const isSelected = formData.services.includes(
                                    service,
                                );
                                return (
                                    <div
                                        key={service}
                                        onClick={() =>
                                            handleServiceToggle(service)}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                                            isSelected
                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-102"
                                                : "border border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                                        }`}
                                        onMouseEnter={() => handleHover(service)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                className={`w-6 h-6 ${
                                                    isSelected
                                                        ? "text-white"
                                                        : "text-purple-600"
                                                }`}
                                            />
                                            <span className="text-lg font-medium">
                                                {service}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button
                            className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all"
                            onClick={() => setStep(3)}
                            disabled={formData.services.length === 0}
                            onMouseEnter={() => handleHover("Continue to voice assistance settings")}
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col space-y-4">
                        <Button
                            variant="outline"
                            className="w-full py-6 text-lg hover:border-purple-400 transition-all flex items-center justify-center gap-3"
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    voiceAssistance: true,
                                }));
                                handleComplete();
                            }}
                            onMouseEnter={() => handleHover("Enable voice assistance")}
                        >
                            <Volume2 className="w-5 h-5" />
                            Yes, enable voice assistance
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full py-6 text-lg hover:border-purple-400 transition-all flex items-center justify-center gap-3"
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    voiceAssistance: false,
                                }));
                                handleComplete();
                            }}
                            disabled={formData.specialNeed ===
                                "Visually Impaired"}
                            onMouseEnter={() => handleHover("Disable voice assistance")}
                        >
                            <VolumeX className="w-5 h-5" />
                            No, I'll use without voice assistance
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Onboarding;
