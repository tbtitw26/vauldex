"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./TestimonialsSlider.module.scss";
import { media } from "@/resources/media";
import { MdStar } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Testimonial {
    name: string;
    role?: string;
    image?: string;
    text: string;
    rating?: number;
}

interface Props {
    title?: string;
    description?: string;
    testimonials: Testimonial[];
}

const resolveImage = (key?: string) => {
    if (!key) return undefined;
    const img = media[key as keyof typeof media];
    if (typeof img === "string") return img;
    return (img as any)?.src ?? "";
};

export default function TestimonialsSlider({ title, description, testimonials }: Props) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(0);

    const go = useCallback(
        (dir: number) => {
            setDirection(dir);
            setActive((prev) => (prev + dir + testimonials.length) % testimonials.length);
        },
        [testimonials.length]
    );

    useEffect(() => {
        const timer = setInterval(() => go(1), 7000);
        return () => clearInterval(timer);
    }, [go]);

    const t = testimonials[active];

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0, scale: 0.95 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0, scale: 0.95 }),
    };

    return (
        <section className={styles.section}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}

            <div className={styles.stage}>
                {/* Navigation arrows */}
                <button className={styles.arrow} onClick={() => go(-1)} aria-label="Previous">
                    <FiChevronLeft />
                </button>

                <div className={styles.cardWrapper}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={active}
                            className={styles.card}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            {/* Quote mark */}
                            <div className={styles.quoteMark}>&ldquo;</div>

                            <p className={styles.text}>{t.text}</p>

                            <div className={styles.divider} />

                            <div className={styles.footer}>
                                {t.image && (
                                    <img
                                        src={resolveImage(t.image)}
                                        alt={t.name}
                                        className={styles.avatar}
                                    />
                                )}
                                <div className={styles.info}>
                                    <h4 className={styles.name}>{t.name}</h4>
                                    {t.role && <p className={styles.role}>{t.role}</p>}
                                </div>
                                <div className={styles.stars}>
                                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                                        <MdStar key={i} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button className={styles.arrow} onClick={() => go(1)} aria-label="Next">
                    <FiChevronRight />
                </button>
            </div>

            {/* Dots */}
            <div className={styles.dots}>
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                        onClick={() => {
                            setDirection(i > active ? 1 : -1);
                            setActive(i);
                        }}
                        aria-label={`Go to testimonial ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
