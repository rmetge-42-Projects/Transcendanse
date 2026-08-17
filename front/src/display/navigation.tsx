import Link from "next/link";
import { Send, CircleUser, Heart } from "lucide-react";

//bandeau pour naviger entre les page
export default function Navigation()
{
    return(
        // <div className="">
        //     test
        // </div>
        <div className="fixed bottom-0 left-0 w-full bg-black  py-4 px-6 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-700">
            {/* <span className="text-white">Ton message ou tes boutons ici</span> */}
            <Link 
                href="/match"
                className="text-white"
            >
                <Heart />
                {/* Match */}
            </Link>
            <Link
                href="/message"
                className="text-white"
            >
                <Send />
                {/* Message */}
            </Link>
            <Link
                href="/profile"
                className="text-white"
            >
                <CircleUser />
                {/* Profile */}
            </Link>
          </div>
        </div>
    );
}