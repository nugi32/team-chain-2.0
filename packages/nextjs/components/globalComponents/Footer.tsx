import React from "react";
import Link from "next/link";
import FadeInSection from "@/components/global/FadeInSection";

const Footer = () => {
  return (
    <FadeInSection>
      <footer className="bg-black text-gray-400 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-white text-xl font-bold mb-4">
              TeamChain
            </h2>
            <p className="text-sm">
              Transparent on-chain collaboration for modern teams.
              Track contributions, verify work, and build trust—decentralized.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Twitter / X
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Telegram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 text-center py-6 text-sm">
          <p>
            © {new Date().getFullYear()} TeamChain. All rights reserved.
          </p>
        </div>
      </footer>
    </FadeInSection>
  );
};

export default Footer;