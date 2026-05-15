import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const phrases = [
  '"EMI manage ho jayega…"',
  '"Loan lena safe hai kya?"',
  '"SIP badha dete hain…"',
  '"Credit score check karo…"',
  '"Insurance renew karni hai…"',
];

export default function TypingAnimation() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const timeout = deleting ? 30 : 60;

    const timer = setTimeout(() => {
      if (!deleting && charIndex < phrase.length) {
        setCharIndex((c) => c + 1);
      } else if (!deleting && charIndex === phrase.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && charIndex > 0) {
        setCharIndex((c) => c - 1);
      } else {
        setDeleting(false);
        setPhraseIndex((p) => (p + 1) % phrases.length);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono text-lg md:text-xl text-primary/80"
    >
      <span>{phrases[phraseIndex].slice(0, charIndex)}</span>
      <span className="border-r-2 border-primary animate-typing-cursor ml-0.5" />
    </motion.div>
  );
}
