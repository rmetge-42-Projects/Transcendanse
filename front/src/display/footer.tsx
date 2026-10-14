import Link from "next/link"

//composant pour le footer (liens vers "politique de confidentialité")
export default function Footer()
{
    return (
    <footer className="flex justify-center gap-4 text-center">
      <Link href="/privacy" className="text-xs text-gray-600 hover:text-black font-medium transition">
        Politique de confidentialité
      </Link>
      <Link href="/terms" className="text-xs text-gray-600 hover:text-black font-medium transition">
        Conditions d’utilisation
      </Link>
    </footer>)
}
