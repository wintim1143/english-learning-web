import { ref, computed } from 'vue'
import type { Word } from '@/types'

export function useTTS() {
  const isSpeaking = ref(false)
  const currentWord = ref<string | null>(null)

  const speak = (word: Word) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this browser')
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.pitch = 1

    utterance.onstart = () => {
      isSpeaking.value = true
      currentWord.value = word.word
    }

    utterance.onend = () => {
      isSpeaking.value = false
      currentWord.value = null
    }

    utterance.onerror = () => {
      isSpeaking.value = false
      currentWord.value = null
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    currentWord.value = null
  }

  return {
    isSpeaking,
    currentWord,
    speak,
    stop
  }
}
