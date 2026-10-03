'use client'
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        socket.on("newMatch", () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["otherUsers"] });
        });

        return () => {
            socket.off("newMatch");
            socket.disconnect();
        };
    }, []);

    return <>{children}</>;
}