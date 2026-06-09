import { Types } from "mongoose";

export type CareerDocType =
    | "recommendationLetter"
    | "thankYouEmail"
    | "interviewPrep"
    | "portfolioBio"
    | "salaryNegotiation"
    | "careerRoadmap";

export interface CareerDocOrderType {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    email: string;
    docType: CareerDocType;
    fullName: string;
    industry: string;
    experienceLevel: string;
    summary: string;
    workExperience: string;
    skills: string;
    targetCompany?: string;
    targetPosition?: string;
    region?: string;
    extraContext?: string;
    response: string;
    createdAt: Date;
}

export interface CreateCareerDocRequest {
    docType: CareerDocType;
    fullName: string;
    industry: string;
    experienceLevel: string;
    summary: string;
    workExperience: string;
    skills: string;
    targetCompany?: string;
    targetPosition?: string;
    region?: string;
    extraContext?: string;
}

export interface CreateCareerDocResponse {
    order: CareerDocOrderType;
}

export interface GetCareerDocOrdersResponse {
    orders: CareerDocOrderType[];
}

export interface GetCareerDocOrderResponse {
    order: CareerDocOrderType | null;
}
