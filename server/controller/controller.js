import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv"
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import { Post } from "../models/model.js"

dotenv.config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});

const getAllImg = async (req, res) =>{
  const data = await Post.find().sort({"_id": -1})
  // console.log("Fetched all data")
  res.status(200).json({success:true, images: data})
}

const getGenImg = async (req, res) =>{
  try{    
    // > stabilityai/stable-diffusion-xl-base-1.0
    // > CompVis/stable-diffusion-v1-4
    // > stable-diffusion-v1-5/stable-diffusion-v1-5
    const {prompt} = req.body;
    // console.log("Generating img for prompt: ", prompt);

    // ---------------------------------------------------------
    // 1. MOCK MODE: Simulate API to save credits
    // ---------------------------------------------------------
    // console.log("USE_MOCK_GEN:", process.env.USE_MOCK_GEN);
    if(process.env.USE_MOCK_GEN==="true"){
      console.log("⚠️ USING MOCK MODE: Returning local asset...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay
      const imgPath = path.resolve(__dirname, "../../client/public/vite.svg");
      if (!fs.existsSync(imgPath)) {
        throw new Error(`Mock image not found at: ${imgPath}`);
      }
      const imgBuffer = fs.readFileSync(imgPath);
      const base64String = imgBuffer.toString("base64");
      const mimeType = "image/svg+xml";
      return res.status(200).json({ b64: `data:${mimeType};base64,${base64String}` });
    }

    // ---------------------------------------------------------
    // 2. REAL MODE: Call Hugging Face API
    // ---------------------------------------------------------

    const response = await axios.post(
      "https://router.huggingface.co/together/v1/images/generations",
      {
        model: "black-forest-labs/FLUX.1-dev",
        prompt: prompt,
        response_format: "base64",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    )
    
    const result = response.data;

    if (!result.data || !result.data[0].b64_json) {
      throw new Error("API returned unexpected format");
    }

    // fs.writeFileSync(`./server/generated_images/${req.body.prompt.slice(10)}.${mimeType}`, Buffer.from(response.data));
    const base64String = result.data[0].b64_json;
    const mimeType = "image/jpeg";

    // console.log("Real Image successfully sent");
    res.status(200).json({ b64: `data:${mimeType};base64,${base64String}` });

  } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      const customError = new Error(errorMessage);
      if (err.response?.status === 429) {
        customError.message = "Rate limit reached. Please wait.";
        customError.statusCode = 429;
      } else {
        customError.statusCode = err.response?.status || 500;
      }
      throw customError;
  }
}


const postToCom = async (req, res) => {
  // console.log("Posting: ", req.body)
  let { prompt, name, photo } = req.body;

  if (!prompt || !photo) {
    throw new Error("Missing required fields: prompt or photo");
  }

  // if somehow MIME is wrong, replace it
  if (photo.startsWith("data:application/json; charset=utf-8")) {
    photo = photo.replace("data:application/json; charset=utf-8", "data:image/jpeg");
  }
  
  const uploadResult = await cloudinary.uploader.upload(photo, {
    folder: "ai_image_hive",
  });
  // console.log("Posting: ", uploadResult)
  // console.log("Cloudinary upload results: ", uploadResult);

  const newPost = await Post.create({
    prompt,
    name: name || "Anonymous", 
    photo: uploadResult.secure_url,
  });

  res.status(201).json({
    success: true,
    message: "Successfully Posted", 
    data: newPost
  });
}

export {getAllImg, getGenImg, postToCom}

