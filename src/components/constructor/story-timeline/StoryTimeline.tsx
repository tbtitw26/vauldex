"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./StoryTimeline.module.scss";

import {
    FaFileAlt,
    FaUserTie,
    FaSearch,
    FaBriefcase,
    FaChartLine
} from "react-icons/fa";

interface TimelineStep {
    icon?: string;
    year: string;
    title: string;
    description: string;
}

const icons: Record<string, JSX.Element> = {
    resume: <FaFileAlt />,
    manager: <FaUserTie />,
    search: <FaSearch />,
    job: <FaBriefcase />,
    growth: <FaChartLine />,
};

const StoryTimeline: React.FC<{ steps: TimelineStep[] }> = ({ steps }) => {
    return (
        <section className={styles.section}>
            <h2 className={styles.heading}>Your CV Evolution Journey</h2>

            <div className={styles.timeline}>
                <div className={styles.line} />

                <div className={styles.scrollContainer}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            className={styles.step}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className={styles.top}>
                                <div className={styles.icon}>
                                    {icons[step.icon || "resume"]}
                                </div>
                            </div>

                            <div className={styles.middleDot} />

                            <div className={styles.bottom}>
                                <h3 className={styles.title}>{step.title}</h3>
                                <p className={styles.desc}>{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StoryTimeline;
