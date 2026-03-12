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
    minHeight: 44,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0, 0, 0, 0.23)",
    background: "#fff",
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
