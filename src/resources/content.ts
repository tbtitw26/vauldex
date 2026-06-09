import {media} from "@/resources/media";
import {FaTwitter, FaFacebook, FaLinkedin} from "react-icons/fa";

export const baseURL =
    typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const headerContent = {
    logo: {
        src: media.logo.src,
        alt: "Site Logo",
        href: "/"
    },
    links: [
        {label: "About Company", href: "/about-us"},
        {label: "Process", href: "/get-started"},
        {label: "Pricing", href: "/pricing"},
        {label: "Contact", href: "/contact-us"},
        {label: "Faq", href: "/faq"},
        {label: "Templates", href: "/templates"},
        {label: "Career Services", href: "/career-services"}

    ]
};

export const footerContent = {
    logo: {src: media.logo.src, alt: "Site Logo", href: "/"},
    columns: [
        {
            title: "Navigate",
            links: [
                {label: "About Us", href: "/about-us"},
                {label: "Pricing", href: "/pricing"},
                {label: "Faq", href: "/faq"},
                {label: "Get Started", href: "/get-started"},
            ],
        },
        {
            title: "Legal",
            links: [
                {label: "Terms & Conditions", href: "/terms-and-conditions"},
                {label: "Cookie Policy", href: "/cookie-policy"},
                {label: "Refund Policy", href: "/refund-policy"},
                {label: "Privacy Policy", href: "/privacy-policy"},
            ],
        },
    ],
    contact: {
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "contact@cheffmate.co.uk",
        phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
        address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
    },

    legal: {
        companyName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME || "",
        companyNumber: process.env.NEXT_PUBLIC_COMPANY_NUMBER || "",
        address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
    },
    socials: [],
};

