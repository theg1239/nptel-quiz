export interface Question {
  question: string;
  question_text?: string;
  options: Array<{
    option_number: string;
    option_text: string;
  }>;
  answer: string[];
  content_type?: 'mcq' | 'text';
  week_name?: string;
}

export function stripOptionLabels(option: string): string {
  return option.replace(/^[A-Z][).:-]\s*/, '').trim();
}

export function cleanQuestionText(text: string): string {
  let cleaned = text.replace(/^\s*\d+[\).:-]\s*/, '');
  cleaned = cleaned.replace(/^\s*(Question|Q)[\s:.]-?\s*/i, '');
  return cleaned.trim();
}

export function initializeQuestionsWithFixedOrder(questions: Question[]): Question[] {
  return questions.map(q => ({
    ...q,
    options: q.options || [],
    answer: q.answer || [],
    week_name: q.week_name || undefined,
  }));
}

export function cleanOptionText(optionText: string, questionText: string): string {
  const cleanedQuestion = cleanQuestionText(questionText).toLowerCase();
  const cleanedOption = cleanQuestionText(optionText).toLowerCase();

  if (cleanedOption.startsWith(cleanedQuestion)) {
    return optionText.substring(questionText.length).trim();
  }
  return optionText;
}

export function normalizeQuestion(question: Partial<Question>): Question {
  return {
    question: question.question || '',
    question_text: question.question_text || '',
    options: Array.isArray(question.options)
      ? question.options.map((opt: string | { option_number: string; option_text: string }) => {
          if (typeof opt === 'string') {
            const labelMatch = opt.match(/^([A-Z])[).:-]/i);
            const label = labelMatch ? labelMatch[1].toUpperCase() : '';
            const text = opt.replace(/^[A-Z][).:-]\s*/i, '').trim();
            return {
              option_number: label,
              option_text: text,
            };
          } else if (
            opt &&
            typeof opt === 'object' &&
            'option_number' in opt &&
            'option_text' in opt
          ) {
            return opt;
          }
          return {
            option_number: '',
            option_text: String(opt),
          };
        })
      : [],
    answer: Array.isArray(question.answer) ? question.answer : [],
    content_type: question.content_type || 'mcq',
  };
}
