// lambda/__tests__/catalogBatchProcess.test.ts
import { handler } from '../lambda/catalogBatchProcess';
import {
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/client-sns');

const mockSend = jest.fn();

(DynamoDBClient as jest.Mock).mockImplementation(() => ({
  send: mockSend,
}));

(SNSClient as jest.Mock).mockImplementation(() => ({
  send: mockSend,
}));

describe('catalogBatchProcess Lambda', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('should write to DynamoDB and publish to SNS for each message', async () => {
    process.env.PRODUCTS_TABLE = 'products';
    process.env.STOCK_TABLE = 'stocks';
    process.env.CREATE_PRODUCT_TOPIC_ARN = 'arn:aws:sns:region:123456789012:createProductTopic';

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify({
            id: 'id-1',
            title: 'Product 1',
            description: 'Test',
            price: 123,
            count: 4,
          }),
        },
      ],
    };

    await handler(mockEvent as any, {} as any, () => { });

    // Expect DynamoDB putItem for products
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    // Expect DynamoDB putItem for stocks
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
    // Expect SNS publish
    expect(mockSend).toHaveBeenCalledWith(expect.any(PublishCommand));
  });

  it('should handle errors gracefully', async () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error('DynamoDB failure');
    });

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify({
            id: 'id-2',
            title: 'Product 2',
            description: 'Error case',
            price: 200,
            count: 2,
          }),
        },
      ],
    };

    await expect(handler(mockEvent as any, {} as any, () => { })).resolves.not.toThrow();
  });
});
