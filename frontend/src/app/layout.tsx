import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'ThreatLens AI - Enterprise Malware Classification & Threat Detection Platform',
  description: 'AI-driven defensive static analysis, YARA matching, scikit-learn malware classification, and SOC incident triage dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="azure">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('threatlens_theme') || 'azure';
                document.documentElement.setAttribute('data-theme', savedTheme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-cyber-dark text-slate-800 min-h-screen font-sans antialiased selection:bg-cyber-accent/20 selection:text-cyber-accent">
        {children}
      </body>
    </html>
  );
}
