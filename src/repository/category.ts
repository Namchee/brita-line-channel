import { Category } from '../entity/category';
import { GraphCMSConsumer } from './apiConsumer';

export class CategoryRepository extends GraphCMSConsumer {
  public constructor(
    protected readonly url: string,
    protected readonly token: string,
  ) {
    super(url, token);
  }

  public findAll = async (): Promise<Category[]> => {
    const query = `
      {
        categories {
          name
        }
      }
    `;

    const result = await this.buildRequest(query);

    return result.body['data']['categories'] as Category[];
  }
}
