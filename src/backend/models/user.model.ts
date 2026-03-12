import mongoose, { Schema, Model } from "mongoose";
import { IUserSchema } from "@/backend/types/user.types";

function requiredForNewUsers(this: IUserSchema) {
    return this.isNew;
}

const UserSchema: Schema<IUserSchema> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        firstName: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        lastName: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        email: { type: String, required: true, unique: true, lowercase: true, index: true },
        password: { type: String, required: true, select: false },
        phone: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        addressStreet: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        addressCity: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        addressCountry: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        addressPostalCode: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        birthDate: { type: Date, required: requiredForNewUsers, default: null },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        tokens: { type: Number, default: 10 }
    },
    { timestamps: true }
);

UserSchema.pre("validate", function (next) {
    if (!this.name && this.firstName && this.lastName) {
        this.name = `${this.firstName} ${this.lastName}`.trim();
    }
    next();
});

if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User: Model<IUserSchema> = mongoose.model<IUserSchema>("User", UserSchema);
