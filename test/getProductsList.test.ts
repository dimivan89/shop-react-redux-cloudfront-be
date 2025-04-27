import { handler } from '../lambda/getProductsList';
import { products } from '../lib/products';

describe('getProductsList', () => {
  it('should return 200 with product list', async () => {
    const result: any = await handler({} as any, {} as any, () => { });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(products);
  });
});
