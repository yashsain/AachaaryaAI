import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-neutral-50 via-white to-blue-50">
      <div className="text-center max-w-4xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="aachaaryAI Logo"
            width={200}
            height={133}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* Brand Name with Gradient */}
        <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
          aachaaryAI
        </h1>

        <p className="text-xl md:text-2xl text-neutral-600 mb-12 font-medium">
          Your AI Teaching Assistant for Test Paper Generation
        </p>

        {/* Main Value Proposition Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 mb-8 border border-neutral-100">
          <h2 className="text-3xl font-bold mb-6 text-neutral-800">
            Replace <span className="text-primary-600">₹60k/month</span> typist costs with AI
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Generate professional test papers in &lt;30 minutes instead of 2-4 hours
          </p>

          {/* Time Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 p-6 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wide mb-2">
                Current Process
              </p>
              <p className="text-4xl font-bold text-neutral-700">2-4 hours</p>
              <p className="text-sm text-neutral-500 mt-2">Manual typing & formatting</p>
            </div>
            <div className="bg-gradient-to-br from-primary-100/50 to-primary-200/50 p-6 rounded-xl border-2 border-primary-300">
              <p className="text-sm text-primary-700 font-semibold uppercase tracking-wide mb-2">
                With aachaaryAI
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                &lt;30 min
              </p>
              <p className="text-sm text-primary-700 mt-2">AI-powered generation</p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <span className="text-success text-lg">✓</span>
              <span>Multi-format questions</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <span className="text-success text-lg">✓</span>
              <span>Instant solutions</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <span className="text-success text-lg">✓</span>
              <span>Chapter-wise control</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="mt-10 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            Get Started
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-neutral-400 mt-6">
          Trusted by coaching institutes for NEET, JEE, Banking & more
        </p>
      </div>
    </main>
  )
}
