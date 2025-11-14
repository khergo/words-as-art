// Utility to check if a password has appeared in known data breaches
// Uses k-Anonymity with the Have I Been Pwned Pwned Passwords API
// No password or full hash is sent over the network

export async function checkPasswordLeaked(password: string): Promise<{ leaked: boolean; count: number }>{
  // Use Web Crypto API to compute SHA-1 hash of the password
  async function sha1Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  try {
    const hash = await sha1Hex(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        // Add padding to mitigate length-based attacks as recommended by the API
        'Add-Padding': 'true',
      },
    });

    if (!res.ok) {
      // If the service is unavailable, fail closed by allowing signup to proceed
      return { leaked: false, count: 0 };
    }

    const text = await res.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [rangeSuffix, countStr] = line.trim().split(':');
      if (rangeSuffix === suffix) {
        const count = parseInt(countStr || '0', 10);
        return { leaked: count > 0, count };
      }
    }

    return { leaked: false, count: 0 };
  } catch (e) {
    // Network or crypto failure - do not block signup
    return { leaked: false, count: 0 };
  }
}
