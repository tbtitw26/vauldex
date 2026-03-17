import * as Yup from "yup";

export async function sendContactRequest(data: {
    name: string;
    secondName: string;
    email: string;
    phone: string;
    message?: string;
}) {
    const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(result?.message || "Failed to send contact request");
    }

    return result;
}

export const validationSchema = Yup.object().shape({
    name: Yup.string().required("First name is required"),
    secondName: Yup.string().required("Second name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .matches(/^[0-9+\-()\s]+$/, "Invalid phone number")
        .min(5, "Minimum 5 characters")
        .required("Phone number is required"),
    message: Yup.string(),
});

export const initialValues = {
    name: "",
    secondName: "",
    email: "",
    phone: "",
    message: "",
};