import fetch from "node-fetch";
import fs from "fs";

const imagePath = "./sample-pollution.jpg";
const API_KEY = "AIzaSyCTeusqEJb7ZK-PNT90BogYKfvF_JuH1wU";

const prompt = "Analyze this image for pollution and generate actionable environmental awareness tips:";

async function callGemini() {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-vision:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    
    const data = await response.json();
    if (data.error) {
      console.error("Gemini API error:", data.error.message);
    } else if (data.candidates && data.candidates.length > 0) {
      console.log("Gemini AI Analysis:\n", data.candidates[0].content.parts[0].text);
    } else {
      console.error("No candidates returned from API:", data);
    }
  } catch (err) {
    console.error("Error in callGemini:", err);
  }
}

(async () => {
  try {
    await callGemini();
  } catch (err) {
    console.error("Unhandled error in callGemini:", err);
  }
})();