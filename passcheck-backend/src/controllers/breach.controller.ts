import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Check if password has been in a data breach (using Have I Been Pwned API)
export const checkBreach = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash the password using SHA-1
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    try {
      // Query the Have I Been Pwned API
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'PassCheck-App'
        }
      });

      const hashes = response.data.split('\n');
      let breachCount = 0;

      for (const hashLine of hashes) {
        const [hashSuffix, count] = hashLine.split(':');
        if (hashSuffix === suffix) {
          breachCount = parseInt(count.trim(), 10);
          break;
        }
      }

      res.json({
        breached: breachCount > 0,
        count: breachCount,
        message: breachCount > 0 
          ? `This password has been seen ${breachCount.toLocaleString()} times in data breaches. Do not use it!`
          : 'This password has not been found in any known data breaches.'
      });
    } catch (apiError) {
      console.error('Error querying HIBP API:', apiError);
      res.json({
        breached: false,
        count: 0,
        message: 'Could not check breach database. Please try again later.',
        error: 'API_UNAVAILABLE'
      });
    }
  } catch (error) {
    console.error('Error checking breach:', error);
    res.status(500).json({ error: 'Failed to check for breaches' });
  }
};

// Check if password is in common password lists
export const checkCommonPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const lowerPassword = password.toLowerCase();
    
    // Check against local wordlists
    const wordlistPath = process.env.WORDLIST_PATH || path.join(__dirname, '../../data/wordlists');
    const wordlistFiles = [
      'ignis-1K.txt',
      'ignis-10K.txt'
    ];

    let isCommon = false;
    let foundIn = '';

    try {
      for (const file of wordlistFiles) {
        const filePath = path.join(wordlistPath, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const passwords = content.split('\n').map(p => p.trim().toLowerCase());
          
          if (passwords.includes(lowerPassword)) {
            isCommon = true;
            foundIn = file;
            break;
          }
        } catch (fileError) {
          console.log(`Could not read ${file}:`, fileError);
          continue;
        }
      }
    } catch (error) {
      console.log('Error reading wordlists:', error);
    }

    res.json({
      isCommon,
      foundIn,
      message: isCommon 
        ? `This password is in the common passwords list (${foundIn}). It's easily guessable!`
        : 'This password is not in our common passwords database.'
    });
  } catch (error) {
    console.error('Error checking common password:', error);
    res.status(500).json({ error: 'Failed to check common passwords' });
  }
};
