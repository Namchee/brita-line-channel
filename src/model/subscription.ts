import { model, Schema } from 'mongoose';
import { Subscription } from '../entity/subscription';

const schema = new Schema({
  categories: [{ type: String, unique: true }],
});

export const subscriptionModel = model<Subscription>('Subscription', schema);
