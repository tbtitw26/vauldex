import { connectDB } from "../config/db";
import { userService } from "../services/user.service";
import { UserType } from "@/backend/types/user.types";
import { sendEmail } from "@/backend/utils/sendEmail";
import { transactionService } from "@/backend/services/transaction.service";

export const userController = {
    async buyTokens(userId: string, amount: number): Promise<UserType> {
        await connectDB();

        const user = await userService.addTokens(userId, amount);

        console.log("💳 Adding tokens for user:", userId);
        await transactionService.record(user._id, user.email, amount, "add", user.tokens);
        console.log("✅ Transaction created successfully");

        sendEmail(
            user.email,
            "Tokens Purchased",
            `You have successfully purchased ${amount} tokens. Your new balance is ${user.tokens} tokens.`
        );

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

        sendEmail(
            user.email,
            "Tokens Spent",
            `You have spent ${amount} tokens${reason ? ` for ${reason}` : ""}. Your new balance is ${user.tokens} tokens.`
        );

        return formatUser(user);
    },
};

function formatUser(user: any): UserType {
    return {
        _id: user._id.toString(),
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        addressStreet: user.addressStreet,
        addressCity: user.addressCity,
        addressCountry: user.addressCountry,
        addressPostalCode: user.addressPostalCode,
        birthDate: user.birthDate,
        role: user.role,
        tokens: user.tokens,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
