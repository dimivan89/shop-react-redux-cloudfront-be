import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (event: any) => {
  try {
    const { productId } = event.pathParameters || {};

    const productsTable = process.env.PRODUCTS_TABLE!;
    const stockTable = process.env.STOCK_TABLE!;

    const productResult = await client.send(new GetItemCommand({
      TableName: productsTable,
      Key: {
        id: { S: productId }
      }
    }));

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    const product = {
      id: productResult.Item.id.S,
      title: productResult.Item.title.S,
      description: productResult.Item.description.S,
      price: Number(productResult.Item.price.N),
    };

    const stockResult = await client.send(new GetItemCommand({
      TableName: stockTable,
      Key: {
        product_id: { S: productId }
      }
    }));

    const count = stockResult.Item ? Number(stockResult.Item.count.N) : 0;

    const mergedProduct = {
      ...product,
      count
    };

    return {
      statusCode: 200,
      body: JSON.stringify(mergedProduct),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
