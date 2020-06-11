import { post, SuperAgentRequest } from 'superagent';

export abstract class GraphCMSConsumer {
  public constructor(
    protected readonly url: string,
    protected readonly token: string,
  ) { }

  protected sendRequest = (
    query: string,
  ): SuperAgentRequest => {
    return post(this.url)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.token}`)
      .send(JSON.stringify({ query }));
  }
}
