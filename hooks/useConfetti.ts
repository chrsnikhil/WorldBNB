import { useState } from "react";

export const useConfetti = () => {
  const [confetti, setConfetti] = useState(false);

  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  return { confetti, triggerConfetti };
};
