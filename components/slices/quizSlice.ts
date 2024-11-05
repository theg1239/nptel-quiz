// slices/quizSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProcessedQuestion, UserAnswer, QuizType, PowerUpType } from '@/types/quiz';

interface ModalContent {
  title: string;
  message: string;
}

interface QuizState {
  currentQuestionIndex: number;
  isAnswerLocked: boolean;
  score: number;
  lives: number;
  timeLeft: number | null,
  powerUps: PowerUpType[];
  quizEnded: boolean;
  availableOptions: number[];
  feedback: { correct: boolean; selectedIndexes: number[] } | null;
  selectedOptions: number[];
  userAnswers: UserAnswer[];
  shake: boolean;
  isModalOpen: boolean;
  modalContent: ModalContent;
}

const initialState: QuizState = {
  currentQuestionIndex: 0,
  isAnswerLocked: false,
  score: 0,
  lives: 3,
  timeLeft: null,
  powerUps: [],
  quizEnded: false,
  availableOptions: [0, 1, 2, 3],
  feedback: null,
  selectedOptions: [],
  userAnswers: [],
  shake: false,
  isModalOpen: false,
  modalContent: { title: '', message: '' },
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setCurrentQuestionIndex(state, action: PayloadAction<number>) {
      state.currentQuestionIndex = action.payload;
    },
    setIsAnswerLocked(state, action: PayloadAction<boolean>) {
      state.isAnswerLocked = action.payload;
    },
    setScore(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
    setLives(state, action: PayloadAction<number>) {
      state.lives = action.payload;
    },
    setTimeLeft(state, action: PayloadAction<number | null>) {
      state.timeLeft = action.payload;
    },
    decrementTimeLeft(state) {
        if (state.timeLeft && state.timeLeft > 0) {
          state.timeLeft -= 1;
          console.log('Decrementing state.timeLeft:', state.timeLeft); // Track decrement logic
        } else {
          console.log('Attempted decrement when timeLeft is null or <= 0'); // Ensure no reset to 0
        }
      },
    setPowerUps(state, action: PayloadAction<PowerUpType[]>) {
      state.powerUps = action.payload;
    },
    addUserAnswer(state, action: PayloadAction<UserAnswer>) {
      state.userAnswers.push(action.payload);
    },
    setQuizEnded(state, action: PayloadAction<boolean>) {
      state.quizEnded = action.payload;
    },
    setAvailableOptions(state, action: PayloadAction<number[]>) {
      state.availableOptions = action.payload;
    },
    setFeedback(state, action: PayloadAction<{ correct: boolean; selectedIndexes: number[] } | null>) {
      state.feedback = action.payload;
    },
    setSelectedOptions(state, action: PayloadAction<number[]>) {
      state.selectedOptions = action.payload;
    },
    setUserAnswers(state, action: PayloadAction<UserAnswer[]>) {
      state.userAnswers = action.payload;
    },
    setShake(state, action: PayloadAction<boolean>) {
      state.shake = action.payload;
    },
    resetQuiz(state) {
      Object.assign(state, initialState);
    },
    openModal(state, action: PayloadAction<ModalContent>) {
      state.isModalOpen = true;
      state.modalContent = action.payload;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.modalContent = { title: '', message: '' };
    },
  },
});

export const {
  setCurrentQuestionIndex,
  setIsAnswerLocked,
  setScore,
  setLives,
  setTimeLeft,
  decrementTimeLeft,
  setPowerUps,
  setQuizEnded,
  setAvailableOptions,
  setFeedback,
  setSelectedOptions,
  setUserAnswers,
  setShake,
  addUserAnswer,
  resetQuiz,
  openModal,
  closeModal,
} = quizSlice.actions;

export default quizSlice.reducer;
