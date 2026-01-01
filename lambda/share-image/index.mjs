import { CopyObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const s3 = new S3Client();
const db = DynamoDBDocumentClient.from(new DynamoDBClient());

async function copyAndDeleteFromS3(imageUrl){
  const fileName = imageUrl.split('/').pop();
  const bucketName = process.env.BUCKET_NAME;
  const sourceKey = `drafts/${fileName}`;
  const destinationKey = `feed/${fileName}`;

  await s3.send(new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destinationKey,
  }))

  await s3.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: sourceKey,
  }))

  return `${process.env.CLOUDFRONT_URL}/${destinationKey}`;
}

export const handler = async (event) => {
  try {
    let parsedInput = event.body;
    if(typeof parsedInput === 'string') parsedInput = JSON.parse(event.body);
    else if(!parsedInput) parsedInput = {};
    const {name, prompt, imageUrl} = parsedInput;
    if(!name || !prompt || !imageUrl){
      throw new Error(`Missing required fields: ${!name && 'name'}, ${!prompt && 'prompt'}, ${!imageUrl && 'imageUrl'}`);
    }
  
    const publicUrl = await copyAndDeleteFromS3(imageUrl);
  
    await db.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        imageId: `${randomUUID()}`,
        name,
        prompt,
        imageUrl: publicUrl,
        createdAt: Date.now(),
        type: 'FEED'
      }
    }))
  
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: 'Successfully Posted',
        success: true,
        data: publicUrl
      }),
    };
    return response;
  } catch (err) {
    console.error(err); 
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: err.message,
        success: false
      }),
    }
  }
};
