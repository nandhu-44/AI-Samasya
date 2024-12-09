"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Trash2 } from "lucide-react";

export default function PDFChat() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            const formData = new FormData();
            formData.append("pdf", file);

            try {
                const response = await fetch("/api/upload-pdf", {
                    method: "POST",
                    body: formData,
                });
                if (response.ok) {
                    setMessages((prev) => [...prev, {
                        type: "system",
                        content:
                            "PDF uploaded successfully! You can now ask questions about it.",
                    }]);
                }
            } catch (error) {
                console.error("Error uploading PDF:", error);
            }
        }
    };

    const handleDeletePDF = () => {
        setPdfFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setMessages(prev => [...prev, {
            type: "system",
            content: "PDF has been removed."
        }]);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        setMessages(
            (prev) => [...prev, { type: "user", content: inputMessage }]
        );
        setInputMessage("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: inputMessage }),
            });

            const data = await response.json();
            setMessages(
                (prev) => [...prev, { type: "assistant", content: data.reply }]
            );
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto p-4 max-w-4xl pt-8">
                <Card className="p-4 mb-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => fileInputRef.current.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload PDF
                        </Button>
                        {pdfFile && (
                            <Button 
                                variant="destructive" 
                                onClick={handleDeletePDF}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete PDF
                            </Button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf"
                            className="hidden"
                        />
                        {pdfFile && (
                            <span className="text-sm text-gray-500">
                                {pdfFile.name}
                            </span>
                        )}
                    </div>
                </Card>

                <Card className="mb-4 shadow-lg backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
                    <ScrollArea className="h-[500px] p-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${
                                    msg.type === "user" ? "text-right" : "text-left"
                                }`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg ${
                                        msg.type === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </Card>

                <div className="flex gap-2">
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
            </div>
        </div>
    );
}
