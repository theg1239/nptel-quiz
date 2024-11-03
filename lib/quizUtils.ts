// lib/quizUtils.ts

/**
 * Represents a quiz question.
 */
export interface Question {
    question: string;
    options: string[];
    answer: string[]; // Labels like "A", "B", etc.
  }
  
  /**
   * Strips labels from options and extracts the labels.
   * Handles multiple formats like "Option A: Text", "A) Text", "A. Text".
   * @param options - The array of option strings.
   * @returns An object containing clean options and their corresponding labels.
   */
  export function stripOptionLabels(options: string[]): { cleanOptions: string[]; labels: string[] } {
    const regex = /^(?:Option\s)?([A-Z])[).:-]?\s*/i; // Case-insensitive
    const cleanOptions = options.map((option) => {
      const match = option.match(regex);
      const label = match ? match[1].toUpperCase() : '';
      const cleanOption = option.replace(regex, '');
      console.log(`Option: "${option}", Label: "${label}", Clean Option: "${cleanOption}"`);
      return cleanOption;
    });
    const labels = options.map((option) => {
      const match = option.match(regex);
      return match ? match[1].toUpperCase() : '';
    });
    return { cleanOptions, labels };
  }
  
  /**
   * Formats and initializes questions by labeling options.
   * @param questions - The array of question objects.
   * @returns An array of questions with labeled options.
   */
  export function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
    return questions.map((q) => {
      const { cleanOptions, labels } = stripOptionLabels(q.options);
      const labeledOptions = labels.map((label, index) => `${label}. ${cleanOptions[index]}`);
      console.log(`Question: "${q.question}", Labeled Options: ${labeledOptions}`);
      return {
        ...q,
        options: labeledOptions,
      };
    });
  }
  