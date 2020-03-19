import { Entity } from './base';
import { StringMap } from '../utils';

export interface State extends Entity {
  id: string;
  service: string;
  state: number;
  misc?: StringMap;
}
