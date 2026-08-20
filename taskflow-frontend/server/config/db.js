import mongoose from "mongoose";
import dns from "dns";

// Fix Windows Node.js DNS SRV lookup ECONNREFUSED issue by setting public Google & Cloudflare DNS servers
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.log("Could not set custom DNS servers:", e.message);
}

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

export const connectDB = async () => {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("127.0.0.1")) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`=================================`);
      console.log(`✅ [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
      console.log(`=================================`);
      return conn;
    } catch (error) {
      console.error(`❌ [MongoDB Atlas Error]: ${error.message}`);
    }
  }

  try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/taskflow", {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`=================================`);
    console.log(`✅ [Local MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`=================================`);
    return conn;
  } catch {
    console.log("⚡ Local MongoDB not detected. Starting In-Memory Mongo Database...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`=================================`);
      console.log(`✅ [In-Memory Mongo] Started and connected successfully!`);
      console.log(`=================================`);
      return conn;
    } catch (err) {
      console.error("❌ Could not start In-Memory Database:", err.message);
      throw err;
    }
  }
};
