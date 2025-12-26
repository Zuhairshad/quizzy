"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

export default function LampDemo() {
    const text = "Master Knowledge The Smart Way";
    const [displayText, setDisplayText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;

        const handleTyping = () => {
            if (!isDeleting) {
                if (displayText.length < text.length) {
                    setDisplayText(text.slice(0, displayText.length + 1));
                    timer = setTimeout(handleTyping, 100);
                } else {
                    timer = setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(text.slice(0, displayText.length - 1));
                    timer = setTimeout(handleTyping, 50);
                } else {
                    setIsDeleting(false);
                    timer = setTimeout(handleTyping, 500);
                }
            }
        };

        timer = setTimeout(handleTyping, 100);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, text]);

    return (
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-8 bg-gradient-to-br from-blue-400 to-blue-600 py-4 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-7xl font-sans drop-shadow-none"
            >
                {displayText}
                <span className="animate-pulse ml-1 text-blue-400">|</span>
            </motion.h1>
        </LampContainer>
    );
}
