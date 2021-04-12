import { Bson } from "https://deno.land/x/mongo@v0.22.0/mod.ts";

export interface ContactType {
  hashedUsername: string;
  nickName: string;
  chat?: Bson.ObjectId;
}

export interface UserSchema {
  hashedUsername: string;
  hashedPassword: string;
  encryptedPrivateKey: string;
  publicKey: string;
  isOnline?: boolean;
  contactList?: ContactType[];
}
