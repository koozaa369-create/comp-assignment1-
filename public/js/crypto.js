// สร้าง User Key Half จาก Master Password + Salt
async function generateUserKeyHalf(masterPassword, userSaltHex) {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  // เปลี่ยน Hex Salt เป็น ArrayBuffer
  const saltBuffer = new Uint8Array(userSaltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    256 // 256 bits
  );

  // แปลง ArrayBuffer เป็น Hex String
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}