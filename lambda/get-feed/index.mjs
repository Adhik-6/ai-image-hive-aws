import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const command = new QueryCommand({
    TableName: process.env.TABLE_NAME,
    IndexName: process.env.INDEX_NAME,
    KeyConditionExpression: '#t = :type AND createdAt > :zero',
    ExpressionAttributeNames: {
      '#t': 'type'
    },
    ExpressionAttributeValues: {
      ':type': 'FEED',
      ':zero': 0
    },
    ScanIndexForward: false
  })
  try {
    const response = await docClient.send(command);
    return {
      statusCode: 200,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        success: true, 
        message:"All images fetched successfully", 
        images: response.Items
      })
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({success: true, message: err.message})
    }
  }
};
