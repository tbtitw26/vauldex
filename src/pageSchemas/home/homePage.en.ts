import {PageSchema} from "@/components/constructor/page-render/types";
import {COMPANY_NAME} from "@/resources/constants";

const schema: PageSchema = {
    meta: {
        title: `${COMPANY_NAME} — CVs, Career Documents & Interview Prep`,
        description: `${COMPANY_NAME} instantly creates ATS-ready CVs, recommendation letters, interview prep kits, salary negotiation scripts, and more.`,
        keywords: [
            "cv maker", "resume builder", "ATS resume", "instant cv",
            "professional resume", "cv review", "career success",
            "HR resume review", "cover letter builder",
            "recommendation letter generator", "interview preparation",
            "salary negotiation", "career roadmap", "portfolio bio"
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
            title: "Your Complete Career Toolkit",
            highlight: "CVs, Letters & Career Strategy",
            description: `Create an ATS-optimized CV, generate recommendation letters, prepare for interviews, and plan your career — all in one platform.`,
            primaryCta: {text: "Create My CV Now", link: "/dashboard"},
            secondaryCta: {text: "See Templates", link: "/templates"},
            image: "image1",
        },

        {
            type: "custom",
            component: "Marquee",
            items: [
                {text: "Used by professionals"},
                {text: "AI-powered career documents"},
                {text: "Used internationally"},
                {text: "Interview prep & salary negotiation"},
                {text: "Built with modern HR best practices"},
            ],
        },

        {
            type: "custom",
            component: "ValuesIcons",
            title: "Why Choose Us?",
            description: `${COMPANY_NAME} blends AI speed with human expertise — for CVs and beyond.`,
            values: [
                {icon: "⚡", title: "Instant CV", text: "Generate a professional CV in seconds."},
                {icon: "🕒", title: "24h Review", text: "Optional review helps refine your CV."},
                {icon: "📑", title: "ATS Compliance", text: "Optimized to pass filters."},
                {icon: "🎨", title: "Modern Templates", text: "Beautiful, professional designs."},
                {icon: "📝", title: "Career Documents", text: "Letters, bios, and negotiation scripts."},
                {icon: "🎯", title: "Interview Prep", text: "Tailored questions and answers for your role."}
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
                description: "We combine AI-driven structure with practical review support to help you present your experience clearly.",
                bullets: [
                    "AI-enhanced keyword optimization",
                    "Clear, professional formatting & structure",
                    "Cleaner, more professional writing",
                    "Designed for ATS-friendly formatting"
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
                    `Instant CV generation is powered by AI, with optional review support for additional refinement.\n\nReviewed CVs are polished with attention to clarity, structure, and current hiring expectations.`,
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
                {title: "Optional Review", description: "Additional review helps refine your CV."},
                {title: "Ready in 24h", description: "Receive a polished version in your inbox."},
            ],
        },

        /* --------------------------------------------------------------
         *  CAREER SERVICES — BEYOND THE CV
         * ------------------------------------------------------------*/
        {
            type: "custom",
            component: "InfoBlock",
            title: "More Than Just a CV Builder",
            description: "Go beyond resumes with our full suite of AI-powered career documents — from recommendation letters to salary negotiation scripts.",
            icon: "🚀",
            align: "center",
        },

        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image4",
                    title: "Recommendation Letters",
                    description: "Professional letters from a former manager's perspective, tailored to your target company and role.",
                    buttonLink: "/career-services",
                    buttonText: "Generate Letter",
                },
                {
                    image: "image5",
                    title: "Interview Prep Kit",
                    description: "Top questions for your specific role and industry, with recommended answers based on your experience.",
                    buttonLink: "/career-services",
                    buttonText: "Prepare Now",
                },
                {
                    image: "image6",
                    title: "Salary Negotiation Script",
                    description: "Data-driven negotiation strategy with scripts for different offer scenarios and counter-offers.",
                    buttonLink: "/career-services",
                    buttonText: "Get Your Script",
                },
            ],
        },

        {
            type: "grid",
            columns: 3,
            gap: "2rem",
            cards: [
                {
                    image: "image7",
                    title: "Thank You Email",
                    description: "Post-interview follow-up that reinforces your candidacy and keeps you top of mind.",
                    buttonLink: "/career-services",
                    buttonText: "Write Email",
                },
                {
                    image: "image8",
                    title: "Portfolio & Bio",
                    description: "Complete personal website copy: hero tagline, about me, services, and project showcases.",
                    buttonLink: "/career-services",
                    buttonText: "Build Bio",
                },
                {
                    image: "image9",
                    title: "Career Roadmap",
                    description: "A 1-3-5 year development plan with target roles, skills to acquire, and milestones.",
                    buttonLink: "/career-services",
                    buttonText: "Plan Career",
                },
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
                    year: "Sep 2025",
                    title: "Launch",
                    description: "Began as a simple CV generator for quick resume creation."
                },
                {
                    year: "Late 2025",
                    title: "AI Engine Added",
                    description: "Introduced AI-assisted drafting and CV improvements."
                },
                {
                    year: "Early 2026",
                    title: "Review Support Added",
                    description: "Added optional review support for more polished CVs."
                },
                {
                    year: "2026",
                    title: "Product Growth",
                    description: "Expanded the platform based on user feedback and new use cases."
                },
                {
                    year: "Next",
                    title: "Ongoing Improvements",
                    description: "Continuing to improve templates, language support, and workflow tools."
                },
            ],
        },

        {
            type: "custom",
            component: "ExamplesGrid",
            title: "Our CV Templates",
            description: "Explore our professionally designed, ATS-optimized resume templates to find the perfect fit for your industry and style."
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
                    description: "1,000 tokens to get started.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "All templates & formats",
                        "Tokens never expire"
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
                    description: "4,900 tokens — best for regular use.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "All templates & formats",
                        "Tokens never expire"
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
                    description: "9,900 tokens — maximum value.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "All templates & formats",
                        "Tokens never expire"
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
                    description: "Choose your own amount.",
                    features: [
                        "Full access to all features",
                        "AI-powered CV generation",
                        "All templates & formats",
                        "Tokens never expire"
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
                    role: "Marketing Specialist — Landed a role at a top agency",
                    image: "review1",
                    text: "I generated my CV on Monday, used the Interview Prep Kit to prepare for Wednesday's call, and got the offer by Friday. The salary negotiation script helped me negotiate 15% above their initial offer. This platform literally changed my career trajectory.",
                    rating: 5,
                },
                {
                    name: "Thomas Andersson",
                    role: "UX Designer — Freelancer building a personal brand",
                    image: "review2",
                    text: "The Portfolio & Bio generator saved me a week of writing. I got a hero tagline, a complete About Me section, project descriptions, and even a LinkedIn summary — all in one go. My personal website looks professional and the tone is exactly what I wanted.",
                    rating: 5,
                },
                {
                    name: "Elena Vasquez",
                    role: "Finance Analyst — Relocated to a new market",
                    image: "review3",
                    text: "Moving from Latin America to Europe meant I needed to completely rethink my CV and understand local salary expectations. The platform generated a region-specific salary negotiation script and a recommendation letter targeted at European companies. Worth every token.",
                    rating: 5,
                },
            ],
        },

        {
            type: "faq",
            items: [
                {
                    question: "Instant CV vs Expert Review?",
                    answer: "Instant CV is generated immediately. Expert Review adds manual refinement for structure, wording, and presentation."
                },
                {question: "Are templates ATS-friendly?", answer: "Yes. All templates are designed with ATS-friendly formatting in mind."},
                {question: "Can I download in PDF?", answer: "Yes — PDF export is included."},
                {question: "Is my data secure?", answer: "We follow strict GDPR protocols."},
                {question: "Cover letters included?", answer: "Yes — in Premium plan."},
                {question: "What career services do you offer?", answer: "Beyond CVs, we generate recommendation letters, thank-you emails, interview prep kits, portfolio bios, salary negotiation scripts, and career roadmaps."},
                {question: "How do career documents work?", answer: "Fill in your professional background once, select the document type, and our AI generates a polished, ready-to-use document in seconds."},
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
