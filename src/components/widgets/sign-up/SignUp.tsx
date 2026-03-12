"use client";

import { Formik, FormikHelpers } from "formik";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import {
    signUpValidation,
    signUpInitialValues,
    signUpOnSubmit,
    signUpCountryOptions,
} from "@/validationSchemas/sign-up/schema";
import FormUI from "@/components/ui/form/FormUI";
import { RegistrationFormValues } from "@/shared/registration";

export type SignUpValues = RegistrationFormValues;

export default function SignUpPage() {
    const { showAlert } = useAlert();
    const router = useRouter();

    return (
        <Formik<SignUpValues>
            initialValues={signUpInitialValues}
            validate={signUpValidation}
            onSubmit={async (
                values,
                { setSubmitting }: FormikHelpers<SignUpValues>
            ) => signUpOnSubmit(values, { setSubmitting }, showAlert, router)}
        >
            {({ isSubmitting }) => (
                <FormUI
                    title="Sign Up"
                    description="Create your account"
                    isSubmitting={isSubmitting}
                    fields={[
                        { name: "firstName", type: "text", placeholder: "First name" },
                        { name: "lastName", type: "text", placeholder: "Last name" },
                        { name: "email", type: "email", placeholder: "Email" },
                        { name: "password", type: "password", placeholder: "Password" },
                        { name: "phone", type: "text", placeholder: "Phone" },
                        { name: "addressStreet", type: "text", placeholder: "Street address" },
                        { name: "addressCity", type: "text", placeholder: "City" },
                        {
                            name: "addressCountry",
                            type: "select",
                            placeholder: "Select country",
                            options: signUpCountryOptions,
                        },
                        { name: "addressPostalCode", type: "text", placeholder: "Postal code" },
                        { name: "birthDate", type: "date", placeholder: "Birth date" },
                    ]}
                    submitLabel="Sign Up"
                    showTerms
                />
            )}
        </Formik>
    );
}
