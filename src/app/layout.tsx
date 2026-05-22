import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/authContext";
import LegalChatBubble from "@/components/LegalChatBubble"; // <--- Importamos la burbuja
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal-AI Platform",
  description: "Plataforma de Inteligencia Artificial Jurídica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          {/* 
            Insertamos la burbuja al final del body para que flote 
            de forma global sobre todo el contenido de la plataforma.
          */}
          <LegalChatBubble/>
        </AuthProvider>
      </body>
    </html>
  );
}
