export type UserRole = "user" | "admin";

export interface IUser {
    _id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string | null;
    street: string;
    city: string;
    country: string;
    postCode: string;
    phone?: string;
    addressStreet?: string;
    addressCity?: string;
    addressCountry?: string;
    addressPostalCode?: string;
    birthDate?: string | null;
    role: UserRole;
    tokens: number | null;
    createdAt: string;
    updatedAt: string;
}

export type Nullable<T> = T | null;

export interface UserResponse {
    user: IUser;
}
