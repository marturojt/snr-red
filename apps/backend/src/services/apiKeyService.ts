import crypto from 'crypto';
import { ApiKey, IApiKey } from '../models/ApiKey';
import { User } from '../models/User';
import { ApiKeyScope } from '@url-shortener/types';

const TOKEN_PREFIX = 'snr_live_';
const DEFAULT_SCOPES: ApiKeyScope[] = ['urls:read', 'urls:write', 'analytics:read'];

export interface VerifiedApiKey {
  keyId: string;
  userId: string;
  plan: 'free' | 'premium';
  scopes: ApiKeyScope[];
}

export class ApiKeyService {
  private static hash(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Create a new API key for a user. Returns the persisted record plus the raw
   * token, which is only available here and never retrievable again.
   */
  static async generate(
    userId: string,
    name: string,
    scopes: ApiKeyScope[] = DEFAULT_SCOPES
  ): Promise<{ apiKey: IApiKey; token: string }> {
    // 32 random bytes -> 64 hex chars of entropy after the prefix
    const secret = crypto.randomBytes(32).toString('hex');
    const token = `${TOKEN_PREFIX}${secret}`;
    // Prefix shown in the dashboard: e.g. "snr_live_ab12cd34"
    const keyPrefix = `${TOKEN_PREFIX}${secret.slice(0, 8)}`;

    const apiKey = new ApiKey({
      userId,
      name,
      keyPrefix,
      keyHash: this.hash(token),
      scopes: scopes.length ? scopes : DEFAULT_SCOPES
    });

    await apiKey.save();
    return { apiKey, token };
  }

  /**
   * Verify a raw token. Returns the owning user's identity/plan and the key's
   * scopes, or null if invalid/revoked/owner-inactive. Updates lastUsedAt.
   */
  static async verify(rawToken: string): Promise<VerifiedApiKey | null> {
    if (!rawToken || !rawToken.startsWith(TOKEN_PREFIX)) {
      return null;
    }

    const apiKey = await ApiKey.findOne({ keyHash: this.hash(rawToken), revoked: false });
    if (!apiKey) {
      return null;
    }

    const user = await User.findOne({ _id: apiKey.userId, isActive: true });
    if (!user) {
      return null;
    }

    // Best-effort usage stamp; don't block the request on it.
    ApiKey.updateOne({ _id: apiKey._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {});

    return {
      keyId: apiKey._id.toString(),
      userId: apiKey.userId,
      plan: user.plan,
      scopes: apiKey.scopes
    };
  }

  static async list(userId: string): Promise<IApiKey[]> {
    return ApiKey.find({ userId }).sort({ createdAt: -1 });
  }

  /** Soft-revoke a key. Only affects keys owned by the given user. */
  static async revoke(userId: string, keyId: string): Promise<boolean> {
    const result = await ApiKey.findOneAndUpdate(
      { _id: keyId, userId },
      { $set: { revoked: true } },
      { new: true }
    );
    return !!result;
  }
}
