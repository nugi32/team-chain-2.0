import React from "react";

const CTA = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Build Transparent Teams On-Chain
        </h2>
        <p className="text-white/80 mb-8">
          Start collaborating with full transparency, trust, and decentralized ownership today.
        </p>

        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold">
            Get Started
          </button>
          <button className="px-6 py-3 border border-white rounded-lg">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;