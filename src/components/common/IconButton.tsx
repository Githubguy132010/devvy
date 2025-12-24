import { motion } from "framer-motion";
import { IconButtonProps } from "../../types";

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #5a9bff 0%, #4a8cef 100%)',
    borderColor: 'rgba(90, 155, 255, 0.3)',
    boxShadow: '0 4px 12px rgba(90, 155, 255, 0.3)',
  },
  secondary: {
    background: 'var(--glass-bg)',
    borderColor: 'var(--glass-border)',
    boxShadow: 'var(--glass-shadow-light)',
  },
  ghost: {
    background: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
  },
};

export function IconButton({
  icon,
  onClick,
  title,
  variant = 'secondary',
  isLoading = false,
  disabled = false,
}: IconButtonProps) {
  const style = variantStyles[variant];

  return (
    <motion.button
      className="icon-button"
      onClick={onClick}
      title={title}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
      style={{
        background: style.background,
        border: `1px solid ${style.borderColor}`,
        boxShadow: style.boxShadow,
      }}
    >
      {isLoading ? (
        <span className="icon-loading">⟳</span>
      ) : typeof icon === 'string' ? (
        <span className="icon">{icon}</span>
      ) : (
        icon
      )}
    </motion.button>
  );
}
