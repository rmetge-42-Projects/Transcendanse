'use client'
import { useEffect } from "react";
import { socket } from "@/src/lib/socket";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        socket.auth = { token };
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    return <>{children}</>;
}