import { NextRequest, NextResponse } from "next/server";
import { careerDocController } from "@/backend/controllers/careerDoc.controller";
import { requireAuth } from "@/backend/middlewares/auth.middleware";

export async function GET(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        if (!payload?.sub) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const result = await careerDocController.getOrders(payload.sub);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}
