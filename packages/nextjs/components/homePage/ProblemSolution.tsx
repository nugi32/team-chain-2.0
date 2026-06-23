import React from "react";
import FadeInSection from "@/components/global/FadeInSection";

const problems = [
  {
    title: "Lack of Transparency",
    description:
      "Team activities, decisions, and contributions are often hidden or difficult to verify, leading to trust issues.",
  },
  {
    title: "Poor Collaboration Tracking",
    description: "There is no reliable way to track who did what, when, and how much they contributed in a team.",
  },
  {
    title: "Centralized Control",
    description:
      "Most collaboration tools rely on centralized systems, making them vulnerable to manipulation or data loss.",
  },
];

const solutions = [
  {
    title: "On-Chain Transparency",
    description:
      "All team activities are recorded on-chain, ensuring data is immutable, verifiable, and publicly accessible.",
  },
  {
    title: "Contribution Tracking System",
    description: "Every action is logged and attributed to team members, enabling fair evaluation and accountability.",
  },
  {
    title: "Decentralized Collaboration",
    description: "Built on blockchain, removing reliance on central authorities and increasing trust across the team.",
  },
];

const ProblemSolution = () => {
  return (
    <FadeInSection>
      <section className="py-16 px-6 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Problem & Solution</h2>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Problems */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-red-400">Problems</h3>
              <div className="space-y-6">
                {problems.map((item, index) => (
                  <div key={index} className="p-5 border border-red-500/30 rounded-xl bg-red-500/5">
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-green-400">Solutions</h3>
              <div className="space-y-6">
                {solutions.map((item, index) => (
                  <div key={index} className="p-5 border border-green-500/30 rounded-xl bg-green-500/5">
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default ProblemSolution;
