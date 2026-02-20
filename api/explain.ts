import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({ error: "No expression provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a mathematics tutor. Explain step-by-step how to solve the given expression clearly and concisely.",
        },
        {
          role: "user",
          content: `Explain how to solve this: ${expression}`,
        },
      ],
      temperature: 0.2,
    });

    const explanation = completion.choices[0].message.content;

    return res.status(200).json({ explanation });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "AI explanation failed" });
  }
}

// backend version active