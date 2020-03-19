import { Redis } from 'ioredis';
import { State } from './../entity/state';
import { StringMap } from './../utils';

export interface StateRepository {
  findById(id: string): Promise<State | null>;
  create(
    id: string,
    service: string,
    state: number,
    misc?: StringMap,
  ): Promise<boolean>;
}

export class StateRepositoryRedis implements StateRepository {
  private static readonly EXPIRATION_TIME =
    Number(process.env.EXPIRATION_TIME) || 180;

  public constructor(private readonly client: Redis) { }

  public findById = async (id: string): Promise<State | null> => {
    const state = await this.client.get(id);

    return state ?
      {
        id,
        ...JSON.parse(state),
      } :
      null;
  }

  public create = async (
    id: string,
    service: string,
    state: number,
    misc?: StringMap,
  ): Promise<boolean> => {
    if (await this.findById(id)) {
      return false;
    }

    const stateData = {
      service,
      state,
      misc,
    };

    const insertResult = await this.client.setex(
      id,
      StateRepositoryRedis.EXPIRATION_TIME,
      JSON.stringify(stateData),
    );

    return insertResult === 'OK';
  }

  public delete = async (id: string): Promise<boolean> => {
    if (!await this.findById(id)) {
      return false;
    }

    const deleteResult = await this.client.del(id);

    return deleteResult > 0;
  }

  public update = async (state: State): Promise<boolean> => {
    if (!await this.findById(state.id)) {
      return false;
    }

    const stateData = { ...state };
    delete stateData.id;

    const updateResult = await this.client.setex(
      state.id,
      StateRepositoryRedis.EXPIRATION_TIME,
      JSON.stringify(stateData),
    );

    return updateResult === 'OK';
  }
}
