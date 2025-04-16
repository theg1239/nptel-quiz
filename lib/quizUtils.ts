export interface Question {
  question: string;
  options: { option_number: string, option_text: string }[];
  answer: string[]; 
}

export function stripOptionLabels(options: { option_number: string, option_text: string }[]): { cleanOptions: string[]; labels: string[] } {
  const cleanOptions = options.map(option => option.option_text.trim());
  const labels = options.map(option => option.option_number);
  return { cleanOptions, labels };
}

export function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
  return questions.map((q) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const options = q.options.map((opt, idx) => {
      if (typeof opt === 'string') {
        const optStr = String(opt);
        const hasLabel = /^[A-Z][).:-]?\s*/i.test(optStr);
        const match = optStr.match(/^([A-Z])[).:-]?\s*(.*)/i);
        if (hasLabel && match) {
          return {
            option_number: match[1].toUpperCase(),
            option_text: match[2].trim()
          };
        }
        return {
          option_number: letters[idx],
          option_text: optStr.trim()
        };
      }
      if (!opt.option_number) {
        return {
          ...opt,
          option_number: letters[idx]
        };
      }
      return opt;
    });

    const answers = q.answer.map(ans => {
      const isNumeric = !isNaN(Number(ans));
      if (isNumeric) {
        const idx = parseInt(ans);
        return letters[idx];
      }
      return ans.toUpperCase();
    });

    return {
      question: q.question,
      options,
      answer: answers
    };
  });
}
