<template>
  <div class="app">
    <header class="app-header">
      <div class="header-container">
        <button v-if="currentVocabKey" class="back-to-lobby-btn" @click="backToLobby">
          🏠 返回首页
        </button>
        <h1>🎓 英语单词学习<span v-if="currentVocabKey"> — {{ currentVocab.name }}</span></h1>
      </div>
      <nav v-if="currentVocabKey" class="nav-tabs">
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
      <!-- 首页：词包选择大厅 -->
      <div v-if="!currentVocabKey && !isLoading" class="vocab-lobby">
        <div class="lobby-header">
          <h2>🎯 请选择学习阶段</h2>
          <p>选择一个英语词包，开启你的高效记忆之旅</p>
        </div>

        <!-- 继续上次学习横幅 -->
        <div v-if="lastProgress && lastProgressCategory" class="continue-banner" @click="selectVocab(lastProgress.vocabularyKey)">
          <div class="continue-info">
            <span class="continue-tag">继续上次学习</span>
            <h3>{{ lastProgressCategory.name }}</h3>
            <p>学习进度：已学习到第 {{ lastProgress.wordIndex + 1 }} / {{ lastProgressCategory.count }} 个单词</p>
          </div>
          <button class="continue-btn">继续学习 →</button>
        </div>

        <!-- 阶段大卡片网格 -->
        <div class="lobby-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.key" 
            class="lobby-card"
            @click="selectVocab(cat.key)"
          >
            <div class="card-content">
              <h3 class="card-title">{{ cat.name }}</h3>
              <p class="card-desc">{{ cat.description }}</p>
              <div class="card-footer">
                <span class="word-count">📊 {{ cat.count }} 词</span>
                <span class="arrow-btn">开始学习 →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 异步加载状态 -->
      <div v-else-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在拉取词库，请稍候...</p>
      </div>

      <!-- 背词主区域 -->
      <div v-else-if="currentWords.length > 0 && currentWord" class="content-state">
        <div v-if="mode === 'sequential'" class="sequential-mode">
          <div class="progress-info">
            <span>当前位置: {{ currentWordIndex + 1 }} / {{ currentWords.length }}</span>
            <button class="reset-btn" @click="resetProgress">重置进度</button>
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
          @toggle-favorite="toggleFavorite"
          @toggle-difficult="toggleDifficult"
        />

        <QuizMode
          v-else-if="mode === 'quiz'"
          :words="currentWords"
          @back="mode = 'list'"
        />
      </div>

      <!-- 空白异常状态 -->
      <div v-else class="empty-state">
        <p>📭 暂无单词数据，请返回首页选择其他分类重试</p>
      </div>
    </main>

    <footer class="app-footer">
      <p>💡 点击单词或 🔊 播放发音 | ⭐ 收藏 | 📑 难点</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import WordCard from './components/WordCard.vue'
import WordList from './components/WordList.vue'
import QuizMode from './components/QuizMode.vue'
import { useTTS } from './composables/useTTS'
import type { Word, LearningMode, LearningProgress, VocabularyMetadata, VocabularyKey } from './types'

const categories = ref<VocabularyMetadata[]>([])
const currentVocabKey = ref<VocabularyKey>('')
const currentWords = ref<Word[]>([])
const isLoading = ref(false)

const lastProgress = ref<LearningProgress | null>(null)

const currentVocab = computed(() => {
  return categories.value.find((c: VocabularyMetadata) => c.key === currentVocabKey.value) || { name: '', description: '', count: 0 }
})

const lastProgressCategory = computed(() => {
  if (!lastProgress.value || !lastProgress.value.vocabularyKey) return null
  return categories.value.find((c: VocabularyMetadata) => c.key === lastProgress.value?.vocabularyKey) || null
})

const { speak, isSpeaking, currentWord: currentSpeakingWord } = useTTS()

const mode = ref<LearningMode>('sequential')

const currentWordIndex = ref(0)
const favoriteWords = ref<string[]>([])
const difficultWords = ref<string[]>([])

const currentWord = computed(() => {
  return currentWords.value[currentWordIndex.value] || null
})

// 从 public 目录异步加载当前词包的单词数据
const loadVocabularyData = async (key: string) => {
  if (!key) return
  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/vocabularies/${key}.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch vocabulary: ${response.statusText}`)
    }
    const data = await response.json()
    currentWords.value = data
  } catch (e) {
    console.error('Failed to load vocabulary data:', e)
    currentWords.value = []
  } finally {
    isLoading.value = false
  }
}

// 选中某个词包并开始学习
const selectVocab = async (key: string) => {
  currentVocabKey.value = key
  
  // 如果选择的词包正好是上次记录的词包，那么还原其上次记录的单词位置和状态
  if (lastProgress.value && lastProgress.value.vocabularyKey === key) {
    await loadVocabularyData(key)
    if (lastProgress.value.wordIndex >= 0 && lastProgress.value.wordIndex < currentWords.value.length) {
      currentWordIndex.value = lastProgress.value.wordIndex
    } else {
      currentWordIndex.value = 0
    }
    favoriteWords.value = lastProgress.value.favoriteWords || []
    difficultWords.value = lastProgress.value.difficultWords || []
  } else {
    // 否则是全新开始
    await loadVocabularyData(key)
    currentWordIndex.value = 0
    // 收藏和难点可以在切换词包时保留其原本的记录（因为它们是单词字符串数组，保留有利于跨词包记录）
  }
  saveProgress()
}

// 返回首页大厅
const backToLobby = () => {
  currentVocabKey.value = ''
  currentWords.value = []
  // 返回大厅时同步拉取最新的 localStorage 进度，以更新“继续学习”横幅
  const saved = localStorage.getItem('learning-progress')
  if (saved) {
    try {
      lastProgress.value = JSON.parse(saved)
    } catch (e) {}
  }
}

const saveProgress = () => {
  if (!currentVocabKey.value) return
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
  lastProgress.value = progress
}

const resetProgress = () => {
  if (confirm('确定要重置当前词包的学习进度吗？收藏和难点单词记录也会被清空。')) {
    currentWordIndex.value = 0
    favoriteWords.value = []
    difficultWords.value = []
    saveProgress()
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

// 监听词包分类选择变化
watch(currentVocabKey, async (newKey) => {
  if (!newKey) return
  const currentCategoryMetadata = categories.value.find((c: VocabularyMetadata) => c.key === newKey)
  const expectedCount = currentCategoryMetadata ? currentCategoryMetadata.count : 0
  
  if (currentWords.value.length !== expectedCount) {
    currentWordIndex.value = 0
    await loadVocabularyData(newKey)
    saveProgress()
  }
})

watch([currentWordIndex, favoriteWords, difficultWords], () => {
  saveProgress()
}, { deep: true })

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/vocabularies/categories.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }
    const cats = await response.json()
    categories.value = cats

    // 获取上次保存的学习进度，用来在大厅渲染“继续学习”横幅
    const saved = localStorage.getItem('learning-progress')
    if (saved) {
      try {
        lastProgress.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved progress:', e)
      }
    }
  } catch (e) {
    console.error('Failed to load categories on mounted:', e)
  } finally {
    isLoading.value = false
  }
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
  margin-bottom: 0rem;
  text-align: center;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
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
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: 1rem;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.content-state {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sequential-mode {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
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
  font-weight: 500;
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
  color: #333;
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

/* 异步加载中指示器样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  color: #764ba2;
  flex: 1;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(118, 75, 162, 0.1);
  border-top: 5px solid #764ba2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 15px rgba(118, 75, 162, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.1rem;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* 空白占位状态样式 */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: #888;
  font-size: 1.1rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ================= 词包选择大厅样式 ================= */
.vocab-lobby {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem 1rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.lobby-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lobby-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.lobby-header p {
  color: #666;
  font-size: 1.05rem;
}

/* 继续学习横幅样式 */
.continue-banner {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 1.2rem 1.8rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.05);
}

.continue-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}

.continue-tag {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  margin-bottom: 0.5rem;
}

.continue-info h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.2rem;
}

.continue-info p {
  color: #666;
  font-size: 0.95rem;
}

.continue-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.2);
  white-space: nowrap;
}

/* 词包卡片网格 */
.lobby-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.lobby-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  height: 180px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.lobby-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0.7;
  transition: opacity 0.3s;
}

.lobby-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.lobby-card:hover::after {
  opacity: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.card-title {
  font-size: 1.3rem;
  color: #333;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-desc {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.4;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.word-count {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
  background: rgba(102, 126, 234, 0.08);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.arrow-btn {
  font-size: 0.9rem;
  color: #764ba2;
  font-weight: 600;
  transition: transform 0.2s;
}

.lobby-card:hover .arrow-btn {
  transform: translateX(3px);
}

/* 返回按钮 */
.back-to-lobby-btn {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.back-to-lobby-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 2.5rem;
}

@media (max-width: 768px) {
  .back-to-lobby-btn {
    position: static;
    transform: none;
    margin-bottom: 0.5rem;
  }
  
  .header-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
