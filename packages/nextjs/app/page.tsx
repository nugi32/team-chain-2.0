"use client";

import { type HTMLAttributes, type AnchorHTMLAttributes, forwardRef, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

// ─── Utility ──────────────────────────────────────────────
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── UI Components ─────────────────────────────────────────

// Container
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "default" | "sm" | "lg" | "xl";
}
function Container({ className, maxWidth = "default", children, ...props }: ContainerProps) {
  const maxClasses = {
    default: "max-w-6xl",
    sm: "max-w-3xl",
    lg: "max-w-7xl",
    xl: "max-w-screen-xl",
  };
  return (
    <div className={cn("mx-auto px-6", maxClasses[maxWidth], className)} {...props}>
      {children}
    </div>
  );
}

// SectionHeader
interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  title: string;
  description?: string;
  centered?: boolean;
}
function SectionHeader({
  className,
  label,
  title,
  description,
  centered = false,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-12", centered && "text-center", className)} {...props}>
      <span className="block text-xs font-semibold tracking-[0.1em] uppercase text-primary/80 mb-3">
        {label}
      </span>
      <h2 className="mb-3.5 text-4xl font-extrabold">{title}</h2>
      {description && (
        <p className={cn(centered ? "mx-auto max-w-2xl" : "max-w-2xl")}>{description}</p>
      )}
    </div>
  );
}

// Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient";
}
function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card rounded-2xl p-6 transition-all duration-300",
        variant === "gradient" &&
          "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Badge
const badgeVariants = cva(
  "badge inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border",
  {
    variants: {
      variant: {
        indigo: "badge-ghost border-indigo-400/30 text-indigo-400",
        purple: "badge-ghost border-purple-400/30 text-purple-400",
        cyan: "badge-ghost border-cyan-400/30 text-cyan-400",
        green: "badge-ghost border-green-400/30 text-green-400",
        default: "badge-ghost",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

// Button
const buttonVariants = cva(
  "btn inline-flex items-center gap-2 font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        secondary: "btn-ghost border border-base-300 hover:border-primary/50",
        outline: "btn-outline",
      },
      size: {
        default: "px-7 py-3.5 text-[15px]",
        lg: "px-9 py-4 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);
interface ButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}
const Button = forwardRef<HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    const Comp = href ? "a" : "span";
    return (
      <Comp ref={ref} href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// Divider
function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-base-300 to-transparent" />;
}

// ─── Main Page ─────────────────────────────────────────────

export default function Home() {
  useEffect(() => {
    // Scroll reveal
    const reveals = document.querySelectorAll(".reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 80);
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((r) => revealObs.observe(r));

    // Score bar animation
    const scoreObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".score-bar-fill").forEach((bar, i) => {
              setTimeout(() => {
                bar.style.width = bar.dataset.target || "0%";
              }, i * 150);
            });
            scoreObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    const sb = document.getElementById("score-bars");
    if (sb) {
      const section = sb.closest("section");
      if (section) scoreObs.observe(section);
    }

    // Immediate reveals for elements in view
    setTimeout(() => {
      reveals.forEach((r) => {
        const rect = r.getBoundingClientRect();
        if (rect.top < window.innerHeight) r.classList.add("visible");
      });
    }, 50);

    return () => {
      revealObs.disconnect();
      scoreObs.disconnect();
    };
  }, []);

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden pt-32 pb-20 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="absolute -top-50 -right-50 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-25 -left-25 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="green" className="gap-2">
                  <span className="w-2 h-2 rounded-full bg-success dot-pulse inline-block" />
                  Testnet Live
                </Badge>
                <Badge variant="indigo">✓ GitHub Native</Badge>
                <Badge variant="purple">✓ On-Chain Reputation</Badge>
                <Badge variant="cyan">✓ Stake-Based</Badge>
              </div>
              <h1 className="mb-5 text-5xl font-extrabold leading-tight">
                Build Trusted Teams Through{" "}
                <span className="grad">GitHub Reputation</span>
              </h1>
              <p className="text-lg text-base-content/70 max-w-lg mb-9 leading-relaxed">
                Team Chain combines GitHub activity, on-chain reputation, and stake-backed accountability to help contributors and teams collaborate with confidence.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="#">Get Started →</Button>
                <Button variant="secondary" href="#">Explore Projects</Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block reveal">
              <div className="flex flex-col gap-3">
                <div className="animate-float flex flex-col gap-1">
                  <div className="card bg-base-100/80 border border-base-300 p-4 rounded-2xl">
                    <div className="text-xs text-base-content/50 font-mono mb-1">01 — Source</div>
                    <div className="text-sm font-semibold">⚡ GitHub Activity</div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">+47 commits</span>
                      <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">12 PRs</span>
                      <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">8 reviews</span>
                    </div>
                  </div>
                  <div className="text-center text-base-300 text-xl leading-none">↓</div>
                  <div className="card bg-base-100/80 border border-base-300 p-4 rounded-2xl">
                    <div className="text-xs text-base-content/50 font-mono mb-1">02 — Verify</div>
                    <div className="text-sm font-semibold">🔍 Contribution Verification</div>
                    <div className="mt-2 text-xs text-base-content/50 font-mono">tx: 0x4f3a...9c2e ✓ verified</div>
                  </div>
                  <div className="text-center text-base-300 text-xl leading-none">↓</div>
                  <div className="card bg-base-100/80 border border-base-300 p-4 rounded-2xl">
                    <div className="text-xs text-base-content/50 font-mono mb-1">03 — Build</div>
                    <div className="text-sm font-semibold">📈 Reputation Growth</div>
                    <div className="mt-2 flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-base-300 rounded-full overflow-hidden">
                        <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
                      </div>
                      <span className="text-xs font-mono text-primary">782 REP</span>
                    </div>
                  </div>
                  <div className="text-center text-base-300 text-xl leading-none">↓</div>
                  <div className="card bg-base-100/80 border border-primary/40 p-4 rounded-2xl">
                    <div className="text-xs text-base-content/50 font-mono mb-1">04 — Collaborate</div>
                    <div className="text-sm font-semibold">🤝 Trusted Teams</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-base-100 flex items-center justify-center text-[10px] font-bold">A</div>
                      <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-accent to-cyan-400 border-2 border-base-100 flex items-center justify-center text-[10px] font-bold -ml-1.5">K</div>
                      <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-cyan-400 to-primary border-2 border-base-100 flex items-center justify-center text-[10px] font-bold -ml-1.5">R</div>
                      <span className="text-xs text-base-content/50 ml-2 self-center">3 trusted members</span>
                    </div>
                  </div>
                </div>

                <div className="animate-float-2 card bg-base-100/80 border border-base-300 p-4 flex items-center gap-3.5 mt-1">
                  <div className="w-13 h-13 rounded-full flex-shrink-0 flex items-center justify-center relative" style={{ background: "conic-gradient(#6366f1 240deg, #1a1a2e 0)" }}>
                    <div className="absolute inset-1.5 rounded-full bg-base-100" />
                    <span className="relative z-1 text-sm font-extrabold text-primary font-mono">94</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">alex.eth</div>
                    <div className="text-xs text-base-content/50 font-mono">React · TypeScript · Solidity</div>
                    <div className="mt-1 text-xs text-success">✓ 342 verified contributions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== PROBLEM ===== */}
      <section id="problem" className="py-24 bg-base-200">
        <Container>
          <SectionHeader
            label="The Challenge"
            title="Why Building Teams Online Is Still Hard"
            description="Distributed collaboration has always suffered from the same fundamental trust problem — there's no reliable way to know who you're working with before it's too late."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
            {[
              { icon: "👻", title: "Contributors disappear mid-project", desc: "No stake, no accountability. Developers vanish at critical moments, leaving teams scrambling without recourse or warning." },
              { icon: "🔍", title: "Hard to verify real skills", desc: "Portfolios and CVs are easy to inflate. There's no transparent, trustless way to verify actual contributions and technical depth." },
              { icon: "🔒", title: "Reputation is trapped inside platforms", desc: "Your GitHub stars, Upwork reviews, and Stack Overflow rank are siloed. You rebuild from zero every time you join a new platform." },
              { icon: "⏳", title: "Team trust takes too long to establish", desc: "Without verifiable history, trust is built slowly through trial and error — costly experiments that delay execution." },
              { icon: "🧩", title: "Freelance collaboration is fragmented", desc: "Finding reliable contributors, managing accountability, and ensuring quality across distributed teams remains brutally manual." },
            ].map((p, i) => (
              <div key={i} className={i === 4 ? "md:col-span-1" : ""}>
                <div className="card bg-base-100/80 border border-base-300 rounded-2xl p-6 border-l-4 border-l-primary transition-all duration-300 hover:border-l-accent hover:translate-x-1">
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-base-content/70">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== SOLUTION ===== */}
      <section id="solution" className="py-24 bg-base-100">
        <Container>
          <SectionHeader
            centered
            label="The Solution"
            title='Introducing <span class="grad">Team Chain</span>'
            description="A trust layer built on top of GitHub. No new workflows. No complicated systems. Just the accountability infrastructure that distributed development has always needed."
          />

          <div className="flex items-center justify-center flex-wrap gap-0 mt-12 reveal">
            {[
              { icon: "⚡", title: "GitHub", desc: "Your existing workflow" },
              { icon: "🔗", title: "Verified Contributions", desc: "On-chain proof of work" },
              { icon: "⭐", title: "Reputation", desc: "Portable, transparent score" },
              { icon: "🤝", title: "Trusted Collaboration", desc: "Teams that actually work" },
            ].map((step, i) => (
              <div key={i} className="flex items-center">
                <div className={`card bg-base-200/50 border border-base-300 rounded-2xl px-6 py-5 text-center min-w-[140px] transition-all duration-300 hover:border-primary/50 ${i === 3 ? "border-primary/40" : ""}`}>
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h4 className="text-sm font-semibold">{step.title}</h4>
                  <p className="text-xs text-base-content/60 mt-1.5">{step.desc}</p>
                </div>
                {i < 3 && <span className="text-primary text-xl px-2 flex-shrink-0">→</span>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 reveal">
            {[
              { icon: "🛡️", title: "Eliminate Ghosting", desc: "Stake-backed commitment means contributors have real skin in the game — not just promises." },
              { icon: "🔎", title: "Verify Before You Hire", desc: "On-chain contribution history makes skill verification instant and trustless." },
              { icon: "🌐", title: "Own Your Reputation", desc: "Your rep follows you across projects, platforms, and organizations — forever." },
            ].map((f, i) => (
              <Card key={i} className="text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-sm text-base-content/70">{f.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== GITHUB NATIVE ===== */}
      <section id="github-native" className="py-24 bg-base-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center reveal">
            <div>
              <span className="block text-xs font-semibold tracking-[0.1em] uppercase text-primary/80 mb-3">Developer First</span>
              <h2 className="text-4xl font-extrabold mb-4">No New Workflow <span className="grad-cyan">Required</span></h2>
              <p className="text-base-content/70 mb-8">Developers continue using GitHub exactly as they do today. No custom IDE, no complicated onboarding, no new contribution system to learn. Just connect your GitHub and start building.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "⚡", title: "Zero friction setup", desc: "Connect GitHub in seconds. Team Chain reads your existing history — no migration needed." },
                  { icon: "🔄", title: "Automatic sync", desc: "Every commit, PR, and review is automatically verified and added to your on-chain profile." },
                  { icon: "🛠️", title: "Keep your tools", desc: "VS Code, Neovim, terminal — use whatever you use. Team Chain lives in the background." },
                  { icon: "📊", title: "Instant credibility", desc: "Years of GitHub history becomes on-chain reputation the moment you connect." },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-base">{p.icon}</div>
                    <div>
                      <h4 className="text-sm font-semibold">{p.title}</h4>
                      <p className="text-xs text-base-content/60">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden font-mono text-sm">
                <div className="bg-[#161b22] px-4 py-3 flex items-center gap-2 border-b border-[#30363d]">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                  <span className="text-xs text-[#8b949e] ml-2">teamchain-sync.sh</span>
                </div>
                <div className="p-5 leading-relaxed text-[#e6edf3]">
                  <div><span className="terminal-prompt">$ </span><span className="terminal-cmd">git commit -m "feat: add user auth"</span></div>
                  <div className="terminal-output">[main 4f3a9c2] feat: add user auth</div>
                  <div className="terminal-output"> 3 files changed, 127 insertions(+)</div>
                  <div className="mt-2 text-[#3fb950]">✓ TeamChain detected commit</div>
                  <div className="text-[#58a6ff]">  → Verifying contribution on-chain...</div>
                  <div className="text-[#3fb950]">  → Verified: tx 0x4f3a...9c2e</div>
                  <div className="text-[#e6edf3] opacity-70">  → Reputation updated: +3 REP</div>
                  <div className="mt-2"><span className="terminal-prompt">$ </span><span className="terminal-cmd">git push origin main</span></div>
                  <div className="terminal-output">Counting objects: 5, done.</div>
                  <div className="terminal-output">Everything up-to-date</div>
                  <div className="mt-2 text-[#3fb950]">✓ Profile updated: alex.eth (785 REP)</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-base-content/50">Your normal git workflow. Team Chain does the rest.</div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== REPUTATION ===== */}
      <section id="reputation" className="py-24 bg-base-100">
        <Container>
          <SectionHeader
            centered
            label="Reputation System"
            title='Reputation That <span class="grad">Follows You</span>'
            description="Your on-chain reputation is a portable, transparent record of your contributions — visible to any project, team, or protocol that wants to work with you."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center reveal">
            <div>
              <div className="grid grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-base-300">
                {[
                  { num: 1, title: "Contribution", desc: "Commits, PRs, code reviews — every meaningful GitHub action counts." },
                  { num: 2, title: "Verification", desc: "Contributions are hashed and verified on-chain, creating a permanent proof." },
                  { num: 3, title: "Reputation", desc: "Verified work translates into REP — a portable score any team can evaluate." },
                ].map((step, i) => (
                  <div key={i} className={`p-6 text-center bg-base-200/50 border-r border-base-300 last:border-r-0 ${i === 0 ? "rounded-l-2xl" : ""} ${i === 2 ? "rounded-r-2xl" : ""}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-extrabold text-base-100 mx-auto mb-3">{step.num}</div>
                    <h4 className="text-sm font-semibold">{step.title}</h4>
                    <p className="text-xs text-base-content/60 mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <Card className="p-4">
                  <div className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Transparent</div>
                  <p className="text-sm text-base-content/70">Anyone can verify your contributions. No black box scores.</p>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-base-content/50 uppercase tracking-wider mb-1">Portable</div>
                  <p className="text-sm text-base-content/70">Your REP works across any project using Team Chain — forever.</p>
                </Card>
              </div>
            </div>

            <div>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-base font-bold">alex.eth</div>
                    <div className="text-xs text-base-content/50 font-mono">Full-Stack · Solidity</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold font-mono grad">782</div>
                    <div className="text-xs text-base-content/50">REP SCORE</div>
                  </div>
                </div>
                <div id="score-bars" className="space-y-4">
                  {[
                    { label: "Code Quality", value: 94 },
                    { label: "Consistency", value: 88 },
                    { label: "Collaboration", value: 76 },
                    { label: "Impact", value: 82 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">{item.label}</span>
                        <span className="font-mono font-bold text-primary">{item.value}</span>
                      </div>
                      <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                        <div className="score-bar-fill h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: "0%" }} data-target={`${item.value}%`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-base-300 flex gap-3 flex-wrap">
                  <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">342 commits</span>
                  <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">87 PRs merged</span>
                  <span className="badge badge-ghost border-cyan-400/20 text-cyan-400 text-xs font-mono">213 reviews</span>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== STAKE ===== */}
      <section id="stake" className="py-24 bg-base-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start reveal">
            <div>
              <span className="block text-xs font-semibold tracking-[0.1em] uppercase text-primary/80 mb-3">Accountability Layer</span>
              <h2 className="text-4xl font-extrabold mb-4">Commitment Backed <span className="grad">By Stake</span></h2>
              <p className="text-base-content/70 mb-5">Ghosting is a systemic problem in freelance collaboration. Team Chain solves it by requiring contributors to stake tokens when joining tasks — creating real, verifiable commitment.</p>
              <p className="text-base-content/70">Stake isn't punitive. It's a signal of professionalism. Contributors who complete work earn it back plus reputation. Those who don't explain the cost of unreliability.</p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-success/5 border border-success/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold font-mono text-success">↓ 73%</div>
                  <div className="text-xs text-base-content/50 mt-1">Reduction in ghosting</div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-extrabold font-mono text-primary">↑ 4.2×</div>
                  <div className="text-xs text-base-content/50 mt-1">Completion rate increase</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden border border-base-300">
              {[
                { icon: "📋", title: "Join Task", desc: "Browse open tasks and join projects that match your skills and reputation level." },
                { icon: "💎", title: "Stake Tokens", desc: "Lock a small stake — your commitment signal. The higher the task, the higher the stake threshold." },
                { icon: "⚡", title: "Complete Work", desc: "Deliver the work via GitHub as normal. Your contributions are auto-verified on-chain." },
                { icon: "🏆", title: "Earn Reputation", desc: "Stake returned. Reputation increases. Your on-chain track record grows stronger with every delivery." },
              ].map((step, i) => (
                <div key={i} className={`flex gap-5 items-start p-5 bg-base-100/80 border-b border-base-300 last:border-b-0 transition-all duration-300 hover:bg-base-100 ${i === 0 ? "rounded-t-2xl" : ""} ${i === 3 ? "rounded-b-2xl" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl border ${i === 0 ? "bg-cyan-400/10 border-cyan-400/20" : i === 1 ? "bg-purple-400/10 border-purple-400/20" : i === 2 ? "bg-primary/10 border-primary/20" : "bg-success/10 border-success/20"}`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold">{step.title}</h4>
                    <p className="text-sm text-base-content/60">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== TESTNET ===== */}
      <section id="testnet" className="py-24 bg-base-100">
        <Container>
          <div className="card bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 rounded-3xl p-12 text-center relative overflow-hidden reveal">
            <div className="absolute -top-25 -right-25 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-2 mb-6 text-sm font-semibold text-success">
              <span className="w-2 h-2 rounded-full bg-success dot-pulse inline-block" />
              Testnet Active
            </div>
            <h2 className="text-4xl font-extrabold mb-4">Help Shape <span className="grad">Team Chain</span></h2>
            <p className="max-w-2xl mx-auto text-base-content/70 mb-8">Team Chain is actively being developed and we're running on testnet. Features may evolve, data may reset — but every piece of feedback shapes the protocol's future. You're not just testing software; you're co-designing the future of developer collaboration.</p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <span className="badge badge-ghost border-base-300">🧪 Active development</span>
              <span className="badge badge-ghost border-base-300">🔄 Features may change</span>
              <span className="badge badge-ghost border-base-300">📊 Data may reset</span>
              <span className="badge badge-ghost border-base-300">💬 Feedback drives roadmap</span>
              <span className="badge badge-ghost border-base-300">🎯 Testing & validation phase</span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button href="#" size="lg">Join the Testnet</Button>
              <Button href="#" variant="secondary" size="lg">Share Feedback</Button>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== DEV MESSAGE ===== */}
      <section id="dev-message" className="py-24 bg-base-200">
        <Container>
          <SectionHeader centered label="Founder's Note" title="Message From The Developer" />

          <div className="max-w-3xl mx-auto card bg-base-100/80 border border-base-300 rounded-3xl p-8 relative reveal">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-cyan-400 rounded-t-3xl" />

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-extrabold text-base-100 shadow-lg shadow-primary/20 flex-shrink-0">
                TC
              </div>
              <div>
                <div className="text-lg font-bold">[Developer Name]</div>
                <div className="text-sm text-base-content/60">Founder & Lead Developer, Team Chain</div>
                <div className="flex gap-3 mt-2">
                  <a href="#" className="link link-hover text-xs text-base-content/50">⚡ GitHub</a>
                  <a href="#" className="link link-hover text-xs text-base-content/50">𝕏 Twitter / X</a>
                  <a href="#" className="link link-hover text-xs text-base-content/50">✉ Email</a>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-base-content/70 leading-relaxed">
              <p>I built Team Chain because I've felt this pain firsthand. After years of working on distributed open-source projects and freelance contracts, I watched talented developers lose trust in collaboration — not because people were malicious, but because the systems we used gave them no reason to stay committed.</p>
              <p>GitHub solved version control. Ethereum solved trustless value transfer. But nobody solved the layer in between: <em>trustless developer reputation and accountability</em>. That gap is what Team Chain exists to fill.</p>
              <p>The core insight is simple: developers already leave a rich digital footprint on GitHub. Contributions, reviews, consistency, impact — it's all there. Team Chain reads that signal, verifies it on-chain, and transforms it into portable, composable reputation. No new workflow. No gamification. Just truth.</p>
              <p>The stake mechanism came from a different observation: ghosting isn't a moral failure — it's a structural one. When there's no cost to leaving, leaving becomes rational. A modest stake changes that calculus without creating a punitive system. It's a commitment device, not a trap.</p>
              <p>We're still early. The testnet is live, but there's much more to build — team formation primitives, cross-chain reputation, protocol governance, integration with more platforms. I'm building this in public and I genuinely want your input. What's broken? What's missing? What matters most to you as a developer?</p>
              <p>The long-term vision is a world where any developer can walk into any collaboration with a cryptographically verifiable record of who they are and what they've built — and where teams can form around trust rather than hope.</p>
            </div>

            <div className="mt-8 pt-6 border-t border-base-300">
              <p className="text-base-content/70">With conviction,</p>
              <strong className="text-lg">[Developer Name]</strong>
              <div className="flex flex-wrap gap-3 mt-3">
                <a href="#" className="link link-hover text-xs text-base-content/50">⚡ github.com/[handle]</a>
                <a href="#" className="link link-hover text-xs text-base-content/50">𝕏 @[handle]</a>
                <a href="#" className="link link-hover text-xs text-base-content/50">✉ [email]</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* ===== CTA ===== */}
      <section id="cta" className="py-24 bg-base-200 text-center border-t border-base-300">
        <Container>
          <div className="reveal">
            <span className="block text-xs font-semibold tracking-[0.1em] uppercase text-primary/80 mb-3">Get Involved</span>
            <h2 className="text-4xl font-extrabold mb-4">Ready To Build With <span className="grad">Trusted Contributors?</span></h2>
            <p className="max-w-2xl mx-auto text-base-content/70 mb-10">Join Team Chain's testnet today. Connect your GitHub, build your on-chain reputation, and collaborate with developers who are as committed as you are.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button href="#" size="lg">Get Started →</Button>
              <Button href="#" variant="secondary" size="lg">Explore Projects</Button>
            </div>
            <div className="flex flex-wrap gap-6 justify-center mt-10">
              <span className="text-sm text-base-content/50">✓ Free on testnet</span>
              <span className="text-sm text-base-content/50">✓ No wallet required to explore</span>
              <span className="text-sm text-base-content/50">✓ GitHub connect in 30 seconds</span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}