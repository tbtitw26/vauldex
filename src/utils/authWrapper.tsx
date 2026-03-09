import { cookies, headers } from "next/headers";
import { ComponentType, ReactNode } from "react";
import { UserProvider } from "@/context/UserContext";
import { IUser, Nullable } from "@/types/user.types";
import { ENV } from "@/backend/config/env";

interface WrappedComponentProps { children?: ReactNode; }

export function authWrapper<T extends WrappedComponentProps>(Component: ComponentType<T>) {
    return async function WrappedComponent(props: T) {
        let user: Nullable<IUser> = null;
        const c = await cookies();
        const h = await headers();

        const protocol = h.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
        const host = h.get("x-forwarded-host") || h.get("host");
        const origin = host ? `${protocol}://${host}` : ENV.APP_URL;

        try {
            if (c.get(ENV.ACCESS_COOKIE_NAME)) {
                const res = await fetch(`${origin}/api/auth/me`, {
                    method: "GET",
                    headers: { Cookie: c.toString() },
                    cache: "no-store",
                });

                if (res.ok) {
                    const json = await res.json();
                    user = json.user;
                }
            }
        } catch (e) {
            console.error("authWrapper user fetch error:", e);
        }

        return (
            <UserProvider user={user}>
                <Component {...props} />
            </UserProvider>
        );
    };
}
