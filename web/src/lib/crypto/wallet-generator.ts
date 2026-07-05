import { generateMnemonic as scureGenerateMnemonic, mnemonicToSeedSync, validateMnemonic as scureValidateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { derivePath } from 'ed25519-hd-key';
import { HDKey } from '@scure/bip32';
import { HDNodeWallet } from 'ethers';
import { sha256, ripemd160 } from 'ethers';
import { ed25519 } from '@noble/curves/ed25519.js';
import bs58 from 'bs58';

import type { DerivedWallet, WalletKeys } from '@/lib/types/wallet';

export function generateMnemonic(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 24 ? 256 : 128;
  return scureGenerateMnemonic(wordlist, strength);
}

export function validateMnemonic(mnemonic: string): boolean {
  return scureValidateMnemonic(mnemonic, wordlist);
}

function deriveSolanaWallet(seed: Uint8Array): WalletKeys {
  const path = "m/44'/501'/0'/0'";
  const { key } = derivePath(path, Buffer.from(seed).toString('hex'));

  const publicKeyBytes = ed25519.getPublicKey(key);
  const address = bs58.encode(publicKeyBytes);
  const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

  return {
    publicKey: publicKeyHex,
    address,
    network: 'solana',
  };
}

function base58CheckEncode(version: number, payload: Uint8Array): string {
  const versioned = new Uint8Array(1 + payload.length);
  versioned[0] = version;
  versioned.set(payload, 1);

  const hex = '0x' + Buffer.from(versioned).toString('hex');
  const hash1 = sha256(hex);
  const hash2 = sha256(hash1);
  const checksum = Buffer.from(hash2.slice(2), 'hex').subarray(0, 4);

  const result = new Uint8Array(versioned.length + 4);
  result.set(versioned);
  result.set(checksum, versioned.length);

  return bs58.encode(result);
}

function deriveBitcoinWallet(seed: Uint8Array): WalletKeys {
  const masterKey = HDKey.fromMasterSeed(seed);
  const child = masterKey.derive("m/44'/0'/0'/0/0");

  if (!child.publicKey) {
    throw new Error('Error al derivar llave de Bitcoin: no se generó clave pública.');
  }

  const pubKeyBytes = child.publicKey;
  const pubKeyHex = '0x' + Buffer.from(pubKeyBytes).toString('hex');

  const shaHash = sha256(pubKeyHex);
  const hash160Hex = ripemd160(shaHash);

  const hash160Bytes = new Uint8Array(
    Buffer.from(hash160Hex.slice(2), 'hex'),
  );

  const address = base58CheckEncode(0x00, hash160Bytes);
  const publicKeyHex = Buffer.from(pubKeyBytes).toString('hex');

  return {
    publicKey: publicKeyHex,
    address,
    network: 'bitcoin',
  };
}

function deriveBnbWallet(mnemonic: string): WalletKeys {
  const path = "m/44'/60'/0'/0/0";
  const hdNode = HDNodeWallet.fromPhrase(mnemonic, undefined, path);

  return {
    publicKey: hdNode.publicKey,
    address: hdNode.address,
    network: 'bnb',
  };
}

export async function deriveAllWallets(
  mnemonic: string,
): Promise<DerivedWallet> {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Frase semilla inválida.');
  }

  const seed = mnemonicToSeedSync(mnemonic);

  const solana = deriveSolanaWallet(seed);
  const bitcoin = deriveBitcoinWallet(seed);
  const bnb = deriveBnbWallet(mnemonic);

  return { solana, bitcoin, bnb };
}
