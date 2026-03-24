// app/api/spoynt/payment-log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/backend/middlewares/auth.middleware";
import { spoyntPaymentService } from "@/backend/services/spoyntPayment.service";

export async function GET(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        const url = new URL(req.url);
        const cpi = url.searchParams.get("cpi") || "";
        const ref = url.searchParams.get("ref") || "";

        if (!cpi && !ref) {
            return NextResponse.json({ message: "Provide ?cpi= or ?ref= parameter" }, { status: 400 });
        }

        let record = cpi
            ? await spoyntPaymentService.getByCpi(cpi)
            : await spoyntPaymentService.getByReferenceId(ref);

        if (!record) {
            return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
        }

        // Only allow the owner or admin to see this record
        if (record.userId?.toString() !== payload.sub && payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const log = {
            _id: record._id?.toString(),
            cpi: record.cpi || null,
            referenceId: record.referenceId || null,
            userId: record.userId?.toString(),
            tokens: record.tokens,
            amount: record.amount,
            currency: record.currency,
            gbpAmount: record.gbpAmount ?? null,
            uiCurrency: record.uiCurrency ?? null,
            uiAmount: record.uiAmount ?? null,
            status: record.status ?? null,
            resolution: record.resolution ?? null,
            creditStatus: record.creditStatus,
            credited: record.credited,
            creditedAt: record.creditedAt ?? null,
            creditStartedAt: record.creditStartedAt ?? null,
            lastEventAt: record.lastEventAt ?? null,
            webhookReceivedAt: record.webhookReceivedAt ?? null,
            confirmedAt: record.confirmedAt ?? null,
            metadata: record.metadata ?? null,
            createdAt: (record as any).createdAt ?? null,
            updatedAt: (record as any).updatedAt ?? null,
        };

        return NextResponse.json(log);
    } catch (err: any) {
        return NextResponse.json({ message: err?.message || "Unknown error" }, { status: 401 });
    }
}

