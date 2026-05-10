import React from "react";

const stats = [
  { value: "10K+", label: "Transactions Logged" },
  { value: "500+", label: "Active Contributors" },
  { value: "50+", label: "Teams Onboarded" },
  { value: "99%", label: "Transparency Score" },
];

const SocialProof = () => {
  return (
    <section className="py-16 px-6 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">
          Trusted by Builders
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((item, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-indigo-400">
                {item.value}
              </div>
              <div className="text-gray-400 text-sm">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;