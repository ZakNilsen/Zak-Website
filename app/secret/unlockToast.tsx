"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useVisitedPages } from "../utility/visitedPageTracker";
import styles from "./unlock-toast.module.css";

export default function SecretUnlockToast() {
  const { justUnlocked, dismissUnlock } = useVisitedPages();
  const router = useRouter();

  return (
    <AnimatePresence>
      {justUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={styles.toast}
        >
          <p className={styles.title}>✦ You've wandered the whole sky.</p>
          <p className={styles.body}>
            The stars, the aurora, the fireflies — you've seen it all. As
            thanks, there's a secret place waiting for you, somewhere off the
            map.
          </p>
          <div className={styles.actions}>
            <button onClick={dismissUnlock} className={styles.dismissButton}>
              Maybe later
            </button>
            <button
              onClick={() => {
                dismissUnlock();
                router.push("/secret");
              }}
              className={styles.confirmButton}
            >
              Take me there
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
