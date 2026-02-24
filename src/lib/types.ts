/** Normalized post input used across all providers */
export interface PostInput {
  title: string;
  subtitle?: string;
  bodyMarkdown: string;
  tags?: string[];
  canonicalUrl?: string;
  publishStatus: "draft" | "public";
}

/** Result from a single platform publish attempt */
export interface PublishResult {
  success: boolean;
  remoteId?: string;
  remoteUrl?: string;
  error?: string;
}

/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Provider credential configs (decrypted shapes) */
export interface MediumCredentialConfig {
  token: string;
}

export interface WordpressCredentialConfig {
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

export interface SubstackCredentialConfig {
  publicationUrl: string;
  authToken: string;
}

export type ProviderConfig =
  | MediumCredentialConfig
  | WordpressCredentialConfig
  | SubstackCredentialConfig;
