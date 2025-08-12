"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3-client";
import Web3Status from "@/components/web3-status";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WalletStatus() {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useWeb3();
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isConnected && address && !isPreparing) {
        setIsPreparing(true);
        const toastId = toast.loading("Verifying player data...", {
          description: "Please wait a moment.",
        });

        try {
          // Save player data to the backend. This also sets the necessary server-side session/cookie.
          const response = await fetch("/api/save-player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save player data.");
          }

          toast.success("Verification successful!", {
            id: toastId,
            description: "Redirecting to the game dashboard...",
          });

          // Use router.push for client-side navigation without a full page reload.
          router.push("/dashboard");

        } catch (error) {
          console.error("Error during game preparation:", error);
          toast.error("Failed to prepare game data", {
            id: toastId,
            description: (error as Error).message || "An unknown error occurred.",
          });
          // Do not redirect if there was an error. The user can try again.
          setIsPreparing(false);
        }
      }
    };

    handleNavigation();
  }, [isConnected, address, router, isPreparing]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-lg">Connecting to your wallet...</p>
        <p className="text-sm text-gray-500">Please check your wallet application.</p>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="mb-4">
          Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <Button disabled>
          {isPreparing ? "Redirecting..." : "Connected"}
        </Button>
      </div>
    );
  }

  // If not connected and not currently connecting, show the connect button.
  return <Web3Status />;
}
