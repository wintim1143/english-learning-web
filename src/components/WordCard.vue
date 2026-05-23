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

    <!-- 衍生词汇与例句选项卡面板 -->
    <div class="derivative-section" v-if="availableTabs.length > 0">
      <!-- 动态 Tab 导航栏 -->
      <div v-if="availableTabs.length > 1" class="tab-header">
        <button 
          v-for="tab in availableTabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab 面板内容 -->
      <div class="tab-content">
        <!-- 1. 例句 Tab -->
        <div v-if="currentTab === 'example' && word.example" class="tab-pane example-pane">
          <p class="example-text">{{ word.example }}</p>
          <p v-if="word.exampleCn" class="example-translation">{{ word.exampleCn }}</p>
        </div>

        <!-- 2. 短语 Tab -->
        <div v-else-if="currentTab === 'phrases' && word.phrases" class="tab-pane list-pane">
          <ul>
            <li v-for="(phrase, idx) in word.phrases" :key="idx">
              {{ phrase }}
            </li>
          </ul>
        </div>

        <!-- 3. 同反义 Tab -->
        <div v-else-if="currentTab === 'synos'" class="tab-pane list-pane">
          <!-- 同近义 -->
          <div v-if="word.synos && word.synos.length > 0" class="sub-pane">
            <h4>💡 同近义词</h4>
            <ul>
              <li v-for="(syn, idx) in word.synos" :key="idx">{{ syn }}</li>
            </ul>
          </div>
          <!-- 反义词 -->
          <div v-if="word.antos && word.antos.length > 0" class="sub-pane anton-pane">
            <h4>⚖️ 反义词</h4>
            <div class="antos-list">
              <span v-for="(ant, idx) in word.antos" :key="idx" class="anto-item">{{ ant }}</span>
            </div>
          </div>
        </div>

        <!-- 4. 同根词 Tab -->
        <div v-else-if="currentTab === 'rels' && word.rels" class="tab-pane list-pane">
          <ul>
            <li v-for="(rel, idx) in word.rels" :key="idx">
              {{ rel }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 收藏与难点操作按钮 -->
    <div class="actions">
      <button 
        class="action-btn favorite" 
        :class="{ active: isFavorite }"
        @click="emit('toggleFavorite')"
      >
        {{ isFavorite ? '⭐ 已收藏' : '☆ 收藏' }}
      </button>
      <button 
        class="action-btn difficult" 
        :class="{ active: isDifficult }"
        @click="emit('toggleDifficult')"
      >
        {{ isDifficult ? '🔖 已设难点' : '📑 设为难点' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Word } from '../types'

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

const currentTab = ref<string>('example')

// 动态计算该单词有哪些可用的辅助 Tab 选项卡
const availableTabs = computed(() => {
  const tabs = []
  if (props.word.example) {
    tabs.push({ id: 'example', name: '📖 例句' })
  }
  if (props.word.phrases && props.word.phrases.length > 0) {
    tabs.push({ id: 'phrases', name: '🔗 短语' })
  }
  if ((props.word.synos && props.word.synos.length > 0) || (props.word.antos && props.word.antos.length > 0)) {
    tabs.push({ id: 'synos', name: '🔄 同近反' })
  }
  if (props.word.rels && props.word.rels.length > 0) {
    tabs.push({ id: 'rels', name: '🌳 同根词' })
  }
  return tabs
})

// 当切换单词时，重置 Tab 为当前单词可用的第一个 Tab，保证展示正常
watch(() => props.word, (newWord) => {
  if (newWord) {
    const defaultTab = availableTabs.value[0]?.id || 'example'
    currentTab.value = defaultTab
  }
}, { immediate: true })

const handleSpeak = () => {
  emit('speak', props.word)
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
  max-height: 90vh; /* 避免在小屏/移动端溢出屏幕 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 0.5rem;
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
  margin: 0.3rem 0;
  font-family: 'Arial Unicode MS', 'Lucida Sans Unicode', sans-serif;
}

.meaning {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0.8rem 0;
}

/* ================= 衍生词汇 Tab 样式 ================= */
.derivative-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-header {
  display: flex;
  gap: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 0.5rem;
  margin-bottom: 0.8rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-header::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  outline: none;
}

.tab-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  font-weight: bold;
}

.tab-content {
  min-height: 80px;
  max-height: 190px; /* 限制最高高度，防止卡片被数据撑得太大 */
  overflow-y: auto;  /* 超出高度时生成滚动条 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  animation: tabFadeIn 0.3s ease-out;
  padding-right: 0.4rem;
}

/* 美化 Tab 内容区滚动条 */
.tab-content::-webkit-scrollbar {
  width: 4px;
}

.tab-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

@keyframes tabFadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.example-text {
  font-size: 1.05rem;
  font-style: italic;
  margin-bottom: 0.4rem;
  line-height: 1.4;
  color: #fff;
}

.example-translation {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

.list-pane ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-pane li {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.4rem;
  position: relative;
  padding-left: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.list-pane li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: rgba(255, 255, 255, 0.5);
}

.sub-pane h4 {
  font-size: 0.9rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.4rem;
}

.anton-pane {
  margin-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.6rem;
}

.antos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.anto-item {
  background: rgba(255, 255, 255, 0.12);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ================= 底部操作按钮 ================= */
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
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  outline: none;
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
    font-size: 1.2rem;
  }
  
  .example-text {
    font-size: 0.95rem;
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
    font-size: 0.85rem;
  }
}
</style>
