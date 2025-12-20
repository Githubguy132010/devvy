import { ValidationError } from './errors.js';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: unknown) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates input data against a set of rules
 */
export function validateInput(data: Record<string, unknown>, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    // Skip validation for optional fields that are not provided
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push(`${rule.field} must be of type ${rule.type}, got ${actualType}`);
        continue;
      }
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${rule.field} does not match required pattern`);
      }
    }

    // Custom validation
    if (rule.validate) {
      const customResult = rule.validate(value);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' 
          ? `${rule.field}: ${customResult}` 
          : `${rule.field} failed validation`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates file paths for security
 */
export function validateFilePath(path: string, allowWrite = false): ValidationResult {
  const errors: string[] = [];

  if (!path || typeof path !== 'string') {
    errors.push('Path must be a non-empty string');
    return { isValid: false, errors };
  }

  // Length validation
  if (path.length > 4096) {
    errors.push('Path too long (max 4096 characters)');
  }

  // Security checks
  const dangerousPatterns = [
    /\.\./, // Directory traversal
    /^\/etc\//, // System directories
    /^\/usr\//, // System directories
    /^\/bin\//, // System directories
    /^\/sbin\//, // System directories
    /^\/proc\//, // System directories
    /^\/sys\//, // System directories
    /^\/dev\//, // Device files
    /\.env$/, // Environment files
    /\.key$/, // Key files
    /\.pem$/, // Certificate files
    /\.p12$/, // Certificate files
    /\.crt$/, // Certificate files
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(path)) {
      errors.push(`Path contains potentially dangerous pattern: ${path}`);
      break;
    }
  }

  // Additional write-specific checks
  if (allowWrite) {
    const writeDangerousPatterns = [
      /node_modules\//, // Node modules
      /\.git\//, // Git files
      /\.svn\//, // SVN files
      /dist\//, // Build outputs
      /build\//, // Build outputs
      /coverage\//, // Test coverage
    ];

    for (const pattern of writeDangerousPatterns) {
      if (pattern.test(path)) {
        errors.push(`Write operation not allowed in: ${path}`);
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates bash commands for security
 */
export function validateBashCommand(command: string): ValidationResult {
  const errors: string[] = [];

  if (!command || typeof command !== 'string') {
    errors.push('Command must be a non-empty string');
    return { isValid: false, errors };
  }

  // Length validation
  if (command.length > 10000) {
    errors.push('Command too long (max 10000 characters)');
  }

  // Dangerous command patterns
  const dangerousPatterns = [
    />\s*\/dev\/(null|zero|random|urandom)/, // Output redirection to dangerous devices
    /rm\s+-rf\s+\//, // Dangerous rm commands
    /\s*:\(\)\{\s*\|\|\s*true\s*;\s*\}/, // Fork bomb
    />\s*\/etc\/passwd/, // Writing to sensitive files
    />\s*\/etc\/shadow/, // Writing to sensitive files
    />\s*\/etc\/sudoers/, // Writing to sudoers file
    /chmod\s+777\s+\//, // Dangerous chmod
    /chmod\s+777\s+\/etc/, // Dangerous chmod on etc
    /dd\s+if=.*of=\/dev/, // Writing to devices
    /mkfs\./, // Filesystem formatting
    /fdisk/, // Disk partitioning
    /mount\s+.*\/dev/, // Mounting devices
    /umount\s+.*\/dev/, // Unmounting devices
    /shutdown/, // System shutdown
    /reboot/, // System reboot
    /halt/, // System halt
    /poweroff/, // System poweroff
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      errors.push('Command contains potentially dangerous patterns');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates API keys and configuration
 */
export function validateConfig(data: Record<string, unknown>): ValidationResult {
  const rules: ValidationRule[] = [
    {
      field: 'apiKey',
      required: true,
      type: 'string',
      minLength: 10,
      validate: (value) => {
        const key = value as string;
        // Basic API key pattern checks
        return !/(password|secret|token)\s*[:=]\s*.+/i.test(key) && 
               !key.includes(' ') &&
               key.length >= 10;
      },
    },
     {
       field: 'apiProvider',
       required: true,
       type: 'string',
       pattern: /^(openai|anthropic|openrouter|custom|gemini)$/,
     },
    {
      field: 'model',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    {
      field: 'apiBaseUrl',
      required: false,
      type: 'string',
      validate: (value) => {
        if (!value) return true;
        try {
          new URL(value as string);
          return true;
        } catch {
          return 'Invalid URL format';
        }
      },
    },
  ];

  return validateInput(data, rules);
}

/**
 * Sanitizes user input by removing potentially harmful content
 */
export function sanitizeInput(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  allowNewlines?: boolean;
} = {}): string {
  const {
    maxLength = 10000,
    allowHtml = false,
    allowNewlines = true,
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }

  // Remove HTML tags if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Creates a validation error if validation fails
 */
export function requireValid(validation: ValidationResult, context?: string): void {
  if (!validation.isValid) {
    const message = context 
      ? `Validation failed for ${context}: ${validation.errors.join(', ')}`
      : `Validation failed: ${validation.errors.join(', ')}`;
    throw new ValidationError(message, { errors: validation.errors });
  }
}
