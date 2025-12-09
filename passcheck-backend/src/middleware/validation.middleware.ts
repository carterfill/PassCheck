import { Request, Response, NextFunction } from 'express';

// Maximum input sizes to prevent DoS
const MAX_PASSWORD_LENGTH = 1000;
const MAX_KEYWORDS_COUNT = 10;
const MAX_KEYWORD_LENGTH = 50;
const MAX_QUANTITY = 10;
const MAX_WORD_COUNT = 10;
const MAX_SEPARATOR_LENGTH = 10;
const MAX_VISITOR_ID_LENGTH = 100;

// Sanitize string input - remove dangerous characters and limit length
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters (except newline, tab, carriage return)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized.trim();
}

// Validate password input
export function validatePassword(req: Request, res: Response, next: NextFunction): void {
  try {
    const { password } = req.body;
    
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }
    
    if (typeof password !== 'string') {
      res.status(400).json({ error: 'Password must be a string' });
      return;
    }
    
    if (password.length === 0) {
      res.status(400).json({ error: 'Password cannot be empty' });
      return;
    }
    
    if (password.length > MAX_PASSWORD_LENGTH) {
      res.status(400).json({ error: `Password length cannot exceed ${MAX_PASSWORD_LENGTH} characters` });
      return;
    }
    
    // Sanitize password
    req.body.password = sanitizeString(password, MAX_PASSWORD_LENGTH);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid password input' });
  }
}

// Validate generator random password input
export function validateRandomPassword(req: Request, res: Response, next: NextFunction): void {
  try {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSpecial, excludeAmbiguous, quantity } = req.body;
    
    // Validate length
    if (length !== undefined) {
      if (typeof length !== 'number' || !Number.isInteger(length) || length < 4 || length > 128) {
        res.status(400).json({ error: 'Length must be an integer between 4 and 128' });
        return;
      }
    }
    
    // Validate boolean flags
    if (includeUppercase !== undefined && typeof includeUppercase !== 'boolean') {
      res.status(400).json({ error: 'includeUppercase must be a boolean' });
      return;
    }
    
    if (includeLowercase !== undefined && typeof includeLowercase !== 'boolean') {
      res.status(400).json({ error: 'includeLowercase must be a boolean' });
      return;
    }
    
    if (includeNumbers !== undefined && typeof includeNumbers !== 'boolean') {
      res.status(400).json({ error: 'includeNumbers must be a boolean' });
      return;
    }
    
    if (includeSpecial !== undefined && typeof includeSpecial !== 'boolean') {
      res.status(400).json({ error: 'includeSpecial must be a boolean' });
      return;
    }
    
    if (excludeAmbiguous !== undefined && typeof excludeAmbiguous !== 'boolean') {
      res.status(400).json({ error: 'excludeAmbiguous must be a boolean' });
      return;
    }
    
    // Validate quantity
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        res.status(400).json({ error: `Quantity must be an integer between 1 and ${MAX_QUANTITY}` });
        return;
      }
    }
    
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input parameters' });
  }
}

// Validate memorable password input
export function validateMemorablePassword(req: Request, res: Response, next: NextFunction): void {
  try {
    const { keywords, separator, addNumbers, addSpecial, capitalize } = req.body;
    
    // Validate keywords
    if (!keywords || !Array.isArray(keywords)) {
      res.status(400).json({ error: 'Keywords must be an array' });
      return;
    }
    
    if (keywords.length === 0) {
      res.status(400).json({ error: 'At least one keyword is required' });
      return;
    }
    
    if (keywords.length > MAX_KEYWORDS_COUNT) {
      res.status(400).json({ error: `Maximum ${MAX_KEYWORDS_COUNT} keywords allowed` });
      return;
    }
    
    // Validate and sanitize each keyword
    const sanitizedKeywords = keywords.map((keyword: any, index: number) => {
      if (typeof keyword !== 'string') {
        throw new Error(`Keyword at index ${index} must be a string`);
      }
      return sanitizeString(keyword, MAX_KEYWORD_LENGTH);
    });
    
    req.body.keywords = sanitizedKeywords;
    
    // Validate separator
    if (separator !== undefined) {
      if (typeof separator !== 'string') {
        res.status(400).json({ error: 'Separator must be a string' });
        return;
      }
      req.body.separator = sanitizeString(separator, MAX_SEPARATOR_LENGTH);
    }
    
    // Validate boolean flags
    if (addNumbers !== undefined && typeof addNumbers !== 'boolean') {
      res.status(400).json({ error: 'addNumbers must be a boolean' });
      return;
    }
    
    if (addSpecial !== undefined && typeof addSpecial !== 'boolean') {
      res.status(400).json({ error: 'addSpecial must be a boolean' });
      return;
    }
    
    if (capitalize !== undefined && typeof capitalize !== 'boolean') {
      res.status(400).json({ error: 'capitalize must be a boolean' });
      return;
    }
    
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid input parameters' });
  }
}

// Validate passphrase input
export function validatePassphrase(req: Request, res: Response, next: NextFunction): void {
  try {
    const { wordCount, separator, addNumbers, capitalize } = req.body;
    
    // Validate wordCount
    if (wordCount !== undefined) {
      if (typeof wordCount !== 'number' || !Number.isInteger(wordCount) || wordCount < 3 || wordCount > MAX_WORD_COUNT) {
        res.status(400).json({ error: `Word count must be an integer between 3 and ${MAX_WORD_COUNT}` });
        return;
      }
    }
    
    // Validate separator
    if (separator !== undefined) {
      if (typeof separator !== 'string') {
        res.status(400).json({ error: 'Separator must be a string' });
        return;
      }
      req.body.separator = sanitizeString(separator, MAX_SEPARATOR_LENGTH);
    }
    
    // Validate boolean flags
    if (addNumbers !== undefined && typeof addNumbers !== 'boolean') {
      res.status(400).json({ error: 'addNumbers must be a boolean' });
      return;
    }
    
    if (capitalize !== undefined && typeof capitalize !== 'boolean') {
      res.status(400).json({ error: 'capitalize must be a boolean' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input parameters' });
  }
}

// Validate visitor ID
export function validateVisitorId(req: Request, res: Response, next: NextFunction): void {
  try {
    const { visitorId } = req.body;
    
    if (!visitorId) {
      res.status(400).json({ error: 'Visitor ID is required' });
      return;
    }
    
    if (typeof visitorId !== 'string') {
      res.status(400).json({ error: 'Visitor ID must be a string' });
      return;
    }
    
    if (visitorId.length > MAX_VISITOR_ID_LENGTH) {
      res.status(400).json({ error: `Visitor ID length cannot exceed ${MAX_VISITOR_ID_LENGTH} characters` });
      return;
    }
    
    // Sanitize visitor ID - only allow alphanumeric, hyphens, and underscores
    const sanitized = visitorId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitized.length === 0) {
      res.status(400).json({ error: 'Visitor ID contains invalid characters' });
      return;
    }
    
    req.body.visitorId = sanitized;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid visitor ID' });
  }
}

// Validate JSON body size
export function validateBodySize(req: Request, res: Response, next: NextFunction): void {
  const contentLength = req.get('content-length');
  const MAX_BODY_SIZE = 10240; // 10KB
  
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }
  
  next();
}

