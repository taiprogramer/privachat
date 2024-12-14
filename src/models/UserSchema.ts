import { ObjectId } from "@db/mongo";

export interface ContactType {
  hashedUsername: string;
  nickName: string;
  chat?: ObjectId;
}

export interface UserSchema {
  hashedUsername: string;
  hashedPassword: string;
  encryptedPrivateKey: string;
  publicKey: string;
  isOnline?: boolean;
  contactList?: ContactType[];
}
