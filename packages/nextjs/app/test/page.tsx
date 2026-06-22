"use client";

import { useState, useEffect } from "react";
import { useDashboardUserData } from "@/utils/lib/dashboard/useDashboardUserData";

export default function DashboardUserDebugPage() {
  const [addressInput, setAddressInput] = useState("");
  const [idInput, setIdInput] = useState("");

  const [address, setAddress] = useState<string | undefined>();
  const [id, setId] = useState<string | undefined>();

  const {
    user,
    loadingUser,
    error,
  } = useDashboardUserData(address, id);

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  useEffect(() => {
    console.log("Loading:", loadingUser);
  }, [loadingUser]);

  useEffect(() => {
    if (error) {
      console.error("Error:", error);
    }
  }, [error]);

  const handleLoadByAddress = () => {
    setId(undefined);
    setAddress(addressInput.trim() || undefined);
  };

  const handleLoadById = () => {
    setAddress(undefined);
    setId(idInput.trim() || undefined);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Dashboard User Debug
      </h1>

      <div className="border rounded p-4 space-y-4">
        <h2 className="font-semibold">
          Load By Wallet Address
        </h2>

        <input
          type="text"
          value={addressInput}
          onChange={e => setAddressInput(e.target.value)}
          placeholder="0x..."
          className="input input-bordered w-full"
        />

        <button
          onClick={handleLoadByAddress}
          className="btn btn-primary"
        >
          Load User
        </button>
      </div>

      <div className="border rounded p-4 space-y-4">
        <h2 className="font-semibold">
          Load By User ID
        </h2>

        <input
          type="text"
          value={idInput}
          onChange={e => setIdInput(e.target.value)}
          placeholder="User ID"
          className="input input-bordered w-full"
        />

        <button
          onClick={handleLoadById}
          className="btn btn-secondary"
        >
          Load User
        </button>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-4">
          Status
        </h2>

        <p>
          Loading: {loadingUser ? "Yes" : "No"}
        </p>

        {error && (
          <div className="text-red-500 mt-2">
            {error.message}
          </div>
        )}
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-4">
          User Data
        </h2>

        <pre className="text-xs overflow-auto">
          {JSON.stringify(
            user,
            (_, value) =>
              typeof value === "bigint"
                ? value.toString()
                : value,
            2
          )}
        </pre>
      </div>
    </div>
  );
}