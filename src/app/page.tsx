export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          aachaaryAI
        </h1>
        <p className="text-xl text-neutral mb-8">
          Your AI Teaching Assistant for Test Paper Generation
        </p>
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Replace ₹60k/month typist costs with AI</h2>
          <p className="text-neutral mb-4">
            Generate test papers in &lt;30 minutes instead of 2-4 hours
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-primary/10 p-4 rounded">
              <p className="text-sm text-neutral">Current Process</p>
              <p className="text-2xl font-bold text-primary">2-4 hours</p>
            </div>
            <div className="bg-success/10 p-4 rounded">
              <p className="text-sm text-neutral">With aachaaryAI</p>
              <p className="text-2xl font-bold text-success">&lt;30 min</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
