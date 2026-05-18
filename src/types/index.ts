export interface Word {
  word: string
  phonetic: string
  meaning: string
  example: string
}

export interface VocabularyCategory {
  name: string
  description: string
  words: Word[]
}

export interface Vocabularies {
  [key: string]: VocabularyCategory
}

export type LearningMode = 'sequential' | 'list' | 'quiz'
export type VocabularyKey = 'elementary' | 'junior' | 'common'

export interface LearningProgress {
  vocabularyKey: VocabularyKey
  wordIndex: number
  learnedWords: string[]
  favoriteWords: string[]
  difficultWords: string[]
  quizScore: number
  lastLearnedAt: string
}
