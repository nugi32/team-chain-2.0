import React from "react";
import FadeInSection from "@/components/global/FadeInSection";

const tokenomics = [
  {
    title: "Contribution Rewards",
    description:
      "Users earn tokens based on verified work and participation.",
  },
  {
    title: "Staking Mechanism",
    description:
      "Stake tokens to gain voting power and reputation weight.",
  },
  {
    title: "Governance Utility",
    description:
      "Token holders can vote on proposals and protocol changes.",
  },
  {
    title: "Incentive Alignment",
    description:
      "Encourages long-term contribution and ecosystem growth.",
  },
];

const TokenModel = () => {
  return (
    <FadeInSection>
      <section className="py-16 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Token & Economic Model
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {tokenomics.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-gray-800 bg-gray-900"
              >
                <h3 className="font-semibold mb-2">
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

export default TokenModel;