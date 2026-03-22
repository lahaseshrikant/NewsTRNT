import fs from 'fs/promises';
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from './config';

interface StorageProvider {
  uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

const normalizeKey = (rawKey: string): string => rawKey.replace(/^\/+/, '').replace(/\\/g, '/');

const trimSlash = (value: string): string => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`);

class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), config.storage.localBaseDir || 'public');
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const normalizedKey = normalizeKey(key);
    const destination = path.join(this.baseDir, normalizedKey);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, buffer);
    return this.getPublicUrl(normalizedKey);
  }

  async deleteFile(key: string): Promise<void> {
    const normalizedKey = normalizeKey(key);
    const target = path.join(this.baseDir, normalizedKey);
    try {
      await fs.unlink(target);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getPublicUrl(key: string): string {
    const normalizedKey = normalizeKey(key);
    if (config.storage.cdnDomain) {
      return `${trimSlash(config.storage.cdnDomain)}${ensureLeadingSlash(normalizedKey)}`;
    }
    return ensureLeadingSlash(normalizedKey);
  }
}

class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor() {
    const r2 = config.storage.r2;

    if (!r2.bucket || !r2.endpoint || !r2.accessKeyId || !r2.secretAccessKey) {
      throw new Error('R2 storage selected but required Cloudflare R2 env vars are missing.');
    }

    this.bucket = r2.bucket;
    this.endpoint = trimSlash(r2.endpoint);

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: r2.accessKeyId,
        secretAccessKey: r2.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const normalizedKey = normalizeKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: normalizedKey,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return this.getPublicUrl(normalizedKey);
  }

  async deleteFile(key: string): Promise<void> {
    const normalizedKey = normalizeKey(key);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalizedKey,
      })
    );
  }

  getPublicUrl(key: string): string {
    const normalizedKey = normalizeKey(key);

    if (config.storage.cdnDomain) {
      return `${trimSlash(config.storage.cdnDomain)}${ensureLeadingSlash(normalizedKey)}`;
    }

    return `${this.endpoint}/${this.bucket}/${normalizedKey}`;
  }
}

let provider: StorageProvider;
try {
  provider = config.storage.provider === 'r2'
    ? new R2StorageProvider()
    : new LocalStorageProvider();
} catch (err) {
  console.warn('[Storage] Failed to initialize storage provider, falling back to local:', err);
  provider = new LocalStorageProvider();
}

export const uploadFile = async (buffer: Buffer, key: string, mimeType: string): Promise<string> => {
  return provider.uploadFile(buffer, key, mimeType);
};

export const deleteFile = async (key: string): Promise<void> => {
  return provider.deleteFile(key);
};

export const getPublicUrl = (key: string): string => {
  return provider.getPublicUrl(key);
};

export const extractStorageKeyFromUrl = (url: string): string | null => {
  if (!url) return null;

  if (url.startsWith('/')) {
    return normalizeKey(url);
  }

  try {
    const parsed = new URL(url);
    if (config.storage.cdnDomain) {
      const cdn = new URL(config.storage.cdnDomain);
      if (cdn.hostname === parsed.hostname) {
        return normalizeKey(parsed.pathname);
      }
    }

    const endpoint = config.storage.r2.endpoint ? trimSlash(config.storage.r2.endpoint) : '';
    const bucket = config.storage.r2.bucket;

    if (endpoint && bucket && url.startsWith(`${endpoint}/${bucket}/`)) {
      return normalizeKey(url.slice(`${endpoint}/${bucket}/`.length));
    }

    return normalizeKey(parsed.pathname);
  } catch {
    return null;
  }
};
