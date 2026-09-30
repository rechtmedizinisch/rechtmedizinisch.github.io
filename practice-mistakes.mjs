// A practice round never changes the answer saved in the original course.
export function courseMistakes(questions, snapshot) {
  return questions.filter(question => {
    const answer = snapshot?.courses?.[question.id]?.quizChoice;
    return Number.isInteger(answer) && answer >= 0
      && answer < question.choices.length && answer !== question.correct;
  });
}
