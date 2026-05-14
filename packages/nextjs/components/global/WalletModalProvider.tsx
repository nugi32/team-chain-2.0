"use client";

import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

let connectWalletFn: (() => void) | null = null;
const modalListeners: Set<(fn: () => void) => void> = new Set();

/**
 * Register modal dari RainbowKit
 * Pasang SEKALI di root/layout
 */
export function WalletModalProvider() {
  useEffect(() => {
    // Ensure listeners are called when component mounts
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => {
        // Update global function
        if (!connectWalletFn) {
          connectWalletFn = openConnectModal;
          // Notify any listeners that were waiting
          modalListeners.forEach(listener => listener(openConnectModal));
          modalListeners.clear();
        }
        return null;
      }}
    </ConnectButton.Custom>
  );
}

/**
 * Function global - buka wallet modal
 */
export function openWalletModal() {
  if (connectWalletFn) {
    connectWalletFn();
  } else {
    // If provider hasn't mounted yet, wait and retry
    console.warn("Wallet modal not ready yet, retrying...");
    setTimeout(openWalletModal, 100);
  }
}

/**
 * Register callback untuk menunggu modal siap
 */
export function onWalletModalReady(callback: (fn: () => void) => void) {
  if (connectWalletFn) {
    callback(connectWalletFn);
  } else {
    modalListeners.add(callback);
  }
}