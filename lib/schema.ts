import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const drugs = sqliteTable('drugs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  genericName: text('generic_name'),
  drugClass: text('drug_class'),
  indication: text('indication'),
  moa: text('moa'),
  dose: text('dose'),
  sideEffects: text('side_effects'),
  contraindications: text('contraindications'),
  nursingConsiderations: text('nursing_considerations'),
  createdAt: integer('created_at').notNull(),
});

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  drugId: text('drug_id')
    .notNull()
    .references(() => drugs.id, { onDelete: 'cascade' }),
  ease: real('ease').notNull().default(2.5),
  interval: integer('interval').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  nextReview: integer('next_review').notNull(),
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  topic: text('topic'),
  subject: text('subject'),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  questionJson: text('question_json'),
  createdAt: integer('created_at').notNull(),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
});

export type Drug = typeof drugs.$inferSelect;
export type NewDrug = typeof drugs.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
