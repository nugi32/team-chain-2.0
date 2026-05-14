'use client';

import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit';
export default function YourApp() {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  return (
    <>
      {openConnectModal && (
        <button onClick={openConnectModal} type="button" className="btn btn-primary w-full rounded-2xl h-12">
          Open Connect Modal
        </button>
      )}
      {openAccountModal && (
        <button onClick={openAccountModal} type="button">
          Open Account Modal
        </button>
      )}
      {openChainModal && (
        <button onClick={openChainModal} type="button">
          Open Chain Modal
        </button>
      )}
    </>
  );
};
