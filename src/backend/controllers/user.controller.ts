import { connectDB } from "../config/db";
import { userService } from "../services/user.service";
import { UserType } from "@/backend/types/user.types";
import { transactionService } from "@/backend/services/transaction.service";
import { mailService } from "@/backend/services/mail.service";

export const userController = {
    async buyTokens(userId: string, amount: number): Promise<UserType> {
        await connectDB();

        const user = await userService.addTokens(userId, amount);

        console.log("💳 Adding tokens for user:", userId);
        await transactionService.record(user._id, user.email, amount, "add", user.tokens);
        console.log("✅ Transaction created successfully");

        try {
            await mailService.sendPaymentConfirmationEmail({
                email: user.email,
                firstName: user.firstName,
                tokensAdded: amount,
                orderDate: new Date(),
                details: [
                    { label: "Transaction type", value: "Token purchase" },
                    { label: "New balance", value: `${user.tokens} tokens` },
                ],
            });
        } catch (error) {
            console.error("[userController.buyTokens] payment confirmation email failed", {
                userId,
                email: user.email,
                amount,
                error,
            });
        }

        return formatUser(user);
    },

    async spendTokens(userId: string, amount: number, reason?: string): Promise<UserType> {
        await connectDB();

        const user = await userService.getUserById(userId);
        if (!user) throw new Error("User not found");
        if ((user.tokens || 0) < amount) throw new Error("Not enough tokens");

        user.tokens -= amount;
        await user.save();

        await transactionService.record(user._id, user.email, amount, "spend", user.tokens);

        return formatUser(user);
    },
};

function formatUser(user: any): UserType {
    const phoneNumber = user.phoneNumber ?? user.phone ?? "";
    const street = user.street ?? user.addressStreet ?? "";
    const city = user.city ?? user.addressCity ?? "";
    const country = user.country ?? user.addressCountry ?? "";
    const postCode = user.postCode ?? user.addressPostalCode ?? "";
    const dateOfBirth = user.dateOfBirth ?? user.birthDate ?? null;

    return {
        _id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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
        role: user.role,
        tokens: user.tokens,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
