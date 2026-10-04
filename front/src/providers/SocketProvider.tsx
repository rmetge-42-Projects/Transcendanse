'use client'
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMatches } from "@/src/hook/conversation";
import { useMessageStore } from "@/src/constant/newMessage";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { data: users } = useMatches();
    const setMessageCount = useMessageStore((state) => state.setMessageCount);

    useEffect(() => {
        if (!users) return;
        const total = users.reduce((sum, user) => {
            let count = user.unreadCount ?? 0;
        if (user.isNewMatch === true && (user.unreadCount ?? 0) === 0) {
            count += 1;
        }
            return sum + count;
        }, 0);
        setMessageCount(total);
    }, [users]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        socket.on("newMatch", () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        });

        socket.on("messagesRead", () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        });

        return () => {
            socket.off("newMatch");
            socket.off("messagesRead");
            socket.disconnect();
        };
    }, []);
    

    return <>{children}</>;
}