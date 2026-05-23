export interface Word {
  word: string
  phonetic: string
  meaning: string
  example?: string
  exampleCn?: string
  phrases?: string[]
  synos?: string[]
  antos?: string[]
  rels?: string[]
}

export interface VocabularyCategory {
  name: string
  description: string
  words: Word[]
}

export interface VocabularyMetadata {
  key: string
  name: string
  description: string
  count: number
}

export type LearningMode = 'sequential' | 'list' | 'quiz'
export type VocabularyKey = string

export interface LearningProgress {
  vocabularyKey: VocabularyKey
  wordIndex: number
  learnedWords: string[]
  favoriteWords: string[]
  difficultWords: string[]
  quizScore: number
  lastLearnedAt: string
}
