import { SQSHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ region: 'us-east-1' });

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const product = JSON.parse(record.body);

      const { id, title, description, price, count } = product;

      // Save product to products table
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.PRODUCTS_TABLE!,
          Item: {
            id: { S: id },
            title: { S: title },
            description: { S: description },
            price: { N: price.toString() },
          },
        })
      );

      // Save stock to stocks table
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.STOCK_TABLE!,
          Item: {
            product_id: { S: id },
            count: { N: count.toString() },
          },
        })
      );

      console.log(`Product ${id} added successfully.`);
    } catch (error) {
      console.error('Error processing message', error);
    }
  }
};
