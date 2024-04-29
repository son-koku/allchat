import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import sharp from "sharp";
import { handleToolCall, tools } from "./tools.js";
dotenv.config({ override: true });

export const bot = new TelegramBot(process.env.TELEGRAM_KEY);
let anthropic;

const resizeImage = async (imageBase64, maxSize = 2 * 1024 * 1024) => {
    const image = sharp(Buffer.from(imageBase64, "base64"));
    const metadata = await image.metadata();

    if (metadata.size > maxSize) {
        const resizedBuffer = await image
            .resize({
                fit: "inside",
                withoutEnlargement: true,
                withMetadata: true,
            })
            .toBuffer();

        return resizedBuffer.toString("base64");
    } else {
        return imageBase64;
    }
};

async function processToolResult(data, temperature, messages, userId, model, webTools) {
    console.log("processToolResult", data, messages);

    const toolUses = data.content.filter((block) => block.type === "tool_use");
    if (!toolUses.length) {
        return data?.content?.[0]?.text;
    }

    const toolResults = await Promise.all(
        toolUses.map(async (toolUse) => {
            const toolResult = await handleToolCall(toolUse.name, toolUse.input, userId);
            return { tool_use_id: toolUse.id, content: toolResult };
        })
    );

    const newMessages = [
        ...messages,
        { role: "assistant", content: data.content.filter((c) => c.type !== "text" || c.text) },
        {
            role: "user",
            content: toolResults.map((toolResult) => ({
                type: "tool_result",
                ...toolResult,
            })),
        },
    ];

    const newData = await anthropic.beta.tools.messages.create({
        model,
        max_tokens: 4096,
        temperature: temperature || 0.5,
        tools: webTools ? tools : [],
        messages: newMessages,
    });
    if (newData.stop_reason === "tool_use") {
        return await processToolResult(newData, temperature, newMessages, userId, model, webTools);
    } else {
        return newData?.content?.[0]?.text;
    }
}

export const getTextClaude = async (prompt, temperature, imageBase64, fileType, userId, model, apiKey, webTools) => {
    if (apiKey) {
        anthropic = new Anthropic({ apiKey });
    } else {
        anthropic = new Anthropic({ apiKey: process.env.CLAUDE_KEY });
        if (model?.includes("opus") || model?.includes("sonnet") || !model) {
            model = "claude-3-haiku-20240307";
        }
    }

    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt },
                ...(imageBase64
                    ? [
                          {
                              type: "image",
                              source: {
                                  type: "base64",
                                  media_type: fileType === "png" ? "image/png" : "image/jpeg",
                                  data: await resizeImage(imageBase64),
                              },
                          },
                      ]
                    : []),
            ],
        },
    ];

    const data = await anthropic.beta.tools.messages.create({
        model,
        max_tokens: 4096,
        temperature: temperature || 0.5,
        tools: webTools ? tools : [],
        messages,
    });

    if (!data) {
        throw new Error("Claude Error");
    } else {
        if (data.stop_reason === "tool_use") {
            return processToolResult(data, temperature, messages, userId, model, webTools);
        } else {
            return data?.content?.[0]?.text;
        }
    }
};
