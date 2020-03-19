import { Entity } from './base';

export interface Category extends Entity {
  id: number;
  name: string;
  desc: string;
}
