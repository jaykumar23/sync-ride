import crypto from 'crypto';
import { Trip } from '../models/Trip';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: 0,O,1,I
const CODE_LENGTH = 6;

export async function generateTripCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRandomCode();
    
    // Check for collision in MongoDB
    const existing = await Trip.findOne({ tripCode: code });
    if (!existing) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate unique trip code after maximum attempts');
}

function generateRandomCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = bytes[i] % CHARACTERS.length;
    code += CHARACTERS[index];
  }
  
  return code;
}
