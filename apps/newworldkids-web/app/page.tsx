export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to New World Kids
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Educational platform for children focused on blockchain technology and conservation
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Golden Boilerplate</h2>
            <p className="text-gray-600">
              Successfully migrated from Vite to Next.js 14 with App Router
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}