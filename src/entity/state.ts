import { Entity } from './base';
import { StringMap } from '../types';

export interface State extends Entity {
  service: string;
  state: number;
  misc?: StringMap;
}
