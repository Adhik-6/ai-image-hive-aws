import express  from "express";
import { getAllImg, getGenImg, postToCom } from "../controller/controller.js";

const router = express.Router()

router.route("/posts").get(getAllImg).post(postToCom); // Inital fetch & upload generated img to DB
router.route("/generate").post(getGenImg); // generate img

export default router