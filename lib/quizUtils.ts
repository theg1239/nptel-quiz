export interface Question {
  question: string;
  options: (string | { option_number: string, option_text: string })[];
  answer: string[]; 
}

export function stripOptionLabels(options: (string | { option_number: string, option_text: string })[]): { cleanOptions: string[]; labels: string[] } {
  const regex = /^([A-Z])[).:-]?\s*/i;
  const cleanOptions = options.map(option => {
    if (typeof option === 'object') {
      // For object options, just return the option_text
      return option.option_text.trim();
    } else {
      return option.replace(regex, '').trim();
    }
  });
  
  const labels = options.map(option => {
    if (typeof option === 'object') {
      // For object options, use the option_number directly
      return option.option_number;
    } else {
      const match = option.match(regex);
      return match ? match[1].toUpperCase() : '';
    }
  });
  
  return { cleanOptions, labels };
}

export function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
  return questions.map((q) => {
    let options: (string | { option_number: string, option_text: string })[];
    if (typeof q.options[0] === 'object' && q.options[0] !== null) {
      // If options are objects, ensure each has an option_number; if not, add one.
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      options = q.options.map((opt, idx) => {
        if (typeof opt === 'object' && 'option_text' in opt) {
          if (!('option_number' in opt) || !opt.option_number) {
            return { 
              option_text: opt.option_text, 
              option_number: letters[idx] 
            };
          }
          return opt;
        }
        // Handle string case
        return {
          option_text: String(opt),
          option_number: letters[idx]
        };
      });
    } else {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      options = q.options.map((opt, idx) => {
        const optStr = String(opt);
        const hasLabel = /^[A-Z][).:-]?\s*/i.test(optStr);
        return hasLabel ? optStr : `${letters[idx]}. ${optStr}`;
      });
    }

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
