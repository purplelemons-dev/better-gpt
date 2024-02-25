// place files you want to import through the `$lib` alias in this folder.
import { OpenAI } from "openai";
import { env } from "$env/dynamic/private";

export const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    organization: env.OPENAI_ORG_ID,
});


