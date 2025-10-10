import { Document, Types } from 'mongoose';
import { Film } from './film';

export type PopulatedDocument<T, P> = Omit<T, keyof P> & P;

export interface PopulatedList {
  _id: Types.ObjectId;
  title: string;
  films: Film[];
  user: {
    _id: Types.ObjectId;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}