<template>
  <div class="quiz-mode">
    <div class="quiz-header">
      <h2>🎯 小测验</h2>
      <div class="score-display">
        <span>得分：<strong>{{ score }}</strong></span>
        <span>题目：<strong>{{ currentQuestionIndex + 1 }}/{{ questions.length }}</strong></span>
      </div>
    </div>

    <div v-if="!quizStarted" class="quiz-start">
      <p class="start-description">测试你的单词掌握程度！</p>
      <div class="quiz-options-container">
        <div class="quiz-option-group">
          <span class="option-title">测验模式：</span>
          <div class="quiz-options">
            <label>
              <input type="radio" v-model="quizType" value="meaning" />
              <span>看英文选中文</span>
            </label>
            <label>
              <input type="radio" v-model="quizType" value="word" />
              <span>看中文选英文</span>
            </label>
          </div>
        </div>
        <div class="quiz-option-group">
          <span class="option-title">测验词数：</span>
          <select v-model="quizCount" class="quiz-select">
            <option :value="5">5 个单词</option>
            <option :value="10">10 个单词</option>
            <option :value="20">20 个单词</option>
            <option :value="30">30 个单词</option>
            <option :value="50">50 个单词</option>
            <option :value="Math.min(100, words.length)">最多 ({{ Math.min(100, words.length) }} 个)</option>
          </select>
        </div>
      </div>
      <button class="start-btn" @click="startQuiz">开始测验</button>
    </div>

    <div v-else-if="quizFinished" class="quiz-result">
      <div class="result-icon">🏆</div>
      <h3>测验完成！</h3>
      <p class="final-score">你的得分：<strong>{{ score }}/{{ questions.length }}</strong></p>
      <p class="accuracy">正确率：{{ Math.round((score / questions.length) * 100) }}%</p>
      <div class="result-actions">
        <button class="retry-btn" @click="restartQuiz">再试一次</button>
        <button class="back-btn" @click="$emit('back')">返回列表</button>
      </div>
    </div>

    <div v-else class="quiz-question">
      <div class="question-card">
        <div class="question-label">请选择正确的答案：</div>
        <div class="question-word">{{ currentQuestion.question }}</div>
        <button v-if="quizType === 'meaning'" class="speak-question-btn" @click="speakQuestion">🔊 播放发音</button>
      </div>

      <div class="answers-grid">
        <button
          v-for="(answer, index) in currentQuestion.options"
          :key="index"
          :class="['answer-btn', getAnswerClass(index)]"
          @click="selectAnswer(index)"
          :disabled="answered"
        >
          {{ answer }}
        </button>
      </div>

      <div v-if="answered" class="feedback">
        <div :class="['feedback-icon', isCorrect ? 'correct' : 'incorrect']">
          {{ isCorrect ? '✅' : '❌' }}
        </div>
        <p :class="['feedback-text', isCorrect ? 'correct' : 'incorrect']">
          {{ isCorrect ? '太棒了！答对了！' : `正确答案是：${currentQuestion.correctAnswer}` }}
        </p>
        <button class="next-btn" @click="nextQuestion">下一题 →</button>
      </div>

      <div class="progress-bar">
        <div class="progress" :style="{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Word } from '../types'
import { useTTS } from '../composables/useTTS'

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits<{
  back: []
}>()

const { speak } = useTTS()

const quizStarted = ref(false)
const quizFinished = ref(false)
const quizType = ref<'meaning' | 'word'>('meaning')
const quizCount = ref(10)
const score = ref(0)
const currentQuestionIndex = ref(0)
const answered = ref(false)
const selectedAnswer = ref<number | null>(null)
const isCorrect = ref(false)

// 使用 Web Audio API 动态合成简单答题提示音，无需加载任何音频文件
const playQuizSound = (type: 'correct' | 'incorrect') => {
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) return
  
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    const now = ctx.currentTime
    
    if (type === 'correct') {
      // 成功：递增的清脆音
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now) // C5
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05)
      gain.gain.linearRampToValueAtTime(0, now + 0.15)
      
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(659.25, now + 0.08) // E5
      gain2.gain.setValueAtTime(0, now + 0.08)
      gain2.gain.linearRampToValueAtTime(0.15, now + 0.13)
      gain2.gain.linearRampToValueAtTime(0, now + 0.25)
      
      osc.start(now)
      osc.stop(now + 0.15)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.25)
    } else {
      // 失败：短促且明显的双击低频 Buzzer 警报音（锯齿波，在 150Hz 双音连发）
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now) // 150Hz
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03)
      gain.gain.linearRampToValueAtTime(0, now + 0.12)
      
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sawtooth'
      osc2.frequency.setValueAtTime(150, now + 0.1) // 0.1秒后发出第二声
      gain2.gain.setValueAtTime(0, now + 0.1)
      gain2.gain.linearRampToValueAtTime(0.18, now + 0.13)
      gain2.gain.linearRampToValueAtTime(0, now + 0.22)
      
      osc.start(now)
      osc.stop(now + 0.12)
      osc2.start(now + 0.1)
      osc2.stop(now + 0.22)
    }
  } catch (e) {
    console.error('Failed to synthesize quiz sound:', e)
  }
}

interface Question {
  question: string
  correctAnswer: string
  options: string[]
  word: Word
}

const questions = ref<Question[]>([])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const generateQuestions = () => {
  const limit = Math.min(quizCount.value, props.words.length)
  const shuffledWords = shuffleArray([...props.words]).slice(0, limit)
  questions.value = shuffledWords.map(word => {
    const otherWords = props.words.filter(w => w.word !== word.word)
    const wrongOptions = shuffleArray(otherWords).slice(0, 3)
    
    if (quizType.value === 'meaning') {
      const correctAnswer = word.meaning
      const options = shuffleArray([
        correctAnswer,
        ...wrongOptions.map(w => w.meaning)
      ])
      return {
        question: word.word,
        correctAnswer,
        options,
        word
      }
    } else {
      const correctAnswer = word.word
      const options = shuffleArray([
        correctAnswer,
        ...wrongOptions.map(w => w.word)
      ])
      return {
        question: word.meaning,
        correctAnswer,
        options,
        word
      }
    }
  })
}

const startQuiz = () => {
  generateQuestions()
  quizStarted.value = true
  quizFinished.value = false
  score.value = 0
  currentQuestionIndex.value = 0
  answered.value = false
}

const restartQuiz = () => {
  startQuiz()
}

const speakQuestion = () => {
  if (quizType.value === 'meaning') {
    speak(currentQuestion.value.word)
  }
}

const selectAnswer = (index: number) => {
  if (answered.value) return
  
  answered.value = true
  selectedAnswer.value = index
  isCorrect.value = currentQuestion.value.options[index] === currentQuestion.value.correctAnswer
  
  if (isCorrect.value) {
    score.value++
    playQuizSound('correct')
  } else {
    playQuizSound('incorrect')
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    answered.value = false
    selectedAnswer.value = null
    isCorrect.value = false
  } else {
    quizFinished.value = true
  }
}

const getAnswerClass = (index: number) => {
  if (!answered.value) return ''
  if (currentQuestion.value.options[index] === currentQuestion.value.correctAnswer) {
    return 'correct'
  }
  if (index === selectedAnswer.value && !isCorrect.value) {
    return 'incorrect'
  }
  return ''
}
</script>

<style scoped>
.quiz-mode {
  max-width: 700px;
  margin: 0 auto;
  padding: 0.8rem;
  width: 100%;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.quiz-header h2 {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0;
}

.score-display {
  font-size: 1.1rem;
  color: #666;
}

.score-display strong {
  color: #667eea;
}

.quiz-start {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.start-description {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 2rem;
}

.quiz-options {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.quiz-options-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 2.2rem;
}

.quiz-option-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  justify-content: center;
  width: 100%;
}

.option-title {
  font-size: 1.05rem;
  font-weight: bold;
  color: #555;
  min-width: 90px;
  text-align: right;
}

.quiz-select {
  padding: 0.45rem 1.2rem;
  font-size: 0.95rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: #333;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.quiz-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.25);
}

.quiz-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: #444;
}

.quiz-options input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.start-btn {
  padding: 1rem 3rem;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.quiz-result {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.result-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.quiz-result h3 {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.final-score {
  font-size: 1.5rem;
  color: #444;
  margin-bottom: 0.5rem;
}

.final-score strong {
  color: #667eea;
  font-size: 2rem;
}

.accuracy {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.retry-btn,
.back-btn {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.back-btn {
  background: #f0f0f0;
  color: #666;
}

.back-btn:hover {
  background: #e0e0e0;
}

.quiz-question {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.question-card {
  text-align: center;
  margin-bottom: 2rem;
}

.question-label {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}

.question-word {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1rem;
}

.speak-question-btn {
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.speak-question-btn:hover {
  background: #667eea;
  color: white;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.answer-btn {
  padding: 1.5rem 1rem;
  font-size: 1.2rem;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.answer-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f0f0ff;
}

.answer-btn.correct {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.answer-btn.incorrect {
  background: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}

.feedback {
  text-align: center;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 15px;
  margin-bottom: 1.5rem;
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.feedback-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.feedback-text.correct {
  color: #10b981;
}

.feedback-text.incorrect {
  color: #ef4444;
}

.next-btn {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

@media (max-width: 480px) {
  .quiz-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .quiz-header h2 {
    font-size: 1.2rem;
  }
  
  .quiz-start,
  .quiz-result,
  .quiz-question {
    padding: 1.2rem;
  }
  
  .start-description {
    font-size: 1rem;
  }
  
  .quiz-options {
    flex-direction: column;
    gap: 1rem;
  }
  
  .start-btn {
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
  }
  
  .result-icon {
    font-size: 3.5rem;
  }
  
  .quiz-result h3 {
    font-size: 1.5rem;
  }
  
  .final-score {
    font-size: 1.2rem;
  }
  
  .final-score strong {
    font-size: 1.5rem;
  }
  
  .question-word {
    font-size: 2rem;
  }
  
  .answers-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .answer-btn {
    padding: 1rem;
    font-size: 1rem;
  }
}
</style>
