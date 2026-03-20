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
        phoneNumber: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        dateOfBirth: { type: Date, required: requiredForNewUsers, default: null },
        street: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        city: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        country: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        postCode: { type: String, required: requiredForNewUsers, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        addressStreet: { type: String, trim: true, default: "" },
        addressCity: { type: String, trim: true, default: "" },
        addressCountry: { type: String, trim: true, default: "" },
        addressPostalCode: { type: String, trim: true, default: "" },
        birthDate: { type: Date, default: null },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        tokens: { type: Number, default: 10 }
    },
    { timestamps: true }
);

UserSchema.pre("validate", function (next) {
    const phoneNumber = (this.phoneNumber || this.phone || "").trim();
    const street = (this.street || this.addressStreet || "").trim();
    const city = (this.city || this.addressCity || "").trim();
    const country = (this.country || this.addressCountry || "").trim();
    const postCode = (this.postCode || this.addressPostalCode || "").trim();
    const dateOfBirth = this.dateOfBirth || this.birthDate || null;

    this.phoneNumber = phoneNumber;
    this.phone = phoneNumber;
    this.street = street;
    this.addressStreet = street;
    this.city = city;
    this.addressCity = city;
    this.country = country;
    this.addressCountry = country;
    this.postCode = postCode;
    this.addressPostalCode = postCode;
    this.dateOfBirth = dateOfBirth;
    this.birthDate = dateOfBirth;

    if (!this.name && this.firstName && this.lastName) {
        this.name = `${this.firstName} ${this.lastName}`.trim();
    }
    next();
});

if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User: Model<IUserSchema> = mongoose.model<IUserSchema>("User", UserSchema);
