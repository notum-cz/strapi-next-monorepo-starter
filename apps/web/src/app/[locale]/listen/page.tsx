"use client"

import AppLink from "@/components/elementary/AppLink";

export default function ListenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-gray-800">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Coming Soon!
          </h1>
          <p className="text-xl text-gray-300">
            Our new radio station is under construction.
          </p>
        </div>
      </div>
      <div className="absolute bottom-8 text-sm text-gray-400">
        <AppLink href="/player">Player Preview</AppLink>
      </div>
    </div>
  )
}
