import { CareerDoc } from "../models/careerDoc.model";
import { User } from "../models/user.model";
import { ENV } from "../config/env";
import OpenAI from "openai";
import { CareerDocType } from "../types/careerDoc.types";
import { transactionService } from "./transaction.service";
import { mailService } from "./mail.service";

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

export const DOC_COST: Record<CareerDocType, number> = {
    recommendationLetter: 20,
    thankYouEmail: 10,
    interviewPrep: 20,
    portfolioBio: 25,
    salaryNegotiation: 15,
    careerRoadmap: 20,
};

export const DOC_LABELS: Record<CareerDocType, string> = {
    recommendationLetter: "Recommendation Letter",
    thankYouEmail: "Thank You Email",
    interviewPrep: "Interview Prep Kit",
    portfolioBio: "Portfolio Bio",
    salaryNegotiation: "Salary Negotiation Script",
    careerRoadmap: "Career Roadmap",
};

const buildPrompts: Record<CareerDocType, (b: any) => string> = {
    recommendationLetter: (b) => `
You are an experienced senior manager writing a professional recommendation letter.
Write a formal, enthusiastic recommendation letter for ${b.fullName}, who worked as a ${b.experienceLevel} professional in ${b.industry}.
${b.targetCompany ? `The letter is addressed to ${b.targetCompany}.` : ""}
${b.targetPosition ? `The candidate is applying for the position of ${b.targetPosition}.` : ""}

Use their background to highlight achievements, character, and professional value.
Summary: ${b.summary}
Work Experience: ${b.workExperience}
Skills: ${b.skills}
${b.extraContext ? `Additional context: ${b.extraContext}` : ""}

Output only the final letter text, ready to print. Include a professional sign-off from "Former Manager / Senior Colleague".
`,

    thankYouEmail: (b) => `
You are a career coach helping write a post-interview follow-up email.
Write a professional, warm thank-you email for ${b.fullName} after interviewing at ${b.targetCompany || "a company"} for the ${b.targetPosition || b.industry} role.

The email should:
- Thank the interviewer for their time
- Reference specific aspects of the role or conversation
- Reinforce key qualifications
- Express genuine enthusiasm
- Be concise (under 250 words)

Background:
Summary: ${b.summary}
Skills: ${b.skills}
${b.extraContext ? `Interview notes / additional context: ${b.extraContext}` : ""}

Output only the final email text with subject line.
`,

    interviewPrep: (b) => `
You are a senior HR consultant and interview coach.
Generate a comprehensive interview preparation kit for ${b.fullName}, a ${b.experienceLevel} ${b.industry} professional.
${b.targetCompany ? `Target company: ${b.targetCompany}.` : ""}
${b.targetPosition ? `Target position: ${b.targetPosition}.` : ""}

Include:
1. 10 most likely interview questions for this role and industry
2. Recommended answers based on the candidate's experience (STAR method where applicable)
3. 5 questions the candidate should ask the interviewer
4. Key talking points and strengths to highlight
5. Common pitfalls to avoid

Background:
Summary: ${b.summary}
Work Experience: ${b.workExperience}
Skills: ${b.skills}
${b.extraContext ? `Additional context: ${b.extraContext}` : ""}

Output a well-structured, ready-to-use document.
`,

    portfolioBio: (b) => `
You are a personal branding expert and copywriter.
Write a complete portfolio / personal website content package for ${b.fullName}, a ${b.experienceLevel} ${b.industry} professional.

Generate the following sections:
1. Hero tagline (one impactful sentence)
2. Professional bio (About Me — 150-200 words, engaging and personable)
3. Services / What I Do (3-5 bullet points with short descriptions)
4. Key projects or achievements showcase descriptions (3-4 items based on experience)
5. Short social media bio (LinkedIn / Twitter style, under 160 characters)
6. Call-to-action text for contact section

Background:
Summary: ${b.summary}
Work Experience: ${b.workExperience}
Skills: ${b.skills}
${b.extraContext ? `Additional context (portfolio focus, personal brand tone): ${b.extraContext}` : ""}

Output polished, ready-to-use text for each section.
`,

    salaryNegotiation: (b) => `
You are an expert career negotiation coach.
Create a salary negotiation script and strategy for ${b.fullName}, a ${b.experienceLevel} ${b.industry} professional.
${b.targetCompany ? `Target company: ${b.targetCompany}.` : ""}
${b.targetPosition ? `Target position: ${b.targetPosition}.` : ""}
${b.region ? `Region/market: ${b.region}.` : ""}

Include:
1. Market salary range analysis for this role and level${b.region ? ` in ${b.region}` : ""}
2. Opening statement script (what to say when the offer comes)
3. Counter-offer script with 3 scenarios (low, fair, strong offer)
4. Key arguments to justify higher compensation based on experience
5. Non-salary benefits to negotiate (equity, remote, PTO, signing bonus, etc.)
6. Phrases to avoid and recommended alternatives
7. Walk-away strategy

Background:
Summary: ${b.summary}
Work Experience: ${b.workExperience}
Skills: ${b.skills}
${b.extraContext ? `Additional context: ${b.extraContext}` : ""}

Output a practical, actionable negotiation guide.
`,

    careerRoadmap: (b) => `
You are a senior career strategist and industry analyst.
Create a detailed career development roadmap for ${b.fullName}, a ${b.experienceLevel} ${b.industry} professional.
${b.targetPosition ? `Career goal / dream role: ${b.targetPosition}.` : ""}

Include:
1. Current position analysis (strengths and gaps)
2. 1-year plan: immediate next steps, skills to develop, certifications to pursue
3. 3-year plan: target roles, leadership development, industry positioning
4. 5-year plan: strategic career vision, executive/specialist track options
5. Specific skills to acquire (with recommended resources/courses)
6. Networking and visibility strategy
7. Risk factors and contingency plans

Background:
Summary: ${b.summary}
Work Experience: ${b.workExperience}
Skills: ${b.skills}
${b.extraContext ? `Additional context (career aspirations, constraints): ${b.extraContext}` : ""}

Output a comprehensive, actionable roadmap document.
`,
};

export const careerDocService = {
    async createOrder(userId: string, email: string, body: any) {
        const user = await User.findById(userId);
        if (!user) throw new Error("UserNotFound");

        const docType = body.docType as CareerDocType;
        const cost = DOC_COST[docType];
        if (!cost) throw new Error("InvalidDocType");

        if (user.tokens < cost) throw new Error("InsufficientTokens");

        user.tokens -= cost;
        await user.save();

        await transactionService.record(user._id, user.email, cost, "spend", user.tokens);

        const promptFn = buildPrompts[docType];
        if (!promptFn) throw new Error("InvalidDocType");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional career services expert. Always provide the final polished document, without asking for more details or context. Write in clear, professional English.",
                },
                { role: "user", content: promptFn(body) },
            ],
        });

        const response = completion.choices[0].message?.content || "";

        const order = await CareerDoc.create({
            userId,
            email,
            docType,
            fullName: body.fullName,
            industry: body.industry,
            experienceLevel: body.experienceLevel,
            summary: body.summary,
            workExperience: body.workExperience,
            skills: body.skills,
            targetCompany: body.targetCompany,
            targetPosition: body.targetPosition,
            region: body.region,
            extraContext: body.extraContext,
            response,
        });

        try {
            await mailService.sendOrderConfirmationEmail({
                email: user.email,
                firstName: user.firstName,
                orderId: String(order._id),
                orderType: "career-doc",
                productName: DOC_LABELS[docType],
                tokensDeducted: cost,
                orderDate: order.createdAt ?? new Date(),
                details: [
                    { label: "Document type", value: DOC_LABELS[docType] },
                    { label: "Status", value: "completed" },
                    ...(body.targetCompany ? [{ label: "Target company", value: body.targetCompany }] : []),
                    ...(body.targetPosition ? [{ label: "Target position", value: body.targetPosition }] : []),
                ],
            });
        } catch (error) {
            console.error("[careerDocService.createOrder] order confirmation email failed", {
                userId,
                email: user.email,
                orderId: String(order._id),
                error,
            });
        }

        return order;
    },

    async getOrders(userId: string) {
        return CareerDoc.find({ userId }).sort({ createdAt: -1 });
    },

    async getOrderById(userId: string, orderId: string) {
        return CareerDoc.findOne({ _id: orderId, userId });
    },
};
