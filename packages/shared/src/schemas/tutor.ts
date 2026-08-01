import { z } from "zod";

export const tutorModeSchema = z.enum(["qa", "quiz", "explain"]);
export type TutorMode = z.infer<typeof tutorModeSchema>;

export const tutorChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type TutorChatMessage = z.infer<typeof tutorChatMessageSchema>;

/** Request body for POST /api/tutor/chat — scoping the tutor's RAG retrieval to the current lesson/course. */
export const tutorChatRequestSchema = z.object({
  messages: z.array(tutorChatMessageSchema).min(1),
  courseSlug: z.string().optional(),
  lessonSlug: z.string().optional(),
  sessionId: z.string().uuid().optional(),
});
export type TutorChatRequest = z.infer<typeof tutorChatRequestSchema>;

export const retrievedChunkSchema = z.object({
  sourceSlug: z.string(),
  headingPath: z.string(),
  content: z.string(),
  similarity: z.number(),
});
export type RetrievedChunk = z.infer<typeof retrievedChunkSchema>;
