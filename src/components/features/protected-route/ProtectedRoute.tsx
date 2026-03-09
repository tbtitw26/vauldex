"use client";
import React, { FC, useContext, useEffect } from "react";
import { UserContext } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { ProtectedRouteProps } from "@/components/features/protected-route/types";
import { authRoutes } from "./authRoutes";
import { disallowedRoutes } from "./authRoutes";


const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useContext(UserContext);
    const router = useRouter();
    const pathname = usePathname();
    const needsAuthCheck = authRoutes.includes(pathname) || disallowedRoutes.includes(pathname);

    useEffect(() => {
        if (isLoading) return;

        if (authRoutes.includes(pathname) && !user) {
            router.replace("/sign-in");
        }
        if (disallowedRoutes.includes(pathname) && user) {
            router.replace("/dashboard");
        }
    }, [user, isLoading, router, pathname]);

    if (needsAuthCheck && isLoading) return null;
    if (authRoutes.includes(pathname) && !user) return null;
    if (disallowedRoutes.includes(pathname) && user) return null;

    return <>{children}</>;
};

export default ProtectedRoute;