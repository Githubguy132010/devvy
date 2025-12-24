import { motion } from "framer-motion";
import { BranchIndicatorProps } from "../../types";

export function BranchIndicator({ branch, isActive, onClick }: BranchIndicatorProps) {
  return (
    <motion.button
      className={`branch-indicator ${isActive ? 'active' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Branch: ${branch.id}`}
    >
      <span>🌿</span>
      <span>Branch</span>
    </motion.button>
  );
}
