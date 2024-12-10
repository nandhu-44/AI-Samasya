import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sahaayi",
  description: "AI assisted learning for the specially abled",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + "bg-gradient-to-br from-purple-200 via-sky-200 to-blue-200"}>
        <Navbar />
        <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          {children}
        </main>
      </body>
    </html>
  );
}
