"use client";

import Link from "next/link";
import { CircleUser, Heart, Send } from "lucide-react";
import { useMessageStore } from "../constant/newMessage";

//bandeau pour naviger entre les page
export default function Navigation()
{
    const messageCount = useMessageStore((state) => state.messageCount);

    return(
        <div className="fixed bottom-0 left-0 w-full bg-black  py-4 px-6 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-700">
            <Link 
                href="/match"
                className="text-white"
                title="Matchs"
            >
                <Heart />
            </Link>
            <Link
                href="/message"
                className="relative inline-flex items-center text-white p-1"
                title="Messages"
            >
                <Send />
                {messageCount > 0 && (
                  <span className="absolute -top-3 -right-3 flex items-center justify-center w-6.5 h-6.5 px-1 text-[10px] font-bold text-white bg-orange-500 rounded-full border-2 border-black">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
            </Link>
            <Link
                href="/myProfile"
                className="text-white"
                title="Profil"
            >
                <CircleUser />
            </Link>
          </div>
        </div>
    );
}
