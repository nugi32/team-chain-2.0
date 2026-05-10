import ClosingCTA from "~~/components/homePage/ClosingCTA";
import CoreFeatures from "~~/components/homePage/CoreFeatures";
import Hero from "~~/components/homePage/Hero";
import ProblemSolution from "~~/components/homePage/ProblemSolution";
import HowItWorks from "~~/components/homePage/HowItWorks";
import SocialProof from "~~/components/homePage/SocialProof";
import TokenModel from "~~/components/homePage/TokenModel";
import UseCases from "~~/components/homePage/UseCases";
import WhyDifferent from "~~/components/homePage/WhyDifferent";


export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <CoreFeatures />
      <UseCases />
      <WhyDifferent />
      <TokenModel />
      <SocialProof />
      <ClosingCTA />
    </>
  );
}