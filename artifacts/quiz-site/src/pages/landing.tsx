import React from "react";
import { useGetRecruitmentStatus } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import Home from "@/pages/home";
import ClubInfo from "@/pages/club-info";

export default function Landing() {
  const { data, isLoading, isError } = useGetRecruitmentStatus();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-mono text-white/60">Loading…</p>
      </div>
    );
  }

  if (!isError && data?.testLive) {
    return <Home />;
  }

  return <ClubInfo />;
}
