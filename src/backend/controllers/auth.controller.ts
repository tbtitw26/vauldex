import { connectDB } from "../config/db";
import { authService } from "../services/auth.service";
import { LogoutResponse } from "@/backend/types/auth.types";
import { UserType } from "@/backend/types/user.types";
import { RegistrationPayload } from "@/shared/registration";

export const authController = {
    async register(body: RegistrationPayload) {
        await connectDB();
        const { user, accessToken, refreshToken } = await authService.register(body);
        return { user: toUser(user), tokens: { accessToken, refreshToken } };
    },

    async login(body: { email: string; password: string }, userAgent?: string, ip?: string) {
        await connectDB();
        const { user, accessToken, refreshToken } = await authService.login(body.email, body.password, userAgent, ip);
        return { user: toUser(user), tokens: { accessToken, refreshToken } };
    },

    async refresh(refreshJWT: string, userAgent?: string, ip?: string) {
        await connectDB();
        const { user, accessToken, refreshToken } = await authService.refresh(refreshJWT, userAgent, ip);
        return { user: toUser(user), tokens: { accessToken, refreshToken } };
    },

    async me(userId: string): Promise<UserType> {
        await connectDB();
        const user = await authService.me(userId);
        return toUser(user);
    },

    async logout(refreshJWT: string): Promise<LogoutResponse> {
        await connectDB();
        await authService.logout(refreshJWT);
        return { message: "Logged out successfully" };
    },

    async logoutAll(userId: string): Promise<LogoutResponse> {
        await connectDB();
        await authService.logoutAll(userId);
        return { message: "All sessions revoked" };
    },
};

function toUser(u: any): UserType {
    const phoneNumber = u.phoneNumber ?? u.phone ?? "";
    const street = u.street ?? u.addressStreet ?? "";
    const city = u.city ?? u.addressCity ?? "";
    const country = u.country ?? u.addressCountry ?? "";
    const postCode = u.postCode ?? u.addressPostalCode ?? "";
    const dateOfBirth = u.dateOfBirth ?? u.birthDate ?? null;

    return {
        _id: u._id.toString(),
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber,
        dateOfBirth,
        street,
        city,
        country,
        postCode,
        phone: phoneNumber,
        addressStreet: street,
        addressCity: city,
        addressCountry: country,
        addressPostalCode: postCode,
        birthDate: dateOfBirth,
        role: u.role,
        tokens: u.tokens,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
    };
}
