"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Upload } from "lucide-react";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function PDFChat() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [ws, setWs] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const backendUrl = BACKEND_BASE_URL.replace(/^http/, protocol);
        const socket = new WebSocket(`${backendUrl}/ws/rag/`);

        socket.onopen = () => {
            console.log("WebSocket Connected");
            setIsConnected(true);
        };

        // Add error handling to capture connection errors
        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socket.onclose = (event) => {
            console.log("WebSocket Disconnected", event);
            setIsConnected(false);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'stream') {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'assistant' && !data.is_complete) {
                        // Append to existing message
                        lastMessage.content += data.message;
                        return newMessages;
                    } else if (data.is_complete) {
                        // Handle completion if necessary
                        return newMessages;
                    } else {
                        // Add new message
                        return [...prev, { type: 'assistant', content: data.message }];
                    }
                });
            }
        };

        setWs(socket);

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            const formData = new FormData();
            formData.append("file", file); // Correct form field name
    
            try {
                const token = JSON.parse(localStorage.getItem("token"))?.access;
                if (!token) {
                    throw new Error("No authentication token found");
                }
    
                const response = await fetch(`${BACKEND_BASE_URL}/api/upload-document/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,  // Pass formData directly here
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setMessages((prev) => [...prev, {
                        type: "system",
                        content: data.message || "PDF uploaded successfully!",
                    }]);
                } else if (response.status === 403) {
                    throw new Error("You do not have permission to upload this PDF.");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Upload failed");
                }
            } catch (error) {
                console.error("Error uploading PDF:", error);
                setMessages((prev) => [...prev, {
                    type: "system",
                    content: error.message || "Error uploading PDF. Please try again.",
                }]);
            }
        }
    };
    

    const handleDeletePDF = () => {
        setPdfFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setMessages((prev) => [...prev, {
            type: "system",
            content: "PDF has been removed.",
        }]);
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) {
            setMessages(prev => [...prev, { type: 'system', content: 'Please enter a message.' }]);
            return;
        }
        if (!pdfFile) {
            setMessages(prev => [...prev, { type: 'system', content: 'Please upload a PDF file before sending a message.' }]);
            return;
        }
        if (!isConnected) {
            setMessages(prev => [...prev, { type: 'system', content: 'Unable to send message: Not connected to server.' }]);
            return;
        }

        setMessages(prev => [...prev, { type: "user", content: inputMessage }]);

        ws.send(JSON.stringify({
            query: inputMessage,
            pdf_path: pdfFile.name
        }));

        setInputMessage("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br  from-purple-200 via-sky-200 to-blue-200">
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
                        {messages.length === 0 && (
                            <div className="text-center text-italic font-semibold text-gray-500">
                                No messages yet
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${
                                    msg.type === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg ${
                                        msg.type === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-green-500 text-gray-800"
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
                        onKeyDown={(e) =>
                            e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-white bg-opacity-70"
                    />
                    <Button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || !pdfFile || !isConnected}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
