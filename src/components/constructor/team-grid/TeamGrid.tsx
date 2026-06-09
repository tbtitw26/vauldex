"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "./TeamGrid.module.scss";
import { media as mediaMap } from "@/resources/media";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface TeamMember {
    name: string;
    role: string;
    bio: string;
    image: string;
}

interface Props {
    title?: string;
    description?: string;
    members: TeamMember[];
}

function resolveMedia(key?: string) {
    if (!key) return "";
    return (mediaMap as Record<string, any>)[key] || "";
}

const TeamGrid: React.FC<Props> = ({ title, description, members }) => {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(0);

    const go = useCallback(
        (dir: number) => {
            setDirection(dir);
            setActive((prev) => (prev + dir + members.length) % members.length);
        },
        [members.length]
    );

    useEffect(() => {
        const timer = setInterval(() => go(1), 5000);
        return () => clearInterval(timer);
    }, [go]);

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
    };

    return (
        <section className={styles.section}>
            <motion.div
                className={styles.head}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                {title && <h2 className={styles.title}>{title}</h2>}
                {description && <p className={styles.desc}>{description}</p>}
            </motion.div>

            <div className={styles.stage}>
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
                            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <div className={styles.imageWrap}>
                                <Image
                                    src={resolveMedia(members[active].image)}
                                    alt={members[active].name}
                                    className={styles.photo}
                                    width={400}
                                    height={400}
                                />
                            </div>

                            <div className={styles.info}>
                                <h3 className={styles.name}>{members[active].name}</h3>
                                <span className={styles.role}>{members[active].role}</span>
                                <p className={styles.bio}>{members[active].bio}</p>
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
                {members.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                        onClick={() => {
                            setDirection(i > active ? 1 : -1);
                            setActive(i);
                        }}
                        aria-label={`Go to member ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default TeamGrid;
