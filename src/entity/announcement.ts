import { Entity } from './base';

export interface Announcement extends Entity {
  id: number;
  title: string;
  contents: string;
  validUntil: Date;
}
