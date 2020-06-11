import { Category } from '../entity/category';
import { GraphCMSConsumer } from './apiConsumer';
import { capitalize } from '../utils/capitalize';

export class CategoryRepository extends GraphCMSConsumer {
  public constructor(
    protected readonly url: string,
    protected readonly token: string,
  ) {
    super(url, token);
  }

  public exists = async (name: string): Promise<boolean> => {
    const query = `
      {
        categories(
          where: {
            name: "${capitalize(name)}"
          }
        ) {
          id
        }
      }
    `;

    const result = await this.sendRequest(query);

    return result.body['data']['category'] !== null;
  }

  public findAll = async (): Promise<Category[]> => {
    const query = `
      {
        categories {
          name
        }
      }
    `;

    const result = await this.sendRequest(query);

    return result.body['data']['categories'] as Category[];
  }
}
