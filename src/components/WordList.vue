<template>
  <div class="word-list">
    <div class="list-header">
      <h2>📚 {{ vocabularyName }}</h2>
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索..."
          class="search-input"
        />
      </div>
    </div>
    <div class="filter-tabs">
      <button 
        :class="['tab', { active: filter === 'all' }]"
        @click="filter = 'all'"
      >
        全部 ({{ words.length }})
      </button>
      <button 
        :class="['tab', { active: filter === 'favorites' }]"
        @click="filter = 'favorites'"
      >
        ⭐ ({{ favoriteWords.length }})
      </button>
      <button 
        :class="['tab', { active: filter === 'difficult' }]"
        @click="filter = 'difficult'"
      >
        📑 ({{ difficultWords.length }})
      </button>
    </div>
    <div class="words-grid">
      <div 
        v-for="word in filteredWords" 
        :key="word.word"
        class="word-item"
        :class="{ 
          'favorite': favoriteWords.includes(word.word),
          'difficult': difficultWords.includes(word.word),
          'speaking': isSpeaking && currentWord === word.word
        }"
        @click="handleWordClick(word)"
      >
        <div class="word-info">
          <h3 class="item-word">{{ word.word }}</h3>
          <p class="item-meaning">{{ word.meaning }}</p>
        </div>
        <button class="play-icon" @click.stop="handleWordClick(word)">
          🔊
        </button>
      </div>
    </div>
    <div v-if="filteredWords.length === 0" class="empty-state">
      <p>没有找到单词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Word } from '@/types'

const props = defineProps<{
  words: Word[]
  vocabularyName: string
  favoriteWords: string[]
  difficultWords: string[]
  isSpeaking: boolean
  currentWord: string | null
}>()

const emit = defineEmits<{
  play: [word: Word]
}>()

const searchQuery = ref('')
const filter = ref<'all' | 'favorites' | 'difficult'>('all')

const filteredWords = computed(() => {
  let result = props.words

  if (filter.value === 'favorites') {
    result = result.filter(w => props.favoriteWords.includes(w.word))
  } else if (filter.value === 'difficult') {
    result = result.filter(w => props.difficultWords.includes(w.word))
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(w => 
      w.word.toLowerCase().includes(query) ||
      w.meaning.toLowerCase().includes(query)
    )
  }

  return result
})

const handleWordClick = (word: Word) => {
  emit('play', word)
}
</script>

<style scoped>
.word-list {
  width: 100%;
  padding: 0.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.list-header h2 {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0;
}

.search-box {
  flex: 1;
  max-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 15px;
  background: #f0f0f0;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #e0e0e0;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.8rem;
}

.word-item {
  background: white;
  border-radius: 10px;
  padding: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.word-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background 0.2s;
}

.word-item.favorite::before {
  background: #fbbf24;
}

.word-item.difficult::before {
  background: #ef4444;
}

.word-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.word-item.speaking {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.word-item.speaking .item-word,
.word-item.speaking .item-meaning {
  color: white;
}

.word-item.speaking .play-icon {
  background: rgba(255, 255, 255, 0.3);
}

.word-info {
  flex: 1;
}

.item-word {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.2rem 0;
}

.item-meaning {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.play-icon {
  font-size: 1.2rem;
  background: #f0f0f0;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.play-icon:hover {
  background: #667eea;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1rem;
}

@media (max-width: 480px) {
  .list-header h2 {
    font-size: 1.2rem;
  }
  
  .words-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.6rem;
  }
  
  .item-word {
    font-size: 1rem;
  }
}
</style>
