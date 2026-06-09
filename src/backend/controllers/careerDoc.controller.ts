import { connectDB } from "../config/db";
import { careerDocService } from "../services/careerDoc.service";
import {
    CreateCareerDocRequest,
    CreateCareerDocResponse,
    GetCareerDocOrdersResponse,
    GetCareerDocOrderResponse,
} from "../types/careerDoc.types";

export const careerDocController = {
    async createOrder(userId: string, email: string, body: CreateCareerDocRequest): Promise<CreateCareerDocResponse> {
        await connectDB();
        const order = await careerDocService.createOrder(userId, email, body);
        const plain: any = (order as any)?.toObject ? (order as any).toObject() : order;
        return { order: plain };
    },

    async getOrders(userId: string): Promise<GetCareerDocOrdersResponse> {
        await connectDB();
        const orders = await careerDocService.getOrders(userId);
        return {
            orders: orders.map((o: any) => (o.toObject ? o.toObject() : o)),
        };
    },

    async getOrder(userId: string, orderId: string): Promise<GetCareerDocOrderResponse> {
        await connectDB();
        const order = await careerDocService.getOrderById(userId, orderId);
        if (!order) return { order: null };
        const plain: any = (order as any)?.toObject ? (order as any).toObject() : order;
        return { order: plain };
    },
};
