import { Document } from 'mongoose';

export interface Subscription extends Document {
  categories: string[];
}
