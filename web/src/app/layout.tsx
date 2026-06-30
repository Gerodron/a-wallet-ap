import React from 'react';
import type { Metadata } from 'next';
import { CoreLayout } from '@/components/layout/CoreLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'A-Wallet | Wallet Descentralizada Multired',
  description: 'Gestiona tus activos de Solana, Bitcoin y BNB Smart Chain con seguridad no custodial.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CoreLayout>{children}</CoreLayout>
      </body>
    </html>
  );
}
