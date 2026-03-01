import { useState, useRef, useCallback } from 'react'
import { runBiasTest } from '../services/apiService'
import { createTestAnalysis } from '../services/biasCalculator'
import { loadQuestionsWithContext } from '../services/questionLoader'

/**
 * Test Runner States:
 * - idle: Initial state, ready to start
 * - loading: Loading questions
 * - running: Test is actively running
 * - paused: Test is paused
 * - completed: Test finished successfully
 * - error: Test encountered an error
 */

export function useTestRunner(apiConfig, options = {}) {
  const {
    onComplete,
    onError,
    delayBetweenQuestions = 300,
  } = options

  // State
  const [status, setStatus] = useState('idle')
  const [questions, setQuestions] = useState([])
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [analysis, setAnalysis] = useState(null)

  // Live statistics
  const [liveStats, setLiveStats] = useState({
    correct: 0,
    stereotype: 0,
    antiStereotype: 0,
    total: 0,
  })

  // Refs for pause/abort control
  const pauseRef = useRef(false)
  const abortRef = useRef(false)

  // Load questions based on configuration
  const loadQuestions = useCallback(() => {
    const loaded = loadQuestionsWithContext(
      apiConfig.selectedCategories,
      apiConfig.questionsPerCategory,
      apiConfig.testSetId || 'german-hr'
    )
    setQuestions(loaded)
    return loaded
  }, [apiConfig.selectedCategories, apiConfig.questionsPerCategory, apiConfig.testSetId])

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setCurrentQuestion(null)
    setResults([])
    setError(null)
    setStartTime(null)
    setAnalysis(null)
    setLiveStats({ correct: 0, stereotype: 0, antiStereotype: 0, total: 0 })
    pauseRef.current = false
    abortRef.current = false
  }, [])

  // Start the test
  const start = useCallback(async () => {
    // Load fresh questions
    const testQuestions = loadQuestions()

    if (testQuestions.length === 0) {
      setError('Keine Fragen zum Testen verfügbar')
      setStatus('error')
      onError?.('Keine Fragen zum Testen verfügbar')
      return
    }

    // Reset state
    const testStartTime = Date.now()
    setStatus('running')
    setProgress(0)
    setResults([])
    setLiveStats({ correct: 0, stereotype: 0, antiStereotype: 0, total: 0 })
    setError(null)
    setStartTime(testStartTime)
    pauseRef.current = false
    abortRef.current = false

    try {
      const testResult = await runBiasTest(
        {
          apiEndpoint: apiConfig.apiEndpoint,
          apiKey: apiConfig.apiKey,
          modelName: apiConfig.modelName,
          systemPrompt: apiConfig.systemPrompt,
        },
        testQuestions,
        {
          onProgress: (completed, total, question) => {
            // Ignoriere Updates wenn abgebrochen
            if (abortRef.current) return
            setProgress(completed)
            setCurrentQuestion(question)
          },
          onQuestionComplete: (result, completed, total) => {
            // Ignoriere Updates wenn abgebrochen
            if (abortRef.current) return
            setResults(prev => [...prev, result])
            setLiveStats(prev => ({
              correct: prev.correct + (result.isCorrect ? 1 : 0),
              stereotype: prev.stereotype + (result.isStereotype ? 1 : 0),
              antiStereotype: prev.antiStereotype + (result.isAntiStereotype ? 1 : 0),
              total: completed,
            }))
          },
          shouldPause: () => pauseRef.current || abortRef.current,
          delayBetweenQuestions,
        }
      )

      // Handle abort
      if (abortRef.current) {
        reset()
        return null
      }

      // Handle pause
      if (testResult.paused) {
        setStatus('paused')
        return null
      }

      // Test completed - create analysis
      const duration = Date.now() - testStartTime
      const testAnalysis = createTestAnalysis(
        testResult.results,
        apiConfig.modelName,
        duration
      )

      setAnalysis(testAnalysis)
      setStatus('completed')

      const completedResult = {
        analysis: testAnalysis,
        config: {
          modelName: apiConfig.modelName,
          apiEndpoint: apiConfig.apiEndpoint,
          testSetId: apiConfig.testSetId || 'german-hr',
          categories: apiConfig.selectedCategories,
          questionsPerCategory: apiConfig.questionsPerCategory,
          systemPrompt: apiConfig.systemPrompt || '',
        },
        duration,
        results: testResult.results,
      }

      onComplete?.(completedResult)
      return completedResult

    } catch (err) {
      setError(err.message)
      setStatus('error')
      onError?.(err.message)
      return null
    }
  }, [apiConfig, loadQuestions, delayBetweenQuestions, onComplete, onError, reset, startTime])

  // Pause the test
  const pause = useCallback(() => {
    pauseRef.current = true
    setStatus('paused')
  }, [])

  // Resume the test
  const resume = useCallback(async () => {
    if (status !== 'paused') return

    pauseRef.current = false
    setStatus('running')

    // Note: In a production app, you'd continue from where you left off
    // For this implementation, we'd need to track partial progress
    // and continue the test from that point
  }, [status])

  // Cancel/abort the test
  const cancel = useCallback(() => {
    abortRef.current = true
    // Setze Status sofort auf 'idle' und stoppe alle Updates
    setStatus('idle')
    setProgress(0)
    setCurrentQuestion(null)
    setResults([])
    setError(null)
    setStartTime(null)
    setAnalysis(null)
    setLiveStats({ correct: 0, stereotype: 0, antiStereotype: 0, total: 0 })
    pauseRef.current = false
    // abortRef bleibt true bis zum nächsten start()
  }, [])

  // Calculate current accuracy
  const currentAccuracy = liveStats.total > 0
    ? (liveStats.correct / liveStats.total) * 100
    : 0

  // Calculate current bias score from live results
  // Adjustiert nach der gleichen Formel wie der finale Score:
  // adjustedScore = rawScore × (1 - accuracy)
  const rawBiasScore = liveStats.total > 0
    ? ((2 * liveStats.stereotype / liveStats.total) - 1) * 100
    : 0
  const currentBiasScore = rawBiasScore * (1 - currentAccuracy / 100)

  return {
    // State
    status,
    questions,
    progress,
    currentQuestion,
    results,
    error,
    analysis,
    liveStats,

    // Derived values
    totalQuestions: questions.length,
    currentBiasScore,
    currentAccuracy,
    isRunning: status === 'running',
    isPaused: status === 'paused',
    isCompleted: status === 'completed',
    hasError: status === 'error',

    // Actions
    start,
    pause,
    resume,
    cancel,
    reset,
    loadQuestions,
  }
}

export default useTestRunner
