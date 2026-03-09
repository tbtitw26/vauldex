"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import styles from "./CurrencySwitch.module.scss";
import { IoMdArrowDropdown } from "react-icons/io";
import { DISPLAY_CURRENCIES } from "@/resources/currencies";

const CurrencySwitch: React.FC = () => {
    const { currency, setCurrency } = useCurrency();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currencies = useMemo(() => DISPLAY_CURRENCIES, []);

    const handleSelect = (val: (typeof currencies)[number]) => {
        setCurrency(val);
        setOpen(false);
    };

    // закриття при кліку поза + ESC
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [open]);

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Change currency"
            >
                <span className={styles.label}>{currency}</span>

                <IoMdArrowDropdown
                    className={`${styles.icon} ${open ? styles.open : ""}`}
                    size={20}
                />
            </button>

            <div className={`${styles.menu} ${open ? styles.show : ""}`}>
                {currencies.map((c) => (
                    <button
                        key={c}
                        type="button"
                        className={`${styles.option} ${currency === c ? styles.active : ""}`}
                        onClick={() => handleSelect(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CurrencySwitch;