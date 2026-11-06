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
    const [hasToken, setHasToken] = useState(false);

    const isPublicPage = ["/", "/login", "/register", "/privacy", "/terms"].includes(pathname);

    const { data: users } = useMatches(hasToken && !isPublicPage);
    const setMessageCount = useMessageStore((state) => state.setMessageCount);
    
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
        const refreshActivity = () => {
            refresh();
            queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
        };
        socket.on("activityChanged", refreshActivity);
        socket.on("connect", refresh);
        const refreshSuggestions = () => {
            queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
        };
        socket.on("suggestionsChanged", refreshSuggestions);
        socket.on("connect", refreshSuggestions);

        return () => {
            socket.off("newMatch", refresh);
            socket.off("messagesRead", refresh);
            socket.off("activityChanged", refreshActivity);
            socket.off("connect", refresh);
            socket.off("suggestionsChanged", refreshSuggestions);
            socket.off("connect", refreshSuggestions);
        };
    }, [hasToken, queryClient]);

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
