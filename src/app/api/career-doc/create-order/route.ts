import { NextRequest, NextResponse } from "next/server";
import { careerDocController } from "@/backend/controllers/careerDoc.controller";
import { requireAuth } from "@/backend/middlewares/auth.middleware";

export async function POST(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        if (!payload?.sub) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = await careerDocController.createOrder(payload.sub, payload.email, body);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Error creating career doc order:", err);
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}
