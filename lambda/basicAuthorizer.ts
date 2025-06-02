import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Received event:', JSON.stringify(event));

  if (!event.authorizationToken) {
    throw new Error('Unauthorized'); // → results in 401
  }

  const token = event.authorizationToken;
  const encoded = token.split(' ')[1];

  if (!encoded) {
    throw new Error('Unauthorized'); // → 401 if no token
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf-8'); // login:password
  const [username, password] = decoded.split(':');

  const expectedPassword = process.env[username];

  if (expectedPassword && expectedPassword === password) {
    return generatePolicy('user', 'Allow', event.methodArn);
  }

  return generatePolicy('user', 'Deny', event.methodArn); // → 403
};

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
