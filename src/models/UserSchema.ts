export interface ContactType {
  hashedUsername: string;
  nickName: string;
}

export interface UserSchema {
  hashedUsername: string;
  hashedPassword: string;
  encryptedPrivateKey: string;
  publicKey: string;
  isOnline?: boolean;
  contactList?: [];
}
