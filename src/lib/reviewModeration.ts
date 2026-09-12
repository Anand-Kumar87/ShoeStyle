// ==========================================
// 🛡️ REVIEW CONTENT MODERATION & QUALITY FILTER
// ==========================================

const PROFANITY_LIST = [
  // English common abusive words
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'slut', 'whore',
  'fucker', 'fucking', 'bullshit', 'motherfucker', 'dumbass', 'retard',
  // Hindi abusive / vulgar words
  'chutiya', 'chutiye', 'bhenchod', 'madarchod', 'bhosdike', 'gandu', 'harami', 'kameena',
  'saala', 'kutte', 'laude', 'lund', 'tatte', 'randi', 'gaand', 'choot', 'bhosdi'
];

const SPAM_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /www\.[^\s]+/i,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // emails
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // phone numbers
  /\b(telegram|whatsapp|crypto|bitcoin|casino|free cash|discount code|promo code)\b/i
];

export interface ModerationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Checks whether a string looks like a random keyboard smash / gibberish.
 * e.g. "fsgdfhjgkjhg", "dasfghgjk,j.", "aaaaaaaaa"
 */
function isGibberish(text: string): boolean {
  const clean = text.toLowerCase().trim();

  // 1. Repeated consecutive identical characters (e.g. "aaaa", "zzzz")
  if (/(.)\1{3,}/.test(clean)) {
    return true;
  }

  // 2. Tokenize words
  const words = clean.split(/[\s,.-]+/).filter(w => w.length > 0);
  if (words.length === 0) return true;

  let gibberishWords = 0;

  for (const word of words) {
    // A single word that is too long with no vowels or too many consonants
    if (word.length >= 5) {
      const vowels = (word.match(/[aeiou]/gi) || []).length;
      const consonants = (word.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;

      // Zero vowels in a 5+ letter word (e.g. "fsgdfhjgkjhg")
      if (vowels === 0 && consonants >= 5) {
        return true;
      }

      // 5 or more consonants in a row without a vowel
      if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(word)) {
        return true;
      }

      // Very low vowel ratio in longer words
      if (word.length >= 7 && vowels / word.length < 0.15) {
        gibberishWords++;
      }
    }
  }

  // If more than half the words look like gibberish
  if (gibberishWords > 0 && gibberishWords >= words.length / 2) {
    return true;
  }

  return false;
}

/**
 * Validates a review comment for quality, spam, profanity, and length.
 */
export function validateReviewContent(comment: string, rating: number): ModerationResult {
  if (!comment || typeof comment !== 'string') {
    return { isValid: false, error: 'Review text cannot be empty.' };
  }

  const trimmed = comment.trim();

  // Rating check (1-5)
  if (!rating || rating < 1 || rating > 5) {
    return { isValid: false, error: 'Rating must be between 1 and 5 stars.' };
  }

  // Minimum length check (At least 20 characters as requested)
  if (trimmed.length < 20) {
    return {
      isValid: false,
      error: `Please write a meaningful review with at least 20 characters (current: ${trimmed.length}).`,
    };
  }

  // Maximum length check (500 characters)
  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: `Review is too long. Maximum 500 characters allowed (current: ${trimmed.length}).`,
    };
  }

  // Minimum word count check (At least 3 words)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) {
    return {
      isValid: false,
      error: 'Please describe your experience in at least 3 words (e.g. fit, comfort, quality).',
    };
  }

  // Gibberish / Keyboard Smash check
  if (isGibberish(trimmed)) {
    return {
      isValid: false,
      error: 'Review contains random or meaningless characters. Please write a genuine review.',
    };
  }

  // Spam & Contact Info check
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Reviews cannot contain external links, phone numbers, or promotional text.',
      };
    }
  }

  // Profanity / Abuse check
  const lowerText = trimmed.toLowerCase();
  for (const badWord of PROFANITY_LIST) {
    // Word boundary match
    const regex = new RegExp(`\\b${badWord}\\b`, 'i');
    if (regex.test(lowerText)) {
      return {
        isValid: false,
        error: 'Inappropriate or abusive language is not allowed. Please keep reviews constructive.',
      };
    }
  }

  return { isValid: true };
}
