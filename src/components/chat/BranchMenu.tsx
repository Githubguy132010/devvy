import { motion } from "framer-motion";
import { Branch } from "../../types";

interface BranchMenuProps {
  branches: Branch[];
  activeBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onDeleteBranch: (branchId: string) => void;
  onMergeBranch: (branchId: string, targetBranchId: string) => void;
}

export function BranchMenu({
  branches,
  activeBranchId,
  onSelectBranch,
  onDeleteBranch,
  onMergeBranch,
}: BranchMenuProps) {
  return (
    <motion.div
      className="branch-menu"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {branches.length === 0 ? (
        <p className="branch-menu-empty">No branches yet</p>
      ) : (
        branches.map(branch => (
          <motion.div
            key={branch.id}
            className={`branch-menu-item ${branch.id === activeBranchId ? 'active' : ''}`}
            onClick={() => onSelectBranch(branch.id)}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="branch-menu-item-content">
              <span className="branch-menu-item-title">Branch</span>
              <span className="branch-menu-item-status">
                {branch.status}
              </span>
            </div>
            {branch.id !== activeBranchId && (
              <div className="branch-actions">
                <motion.button
                  className="branch-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBranch(branch.id);
                  }}
                  title="Delete branch"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
                <motion.button
                  className="branch-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMergeBranch(branch.id, activeBranchId);
                  }}
                  title="Merge to active"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ↩
                </motion.button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
