import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'us-east-1' });

const products = [
  {
    id: uuidv4(),
    title: 'Xbox Series X',
    description: 'Microsoft Xbox Series X Console',
    price: 500
  },
  {
    id: uuidv4(),
    title: 'PlayStation 5',
    description: 'Sony PlayStation 5 Console',
    price: 499
  },
  {
    id: uuidv4(),
    title: 'Nintendo Switch',
    description: 'Nintendo Switch with Neon Red and Neon Blue Joy‑Con',
    price: 299
  },
  {
    id: uuidv4(),
    title: 'Steam Deck',
    description: 'Valve Steam Deck Handheld Gaming Console',
    price: 399
  },
  {
    id: uuidv4(),
    title: 'Razer Blade 15',
    description: 'Razer Blade 15 Gaming Laptop with NVIDIA GeForce RTX',
    price: 1899
  },
  {
    id: uuidv4(),
    title: 'Alienware Aurora R13',
    description: 'Dell Alienware Aurora R13 Gaming Desktop',
    price: 1699
  },
  {
    id: uuidv4(),
    title: 'Logitech G Pro X Headset',
    description: 'Logitech G Pro X Gaming Headset with Blue Voice Technology',
    price: 129
  },
  {
    id: uuidv4(),
    title: 'ASUS ROG Strix Monitor',
    description: 'ASUS ROG Strix 27” Gaming Monitor 144Hz',
    price: 399
  },
  {
    id: uuidv4(),
    title: 'Corsair K95 Keyboard',
    description: 'Corsair K95 RGB Platinum Mechanical Gaming Keyboard',
    price: 199
  },
  {
    id: uuidv4(),
    title: 'Logitech MX Master 3',
    description: 'Logitech MX Master 3 Advanced Wireless Mouse',
    price: 99
  },
];

const stocks = products.map(product => ({
  product_id: product.id,
  count: Math.floor(Math.random() * 100) + 1
}));

async function fillTables() {
  try {
    for (const product of products) {
      const command = new PutItemCommand({
        TableName: 'products',
        Item: {
          id: { S: product.id },
          title: { S: product.title },
          description: { S: product.description },
          price: { N: product.price.toString() },
        },
      });
      await client.send(command);
      console.log(`Inserted product: ${product.title}`);
    }

    for (const stock of stocks) {
      const command = new PutItemCommand({
        TableName: 'stock',
        Item: {
          product_id: { S: stock.product_id },
          count: { N: stock.count.toString() },
        },
      });
      await client.send(command);
      console.log(`Inserted stock for product_id: ${stock.product_id}`);
    }

    console.log('Done inserting test data!');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

fillTables();
