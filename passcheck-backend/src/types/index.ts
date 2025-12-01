export interface PasswordAnalysis {
  score: number;
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  length: number;
  entropy: number;
  characteristics: {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    charDiversity: number;
  };
  crackTime: {
    onlineThrottling: string;
    onlineNoThrottling: string;
    offlineSlowHashing: string;
    offlineFastHashing: string;
  };
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

export interface GeneratorOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecial?: boolean;
  excludeAmbiguous?: boolean;
  quantity?: number;
}

export interface MemorablePasswordOptions {
  keywords: string[];
  separator?: string;
  addNumbers?: boolean;
  addSpecial?: boolean;
  capitalize?: boolean;
}

export interface PassphraseOptions {
  wordCount?: number;
  separator?: string;
  addNumbers?: boolean;
  capitalize?: boolean;
}
