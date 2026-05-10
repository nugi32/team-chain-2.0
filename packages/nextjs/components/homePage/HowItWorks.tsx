import React from "react";

const steps = [
  {
    step: "01",
    title: "Connect Wallet",
    description:
      "Users connect their Web3 wallet to access the platform and establish their on-chain identity.",
  },
  {
    step: "02",
    title: "Create or Join a Team",
    description:
      "Start a new team or join an existing one. All memberships are recorded on-chain for transparency.",
  },
  {
    step: "03",
    title: "Collaborate & Contribute",
    description:
      "Team members submit tasks, updates, and contributions that are logged immutably on the blockchain.",
  },
  {
    step: "04",
    title: "Track Contributions",
    description:
      "Every action is tracked and attributed, enabling clear visibility into individual performance.",
  },
  {
    step: "05",
    title: "Verify & Reward",
    description:
      "Contributions can be verified by the team or DAO, and rewards are distributed fairly via smart contracts.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-6 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-800 bg-gray-900 hover:border-indigo-500 transition"
            >
              <div className="text-indigo-400 font-bold text-lg mb-2">
                {item.step}
              </div>
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
  );
};

export default HowItWorks;