import { useState } from "react";
import { motion } from "framer-motion";
import { IconButton } from "../common/IconButton";
import { SplitViewProps } from "../../types";
import { CopyIcon, SplitIcon } from "../common/Icons";

export function SplitView({ leftContent, rightContent, showBoth, onToggleSplit, onCopyFromPanel }: SplitViewProps) {
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const ratio = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.min(70, Math.max(30, ratio)));
  };

  return (
    <div
      className={`split-view-container ${showBoth ? 'show-both' : ''}`}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div
        className="split-panel left"
        style={{ flex: showBoth ? splitRatio : 100 }}
      >
        {leftContent}
      </div>

      {showBoth && (
        <motion.div
          className="split-view-divider"
          onMouseDown={handleDragStart}
          whileHover={{ width: 6 }}
          animate={{ opacity: isDragging ? 1 : 0.5 }}
          style={{ cursor: isDragging ? 'col-resize' : 'grab' }}
        />
      )}

      {showBoth && rightContent && (
        <div className="split-panel right" style={{ flex: 100 - splitRatio }}>
          <div className="code-panel-header">
            <span className="code-panel-title">Code Panel</span>
            <IconButton
              icon={<CopyIcon />}
              onClick={() => onCopyFromPanel('right')}
              title="Copy from panel"
              variant="ghost"
            />
          </div>
          <div className="code-panel">{rightContent}</div>
        </div>
      )}

      {!showBoth && (
        <motion.div
          className="split-toggle-btn"
          onClick={onToggleSplit}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 4 }}
        >
          <SplitIcon />
          <span>Split View</span>
        </motion.div>
      )}
    </div>
  );
}
