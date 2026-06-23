"use client";

import React from "react";
import { Button } from "@/components/globalComponents/button";
import { Card, CardContent } from "@/components/globalComponents/card";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Coins, FileText, GitBranch, Layers, Scale, ShieldCheck, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const activityData = [
  { month: "Jan", tx: 120, contributors: 18 },
  { month: "Feb", tx: 240, contributors: 29 },
  { month: "Mar", tx: 380, contributors: 43 },
  { month: "Apr", tx: 520, contributors: 61 },
  { month: "May", tx: 690, contributors: 82 },
  { month: "Jun", tx: 860, contributors: 104 },
];

const sidebarItems = [
  "Overview",
  "Architecture",
  "Roles",
  "Task Lifecycle",
  "Staking Rules",
  "Fees",
  "Rewards",
  "Governance",
  "Security Model",
];

export default function TeamChainDocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r border-gray-800 bg-gray-950 px-6 py-8 overflow-y-auto">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-5">Team Chain Docs</div>
        <div className="space-y-2">
          {sidebarItems.map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="block text-sm text-gray-400 hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </aside>

      <main className="lg:ml-64 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-8 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <section id="overview" className="mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Team Chain Protocol Documentation</h1>
              <p className="text-gray-400 text-lg max-w-4xl leading-relaxed">
                Team Chain is a protocol for structured on-chain collaboration. It formalizes how teams create work,
                assign ownership, validate outcomes, distribute rewards, and enforce accountability through staking and
                programmable execution rules.
              </p>
            </motion.div>
          </section>

          <div className="grid xl:grid-cols-2 gap-6 mb-14">
            <Card className="bg-gray-900 border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Transaction Throughput</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="tx" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contributor Growth</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="contributors" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <section id="architecture" className="mb-14">
            <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
            <p className="text-gray-400 leading-7 text-sm">
              The protocol consists of four layers: identity, execution, economic coordination, and governance. Wallet
              identity anchors participation. Execution records task state transitions. The economic layer handles
              staking, fees, and reward settlement. Governance modifies protocol parameters over time.
            </p>
          </section>

          <section id="roles" className="mb-14">
            <h2 className="text-2xl font-semibold mb-5">Protocol Roles</h2>
            <div className="grid md:grid-cols-3 gap-5 text-sm">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-5">
                  <strong className="block mb-2">Contributor</strong>
                  <p className="text-gray-400">
                    Executes tasks, submits deliverables, earns rewards, and may stake to access higher trust
                    workstreams.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-5">
                  <strong className="block mb-2">Validator</strong>
                  <p className="text-gray-400">
                    Confirms whether deliverables satisfy execution requirements and can trigger settlement or
                    rejection.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-5">
                  <strong className="block mb-2">Coordinator / DAO</strong>
                  <p className="text-gray-400">
                    Defines task rules, stake requirements, fee parameters, and governance policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="task-lifecycle" className="mb-14">
            <h2 className="text-2xl font-semibold mb-4">Task Lifecycle</h2>
            <div className="space-y-3 text-sm text-gray-400 leading-7">
              <p>
                <strong className="text-white">Created:</strong> task metadata, deadline, stake requirement, and reward
                allocation are registered.
              </p>
              <p>
                <strong className="text-white">Accepted:</strong> contributor locks required stake and claims execution
                responsibility.
              </p>
              <p>
                <strong className="text-white">Submitted:</strong> deliverable and proof-of-work are attached to the
                task state.
              </p>
              <p>
                <strong className="text-white">Validated:</strong> validator accepts or rejects submission based on
                predefined criteria.
              </p>
              <p>
                <strong className="text-white">Settled:</strong> rewards, fees, reputation changes, and stake release or
                slashing are executed.
              </p>
            </div>
          </section>

          <section id="staking-rules" className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Staking Rules</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-400 leading-7">
              <p>
                <strong className="text-white">Minimum Stake:</strong> every task or team can define a minimum stake
                threshold required before execution rights are granted.
              </p>
              <p>
                <strong className="text-white">Stake Lock Period:</strong> stake remains locked until task settlement or
                dispute resolution finishes.
              </p>
              <p>
                <strong className="text-white">Slashing Conditions:</strong> slashable events include malicious
                behavior, repeated non-delivery, fraudulent submission, or governance-defined violations.
              </p>
              <p>
                <strong className="text-white">Reputation Multiplier:</strong> higher historical trust can reduce stake
                requirements or unlock privileged task access.
              </p>
            </div>
          </section>

          <section id="fees" className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Fee Model</h2>
            </div>
            <div className="space-y-4 text-sm text-gray-400 leading-7">
              <p>
                <strong className="text-white">Protocol Fee:</strong> a percentage deducted from successful settlement.
                Used for treasury, maintenance, and protocol development.
              </p>
              <p>
                <strong className="text-white">Validation Fee:</strong> optional validator compensation allocated when
                validation is externalized.
              </p>
              <p>
                <strong className="text-white">Dispute Fee:</strong> optional anti-spam fee required to open a challenge
                against a finalized validation result.
              </p>
            </div>
          </section>

          <section id="rewards" className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Reward Distribution</h2>
            </div>
            <p className="text-sm text-gray-400 leading-7">
              Reward settlement follows execution success. Gross task reward is first reduced by protocol and validation
              fees. Remaining value is distributed to contributors according to task ownership, weighted contribution
              metrics, or governance-defined payout logic.
            </p>
          </section>

          <section id="governance" className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Governance Parameters</h2>
            </div>
            <p className="text-sm text-gray-400 leading-7">
              Governance can modify stake thresholds, fee percentages, validator permissions, quorum requirements,
              dispute windows, treasury allocation, and reward formulas. This allows progressive decentralization
              without changing the collaboration primitives.
            </p>
          </section>

          <section id="security-model" className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-semibold">Security Model</h2>
            </div>
            <p className="text-sm text-gray-400 leading-7">
              Team Chain assumes rational economic actors. Security is derived from stake-backed accountability,
              transparent execution history, validator verification, and governance-controlled dispute escalation. The
              protocol minimizes trust assumptions by converting social coordination into explicit state transitions.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
