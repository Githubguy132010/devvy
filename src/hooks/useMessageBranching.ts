import { useState, useCallback } from "react";
import { Branch } from "../types";

export interface UseMessageBranchingReturn {
  branches: Branch[];
  activeBranchId: string;
  createBranch: (messageId: string) => void;
  switchBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  mergeBranch: (branchId: string, targetBranchId: string) => void;
}

export function useMessageBranching(chatId: string): UseMessageBranchingReturn {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>('');

  const createBranch = useCallback((messageId: string) => {
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      chatId,
      forkedFromMessageId: messageId,
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setBranches(prev => [...prev, newBranch]);
    setActiveBranchId(newBranch.id);
  }, [chatId]);

  const switchBranch = useCallback((branchId: string) => {
    setActiveBranchId(branchId);
    setBranches(prev =>
      prev.map(branch =>
        branch.id === branchId
          ? { ...branch, status: 'active' }
          : { ...branch, status: 'inactive' }
      )
    );
  }, []);

  const deleteBranch = useCallback((branchId: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== branchId));

    if (activeBranchId === branchId) {
      setActiveBranchId('');
    }
  }, [activeBranchId]);

  const mergeBranch = useCallback((branchId: string, targetBranchId: string) => {
    const sourceBranch = branches.find(b => b.id === branchId);
    if (!sourceBranch) return;

    setBranches(prev =>
      prev.map(branch =>
        branch.id === targetBranchId
          ? { ...branch, messages: [...branch.messages, ...sourceBranch.messages] }
          : branch.id === branchId
          ? { ...branch, status: 'merged' }
          : branch
      )
    );

    setActiveBranchId(targetBranchId);
  }, [branches]);

  return {
    branches,
    activeBranchId,
    createBranch,
    switchBranch,
    deleteBranch,
    mergeBranch,
  };
}
