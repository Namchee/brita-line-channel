import { Model } from 'mongoose';
import { Subscription } from '../entity/subscription';

export class SubscriptionRepository {
  public constructor(private readonly model: Model<Subscription>) {}

  public exist = async (id: string): Promise<boolean> => {
    return this.model.exists({ _id: id });
  }

  public getUserSubscription = async (
    id: string,
  ): Promise<Subscription | null> => {
    return this.model.findOne({ _id: id }).lean();
  }

  public getMatchingSubscriptions = async (
    category: string,
  ): Promise<string[]> => {
    const subscriptions = await this.model.find(
      { categories: { $in: [category] } },
    );

    return subscriptions.map(doc => doc._id);
  }

  public addSubscription = async (
    id: string,
    category: string,
  ): Promise<boolean> => {
    if (!await this.exist(id)) {
      const result = await this.model.create({
        _id: id,
        categories: [category],
      });

      return !!result;
    }

    const result = await this.model.findOneAndUpdate(
      { _id: id },
      { $push: { categories: category } },
    );

    return !!result;
  }

  public deleteSubscription = async (
    id: string,
    category: string,
  ): Promise<boolean> => {
    if (!await this.exist(id)) {
      return false;
    }

    const result = await this.model.findByIdAndUpdate(
      { id },
      { $pull: { categories: category } },
    );

    // Delete subscription if subscribed categories is zero
    // need to find a better way to do this
    const modified = await this.model.findOne({ _id: id });

    if (modified?.categories.length === 0) {
      await this.model.findByIdAndDelete({ _id: id });
    }

    return !!result;
  }
}
