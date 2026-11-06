"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/src/lib/authToken";

export default function LegalBack() {
  const router = useRouter();

  const goBack = () => {
    const from = new URLSearchParams(window.location.search).get("from");
    const publicOrigins = ["/", "/login", "/register"];
    const allowedOrigins = getAuthToken()
      ? [...publicOrigins, "/myProfile", "/createProfile", "/modifyProfile"]
      : publicOrigins;
    router.push(from && allowedOrigins.includes(from) ? from : "/");
  };

  return (
    <button type="button" onClick={goBack}
      className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-black">
      <ArrowLeft className="h-4 w-4" />
      Retour
    </button>
  );
}
