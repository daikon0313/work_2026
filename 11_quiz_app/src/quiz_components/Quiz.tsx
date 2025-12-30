import { useState } from 'react'
import { quizData } from '../data/quizData'

// 型定義
type AnswerHistory = {
  question_id: number
  question_text: string
  selected_answer: number
  correct_answer: number
  is_correct: boolean
}

function Quiz() {
  // State の定義
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>('')

  // 現在の質問を取得
  const currentQuestion = quizData[currentQuestionIndex]

  // 回答を選択
  const handleAnswerClick = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)

    const isCorrect = answerIndex === currentQuestion.correctAnswer

    // 正解かチェック
    if (isCorrect) {
      setScore(score + 1)
    }

    // 回答履歴に追加
    const newAnswer: AnswerHistory = {
      question_id: currentQuestion.id,
      question_text: currentQuestion.question,
      selected_answer: answerIndex,
      correct_answer: currentQuestion.correctAnswer,
      is_correct: isCorrect
    }
    setAnswerHistory([...answerHistory, newAnswer])
  }

  // クイズ結果をバックエンドに保存
  const saveQuizResults = async (finalScore: number, finalAnswers: AnswerHistory[]) => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('http://localhost:8000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: finalScore,
          total_questions: quizData.length,
          answers: finalAnswers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save quiz results')
      }

      const data = await response.json()
      setSaveMessage(`✅ ${data.message}`)
    } catch (error) {
      console.error('Error saving quiz results:', error)
      setSaveMessage('❌ 結果の保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1

    if (nextQuestion < quizData.length) {
      setCurrentQuestionIndex(nextQuestion)
      setSelectedAnswer(null)
    } else {
      // クイズ終了時に結果を保存
      const finalScore = score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)
      saveQuizResults(finalScore, answerHistory)
      setShowScore(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowScore(false)
    setSelectedAnswer(null)
    setAnswerHistory([])
    setSaveMessage('')
  }

  // スコア画面
  if (showScore) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>クイズ終了！</h1>
        <p style={{ fontSize: '24px' }}>
          スコア: {score} / {quizData.length}
        </p>
        <p>正解率: {Math.round((score / quizData.length) * 100)}%</p>

        {/* 保存状態の表示 */}
        {isSaving && (
          <p style={{ color: '#2196F3', marginTop: '20px' }}>
            💾 結果を保存中...
          </p>
        )}
        {saveMessage && (
          <p style={{
            marginTop: '20px',
            fontSize: '16px',
            color: saveMessage.includes('✅') ? '#4CAF50' : '#f44336'
          }}>
            {saveMessage}
          </p>
        )}

        <button
          onClick={handleRestart}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          もう一度挑戦
        </button>
      </div>
    )
  }

  // クイズ画面
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>質問 {currentQuestionIndex + 1} / {quizData.length}</p>
      </div>

      <h2 style={{ marginBottom: '30px' }}>{currentQuestion.question}</h2>

      <div style={{ marginBottom: '20px' }}>
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
            style={{
              display: 'block',
              width: '100%',
              padding: '15px',
              margin: '10px 0',
              fontSize: '16px',
              backgroundColor:
                selectedAnswer === null
                  ? '#f0f0f0'
                  : index === currentQuestion.correctAnswer
                  ? '#4CAF50'
                  : selectedAnswer === index
                  ? '#f44336'
                  : '#f0f0f0',
              color:
                selectedAnswer !== null &&
                (index === currentQuestion.correctAnswer || selectedAnswer === index)
                  ? 'white'
                  : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: selectedAnswer === null ? 'pointer' : 'not-allowed'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            {selectedAnswer === currentQuestion.correctAnswer
              ? '✅ 正解！'
              : '❌ 不正解...'}
          </p>
          <button
            onClick={handleNextQuestion}
            style={{
              padding: '10px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {currentQuestionIndex + 1 < quizData.length ? '次の質問へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz