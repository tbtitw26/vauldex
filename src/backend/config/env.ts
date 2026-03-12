export function env(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`${name} is not defined in environment variables.`);
    }
    return value;
}

export function envOptional(name: string, fallback = ""): string {
    return process.env[name] ?? fallback;
}

export const ENV = {
    MONGODB_URI: env("MONGODB_URI"),
    JWT_ACCESS_SECRET: env("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: env("JWT_REFRESH_SECRET"),
    ACCESS_TOKEN_EXPIRES: env("ACCESS_TOKEN_EXPIRES", "15m"),
    REFRESH_TOKEN_EXPIRES: env("REFRESH_TOKEN_EXPIRES", "30d"),
    ACCESS_COOKIE_NAME: env("ACCESS_COOKIE_NAME", "access_token"),
    REFRESH_COOKIE_NAME: env("REFRESH_COOKIE_NAME", "refresh_token"),
    APP_URL: env("APP_URL", "http://localhost:3000"),
    NODE_ENV: env("NODE_ENV", "development"),
    OPENAI_API_KEY: env("OPENAI_API_KEY", "none"),
    AI_COST_PER_REQUEST: env("AI_COST_PER_REQUEST", "tokens_per_request"),
    SMTP_HOST: env("SMTP_HOST", "smtp.tech-text.co.uk"),
    SMTP_PORT: env("SMTP_PORT", "465"),
    SMTP_SECURE: env("SMTP_SECURE", "true") === "true",
    SMTP_USER: envOptional("SMTP_USER"),
    SMTP_PASS: envOptional("SMTP_PASS"),
    EMAIL_FROM: envOptional("EMAIL_FROM"),
    EMAIL_FROM_NAME: envOptional("EMAIL_FROM_NAME", process.env.NEXT_PUBLIC_COMPANY_NAME || "Support"),
    RESEND_API: envOptional("RESEND_API"),
    SUPPORT_EMAIL: envOptional("SUPPORT_EMAIL", process.env.NEXT_PUBLIC_COMPANY_EMAIL || process.env.EMAIL_FROM || ""),
    COMPANY_NAME: env("COMPANY_NAME", process.env.NEXT_PUBLIC_COMPANY_NAME || "Company"),
    COMPANY_ADDRESS: envOptional("COMPANY_ADDRESS", process.env.NEXT_PUBLIC_COMPANY_ADDRESS || ""),
    COMPANY_PHONE: envOptional("COMPANY_PHONE", process.env.NEXT_PUBLIC_COMPANY_PHONE || ""),
    WEBSITE_NAME: env("WEBSITE_NAME", process.env.NEXT_PUBLIC_COMPANY_NAME || "App"),
    WEBSITE_URL: env("WEBSITE_URL", process.env.APP_URL || "http://localhost:3000"),
};
