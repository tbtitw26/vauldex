import {PageSchema} from "@/components/constructor/page-render/types";
import { COMPANY_NAME } from "@/resources/constants";

const schema: PageSchema = {
    meta: {
        title: `About Us — ${COMPANY_NAME}`,
        description:
            `${COMPANY_NAME} combines instant AI-generated resumes with professional HR review. Create your CV instantly or choose the optional expert service for a polished version within 24 hours.`,
        keywords: [
            `${COMPANY_NAME}`,
            "create resume",
            "online resume",
            "CV templates",
            "resume builder",
            "professional resume",
            "AI CV",
            "HR review",
        ],
        canonical: "/about-us",
        ogImage: {
            title: `${COMPANY_NAME}`,
            description: "Instant CVs + optional expert review in 24h",
            bg: "#0a2540",
            color: "#ffffff",
        },
    },
    blocks: [
        {
            type: "custom",
            component: "HeroSection",
            title: `About ${COMPANY_NAME}`,
            highlight: "Our Mission & Vision",
            description: `At ${COMPANY_NAME}, we believe that every professional deserves a fair chance to showcase their skills.  
   Our platform helps you instantly generate ATS-friendly CVs, while our HR experts ensure your application stands out with personalized reviews.`,
            image: "image2",
        },

        {
            type: "section",
            left: {
                type: "media",
                mediaType: "image",
                src: "image5",
                alt: "Example of a professional resume",
            },
            right: {
                type: "custom",
                component: "InfoBlock",
                title: `Why ${COMPANY_NAME}?`,
                description: "We provide flexibility: instant results when you need speed, or expert refinement when you want the highest quality.",
                bullets: [
                    "A tool for instantly creating resumes based on pre-designed templates",
                    "Optional HR manager review in 24h",
                    "Resumes tailored to your industry",
                ],
            },
        },

        // 🔹 Our Story
        {
            type: "section",
            left: {
                type: "custom",
                component: "Timeline",
                title: "Our Evolution",
                steps: [
                    {
                        title: "Launch",
                        description: "Started as a simple CV generator focused on fast, clean resume creation."
                    },
                    {
                        title: "AI Engine Added",
                        description: "We introduced smart keyword optimization and ATS improvements."
                    },
                    {
                        title: "HR Team Added",
                        description: "Experienced HR experts joined to provide personalized CV reviews."
                    },
                    {
                        title: "10,000+ Users",
                        description: "Trusted by job seekers worldwide, across 15+ industries."
                    },
                ],
            },
            right: {
                type: "custom",
                component: "InfoBlock",
                title: "Our Story",
                image: "image2",
                description: `${COMPANY_NAME} was born from a simple but powerful idea: 
Not everyone has the time, resources, or design skills to craft a professional CV.  
Many job seekers lose opportunities not because they lack talent, but because their resumes fail 
to pass automated filters or attract recruiters' attention.  

To solve this, we combined automation with human expertise — creating a platform that delivers instant, 
ATS-ready CVs while also offering optional personalized reviews from experienced HR professionals.  

From day one, our mission has been to empower people from all industries and backgrounds to showcase their strengths 
and land opportunities they truly deserve.`,
                bullets: [
                    "Founded by HR experts with 10+ years of recruitment experience",
                    "Built to bridge the gap between AI automation and human expertise",
                    "Designed to help job seekers worldwide at every stage of their career",
                    "Trusted by thousands globally across tech, healthcare, finance, and more",
                ],
            },
        },


        // 🔹 Our Vision
        {
            type: "section",
            left: {
                type: "custom",
                component: "InfoBlock",
                title: "Our Vision",
                description: `We believe professional career tools should be accessible to everyone. Whether you need a quick CV today or a polished expert-reviewed version, ${COMPANY_NAME} gives you both options.`,
                bullets: [
                    "Accessible resumes for all candidates",
                    "Balance between speed and quality",
                    "Empowering people to land their dream jobs",
                ],
            },
            right: {
                type: "media",
                mediaType: "image",
                src: "image4",
                alt: `Vision of ${COMPANY_NAME}`,
            },
        },

        // 🔹 Our Values
        {
            type: "custom",
            component: "ValuesIcons",
            values: [
                {icon: "⚡", title: "Instant Access", text: "Generate a CV immediately when speed matters most"},
                {icon: "👩‍💼", title: "Expert Touch", text: "Optional HR manager review with 24h delivery"},
                {icon: "📑", title: "ATS-Optimized", text: "Every CV is recruiter-friendly and passes ATS scans"},
                {icon: "🤝", title: "Trust", text: "Thousands of job seekers already rely on us"},
            ],
        },

        // 🔹 What Sets Us Apart
        {
            type: "section",
            align: "center",
            left: {
                type: "text",
                title: "What Sets Us Apart",
                description: `Unlike pure automation tools, ${COMPANY_NAME} gives you a choice. Get an AI-generated CV instantly, or opt for a manager-reviewed version that combines automation with human expertise.`,
                centerTitle: true,
                centerDescription: true,
            },
        },

        // 🔹 Meet the Team
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

        // 🔹 How It Works
        {
            type: "custom",
            component: "Timeline",
            steps: [
                { title: "1. Provide Your Details", description: "Fill out the form with your work experience, education, and skills." },
                { title: "2. Choose Your Option", description: "Download your instant CV — or select manager review for expert refinement." },
                { title: "3. Expert Processing (Optional)", description: "Our HR consultants review and polish your CV." },
                { title: "4. Delivery", description: "Instant download available, or polished PDF sent within 24 hours." },
            ],
        },

        // 🔹 FAQ
        {
            type: "faq",
            items: [
                { question: "How fast can I get my CV?", answer: "You can download your CV instantly. If you choose expert review, it’s ready within 24 hours." },
                { question: "Is my CV ATS-friendly?", answer: "Yes, all generated CVs are optimized to pass ATS (Applicant Tracking System) scans." },
                { question: "Can I edit my CV after generating it?", answer: "Absolutely. You can edit, update, and regenerate your CV anytime." },
                { question: "Do you offer refunds?", answer: "Yes, we have a satisfaction guarantee. If you’re not happy, contact support for assistance." }
            ]
        }
    ],
};

export default schema;
