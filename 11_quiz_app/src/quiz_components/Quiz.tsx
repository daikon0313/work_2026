import { useState } from 'react'
import { quizData } from '../data/quizData'

function Quiz(): JSX.Element {
  // State の定義
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  // 現在の質問を取得
  const currentQuestion = quizData[currentQuestionIndex]

  // 回答を選択
  const handleAnswerClick = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)

    // 正解かチェック
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestionIndex + 1

    if (nextQuestion < quizData.length) {
      setCurrentQuestionIndex(nextQuestion)
      setSelectedAnswer(null)
    } else {
      setShowScore(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowScore(false)
    setSelectedAnswer(null)
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