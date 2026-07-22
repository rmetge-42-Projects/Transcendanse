import Link from "next/link"
export function Footer()
{
    return (
    <footer className="w-full bg-white py-3 text-center">
      <Link href="/privacy" className="text-xs text-gray-600 hover:text-black font-medium transition">
        Politique de confidentialité
      </Link>
    </footer>)
}