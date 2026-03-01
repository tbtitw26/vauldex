import {PageSchema} from "@/components/constructor/page-render/types";
import {COMPANY_NAME} from "@/resources/constants";

const schema: PageSchema = {
    meta: {
        title: `${COMPANY_NAME} — Instant CVs or Expert Review`,
        description: `${COMPANY_NAME} instantly creates ATS-ready CVs or provides a polished expert-reviewed version within 24 hours.`,
        keywords: [
            "cv maker", "resume builder", "ATS resume", "instant cv",
            "professional resume", "cv review", "career success",
            "HR resume review", "cover letter builder"
        ],
        canonical: "/",
        ogImage: {
            title: COMPANY_NAME,
            description: `Get your CV instantly — or let our experts refine it.`,
            bg: "#0a2540",
            color: "#ffffff",
        },
    },

    blocks: [

        /* --------------------------------------------------------------
         *  HERO — BIG EMOTIONAL OPENING
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "HeroSection",
            title: "Two Ways to Build Your Career",
            highlight: "Instant CV or Expert Review",
            description: `Create an ATS-optimized CV instantly or get a polished, HR-reviewed version in 24 hours.`,
            primaryCta: {text: "Create My CV Now", link: "/get-started"},
            secondaryCta: {text: "See Templates", link: "/templates"},
            image: "image1",
        },

        {
            type: "custom",
            component: "Marquee",
            items: [
                {text: "Trusted by HR managers worldwide"},
                {text: "8,500+ CVs generated"},
                {text: "Users from 15 countries"},
                {text: "10+ years of HR experience"},
            ],
        },

        {
            type: "custom",
            component: "ValuesIcons",
            title: "Why Choose Us?",
            description: `${COMPANY_NAME} blends AI speed with human expertise.`,
            values: [
                {icon: "⚡", title: "Instant CV", text: "Generate a professional CV in seconds."},
                {icon: "🕒", title: "24h Review", text: "HR specialists refine your CV."},
                {icon: "📑", title: "ATS Compliance", text: "Optimized to pass filters."},
                {icon: "🎨", title: "Modern Templates", text: "Beautiful, recruiter-friendly designs."}
            ]
        },

        /* --------------------------------------------------------------
         *   INFOBLOCK (left text + right image)
         * ------------------------------------------------------------*/


        {
            type: "section",
            left: {
                type: "text",
                title: "Your CV, Reinvented for Modern Hiring",
                description: "We combine AI-driven structure with real HR expertise to significantly increase your chances of landing interviews.",
                bullets: [
                    "AI-enhanced keyword optimization",
                    "HR-approved formatting & structure",
                    "Cleaner, more professional writing",
                    "Built to pass ATS filters"
                ],
            },
            right: {
                type: "media",
                mediaType: "image",
                src: "image1",
                alt: "CV comparison before and after"
            },

        },

        /* --------------------------------------------------------------
         *   MEDIA + TEXT (right text, left image)
         * ------------------------------------------------------------*/
        {
            type: "section",
            left: {
                type: "media",
                mediaType: "image",
                src: "image8",
                width: "100%",
                height: "320px",
                alt: "Resume creation process"
            },
            right: {
                type: "text",
                title: "We Combine Technology With Human Expertise",
                description:
                    `Instant CV generation is powered by AI — but the polish comes from real HR professionals.\n\nEvery reviewed CV is analyzed by recruiters who understand industry expectations and modern hiring standards.`,
                bullets: [
                    "Tailored recommendations",
                    "Grammar and clarity improvements",
                    "Industry-specific adjustments"
                ]
            }
        },

        /* --------------------------------------------------------------
         *   TIMELINE — HOW IT WORKS
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "Timeline",
            title: "How It Works",
            steps: [
                {title: "Fill in your details", description: "Work experience, education, and skills."},
                {title: "Instant CV", description: "Get your ATS-ready document immediately."},
                {title: "Optional Review", description: "HR expert refines your CV."},
                {title: "Ready in 24h", description: "Receive a polished version in your inbox."},
            ],
        },

        /* --------------------------------------------------------------
         *  VIDEO DEMO — PRODUCT IN ACTION
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "VideoDemo",
            title: "Watch It in Action",
            description: "See how our instant generator and expert review upgrade your resume.",
            video: "CVMakerDemo",
        },

        /* --------------------------------------------------------------
         *  STORY TIMELINE — BRAND DEVELOPMENT
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "StoryTimeline",
            steps: [
                {
                    year: "2021",
                    title: "Launch",
                    description: "Began as a simple CV generator for quick resume creation."
                },
                {
                    year: "2022",
                    title: "AI Engine Added",
                    description: "Introduced intelligent keyword optimization for ATS systems."
                },
                {
                    year: "2023",
                    title: "HR Team Added",
                    description: "Experienced HR professionals joined the platform."
                },
                {
                    year: "2024",
                    title: "10,000+ Users",
                    description: "Became a trusted tool for job seekers worldwide."
                },
                {
                    year: "2025",
                    title: "Global Expansion",
                    description: "Launching multi-language CV support and worldwide HR network."
                },
            ],
        },

        {
            type: "custom",
            component: "ExamplesGrid",
            title: "Our CV Templates",
            description: "Explore our professionally designed, ATS-optimized resume templates to find the perfect fit for your industry and style."
        },

        {
            type: "custom",
            component: "TeamGrid",
            title: "Meet Our Team",
            description: `Behind ${COMPANY_NAME} is a passionate team of HR experts and developers who combine technology with human insight.`,
            members: [
                { name: "Anna Kowalski", role: "HR Manager", bio: "10+ years in recruitment & career coaching.", image: "team1" },
                { name: "John Doe", role: "Lead Developer", bio: "Building scalable resume tech solutions.", image: "team2" },
                { name: "Maria Lopez", role: "Designer", bio: "Crafting clean, professional CV templates.", image: "team3" }
            ]
        },


        /* --------------------------------------------------------------
         *  PRICING
         * ------------------------------------------------------------*/
        {
            type: "grid",
            columns: 2,
            gap: "2rem",
            cards: [
                {
                    type: "pricing",
                    variant: "starter",
                    title: "Starter",
                    price: "€10",
                    tokens: 1000,
                    badgeTop: "Starter Plan",
                    description: "Perfect for first-time users.",
                    features: [
                        "1 instant ATS-ready CV",
                        "Modern templates",
                        "Basic formatting"
                    ],
                    buttonText: "Start Now",
                    buttonLink: "/checkout?plan=starter",
                },
                {
                    type: "pricing",
                    variant: "pro",
                    title: "Pro",
                    price: "€49",
                    tokens: 4900,
                    badgeTop: "Most Popular",
                    description: "For active job seekers.",
                    features: [
                        "Unlimited generations",
                        "PDF/DOCX export",
                        "Priority support",
                        "Template customization"
                    ],
                    buttonText: "Go Pro",
                    buttonLink: "/checkout?plan=pro",
                },
                {
                    type: "pricing",
                    variant: "premium",
                    title: "Premium",
                    price: "€99",
                    tokens: 9900,
                    badgeTop: "Recommended",
                    description: "Full HR support.",
                    features: [
                        "Unlimited CVs",
                        "24h HR review",
                        "Personalization",
                        "Cover letter builder",
                        "Priority support"
                    ],
                    buttonText: "Choose Premium",
                    buttonLink: "/checkout?plan=premium",
                },
                {
                    type: "pricing",
                    variant: "custom",
                    title: "Custom Plan",
                    price: "dynamic",
                    tokens: 0,
                    badgeTop: "Flexible",
                    description: "Pay only for what you use.",
                    features: [
                        "Custom credits",
                        "Instant token calculator",
                        "Credits never expire"
                    ],
                    buttonText: "Buy Custom",
                    buttonLink: "/checkout?plan=custom",
                },
            ],
        },

        /* --------------------------------------------------------------
         *  TESTIMONIALS
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "TestimonialsSlider",
            testimonials: [
                {
                    name: "Yaroslav Krupa",
                    role: "Marketing Specialist",
                    image: "review1",
                    text: "I got an instant CV and interviews the same week!"
                },
                {
                    name: "John Smith",
                    role: "Software Engineer",
                    image: "review2",
                    text: "Expert review made my CV 2x better."
                },
                {
                    name: "Maria Lopez",
                    role: "Project Manager",
                    image: "review3",
                    text: "Quick, clean, and professional."
                },
            ],
        },

        {
            type: "faq",
            items: [
                {
                    question: "Instant CV vs Expert Review?",
                    answer: "Instant CV is generated immediately. Expert Review is manually polished by HR experts."
                },
                {question: "Are templates ATS-friendly?", answer: "Yes. All templates pass ATS filters."},
                {question: "Can I download in PDF?", answer: "Yes — PDF export is included."},
                {question: "Is my data secure?", answer: "We follow strict GDPR protocols."},
                {question: "Cover letters included?", answer: "Yes — in Premium plan."},
            ]
        },

        {
            type: "custom",
            component: "ContactForm",
            title: "Need Help?",
            description: "Our support team is here to assist you anytime.",
        },
    ],
};

export default schema;
