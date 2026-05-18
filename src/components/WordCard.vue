<template>
  <div class="word-card" :class="{ 'speaking': isSpeaking && word.word === currentWord }">
    <div class="word-header">
      <h2 class="word-text">{{ word.word }}</h2>
      <button 
        class="speak-btn" 
        @click="handleSpeak"
        :disabled="isSpeaking && currentWord === word.word"
      >
        🔊
      </button>
    </div>
    <p class="phonetic">{{ word.phonetic }}</p>
    <p class="meaning">{{ word.meaning }}</p>
    <div class="example-section">
      <p class="example-text">{{ word.example }}</p>
      <p class="example-translation">{{ translateExample(word.example) }}</p>
    </div>
    <div class="actions">
      <button 
        class="action-btn favorite" 
        :class="{ active: isFavorite }"
        @click="$emit('toggle-favorite')"
      >
        {{ isFavorite ? '⭐' : '☆' }}
      </button>
      <button 
        class="action-btn difficult" 
        :class="{ active: isDifficult }"
        @click="$emit('toggle-difficult')"
      >
        {{ isDifficult ? '🔖' : '📑' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Word } from '@/types'

const props = defineProps<{
  word: Word
  isSpeaking: boolean
  currentWord: string | null
  isFavorite: boolean
  isDifficult: boolean
}>()

const emit = defineEmits<{
  speak: [word: Word]
  toggleFavorite: []
  toggleDifficult: []
}>()

const handleSpeak = () => {
  emit('speak', props.word)
}

const translateExample = (example: string): string => {
  const translations: Record<string, string> = {
    "I eat an apple every day.": "我每天吃一个苹果。",
    "She reads a book before bed.": "她睡前看书。",
    "The cat is sleeping on the sofa.": "猫正在沙发上睡觉。",
    "My dog likes to play fetch.": "我的狗喜欢玩接球游戏。",
    "The elephant has a long trunk.": "大象有一个长长的鼻子。",
    "This flower smells very sweet.": "这朵花闻起来很香。",
    "The girl is wearing a red dress.": "女孩穿着红色的连衣裙。",
    "They live in a big house.": "他们住在一所大房子里。",
    "Ice cream is my favorite dessert.": "冰淇淋是我最喜欢的甜点。",
    "Would you like some orange juice?": "你想要些橙汁吗？"
  }
  return translations[example] || example
}
</script>

<style scoped>
.word-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  max-width: 500px;
  margin: 0 auto;
}

.word-card.speaking {
  transform: scale(1.02);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.word-text {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.speak-btn {
  font-size: 1.8rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.speak-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.speak-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.phonetic {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0.5rem 0;
  font-family: 'Arial Unicode MS', 'Lucida Sans Unicode', sans-serif;
}

.meaning {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0.8rem 0;
}

.example-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem;
  margin: 1rem 0;
}

.example-text {
  font-size: 1rem;
  margin: 0 0 0.4rem 0;
  font-style: italic;
}

.example-translation {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.action-btn {
  flex: 1;
  padding: 0.7rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 480px) {
  .word-card {
    padding: 1.2rem;
  }
  
  .word-text {
    font-size: 2rem;
  }
  
  .speak-btn {
    width: 45px;
    height: 45px;
    font-size: 1.5rem;
  }
  
  .phonetic {
    font-size: 1rem;
  }
  
  .meaning {
    font-size: 1.3rem;
  }
  
  .example-text {
    font-size: 0.9rem;
  }
  
  .example-translation {
    font-size: 0.85rem;
  }
  
  .actions {
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .action-btn {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}
</style>
