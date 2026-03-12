import { Document, Types } from "mongoose";

export interface IUserSchema extends Document {
    _id: Types.ObjectId;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    addressStreet: string;
    addressCity: string;
    addressCountry: string;
    addressPostalCode: string;
    birthDate: Date | null;
    tokens: number;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}

export interface UserType {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressStreet: string;
    addressCity: string;
    addressCountry: string;
    addressPostalCode: string;
    birthDate: Date | null;
    tokens: number;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
