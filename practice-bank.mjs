// Keep answer identity independent from the random display order.
// Older API views without explicit IDs remain valid if their indices are sound.
import {safeURL} from './policy.mjs?v=20261027-google-choice55';
export function practiceSources(question){return [...new Set((question.sourceReferences??[]).map(safeURL).filter(Boolean))];}
export function validPracticeBank(questions) {
  if (!Array.isArray(questions) || !questions.length) return false;
  const ids = new Set();
  return questions.every(question => {
    if (typeof question.id !== 'string' || !question.id || ids.has(question.id)) return false;
    ids.add(question.id);
    if (!Array.isArray(question.choices) || !question.choices.length
      || !Number.isInteger(question.correct) || question.correct < 0
      || question.correct >= question.choices.length) return false;
    if (question.correctAnswerIds == null) return true;
    const answerIds = question.choices.map(choice => choice.id);
    return answerIds.every(id => typeof id === 'string' && id.length > 0)
      && new Set(answerIds).size === answerIds.length
      && Array.isArray(question.correctAnswerIds) && question.correctAnswerIds.length === 1
      && question.correctAnswerIds[0] === answerIds[question.correct];
  });
}

export function practiceFeedback(text) {
  return (text??'').replace(/^\s*(?:Richtig|Falsch|Nein|Ja|Genau|Korrekt)[.!:;]\s*/i,'').trim();
}
export function practiceExplanations(question,answer){
 const choices=question.choices,correct=practiceFeedback(choices[question.correct]?.feedback),selected=Number.isInteger(answer)&&answer!==question.correct?practiceFeedback(choices[answer]?.feedback):'';
 return [...new Set([correct,selected].filter(Boolean))];
}
