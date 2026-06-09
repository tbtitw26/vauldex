import mongoose, { Schema, Document } from "mongoose";

export interface CareerDocDocument extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    docType: string;
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

const careerDocSchema = new Schema<CareerDocDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    docType: {
        type: String,
        enum: [
            "recommendationLetter",
            "thankYouEmail",
            "interviewPrep",
            "portfolioBio",
            "salaryNegotiation",
            "careerRoadmap",
        ],
        required: true,
    },
    fullName: { type: String, required: true },
    industry: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    summary: { type: String, required: true },
    workExperience: { type: String, required: true },
    skills: { type: String, required: true },
    targetCompany: { type: String },
    targetPosition: { type: String },
    region: { type: String },
    extraContext: { type: String },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.CareerDoc) {
    delete mongoose.models.CareerDoc;
}

export const CareerDoc = mongoose.model<CareerDocDocument>("CareerDoc", careerDocSchema);
