import React from "react";
import FadeInSection from "@/components/global/FadeInSection";
import Link from "next/link";

const CTA = () => {
  return (
    <FadeInSection>
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Build Transparent Teams On-Chain
          </h2>
          <p className="text-white/80 mb-8">
            Start collaborating with full transparency, trust, and decentralized ownership today.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/getStarted" className="text-sm/6 font-semibold text-black bg-white px-4 py-2 rounded-lg">
              Get Started <span aria-hidden="true">→</span>
            </Link>
            <Link href="/howItWorks" className="text-sm/6 font-semibold text-white px-4 py-2 rounded-lg border border-white/50">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default CTA;