import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://$rajpootsahil51_db_user:YOUR_PASSWORD@cluster0.wftt93m.mongodb.net/";
console.log("MongoDB URI:", uri);
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("realtime-tracker");
    console.log("MongoDB Connected Successfully ");
    return db;
  } catch (error) {
    console.log("Connection Failed", error);
  }
}

export {  db, connectDB };
