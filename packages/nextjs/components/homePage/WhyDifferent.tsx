import React from "react";
import FadeInSection from "@/components/global/FadeInSection";

const points = [
  "Fully on-chain contribution tracking",
  "Transparent and verifiable team history",
  "No centralized control or manipulation",
  "Built specifically for collaborative teams, not just finance",
];

const WhyDifferent = () => {
  return (
    <FadeInSection>
      <section className="py-16 px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Why It’s Different
          </h2>

          <div className="space-y-4">
            {points.map((point, i) => (
              <div
                key={i}
                className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-500/5"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default WhyDifferent;