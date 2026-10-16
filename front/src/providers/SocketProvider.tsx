'use client'
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { socket } from "@/src/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMatches } from "@/src/hook/conversation";
import { useMessageStore } from "@/src/constant/newMessage";
import { getAuthToken } from "@/src/lib/authToken";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const pathname = usePathname() ?? "";

    // Vrai quand un token existe dans le navigateur (relu a chaque changement de page,
    const [hasToken, setHasToken] = useState(false);

    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/privacy";

    // Aucune requete /match tant qu'on n'est pas connecte ou sur une page publique
    const { data: users } = useMatches(hasToken && !isPublicPage);
    const setMessageCount = useMessageStore((state) => state.setMessageCount);

    // Compteur du badge : messages non lus + nouveaux matchs jamais ouverts
    
    useEffect(() => {
        if (!hasToken || isPublicPage) {
            setMessageCount(0);
            return;
        }
        if (!users) return;
        const total = users
            .filter((user) => user.isActive !== false && !user.isBlocked)
            .reduce((sum, user) => {
                let count = user.unreadCount ?? 0;
                if (user.isNewMatch === true && (user.unreadCount ?? 0) === 0) {
                    count += 1;
                }
                return sum + count;
            }, 0);
        setMessageCount(total);
    }, [users, hasToken, isPublicPage, setMessageCount]);

    // Evenements recus : ils font simplement recharger la liste si l'utilisateur est authentifie
    useEffect(() => {
        if (!hasToken) {
            socket.off("newMatch");
            socket.off("messagesRead");
            return;
        }

        const refresh = () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        };
        socket.on("newMatch", refresh);
        socket.on("messagesRead", refresh);

        return () => {
            socket.off("newMatch", refresh);
            socket.off("messagesRead", refresh);
        };
    }, [hasToken, queryClient]);

    // La connexion suit le token : ouverte apres un login, fermee apres un logout
    useEffect(() => {
        const token = getAuthToken();
        const authenticated = !!token;
        setHasToken(authenticated);

        if (!authenticated) {
            socket.auth = {};
            if (socket.connected) {
                socket.disconnect();
            }
            return;
        }

        socket.auth = { token };
        if (!socket.connected) {
            socket.connect();
        }
    }, [pathname]);

    return <>{children}</>;
}
