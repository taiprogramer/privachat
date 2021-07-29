/**
* Each user has many friends. (Friendship)
* User and friend have only one chat (Friendship.chatId)
* Each chat have many messages. (Message)
* */

import { Bson } from "../deps.ts";

export type FriendshipSchema = {
  _id: { $oid: string };
  uid: string; // who add friend to his/her friend list.
  friendId: string; // who will be added
  nickname: string; // friend's nick name
  chatId: Bson.ObjectId; // primary key of Chat
};

export type UserSchema = {
  _id: { $oid: string };
  uid: string; // sha-256 hex
  pass: string; // bcrypt
  priKey: string; // openpgpjs encrypted private key
  pubKey: string; // openpgpjs public key
};

export interface ChatSchema {
  _id: { $oid: string };
}

export type MessageSchema = {
  _id: { $oid: string };
  fromUID: string; // uid of sender
  toUID: string; // uid of receiver
  content: string; // openpgp encrypt content
  timestamp: Date; // ...
  seen: boolean; // is message seen or not
  chatId: Bson.ObjectId; // primary key of Chat
};
