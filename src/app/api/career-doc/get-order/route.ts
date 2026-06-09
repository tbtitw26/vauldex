import { NextRequest, NextResponse } from "next/server";
import { careerDocController } from "@/backend/controllers/careerDoc.controller";
import { requireAuth } from "@/backend/middlewares/auth.middleware";

export async function GET(req: NextRequest) {
    try {
        const payload = await requireAuth(req);
        if (!payload?.sub) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ message: "Missing order id" }, { status: 400 });
        }

        const result = await careerDocController.getOrder(payload.sub, id);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}
