import { useState } from "react";
import { motion } from "framer-motion";
import { CodeBlockProps } from "../../types";
import { CopyIcon, CheckIcon } from "../common/Icons";

export function CodeBlock({ language, code, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language}</span>
        <motion.button
          className={`copy-code-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
        </motion.button>
      </div>
      <pre className="code-block-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}
