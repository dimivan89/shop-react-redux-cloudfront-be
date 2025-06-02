import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const productsTable = process.env.PRODUCTS_TABLE!;
    const stockTable = process.env.STOCK_TABLE!;

    const productsResult = await client.send(new ScanCommand({ TableName: productsTable }));
    const products = (productsResult.Items || []).map(item => ({
      id: item.id.S,
      title: item.title.S,
      description: item.description.S,
      price: Number(item.price.N),
    }));

    const stockResult = await client.send(new ScanCommand({ TableName: stockTable }));
    const stock = (stockResult.Items || []).map(item => ({
      product_id: item.product_id.S,
      count: Number(item.count.N),
    }));

    const mergedProducts = products.map(product => {
      const stockItem = stock.find(s => s.product_id === product.id);
      return {
        ...product,
        count: stockItem ? stockItem.count : 0
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(mergedProducts),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
