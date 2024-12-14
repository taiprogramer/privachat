/**
 * Each user has many friends. (Friendship)
 * User and friend have only one chat (Friendship.chatId)
 * Each chat have many messages. (Message)
 * */

import { ObjectId } from "@db/mongo";

export type IFriendship = {
  _id?: { $oid: string };
  uid: string; // who add friend to his/her friend list.
  friendId: string; // who will be added
  nickname: string; // friend's nick name
  chatId?: ObjectId; // primary key of Chat
};

export type IUser = {
  _id?: { $oid: string };
  uid: string; // sha-256 hex
  pass: string; // scrypt
  priKey: string; // openpgpjs encrypted private key
  pubKey: string; // openpgpjs public key
};

export interface IChat {
  _id?: { $oid: string };
}

export type IMessage = {
  _id?: { $oid: string };
  fromUID: string; // uid of sender
  toUID: string; // uid of receiver
  content: string; // openpgp encrypt content
  timestamp: Date; // when message was sent
  seen: boolean; // is message seen or not
  chatId: ObjectId; // primary key of Chat
};
