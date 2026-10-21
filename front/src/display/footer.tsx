"use client";
import Link from "next/link"
import { usePathname } from "next/navigation";

export default function Footer()
{
    const pathname = usePathname();
    return (
    <footer className="flex justify-center gap-4 text-center">
      <Link href={{ pathname: "/privacy", query: { from: pathname } }} className="text-xs text-gray-600 hover:text-black font-medium transition">
        Politique de confidentialité
      </Link>
      <Link href={{ pathname: "/terms", query: { from: pathname } }} className="text-xs text-gray-600 hover:text-black font-medium transition">
        Conditions d’utilisation
      </Link>
    </footer>)
}
