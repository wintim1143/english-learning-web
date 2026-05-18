<template>
  <div class="app">
    <header class="app-header">
      <h1>🎓 英语单词学习</h1>
      <div class="vocabulary-selector">
        <select v-model="currentVocabKey" class="vocab-select">
          <option v-for="(vocab, key) in vocabularies" :key="key" :value="key">
            {{ vocab.name }} ({{ vocab.words.length }})
          </option>
        </select>
      </div>
      <nav class="nav-tabs">
        <button 
          :class="['nav-btn', { active: mode === 'sequential' }]"
          @click="mode = 'sequential'"
        >
          📖 逐个学习
        </button>
        <button 
          :class="['nav-btn', { active: mode === 'list' }]"
          @click="mode = 'list'"
        >
          📚 单词列表
        </button>
        <button 
          :class="['nav-btn', { active: mode === 'quiz' }]"
          @click="mode = 'quiz'"
        >
          🎯 随机测验
        </button>
      </nav>
    </header>

    <main class="app-main">
      <div v-if="mode === 'sequential'" class="sequential-mode">
        <div class="progress-info">
          <span>{{ currentVocab.name }}: {{ currentWordIndex + 1 }}/{{ currentWords.length }}</span>
          <button class="reset-btn" @click="resetProgress">重置</button>
        </div>
        <WordCard
          :word="currentWord"
          :is-speaking="isSpeaking"
          :current-word="currentSpeakingWord"
          :is-favorite="favoriteWords.includes(currentWord.word)"
          :is-difficult="difficultWords.includes(currentWord.word)"
          @speak="handleSpeak"
          @toggle-favorite="toggleFavorite(currentWord)"
          @toggle-difficult="toggleDifficult(currentWord)"
        />
        <div class="navigation">
          <button 
            class="nav-btn-prev" 
            @click="prevWord"
            :disabled="currentWordIndex === 0"
          >
            ← 上一个
          </button>
          <button 
            class="nav-btn-next" 
            @click="nextWord"
            :disabled="currentWordIndex === currentWords.length - 1"
          >
            下一个 →
          </button>
        </div>
      </div>

      <WordList
        v-else-if="mode === 'list'"
        :words="currentWords"
        :vocabulary-name="currentVocab.name"
        :favorite-words="favoriteWords"
        :difficult-words="difficultWords"
        :is-speaking="isSpeaking"
        :current-word="currentSpeakingWord"
        @play="handleSpeak"
      />

      <QuizMode
        v-else-if="mode === 'quiz'"
        :words="currentWords"
        @back="mode = 'list'"
      />
    </main>

    <footer class="app-footer">
      <p>💡 点击单词或 🔊 播放发音 | ⭐ 收藏 | 📑 难点</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import vocabulariesData from '@/data/vocabularies.json'
import WordCard from '@/components/WordCard.vue'
import WordList from '@/components/WordList.vue'
import QuizMode from '@/components/QuizMode.vue'
import { useTTS } from '@/composables/useTTS'
import type { Word, LearningMode, LearningProgress, Vocabularies, VocabularyKey } from '@/types'

const vocabularies: Vocabularies = vocabulariesData

const currentVocabKey = ref<VocabularyKey>('elementary')
const currentVocab = computed(() => vocabularies[currentVocabKey.value])
const currentWords = computed(() => currentVocab.value.words)

const { speak, isSpeaking, currentWord: currentSpeakingWord } = useTTS()

const mode = ref<LearningMode>('sequential')

const currentWordIndex = ref(0)
const favoriteWords = ref<string[]>([])
const difficultWords = ref<string[]>([])

const currentWord = computed(() => currentWords.value[currentWordIndex.value])

const loadProgress = () => {
  const saved = localStorage.getItem('learning-progress')
  if (saved) {
    try {
      const progress: LearningProgress = JSON.parse(saved)
      currentVocabKey.value = progress.vocabularyKey || 'elementary'
      currentWordIndex.value = progress.wordIndex || 0
      favoriteWords.value = progress.favoriteWords || []
      difficultWords.value = progress.difficultWords || []
    } catch (e) {
      console.error('Failed to load progress:', e)
    }
  }
}

const saveProgress = () => {
  const progress: LearningProgress = {
    vocabularyKey: currentVocabKey.value,
    wordIndex: currentWordIndex.value,
    learnedWords: [],
    favoriteWords: favoriteWords.value,
    difficultWords: difficultWords.value,
    quizScore: 0,
    lastLearnedAt: new Date().toISOString()
  }
  localStorage.setItem('learning-progress', JSON.stringify(progress))
}

const resetProgress = () => {
  if (confirm('确定要重置学习进度吗？收藏和难点单词记录也会被清空。')) {
    currentWordIndex.value = 0
    favoriteWords.value = []
    difficultWords.value = []
    localStorage.removeItem('learning-progress')
  }
}

const handleSpeak = (word: Word) => {
  speak(word)
}

const nextWord = () => {
  if (currentWordIndex.value < currentWords.value.length - 1) {
    currentWordIndex.value++
    saveProgress()
  }
}

const prevWord = () => {
  if (currentWordIndex.value > 0) {
    currentWordIndex.value--
    saveProgress()
  }
}

const toggleFavorite = (word: Word) => {
  const index = favoriteWords.value.indexOf(word.word)
  if (index > -1) {
    favoriteWords.value.splice(index, 1)
  } else {
    favoriteWords.value.push(word.word)
  }
  saveProgress()
}

const toggleDifficult = (word: Word) => {
  const index = difficultWords.value.indexOf(word.word)
  if (index > -1) {
    difficultWords.value.splice(index, 1)
  } else {
    difficultWords.value.push(word.word)
  }
  saveProgress()
}

watch([currentVocabKey], () => {
  currentWordIndex.value = 0
  saveProgress()
})

watch([currentWordIndex, favoriteWords, difficultWords], () => {
  saveProgress()
}, { deep: true })

onMounted(() => {
  loadProgress()
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  overscroll-behavior: none;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  overflow-x: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  text-align: center;
}

.vocabulary-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 0.8rem;
}

.vocab-select {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  text-align: center;
}

.vocab-select option {
  background: white;
  color: #333;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-btn.active {
  background: white;
  color: #667eea;
}

.app-main {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.sequential-mode {
  max-width: 500px;
  margin: 0 auto;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.progress-info span {
  font-size: 0.95rem;
  color: #666;
}

.reset-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #e0e0e0;
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.nav-btn-prev,
.nav-btn-next {
  flex: 1;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn-prev:hover:not(:disabled),
.nav-btn-next:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.nav-btn-prev:disabled,
.nav-btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-footer {
  background: white;
  padding: 0.8rem 1rem;
  text-align: center;
  color: #666;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.app-footer p {
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 1.3rem;
  }
  
  .nav-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .app-main {
    padding: 0.8rem;
  }
}
</style>
