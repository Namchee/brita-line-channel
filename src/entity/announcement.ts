import { Entity } from './base';
import { Category } from './category';

export interface Announcement extends Entity {
  title: string;
  contents: string;
  validUntil: Date;
  categories: Category[];
}
