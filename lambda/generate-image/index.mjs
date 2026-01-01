import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client();
const MOCK_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function uploadToS3(s3Key, imageBuffer) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: s3Key,
    Body: imageBuffer,
    ContentType: "image/png",
  }));
}

export const handler = async (event) => {
  let data; 
  
  try {    
    const fileName = `${Date.now()}.png`;
    const s3Key = `drafts/${fileName}`;
    const imageUrl = `${process.env.CLOUDFRONT_URL}/${s3Key}`;

    let parsedBody = event.body;
    if (typeof event.body === 'string') parsedBody = JSON.parse(event.body);
    else if (!parsedBody) parsedBody = {};
    
    const { prompt, mock } = parsedBody;
    if (!prompt) throw new Error("Prompt is required");

    let base64String;

    if (mock) {
      console.log("⚠️ MOCK MODE ENABLED");
      base64String = MOCK_IMAGE_BASE64;
      await new Promise(r => setTimeout(r, 1000));
    } else {
      const res = await fetch(
        "https://router.huggingface.co/together/v1/images/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-dev",
            prompt: prompt,
            response_format: "base64",
          })
        }
      );
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Hugging Face API Error: ${res.status} ${res.statusText}`);
      }
      
      data = await res.json();
      base64String = data.data?.[0]?.b64_json; 
    }
    
    if (!base64String) {
      console.error("API Response Dump:", JSON.stringify(data));
      throw new Error("No image data found in API response");
    }

    const imageBuffer = Buffer.from(base64String, "base64");
    await uploadToS3(s3Key, imageBuffer);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Image generated successfully",
        success: true,
        imageUrl: imageUrl
      })
    };
  } catch (err) {
    console.error("Full Error:", err);
      
    const errorMessage = err.response?.data?.error?.message || err.message || "Unknown Error";
    let statusCode = err.response?.status === 429? 429 : 500;

    return {
      statusCode: statusCode,
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, message: errorMessage }),
    };
  }
};
