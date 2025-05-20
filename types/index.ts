// API Response types
export interface TokenResponse {
  token: string;
  id: string;
}

export interface Account {
  id: string;
  address: string;
  password: string;
  username: string;
  token: string;
  siteUsedFor: string;
  createdAt: number;
  expiresAt: number;
}

export interface Message {
  id: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  text: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  hydraTotalItems: number;
  hydraMember: Message[];
}

export interface MessageResponse {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  downloadUrl: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

// App Settings
export interface AppSettings {
  expirationMinutes: number;
  pollingIntervalSeconds: number;
}

export interface SavedEmail {
  id: string;
  address: string;
  username: string;
  password: string;
  createdAt: number;
  siteUsedFor?: string;
}