import { handler } from '../lambda/getProductById';
import { products } from '../lib/products';

describe('getProductById', () => {
  it('should return 200 and the correct product if ID exists', async () => {
    const targetProduct = products[0];

    const event = {
      pathParameters: {
        productId: targetProduct.id
      }
    };

    const result: any = await handler(event as any, {} as any, () => { });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(targetProduct);
  });

  it('should return 404 if product ID not found', async () => {
    const event = {
      pathParameters: {
        productId: 'non-existent-id'
      }
    };

    const result: any = await handler(event as any, {} as any, () => { });

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({ message: 'Product not found' });
  });
});
