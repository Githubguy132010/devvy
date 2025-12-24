import { motion } from "framer-motion";
import { LoadingSpinnerProps } from "../../types";

const sizeMap = {
  small: '16px',
  medium: '24px',
  large: '32px',
};

export function LoadingSpinner({ size = 'medium', color = '#5a9bff' }: LoadingSpinnerProps) {
  return (
    <motion.div
      className="loading-spinner"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderColor: color,
        borderTopColor: 'transparent',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}
