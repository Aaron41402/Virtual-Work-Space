import connectMongo from "@/libs/mongoose";
import Task from "@/models/Task";

export default async function handler(req, res) {
  await connectMongo();
  
  if (req.method === "POST") {
    const { userId, message } = req.body;

    if (message.includes("my tasks")) {
      const tasks = await Task.find({ userId, status: "pending" });
      return res.json({ response: `You have ${tasks.length} tasks: ${tasks.map(t => t.task).join(", ")}` });
    }

    return res.json({ response: "I'm here to help! Ask me about your schedule." });
  }
  
  res.status(405).json({ error: "Method Not Allowed" });
}