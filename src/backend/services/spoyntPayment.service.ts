import { connectDB } from "@/backend/config/db";
import { SpoyntPayment, SpoyntPaymentDocument } from "@/backend/models/spoyntPayment.model";

export const spoyntPaymentService = {
    async upsertFromInvoice(params: {
        referenceId: string;
        cpi: string;
        userId: string;
        tokens: number;
        amount: number;
        currency: string;
        gbpAmount: number;
        uiCurrency: string;
        uiAmount: number;
    }): Promise<SpoyntPaymentDocument> {
        await connectDB();
        const now = new Date();

        return SpoyntPayment.findOneAndUpdate(
            { referenceId: params.referenceId },
            {
                $set: {
                    cpi: params.cpi,
                    userId: params.userId,
                    tokens: params.tokens,
                    amount: params.amount,
                    currency: params.currency,
                    gbpAmount: params.gbpAmount,
                    uiCurrency: params.uiCurrency,
                    uiAmount: params.uiAmount,
                    status: "created",
                    lastEventAt: now,
                },
                $setOnInsert: {
                    creditStatus: "none",
                    credited: false,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    },

    async getByCpi(cpi: string): Promise<SpoyntPaymentDocument | null> {
        await connectDB();
        return SpoyntPayment.findOne({ cpi });
    },

    async getByReferenceId(referenceId: string): Promise<SpoyntPaymentDocument | null> {
        await connectDB();
        return SpoyntPayment.findOne({ referenceId });
    },

    async markStatusByCpi(params: {
        cpi: string;
        status?: string;
        resolution?: string;
        metadata?: Record<string, unknown>;
        webhook?: boolean;
        confirmed?: boolean;
        referenceId?: string;
        userId?: string;
        tokens?: number;
        amount?: number;
        currency?: string;
    }): Promise<SpoyntPaymentDocument | null> {
        await connectDB();
        const now = new Date();

        return SpoyntPayment.findOneAndUpdate(
            { cpi: params.cpi },
            {
                $set: {
                    status: params.status,
                    resolution: params.resolution,
                    metadata: params.metadata,
                    referenceId: params.referenceId,
                    userId: params.userId,
                    tokens: params.tokens,
                    amount: params.amount,
                    currency: params.currency,
                    lastEventAt: now,
                    webhookReceivedAt: params.webhook ? now : undefined,
                    confirmedAt: params.confirmed ? now : undefined,
                },
                $setOnInsert: {
                    creditStatus: "none",
                    credited: false,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    },

    async tryBeginCredit(cpi: string): Promise<SpoyntPaymentDocument | null> {
        await connectDB();
        return SpoyntPayment.findOneAndUpdate(
            { cpi, creditStatus: "none" },
            {
                $set: {
                    creditStatus: "processing",
                    creditStartedAt: new Date(),
                },
            },
            { new: true }
        );
    },

    async markCredited(cpi: string): Promise<SpoyntPaymentDocument | null> {
        await connectDB();
        return SpoyntPayment.findOneAndUpdate(
            { cpi },
            {
                $set: {
                    creditStatus: "credited",
                    credited: true,
                    creditedAt: new Date(),
                },
            },
            { new: true }
        );
    },

    async releaseCreditLock(cpi: string): Promise<void> {
        await connectDB();
        await SpoyntPayment.updateOne(
            { cpi, creditStatus: "processing" },
            {
                $set: {
                    creditStatus: "none",
                    creditStartedAt: undefined,
                },
            }
        );
    },
};

