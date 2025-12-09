import { Request, Response } from 'express';
import crypto from 'crypto';

// Generate random password with customizable options
export const generateRandomPassword = async (req: Request, res: Response) => {
  try {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSpecial = true,
      excludeAmbiguous = false,
      quantity = 1
    } = req.body;

    // Validation is handled by middleware, but double-check for safety
    if (length < 4 || length > 128) {
      return res.status(400).json({ error: 'Length must be between 4 and 128' });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 10' });
    }

    const passwords = [];
    for (let i = 0; i < quantity; i++) {
      const password = generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSpecial,
        excludeAmbiguous
      });
      passwords.push(password);
    }

    res.json({ passwords });
  } catch (error) {
    console.error('Error generating random password:', error);
    res.status(500).json({ error: 'Failed to generate password' });
  }
};

// Generate memorable password from keywords
export const generateMemorablePassword = async (req: Request, res: Response) => {
  try {
    const { keywords = [], separator = '-', addNumbers = true, addSpecial = false, capitalize = true } = req.body;

    // Validation is handled by middleware, but double-check for safety
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'At least one keyword is required' });
    }

    // Process keywords
    let processedKeywords = keywords.map((word: string) => {
      let processed = word.trim().toLowerCase();
      
      if (capitalize) {
        processed = processed.charAt(0).toUpperCase() + processed.slice(1);
      }
      
      // Random character substitution for extra security - using crypto
      if (crypto.randomInt(0, 2) === 1) {
        processed = processed
          .replace(/a/g, crypto.randomInt(0, 2) === 1 ? '@' : 'a')
          .replace(/e/g, crypto.randomInt(0, 2) === 1 ? '3' : 'e')
          .replace(/i/g, crypto.randomInt(0, 2) === 1 ? '!' : 'i')
          .replace(/o/g, crypto.randomInt(0, 2) === 1 ? '0' : 'o')
          .replace(/s/g, crypto.randomInt(0, 2) === 1 ? '$' : 's');
      }
      
      return processed;
    });

    let password = processedKeywords.join(separator);

    // Add random numbers - using crypto
    if (addNumbers) {
      const randomNum = crypto.randomInt(100, 9999);
      password += separator + randomNum;
    }

    // Add special characters - using crypto
    if (addSpecial) {
      const specialChars = '!@#$%^&*';
      const randomSpecial = specialChars[crypto.randomInt(0, specialChars.length)];
      password += randomSpecial;
    }

    res.json({ password });
  } catch (error) {
    console.error('Error generating memorable password:', error);
    res.status(500).json({ error: 'Failed to generate memorable password' });
  }
};

// Generate passphrase using random words
export const generatePassphrase = async (req: Request, res: Response) => {
  try {
    const { wordCount = 4, separator = '-', addNumbers = true, capitalize = true } = req.body;

    // Validation is handled by middleware, but double-check for safety
    if (wordCount < 3 || wordCount > 10) {
      return res.status(400).json({ error: 'Word count must be between 3 and 10' });
    }

    // Common word list for passphrases
    const commonWords = [
      'correct', 'horse', 'battery', 'staple', 'random', 'secure', 'strong', 'password',
      'mountain', 'river', 'ocean', 'forest', 'sunrise', 'sunset', 'cloud', 'storm',
      'dragon', 'phoenix', 'wizard', 'castle', 'knight', 'sword', 'shield', 'arrow',
      'planet', 'galaxy', 'comet', 'meteor', 'lunar', 'solar', 'cosmic', 'stellar',
      'thunder', 'lightning', 'rainbow', 'crystal', 'diamond', 'emerald', 'sapphire',
      'tiger', 'eagle', 'wolf', 'falcon', 'panther', 'leopard', 'cheetah', 'jaguar',
      'silver', 'golden', 'bronze', 'copper', 'iron', 'steel', 'titanium', 'platinum',
      'whisper', 'shadow', 'phantom', 'spirit', 'ghost', 'specter', 'wraith', 'shade'
    ];

    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = crypto.randomInt(0, commonWords.length);
      let word = commonWords[randomIndex];
      
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      selectedWords.push(word);
    }

    let passphrase = selectedWords.join(separator);

    if (addNumbers) {
      const randomNum = crypto.randomInt(100, 9999);
      passphrase += separator + randomNum;
    }

    res.json({ passphrase });
  } catch (error) {
    console.error('Error generating passphrase:', error);
    res.status(500).json({ error: 'Failed to generate passphrase' });
  }
};

// Helper function to generate password
function generatePassword(options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
  excludeAmbiguous: boolean;
}): string {
  let charset = '';
  let password = '';

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const ambiguous = 'il1Lo0O';

  if (options.includeLowercase) charset += lowercase;
  if (options.includeUppercase) charset += uppercase;
  if (options.includeNumbers) charset += numbers;
  if (options.includeSpecial) charset += special;

  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(char => !ambiguous.includes(char)).join('');
  }

  if (charset.length === 0) {
    charset = lowercase + numbers; // fallback
  }

  // Ensure at least one character from each selected type
  if (options.includeLowercase) password += lowercase[crypto.randomInt(0, lowercase.length)];
  if (options.includeUppercase) password += uppercase[crypto.randomInt(0, uppercase.length)];
  if (options.includeNumbers) password += numbers[crypto.randomInt(0, numbers.length)];
  if (options.includeSpecial) password += special[crypto.randomInt(0, special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < options.length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }

  // Shuffle the password using cryptographically secure random
  const passwordArray = password.split('');
  // Fisher-Yates shuffle with crypto.randomInt
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  return passwordArray.join('');
}
