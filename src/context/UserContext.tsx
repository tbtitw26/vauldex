"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { IUser, Nullable } from "@/types/user.types";

type UserContextValue = {
    user: Nullable<IUser>;
    isLoading: boolean;
};

export const UserContext = createContext<UserContextValue>({
    user: null,
    isLoading: true,
});

export function useUser(): Nullable<IUser> {
    return useContext(UserContext).user;
}

export function UserProvider({
                                 user,
                                 children,
                             }: {
    user: Nullable<IUser>;
    children: React.ReactNode;
}) {
    const [currentUser, setCurrentUser] = useState<Nullable<IUser>>(user);
    const [isLoading, setIsLoading] = useState(user === null);

    useEffect(() => {
        setCurrentUser(user);
        setIsLoading(user === null);
    }, [user]);

    useEffect(() => {
        if (!isLoading || currentUser) return;

        let isActive = true;

        const bootstrapSession = async () => {
            try {
                const meRes = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (meRes.ok) {
                    const meData = await meRes.json();
                    if (isActive) setCurrentUser(meData.user ?? null);
                    return;
                }

                const refreshRes = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store",
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    if (isActive) setCurrentUser(refreshData.user ?? null);
                    return;
                }

                if (isActive) setCurrentUser(null);
            } catch (error) {
                console.error("UserProvider bootstrap error:", error);
                if (isActive) setCurrentUser(null);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void bootstrapSession();

        return () => {
            isActive = false;
        };
    }, [currentUser, isLoading]);

    const value = useMemo(
        () => ({ user: currentUser, isLoading }),
        [currentUser, isLoading]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
