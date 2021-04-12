export interface Message {
  from: string; // uid who send this message
  encryptedContent: string;
  timestamp: Date;
  seen: boolean;
}

export interface Chat {
  messages?: Message[];
}
