import { AlertColor } from "@mui/material/Alert";
import {
    COUNTRY_OPTIONS,
    RegistrationFormValues,
    validateRegistration,
} from "@/shared/registration";

export const signUpInitialValues: RegistrationFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    addressStreet: "",
    addressCity: "",
    addressCountry: "",
    addressPostalCode: "",
    birthDate: "",
    terms: false,
};

export const signUpCountryOptions = COUNTRY_OPTIONS.map((country) => ({
    value: country.code,
    label: country.label,
}));

export const signUpValidation = (values: RegistrationFormValues) =>
    validateRegistration(values, { requireTerms: true });

export const signUpOnSubmit = async (
    values: RegistrationFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
    showAlert: (msg: string, desc?: string, severity?: AlertColor) => void,
    router: { replace: (url: string) => void; refresh: () => void }
) => {
    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
        const data = await res.json();

        if (res.ok && data?.user) {
            showAlert("Registration successful!", "", "success");
            router.replace("/");
            router.refresh();
        } else {
            const fieldError = data?.errors
                ? (Object.values(data.errors)[0] as string | undefined)
                : undefined;
            showAlert(fieldError || data?.message || "Registration failed", "", "error");
        }
    } catch (e: any) {
        showAlert(e?.message || "Network error", "", "error");
    } finally {
        setSubmitting(false);
    }
};
