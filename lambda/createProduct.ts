import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const productsTable = process.env.PRODUCTS_TABLE!;
    const stockTable = process.env.STOCK_TABLE!;

    const { title, description, price, count } = JSON.parse(event.body || '{}');

    if (!title || price === undefined || count === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: title, price, count' }),
      };
    }

    const id = uuidv4();

    await client.send(new PutItemCommand({
      TableName: productsTable,
      Item: {
        id: { S: id },
        title: { S: title },
        description: { S: description || '' },
        price: { N: price.toString() },
      },
    }));

    await client.send(new PutItemCommand({
      TableName: stockTable,
      Item: {
        product_id: { S: id },
        count: { N: count.toString() },
      },
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Product created', id }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
