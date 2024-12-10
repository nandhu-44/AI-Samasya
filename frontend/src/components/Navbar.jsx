"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem("token");
        const storedUserInfo = localStorage.getItem("userInfo");
        
        if (token && storedUserInfo) {
            const parsedToken = JSON.parse(token);
            const parsedUserInfo = JSON.parse(storedUserInfo);
            
            if (parsedToken.access) {
                setIsLoggedIn(true);
                setUserInfo(parsedUserInfo);
            } else {
                handleLogout();
            }
        }
    };

    const handleLogout = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("token"))?.access;
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setUserInfo(null);
            router.push("/login");
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm shadow-md py-4 fixed w-full top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/">
                    <span className="text-xl font-bold text-purple-600">Sahaayi</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    {isLoggedIn && userInfo ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 border border-purple-200">
                                    <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                                        {userInfo.username?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-700">
                                    {userInfo.username}
                                </span>
                            </div>
                            <Button 
                                variant="outline"
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}