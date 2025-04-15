export interface Question {
  question: string;
  options: string[];
  answer: string[]; 
}

export function stripOptionLabels(options: string[]): { cleanOptions: string[]; labels: string[] } {
  const regex = /^([A-Z])[).:-]?\s*/i;
  const cleanOptions = options.map(option => {
    const cleanOption = option.replace(regex, '').trim();
    return cleanOption;
  });
  
  const labels = options.map(option => {
    const match = option.match(regex);
    return match ? match[1].toUpperCase() : '';
  });
  
  return { cleanOptions, labels };
}

export function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
  return questions.map((q) => {
    // Add option labels if they don't exist
    const options = q.options.map((opt, idx) => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const hasLabel = /^[A-Z][).:-]?\s*/i.test(opt);
      return hasLabel ? opt : `${letters[idx]}. ${opt}`;
    });

    // Transform answers to use letter format if they're indices
    const answers = q.answer.map(ans => {
      const isNumeric = !isNaN(Number(ans));
      if (isNumeric) {
        const idx = parseInt(ans);
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return letters[idx];
      }
      return ans.toUpperCase();
    });

    return {
      ...q,
      options,
      answer: answers
    };
  });
}
