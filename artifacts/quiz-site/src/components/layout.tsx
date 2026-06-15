import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex flex-col">
      <div
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
      />
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-4xl mx-auto p-4 sm:p-8">
        <header className="py-8 flex justify-center items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              IG
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-white">
              Club Innogeeks
            </h1>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
