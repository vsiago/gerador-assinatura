import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="description"
          content="Crie e personalize sua assinatura de e-mail de forma simples e eficiente com a ferramenta da Prefeitura Municipal de Itaguaí."
        />
        <meta name="author" content="Prefeitura Municipal de Itaguaí" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Gerador de Assinaturas de E-mail - Prefeitura Municipal de Itaguaí</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-sky-100 to-sky-50`}
      >
        {children}
      </body>
    </html>
  );
}
