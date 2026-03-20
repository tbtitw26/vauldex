import * as React from "react";
import Input, { InputProps } from "@mui/joy/Input";
import { useField } from "formik";

type SelectOption = {
    value: string;
    label: string;
};

type SupportedInputType = React.HTMLInputTypeAttribute | "select";

type FormikInputProps = Omit<InputProps, "type"> & {
    name: string;
    formik?: boolean;
    type?: SupportedInputType;
    options?: SelectOption[];
};

const errorStyle: React.CSSProperties = { color: "red", fontSize: 12 };
const selectStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 40,
    padding: "0.625rem 2.5rem 0.625rem 0.75rem",
    borderRadius: 8,
    border: "1px solid var(--joy-palette-neutral-outlinedBorder, rgba(0, 0, 0, 0.23))",
    background: "#fff",
    fontSize: "1rem",
    lineHeight: 1.5,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage:
        "linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px)",
    backgroundSize: "6px 6px, 6px 6px",
    backgroundRepeat: "no-repeat",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    outline: "none",
    boxSizing: "border-box",
};

const InputUI: React.FC<FormikInputProps> = ({ formik, options, type, ...props }) => {
    if (formik && props.name) {
        const [field, meta] = useField(props.name);
        const hasError = !!meta.error && meta.touched;

        if (type === "select") {
            return (
                <>
                    <select
                        {...field}
                        aria-invalid={hasError}
                        style={{
                            ...selectStyle,
                            border: hasError ? "1px solid #d32f2f" : selectStyle.border,
                            color: field.value ? "#111827" : "#6b7280",
                            boxShadow: hasError ? "0 0 0 1px #d32f2f inset" : "none",
                        }}
                    >
                        <option value="">{props.placeholder || "Select an option"}</option>
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {hasError && <div style={errorStyle}>{meta.error}</div>}
                </>
            );
        }

        return (
            <>
                <Input {...field} {...props} type={type} error={hasError} />
                {hasError && <div style={errorStyle}>{meta.error}</div>}
            </>
        );
    }

    if (type === "select") {
        return (
            <select name={props.name} defaultValue="" style={selectStyle}>
                <option value="">{props.placeholder || "Select an option"}</option>
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    return <Input {...props} type={type} />;
};

export default InputUI;
