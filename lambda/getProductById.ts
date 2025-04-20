import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from '../lib/products';

export const handler: APIGatewayProxyHandler = async (event: any) => {
  try {
    const { productId } = event.pathParameters || {};

    // Simulate async lookup
    const product = await Promise.resolve(
      products.find((p) => p.id === productId)
    );

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching product by ID' }),
    };
  }
};
