"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function RevokeKeyButton({ id, provider }: { id: string; provider: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      iconLeft="trash"
      onClick={async () => {
        if (!confirm(`Revoke this ${provider === "DEEPGRAM" ? "Deepgram" : "DeepL"} key? Active overlay sessions using it will fail.`)) return;
        await fetch(`/api/keys/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Revoke
    </Button>
  );
}
