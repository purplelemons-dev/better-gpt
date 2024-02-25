import type { RequestHandler } from '@sveltejs/kit';
import { openai } from '$lib';

export const GET: RequestHandler = async (request) => {
    console.log(request.url)
    if (
        !((request.request.headers.get("host") === "gptx.purplelemons.dev")
            || request.request.headers.get("host")?.startsWith("localhost"))
    ) {
        return new Response("Access denied", { status: 403 });
    }
    const prompt = new URL(request.url).searchParams.get("prompt");
    if (!prompt) {
        return new Response("No prompt provided", { status: 400 });
    }

    const stream = openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        stream: true,
    });

    const response = new ReadableStream({
        async start(controller) {
            for await (const chunk of await stream) {
                if (!chunk.choices[0].finish_reason) {
                    controller.enqueue(`data: ${chunk.choices[0].delta.content}\n\n`);
                } else {
                    controller.enqueue(`data: <|close|>\n\n`);
                    return controller.close();
                }
            }
        },
    });

    return new Response(response, {
        headers: {
            "Content-Type": "text/event-stream",
        },
    });
};
