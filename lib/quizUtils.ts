export interface Question {
  question: string;
  options: string[];
  answer: string[]; 
}

export function stripOptionLabels(options: string[]): { cleanOptions: string[]; labels: string[] } {
  const regex = /^(?:Option\s)?([A-Z])[).:-]?\s*/i; 
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
