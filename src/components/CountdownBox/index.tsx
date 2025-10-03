"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownBox({
  countdown,
}: {
  countdown: number | null;
}) {
  return (
    <AnimatePresence>
      {typeof countdown === "number" && (
        <>
          <motion.div
            key="countdown-box"
            initial={{ y: -100, opacity: 0 }}
            animate={
              countdown > 0 ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }
            }
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="absolute w-[200px] h-[50px] top-0 left-1/2 -translate-x-1/2 bg-red-600/80 px-6 py-3 text-center"
            style={{
              clipPath: "polygon(0 0, 100% 0, 75% 100%, 25% 100%)",
            }}
          >
            <span className="text-2xl font-extrabold">{countdown}</span>
          </motion.div>

          <motion.div
            key="countdown-bg"
            initial={{ y: -100, opacity: 0 }}
            animate={
              countdown > 0 ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }
            }
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute w-[205px] h-[52px] top-0 left-1/2 -translate-x-1/2 bg-neutral-500 -z-10 px-6 py-3 text-center"
            style={{
              clipPath: "polygon(0 0, 100% 0, 75% 100%, 25% 100%)",
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
