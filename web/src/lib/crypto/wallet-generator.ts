import { generateMnemonic as scureGenerateMnemonic, mnemonicToSeedSync, validateMnemonic as scureValidateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { derivePath } from 'ed25519-hd-key';
import { HDKey } from '@scure/bip32';
import { HDNodeWallet } from 'ethers';
import { sha256, ripemd160 } from 'ethers';
import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';

import type { DerivedWallet, WalletKeys } from '@/lib/types/wallet';

// ---------------------------------------------------------------------------
// Mnemonic helpers
// ---------------------------------------------------------------------------

/**
 * Generate a new BIP-39 mnemonic phrase.
 *
 * @param wordCount - 12 (128-bit entropy) or 24 (256-bit entropy). Default: 12.
 * @returns A space-separated mnemonic string.
 */
export function generateMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 24 ? 256 : 128;
  return scureGenerateMnemonic(wordlist, strength);
}

/**
 * Validate an existing mnemonic against the BIP-39 english wordlist.
 */
export function validateMnemonic(mnemonic: string): boolean {
  return scureValidateMnemonic(mnemonic, wordlist);
}

// ---------------------------------------------------------------------------
// Solana derivation (Ed25519 via SLIP-0010)
// ---------------------------------------------------------------------------

/**
 * Derive a Solana keypair from a BIP-39 seed.
 *
 * Path: m/44'/501'/0'/0'  (all segments hardened — Ed25519 requires this).
 *
 * The public key *is* the address (base58-encoded 32 bytes).
 */
function deriveSolanaWallet(seed: Uint8Array): WalletKeys {
  const path = "m/44'/501'/0'/0'";
  const { key } = derivePath(path, Buffer.from(seed).toString('hex'));

  // ed25519-hd-key gives us the raw 32-byte private scalar.
  // The "public key" for Ed25519 is the last 32 bytes of the 64-byte
  // expanded keypair, but for Solana address purposes we only need the
  // 32-byte public key point.  We can compute it via tweetnacl or
  // simply use the nacl-compatible approach: the seed IS the private key
  // and the public key is derived from it.
  //
  // We use a lightweight approach: import the ed25519 private key and
  // derive the public key using the noble/ed25519 curve that @scure/bip32
  // bundles internally.  However, since we already have ed25519-hd-key
  // and it only gives us the private key, we compute the public key
  // using the Web Crypto API (Ed25519 support) or a manual derivation.
  //
  // For maximum compatibility (Ed25519 CryptoKey is not available in all
  // browsers yet), we use the `@noble/ed25519` approach bundled via
  // ed25519-hd-key's own dependency tree, or compute manually.
  //
  // The simplest cross-browser approach: use the fact that ed25519-hd-key
  // returns { key, chainCode } where `key` is the 32-byte seed.  We can
  // use tweetnacl-compatible logic or just extract from the key.
  //
  // Since the project doesn't have tweetnacl, let's use the synchronous
  // approach from @noble/curves which @scure/bip32 already depends on:
  const publicKeyBytes = ed25519.getPublicKey(key);
  const address = bs58.encode(publicKeyBytes);
  const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

  return {
    publicKey: publicKeyHex,
    address,
    network: 'solana',
  };
}

// ---------------------------------------------------------------------------
// Bitcoin derivation (secp256k1, P2PKH)
// ---------------------------------------------------------------------------

/**
 * Base58Check encode with a version byte.
 * Used to produce legacy Bitcoin P2PKH addresses (version 0x00).
 */
function base58CheckEncode(version: number, payload: Uint8Array): string {
  // 1. Prepend the version byte
  const versioned = new Uint8Array(1 + payload.length);
  versioned[0] = version;
  versioned.set(payload, 1);

  // 2. Double-SHA-256 checksum (first 4 bytes)
  //    We use ethers.js sha256 which operates on hex strings.
  const hex = '0x' + Buffer.from(versioned).toString('hex');
  const hash1 = sha256(hex);
  const hash2 = sha256(hash1);
  const checksum = Buffer.from(hash2.slice(2), 'hex').subarray(0, 4);

  // 3. Concatenate versioned payload + checksum
  const result = new Uint8Array(versioned.length + 4);
  result.set(versioned);
  result.set(checksum, versioned.length);

  return bs58.encode(result);
}

/**
 * Derive a Bitcoin P2PKH address from a BIP-39 seed.
 *
 * Path: m/44'/0'/0'/0/0
 *
 * Address derivation:
 *  1. Compressed public key (33 bytes)
 *  2. SHA-256 → RIPEMD-160  (= "Hash160")
 *  3. Base58Check with version byte 0x00
 */
function deriveBitcoinWallet(seed: Uint8Array): WalletKeys {
  const masterKey = HDKey.fromMasterSeed(seed);
  const child = masterKey.derive("m/44'/0'/0'/0/0");

  if (!child.publicKey) {
    throw new Error('Bitcoin key derivation failed: no public key produced.');
  }

  const pubKeyBytes = child.publicKey; // 33-byte compressed
  const pubKeyHex = '0x' + Buffer.from(pubKeyBytes).toString('hex');

  // Hash160 = RIPEMD-160(SHA-256(pubkey))
  const shaHash = sha256(pubKeyHex);
  const hash160Hex = ripemd160(shaHash); // returns 0x-prefixed hex

  const hash160Bytes = new Uint8Array(
    Buffer.from(hash160Hex.slice(2), 'hex'),
  );

  // P2PKH address: Base58Check(0x00 || hash160)
  const address = base58CheckEncode(0x00, hash160Bytes);
  const publicKeyHex = Buffer.from(pubKeyBytes).toString('hex');

  return {
    publicKey: publicKeyHex,
    address,
    network: 'bitcoin',
  };
}

// ---------------------------------------------------------------------------
// BNB / BSC derivation (secp256k1, EVM)
// ---------------------------------------------------------------------------

/**
 * Derive a BNB Smart Chain (EVM) address from a BIP-39 mnemonic.
 *
 * Path: m/44'/60'/0'/0/0  (identical to Ethereum)
 *
 * Uses ethers.js v6 `HDNodeWallet.fromPhrase` which handles BIP-39 → BIP-32
 * → secp256k1 derivation internally.
 */
function deriveBnbWallet(mnemonic: string): WalletKeys {
  const path = "m/44'/60'/0'/0/0";
  const hdNode = HDNodeWallet.fromPhrase(mnemonic, undefined, path);

  return {
    publicKey: hdNode.publicKey, // 0x-prefixed compressed public key hex
    address: hdNode.address,     // EIP-55 checksummed address
    network: 'bnb',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derive wallet addresses for **all** supported networks from a single
 * BIP-39 mnemonic phrase.
 *
 * @param mnemonic - A valid BIP-39 mnemonic (12 or 24 words).
 * @returns A {@link DerivedWallet} containing keys for Solana, Bitcoin, and BNB.
 * @throws If the mnemonic is invalid.
 */
export async function deriveAllWallets(
  mnemonic: string,
): Promise<DerivedWallet> {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase.');
  }

  // BIP-39 mnemonic → 64-byte seed (no passphrase).
  const seed = mnemonicToSeedSync(mnemonic);

  const solana = deriveSolanaWallet(seed);
  const bitcoin = deriveBitcoinWallet(seed);
  const bnb = deriveBnbWallet(mnemonic);

  return { solana, bitcoin, bnb };
}
