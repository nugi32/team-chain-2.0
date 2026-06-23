import React from "react";
import FadeInSection from "@/components/global/FadeInSection";

const features = [
  {
    title: "On-Chain Activity Logs",
    description: "Every action is recorded on-chain, ensuring full transparency and auditability.",
  },
  {
    title: "Contribution Scoring",
    description: "Measure individual impact with verifiable contribution metrics.",
  },
  {
    title: "Smart Contract Automation",
    description: "Automate workflows like approvals, rewards, and governance decisions.",
  },
  {
    title: "Decentralized Identity",
    description: "Users build a reputation tied to their wallet across teams.",
  },
  {
    title: "DAO Governance Ready",
    description: "Enable voting, proposals, and decentralized decision-making.",
  },
  {
    title: "Real-Time Collaboration",
    description: "Work with your team while syncing all actions to the blockchain.",
  },
];

const CoreFeatures = () => {
  return (
    <FadeInSection>
      <section className="py-16 px-6 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((item, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-800 bg-gray-900">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
};

export default CoreFeatures;
