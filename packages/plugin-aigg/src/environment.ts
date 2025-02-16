import { z } from "zod";

export const configSchema = z.object({
    AIGG_API_URL: z.string().default("http://37.27.54.184:8000"),
});

export type Config = z.infer<typeof configSchema>;

export const getConfig = (): Config => {
    return configSchema.parse(process.env);
}; 