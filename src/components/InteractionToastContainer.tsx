"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import InteractionToast from "./InteractionToast";

interface InteractionEvent {
    id: string;
    type: "comment" | "reply" | "like" | "save";
    linkId: string;
    linkOwnerId: string;
    actor: {
        _id: string;
        username: string;
        name?: string;
        avatar?: string;
    };
    commentId?: string;
    commentText?: string;
    deepLink: string;
}

export default function InteractionToastContainer() {
    const socket = useSocketStore((state) => state.socket);
    const { currentUser } = useUsers();
    const [toasts, setToasts] = useState<InteractionEvent[]>([]);
    const processedEventsRef = React.useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!socket || !currentUser) return;

        const handleInteraction = (data: InteractionEvent) => {

            if (data.linkOwnerId !== currentUser._id) {
                return;
            }

            const eventId = `${data.type}-${data.linkId}-${data.actor._id}-${data.commentId || Date.now()}`;

            if (processedEventsRef.current.has(eventId)) {
                return;
            }
            processedEventsRef.current.add(eventId);

            if (processedEventsRef.current.size > 100) {
                const oldest = Array.from(processedEventsRef.current).slice(0, 10);
                oldest.forEach(id => processedEventsRef.current.delete(id));
            }

            setToasts((prev) => [
                ...prev,
                {
                    ...data,
                    id: `interaction-${Date.now()}-${Math.random()}`,
                },
            ]);
        };

        socket.on("interaction:link", handleInteraction);

        return () => {
            socket.off("interaction:link", handleInteraction);
        };
    }, [socket, currentUser]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            <div className="flex flex-col gap-2 p-4 pointer-events-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <InteractionToast
                            key={toast.id}
                            actor={toast.actor}
                            type={toast.type}
                            linkId={toast.linkId}
                            deepLink={toast.deepLink}
                            commentText={toast.commentText}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
