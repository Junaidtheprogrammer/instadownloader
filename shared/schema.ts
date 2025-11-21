import { z } from "zod";

export const videoMetadataSchema = z.object({
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  title: z.string().optional(),
  username: z.string().optional(),
  duration: z.number().optional(),
  downloadUrl: z.string(),
  type: z.enum(['reel', 'igtv', 'post']).optional(),
});

export const fetchVideoRequestSchema = z.object({
  url: z.string().url().refine((url) => {
    return url.includes('instagram.com');
  }, {
    message: "URL must be from Instagram (instagram.com)"
  }),
});

export type VideoMetadata = z.infer<typeof videoMetadataSchema>;
export type FetchVideoRequest = z.infer<typeof fetchVideoRequestSchema>;
