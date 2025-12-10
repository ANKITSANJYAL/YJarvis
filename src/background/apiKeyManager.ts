const STORAGE_KEY = 'OPENAI_API_KEY_ENC';
const IV_KEY = 'OPENAI_API_KEY_IV';

async function getCryptoKey(): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('jarvis-yt-assistant-fixed-salt'),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('jarvis-salt'), iterations: 100000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(text: string): Promise<{ cipher: ArrayBuffer; iv: Uint8Array }> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return { cipher, iv };
}

async function decrypt(cipher: ArrayBuffer, iv: Uint8Array): Promise<string> {
  const key = await getCryptoKey();
  // Use ArrayBuffer for IV to satisfy BufferSource typing
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, cipher);
  return new TextDecoder().decode(plain);
}

export const apiKeyManager = {
  async setKey(key: string): Promise<void> {
    const { cipher, iv } = await encrypt(key);
    await chrome.storage.local.set({ [STORAGE_KEY]: Array.from(new Uint8Array(cipher)), [IV_KEY]: Array.from(iv) });
  },
  async getKey(): Promise<string | null> {
    const data = await chrome.storage.local.get([STORAGE_KEY, IV_KEY]);
    const cipherArr = data[STORAGE_KEY] as number[] | undefined;
    const ivArr = data[IV_KEY] as number[] | undefined;
    if (!cipherArr || !ivArr) return null;
    const cipher = new Uint8Array(cipherArr).buffer;
    const iv = new Uint8Array(ivArr);
    try {
      return await decrypt(cipher, iv);
    } catch {
      return null;
    }
  },
  async clearKey(): Promise<void> {
    await chrome.storage.local.remove([STORAGE_KEY, IV_KEY]);
  },
};