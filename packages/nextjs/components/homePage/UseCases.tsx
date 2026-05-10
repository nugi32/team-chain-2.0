import React from "react";
import FadeInSection from "@/components/global/FadeInSection";

const useCases = [
  {
    title: "Web3 Startup Teams",
    description:
      "Track contributions and distribute tokens fairly among early contributors.",
  },
  {
    title: "DAOs",
    description:
      "Ensure transparent governance and reward active members.",
  },
  {
    title: "Freelance Collaboration",
    description:
      "Provide proof-of-work and automate payments without intermediaries.",
  },
  {
    title: "Open Source Projects",
    description:
      "Reward developers based on verified contributions.",
  },
];

const UseCases = () => {
  return (
    <FadeInSection>
      <section className="py-16 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Use Cases
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-gray-800 bg-gray-900"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default UseCases;