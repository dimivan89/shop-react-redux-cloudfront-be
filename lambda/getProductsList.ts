import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from '../lib/products';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    // Simulate async behavior (optional for mock data)
    const data = await Promise.resolve(products);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching product list' }),
    };
  }
};
