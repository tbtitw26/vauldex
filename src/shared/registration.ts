export type CountryOption = {
    code: string;
    label: string;
};

export type RegistrationPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    street: string;
    city: string;
    country: string;
    postCode: string;
    dateOfBirth: string;
};

export type RegistrationFormValues = RegistrationPayload & {
    confirmPassword: string;
    terms: boolean;
};

export type RegistrationFieldErrors = Partial<Record<keyof RegistrationFormValues, string>>;

export class RegistrationValidationError extends Error {
    readonly statusCode = 400;

    constructor(public readonly fields: RegistrationFieldErrors, message = "Validation failed") {
        super(message);
        this.name = "RegistrationValidationError";
    }
}

export const REGISTRATION_MIN_AGE = 18;

const RAW_COUNTRY_OPTIONS: CountryOption[] = [
    { code: "AF", label: "Afghanistan" },
    { code: "AL", label: "Albania" },
    { code: "DZ", label: "Algeria" },
    { code: "AD", label: "Andorra" },
    { code: "AO", label: "Angola" },
    { code: "AG", label: "Antigua and Barbuda" },
    { code: "AR", label: "Argentina" },
    { code: "AM", label: "Armenia" },
    { code: "AU", label: "Australia" },
    { code: "AT", label: "Austria" },
    { code: "AZ", label: "Azerbaijan" },
    { code: "BS", label: "Bahamas" },
    { code: "BH", label: "Bahrain" },
    { code: "BD", label: "Bangladesh" },
    { code: "BB", label: "Barbados" },
    { code: "BY", label: "Belarus" },
    { code: "BE", label: "Belgium" },
    { code: "BZ", label: "Belize" },
    { code: "BJ", label: "Benin" },
    { code: "BT", label: "Bhutan" },
    { code: "BO", label: "Bolivia" },
    { code: "BA", label: "Bosnia and Herzegovina" },
    { code: "BW", label: "Botswana" },
    { code: "BR", label: "Brazil" },
    { code: "BN", label: "Brunei" },
    { code: "BG", label: "Bulgaria" },
    { code: "BF", label: "Burkina Faso" },
    { code: "BI", label: "Burundi" },
    { code: "CV", label: "Cabo Verde" },
    { code: "KH", label: "Cambodia" },
    { code: "CM", label: "Cameroon" },
    { code: "CA", label: "Canada" },
    { code: "CF", label: "Central African Republic" },
    { code: "TD", label: "Chad" },
    { code: "CL", label: "Chile" },
    { code: "CN", label: "China" },
    { code: "CO", label: "Colombia" },
    { code: "KM", label: "Comoros" },
    { code: "CG", label: "Congo" },
    { code: "CD", label: "Dem. Rep. of the Congo" },
    { code: "CR", label: "Costa Rica" },
    { code: "CI", label: "Cote d'Ivoire" },
    { code: "HR", label: "Croatia" },
    { code: "CU", label: "Cuba" },
    { code: "CY", label: "Cyprus" },
    { code: "CZ", label: "Czech Republic" },
    { code: "DK", label: "Denmark" },
    { code: "DJ", label: "Djibouti" },
    { code: "DM", label: "Dominica" },
    { code: "DO", label: "Dominican Republic" },
    { code: "EC", label: "Ecuador" },
    { code: "EG", label: "Egypt" },
    { code: "SV", label: "El Salvador" },
    { code: "GQ", label: "Equatorial Guinea" },
    { code: "ER", label: "Eritrea" },
    { code: "EE", label: "Estonia" },
    { code: "SZ", label: "Eswatini" },
    { code: "ET", label: "Ethiopia" },
    { code: "FJ", label: "Fiji" },
    { code: "FI", label: "Finland" },
    { code: "FR", label: "France" },
    { code: "GA", label: "Gabon" },
    { code: "GM", label: "Gambia" },
    { code: "GE", label: "Georgia" },
    { code: "DE", label: "Germany" },
    { code: "GH", label: "Ghana" },
    { code: "GR", label: "Greece" },
    { code: "GD", label: "Grenada" },
    { code: "GT", label: "Guatemala" },
    { code: "GN", label: "Guinea" },
    { code: "GW", label: "Guinea-Bissau" },
    { code: "GY", label: "Guyana" },
    { code: "HT", label: "Haiti" },
    { code: "HN", label: "Honduras" },
    { code: "HU", label: "Hungary" },
    { code: "IS", label: "Iceland" },
    { code: "IN", label: "India" },
    { code: "ID", label: "Indonesia" },
    { code: "IR", label: "Iran" },
    { code: "IQ", label: "Iraq" },
    { code: "IE", label: "Ireland" },
    { code: "IL", label: "Israel" },
    { code: "IT", label: "Italy" },
    { code: "JM", label: "Jamaica" },
    { code: "JP", label: "Japan" },
    { code: "JO", label: "Jordan" },
    { code: "KZ", label: "Kazakhstan" },
    { code: "KE", label: "Kenya" },
    { code: "KI", label: "Kiribati" },
    { code: "KP", label: "North Korea" },
    { code: "KR", label: "South Korea" },
    { code: "KW", label: "Kuwait" },
    { code: "KG", label: "Kyrgyzstan" },
    { code: "LA", label: "Laos" },
    { code: "LV", label: "Latvia" },
    { code: "LB", label: "Lebanon" },
    { code: "LS", label: "Lesotho" },
    { code: "LR", label: "Liberia" },
    { code: "LY", label: "Libya" },
    { code: "LI", label: "Liechtenstein" },
    { code: "LT", label: "Lithuania" },
    { code: "LU", label: "Luxembourg" },
    { code: "MG", label: "Madagascar" },
    { code: "MW", label: "Malawi" },
    { code: "MY", label: "Malaysia" },
    { code: "MV", label: "Maldives" },
    { code: "ML", label: "Mali" },
    { code: "MT", label: "Malta" },
    { code: "MH", label: "Marshall Islands" },
    { code: "MR", label: "Mauritania" },
    { code: "MU", label: "Mauritius" },
    { code: "MX", label: "Mexico" },
    { code: "FM", label: "Micronesia" },
    { code: "MD", label: "Moldova" },
    { code: "MC", label: "Monaco" },
    { code: "MN", label: "Mongolia" },
    { code: "ME", label: "Montenegro" },
    { code: "MA", label: "Morocco" },
    { code: "MZ", label: "Mozambique" },
    { code: "MM", label: "Myanmar (Burma)" },
    { code: "NA", label: "Namibia" },
    { code: "NR", label: "Nauru" },
    { code: "NP", label: "Nepal" },
    { code: "NL", label: "Netherlands" },
    { code: "NZ", label: "New Zealand" },
    { code: "NI", label: "Nicaragua" },
    { code: "NE", label: "Niger" },
    { code: "NG", label: "Nigeria" },
    { code: "MK", label: "North Macedonia" },
    { code: "NO", label: "Norway" },
    { code: "OM", label: "Oman" },
    { code: "PK", label: "Pakistan" },
    { code: "PW", label: "Palau" },
    { code: "PA", label: "Panama" },
    { code: "PG", label: "Papua New Guinea" },
    { code: "PY", label: "Paraguay" },
    { code: "PE", label: "Peru" },
    { code: "PH", label: "Philippines" },
    { code: "PL", label: "Poland" },
    { code: "PT", label: "Portugal" },
    { code: "QA", label: "Qatar" },
    { code: "RO", label: "Romania" },
    { code: "RU", label: "Russia" },
    { code: "RW", label: "Rwanda" },
    { code: "KN", label: "Saint Kitts and Nevis" },
    { code: "LC", label: "Saint Lucia" },
    { code: "VC", label: "Saint Vincent and the Grenadines" },
    { code: "WS", label: "Samoa" },
    { code: "SM", label: "San Marino" },
    { code: "ST", label: "Sao Tome and Principe" },
    { code: "SA", label: "Saudi Arabia" },
    { code: "SN", label: "Senegal" },
    { code: "RS", label: "Serbia" },
    { code: "SC", label: "Seychelles" },
    { code: "SL", label: "Sierra Leone" },
    { code: "SG", label: "Singapore" },
    { code: "SK", label: "Slovakia" },
    { code: "SI", label: "Slovenia" },
    { code: "SB", label: "Solomon Islands" },
    { code: "SO", label: "Somalia" },
    { code: "ZA", label: "South Africa" },
    { code: "SS", label: "South Sudan" },
    { code: "ES", label: "Spain" },
    { code: "LK", label: "Sri Lanka" },
    { code: "SD", label: "Sudan" },
    { code: "SR", label: "Suriname" },
    { code: "SE", label: "Sweden" },
    { code: "CH", label: "Switzerland" },
    { code: "SY", label: "Syria" },
    { code: "TW", label: "Taiwan" },
    { code: "TJ", label: "Tajikistan" },
    { code: "TZ", label: "Tanzania" },
    { code: "TH", label: "Thailand" },
    { code: "TL", label: "Timor-Leste" },
    { code: "TG", label: "Togo" },
    { code: "TO", label: "Tonga" },
    { code: "TT", label: "Trinidad and Tobago" },
    { code: "TN", label: "Tunisia" },
    { code: "TR", label: "Turkey" },
    { code: "TM", label: "Turkmenistan" },
    { code: "TV", label: "Tuvalu" },
    { code: "UG", label: "Uganda" },
    { code: "UA", label: "Ukraine" },
    { code: "AE", label: "United Arab Emirates" },
    { code: "GB", label: "United Kingdom" },
    { code: "US", label: "United States" },
    { code: "UY", label: "Uruguay" },
    { code: "UZ", label: "Uzbekistan" },
    { code: "VU", label: "Vanuatu" },
    { code: "VA", label: "Vatican City" },
    { code: "VE", label: "Venezuela" },
    { code: "VN", label: "Vietnam" },
    { code: "YE", label: "Yemen" },
    { code: "ZM", label: "Zambia" },
    { code: "ZW", label: "Zimbabwe" },
    { code: "XK", label: "Kosovo" },
    { code: "CRIMEA", label: "Crimea (Ukraine)" },
    { code: "DARFUR", label: "Darfur (Sudan)" },
];

export const BLOCKED_COUNTRY_CODES = new Set([
    "AF",
    "BY",
    "CF",
    "CRIMEA",
    "CU",
    "CD",
    "DARFUR",
    "HT",
    "IR",
    "IQ",
    "KP",
    "ML",
    "MM",
    "RU",
    "SD",
    "SO",
    "SS",
    "SY",
    "VE",
    "YE",
    "ZW",
]);

const BLOCKED_COUNTRY_LABELS = new Set([
    "Afghanistan",
    "Belarus",
    "Central African Republic",
    "Crimea (Ukraine)",
    "Cuba",
    "Darfur (Sudan)",
    "Dem. Rep. of the Congo",
    "Iran",
    "Iraq",
    "Haiti",
    "Mali",
    "Myanmar (Burma)",
    "North Korea",
    "Russia",
    "Somalia",
    "South Sudan",
    "Sudan",
    "Syria",
    "Venezuela",
    "Yemen",
    "Zimbabwe",
].map(normalizeCountryName));

export const COUNTRY_OPTIONS = RAW_COUNTRY_OPTIONS.filter(
    (country) => !BLOCKED_COUNTRY_CODES.has(country.code)
);

const COUNTRY_BY_CODE = new Map(RAW_COUNTRY_OPTIONS.map((country) => [country.code, country]));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s().-]{6,}$/;

function normalizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeCountryName(value: string): string {
    return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function parseBirthDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return null;

    const [year, month, day] = value.split("-").map(Number);
    if (
        parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() + 1 !== month ||
        parsed.getUTCDate() !== day
    ) {
        return null;
    }

    return parsed;
}

export function getCountryOption(value: string): CountryOption | null {
    const normalized = normalizeText(value);
    if (!normalized) return null;

    const byCode = COUNTRY_BY_CODE.get(normalized.toUpperCase());
    if (byCode) return byCode;

    return (
        RAW_COUNTRY_OPTIONS.find(
            (country) => normalizeCountryName(country.label) === normalizeCountryName(normalized)
        ) ?? null
    );
}

export function isBlockedCountry(value: string): boolean {
    const normalized = normalizeText(value);
    if (!normalized) return false;

    const option = getCountryOption(normalized);
    if (option) {
        return BLOCKED_COUNTRY_CODES.has(option.code);
    }

    return BLOCKED_COUNTRY_LABELS.has(normalizeCountryName(normalized));
}

export function normalizeRegistrationPayload(
    values: Partial<RegistrationFormValues> | Partial<RegistrationPayload>
): RegistrationPayload {
    const countryValue = normalizeText(values.country ?? (values as any).addressCountry);
    const countryOption = getCountryOption(countryValue);

    return {
        email: normalizeText(values.email).toLowerCase(),
        password: typeof values.password === "string" ? values.password : "",
        firstName: normalizeText(values.firstName),
        lastName: normalizeText(values.lastName),
        phoneNumber: normalizeText(values.phoneNumber ?? (values as any).phone),
        street: normalizeText(values.street ?? (values as any).addressStreet),
        city: normalizeText(values.city ?? (values as any).addressCity),
        country: countryOption?.label ?? countryValue,
        postCode: normalizeText(values.postCode ?? (values as any).addressPostalCode),
        dateOfBirth: normalizeText(values.dateOfBirth ?? (values as any).birthDate),
    };
}

export function validateRegistration(
    values: Partial<RegistrationFormValues> | Partial<RegistrationPayload>,
    options: { requireTerms?: boolean } = {}
): RegistrationFieldErrors {
    const errors: RegistrationFieldErrors = {};
    const normalized = normalizeRegistrationPayload(values);
    const birthDate = parseBirthDate(normalized.dateOfBirth);

    if (!normalized.firstName) errors.firstName = "First name is required.";
    if (!normalized.lastName) errors.lastName = "Last name is required.";

    if (!normalized.email) {
        errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(normalized.email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!normalized.password) {
        errors.password = "Password is required.";
    } else if (normalized.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    if ("confirmPassword" in values) {
        const confirmPassword = normalizeText((values as RegistrationFormValues).confirmPassword);

        if (!confirmPassword) {
            errors.confirmPassword = "Confirm your password.";
        } else if (confirmPassword !== normalized.password) {
            errors.confirmPassword = "Passwords do not match.";
        }
    }

    if (!normalized.phoneNumber) {
        errors.phoneNumber = "Phone number is required.";
    } else if (!PHONE_REGEX.test(normalized.phoneNumber)) {
        errors.phoneNumber = "Enter a valid phone number.";
    }

    if (!normalized.street) errors.street = "Street is required.";
    if (!normalized.city) errors.city = "City is required.";
    if (!normalized.postCode) errors.postCode = "Post code is required.";

    if (!normalizeText(values.country ?? (values as any).addressCountry)) {
        errors.country = "Country is required.";
    } else if (!getCountryOption(normalizeText(values.country ?? (values as any).addressCountry))) {
        errors.country = "Select a valid country.";
    } else if (isBlockedCountry(normalizeText(values.country ?? (values as any).addressCountry))) {
        errors.country = "Registration is not available in the selected country.";
    }

    if (!normalized.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required.";
    } else if (!birthDate) {
        errors.dateOfBirth = "Enter a valid date of birth.";
    } else if (!isAdult(birthDate, REGISTRATION_MIN_AGE)) {
        errors.dateOfBirth = `You must be at least ${REGISTRATION_MIN_AGE} years old.`;
    }

    if (options.requireTerms && !values.terms) {
        errors.terms = "You must agree to the Terms and Conditions.";
    }

    return errors;
}

export function assertValidRegistration(
    values: Partial<RegistrationFormValues> | Partial<RegistrationPayload>
): RegistrationPayload {
    const fields = validateRegistration(values);
    if (Object.keys(fields).length > 0) {
        throw new RegistrationValidationError(fields);
    }

    return normalizeRegistrationPayload(values);
}

function isAdult(date: Date, minAge: number): boolean {
    const today = new Date();
    let age = today.getUTCFullYear() - date.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - date.getUTCMonth();
    const dayDiff = today.getUTCDate() - date.getUTCDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }

    return age >= minAge;
}
