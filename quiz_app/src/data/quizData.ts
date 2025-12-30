export type QuizQuestion = {
    id: number
    question: string
    options: string[]
    correctAnswer: number
}

export const quizData: QuizQuestion[] = [
    {
        id: 1,
        question: "日本の首都はどこですか?",
        options: ["大阪", "京都", "東京", "名古屋"],
        correctAnswer: 2,
    },
    {
        id: 2,
        question: "1 + 1 = ?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
    },
    {
        id: 3,
        question: "Reactのフックで状態管理に使うのは？",
        options: ["useState", "useEffect", "useContext", "useRef"],
        correctAnswer: 0,
    }
]