import { pgTable, uuid, text, integer, vector, uniqueIndex, index } from "drizzle-orm/pg-core";
import { lessons } from "./courses.js";

/** Chunked, embedded lesson content powering the tutor's RAG retrieval. Populated by scripts/sync-content.ts. */
export const contentChunks = pgTable(
  "content_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    sourceSlug: text("source_slug").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    headingPath: text("heading_path").notNull(),
    content: text("content").notNull(),
    contentHash: text("content_hash").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
  },
  (table) => [
    uniqueIndex("content_chunks_source_idx").on(table.sourceSlug, table.chunkIndex),
    index("content_chunks_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ],
);
