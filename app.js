const DATA = window.MENU_DATA;

const els = {
  form: document.querySelector("#quiz-form"),
  questionCount: document.querySelector("#question-count"),
  focus: document.querySelector("#focus"),
  difficulty: document.querySelector("#difficulty"),
  pace: document.querySelector("#pace"),
  itemCount: document.querySelector("#item-count"),
  availableCount: document.querySelector("#available-count"),
  idleView: document.querySelector("#idle-view"),
  quizView: document.querySelector("#quiz-view"),
  resultView: document.querySelector("#result-view"),
  questionMeta: document.querySelector("#question-meta"),
  questionTitle: document.querySelector("#question-title"),
  questionBody: document.querySelector("#question-body"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  submitAnswer: document.querySelector("#submit-answer"),
  nextQuestion: document.querySelector("#next-question"),
  scorePill: document.querySelector("#score-pill"),
  progressBar: document.querySelector("#progress-bar"),
  resultTitle: document.querySelector("#result-title"),
  finalScore: document.querySelector("#final-score"),
  mistakesList: document.querySelector("#mistakes-list"),
  retryWrong: document.querySelector("#retry-wrong"),
  restart: document.querySelector("#restart"),
};

const ingredientTerms = [
  ["maldon sea salt", "maldon sea salt", "sea salt"],
  ["spicy edamame sauce", "spicy edamame sauce"],
  ["butter soy sauce", "butter soy sauce"],
  ["creamy spicy sauce", "creamy spicy sauce"],
  ["la yu", "la yu"],
  ["gochujang miso", "gochujang", "cochujang"],
  ["spring onion", "spring onion", "negi"],
  ["flour tortilla chips", "flour tortillas", "tortillas"],
  ["spicy tomato salsa", "tomato salsa"],
  ["coriander cress", "coriander"],
  ["jalapeno peppers", "jalapeno"],
  ["wagyu salsa", "wagyu salsa"],
  ["sake", "sake"],
  ["soy", "soy", "soya"],
  ["mirin", "mirin"],
  ["dashi", "dashi"],
  ["white onion", "white onion"],
  ["french caviar", "french caviar", "caviar"],
  ["momoko", "momoko", "baby peach"],
  ["wasabi soy", "wasabi soy"],
  ["lettuce", "lettuce"],
  ["kadaifi", "kadaifi", "kataifi"],
  ["chives", "chives"],
  ["den miso", "den miso"],
  ["hajikami", "hajikami"],
  ["daikon", "daikon"],
  ["chinese cabbage", "chinese cabbage"],
  ["ginger", "ginger"],
  ["sesame oil", "sesame oil"],
  ["truffle paste", "truffle paste"],
  ["ponzu", "ponzu"],
  ["truffle mayo", "truffle mayo"],
  ["yuzu soy sauce", "yuzu soy"],
  ["olive oil", "olive oil"],
  ["dry miso", "dry miso"],
  ["garlic chips", "garlic chips"],
  ["karashi su den miso", "karashi su den miso", "karashi"],
  ["eel sauce", "eel sauce"],
  ["shiso leaf", "shiso leaf", "shiso"],
  ["momiji-oroshi", "momiji-oroshi"],
  ["onion ponzu", "onion ponzu"],
  ["yuzu miso", "yuzu miso"],
  ["anticucho sauce", "anticucho"],
  ["umami sauce", "umami sauce"],
  ["eggplant", "eggplant", "aubergine"],
  ["mushrooms", "mushroom", "mushrooms", "shitake", "shiitake"],
  ["asparagus", "asparagus"],
  ["broccoli", "broccoli", "brocoli"],
  ["tofu", "tofu"],
  ["king crab", "king crab"],
  ["rock shrimp", "rock shrimp"],
  ["miso soup", "miso soup"],
  ["wakame", "wakame"],
  ["sushi rice", "sushi rice"],
  ["nori", "nori"],
  ["avocado", "avocado"],
  ["cucumber", "cucumber"],
  ["masago", "masago"],
  ["matcha ice cream", "matcha ice cream"],
  ["goma caramel", "goma caramel"],
  ["coffee crumble", "coffee crumble"],
  ["whisky foam", "whisky foam"],
  ["almond crumble", "almond crumble"],
  ["mandarin sorbet", "mandarin sorbet"],
  ["greek yogurt ice cream", "greek yogurt ice cream"],
  ["blueberry coulis", "blueberry coulis"],
  ["sesame tuile", "sesame touille", "sesame tuile"],
  ["mochi", "mochi"],
  ["pandan", "pandan"],
  ["miso caramel", "miso caramel"],
];

const state = {
  questions: [],
  index: 0,
  selected: null,
  score: 0,
  misses: [],
  pace: "review",
  locked: false,
};

els.itemCount.textContent = DATA.items.length;

function showView(view) {
  [els.idleView, els.quizView, els.resultView].forEach((node) => {
    node.classList.toggle("active", node === view);
  });
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample(values, count) {
  return shuffle(values).slice(0, count);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 320) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

function makeOptions(answer, distractors) {
  const cleaned = unique(distractors).filter((item) => item !== answer);
  return shuffle([answer, ...sample(cleaned, 3)]).slice(0, 4);
}

function makeQuestion({ prompt, body, answer, options, category, source, explanation, difficulty }) {
  if (!answer || !options || options.length < 4) return null;
  return {
    prompt,
    body,
    answer,
    options,
    category,
    source,
    difficulty,
    explanation: explanation || `Source: ${source}`,
  };
}

function buildDescriptionQuestions(items) {
  const titles = items.map((item) => item.title);
  return items
    .filter((item) => item.description.length > 60)
    .map((item) =>
      makeQuestion({
        prompt: "Which menu item matches this description?",
        body: truncate(item.description),
        answer: item.title,
        options: makeOptions(item.title, titles),
        category: item.section === "Desserts" ? "desserts" : item.section === "Sushi Rolls" ? "sushi" : "dishes",
        source: `Page ${item.page} - ${item.section}`,
        explanation: `${item.title}. ${item.section}, page ${item.page}.`,
        difficulty: "medium",
      }),
    )
    .filter(Boolean);
}

function buildSectionQuestions(items) {
  const sections = unique(items.map((item) => item.section));
  return items
    .filter((item) => item.kind !== "reference")
    .map((item) =>
      makeQuestion({
        prompt: "Which menu section is this item from?",
        body: item.title,
        answer: item.section,
        options: makeOptions(item.section, sections),
        category: item.section === "Desserts" ? "desserts" : "dishes",
        source: `Page ${item.page}`,
        explanation: `${item.title} is in the ${item.section} section.`,
        difficulty: "easy",
      }),
    )
    .filter(Boolean);
}

function findIngredients(item) {
  const haystack = normalize(`${item.title} ${item.description}`);
  const titleOnly = normalize(item.title);
  return ingredientTerms
    .filter(([label, ...aliases]) => {
      const allAliases = aliases.length ? aliases : [label];
      const inDescription = allAliases.some((alias) => haystack.includes(normalize(alias)));
      const tooObvious = allAliases.some((alias) => titleOnly.includes(normalize(alias)));
      return inDescription && !tooObvious;
    })
    .map(([label]) => label);
}

function buildIngredientQuestions(items) {
  const allIngredients = ingredientTerms.map(([label]) => label);
  const questions = [];
  items.forEach((item) => {
    const ingredients = findIngredients(item);
    sample(ingredients, 2).forEach((ingredient) => {
      const absent = allIngredients.filter((candidate) => !ingredients.includes(candidate));
      questions.push(
        makeQuestion({
          prompt: `Which element is included in "${item.title}"?`,
          body: truncate(item.description, 240),
          answer: ingredient,
          options: makeOptions(ingredient, absent),
          category: item.section === "Desserts" ? "desserts" : item.section === "Sushi Rolls" ? "sushi" : "dishes",
          source: `Page ${item.page} - ${item.section}`,
          explanation: `${item.title} includes: ${ingredient}.`,
          difficulty: "hard",
        }),
      );
    });
  });
  return questions.filter(Boolean);
}

function buildSauceQuestions() {
  const sauces = DATA.sauces;
  const ingredients = sauces.map((sauce) => sauce.ingredients);
  return sauces.map((sauce) =>
    makeQuestion({
      prompt: `Which composition matches "${sauce.name}"?`,
      body: "Choose the correct ingredient list.",
      answer: sauce.ingredients,
      options: makeOptions(sauce.ingredients, ingredients),
      category: "sauces",
      source: "Pages sauces",
      explanation: `${sauce.name}: ${sauce.ingredients}.`,
      difficulty: "hard",
    }),
  );
}

function buildGlossaryQuestions() {
  const definitions = DATA.glossary.map((entry) => entry.definition);
  const terms = DATA.glossary.map((entry) => entry.term);
  const glossaryQuestions = DATA.glossary.flatMap((entry) => [
    makeQuestion({
      prompt: `What does "${entry.term}" mean?`,
      body: "Choose the correct definition.",
      answer: entry.definition,
      options: makeOptions(entry.definition, definitions),
      category: "glossary",
      source: "Quick reference dictionary",
      explanation: `${entry.term}: ${entry.definition}.`,
      difficulty: "hard",
    }),
    makeQuestion({
      prompt: "Which term matches this definition?",
      body: entry.definition,
      answer: entry.term,
      options: makeOptions(entry.term, terms),
      category: "glossary",
      source: "Quick reference dictionary",
      explanation: `${entry.term}: ${entry.definition}.`,
      difficulty: "hard",
    }),
  ]);

  const fishEnglish = DATA.fish.map((fish) => fish.english);
  const fishJapanese = DATA.fish.map((fish) => fish.japanese);
  const fishFrench = DATA.fish.map((fish) => fish.french);
  const fishQuestions = DATA.fish.flatMap((fish) => [
    makeQuestion({
      prompt: `What is the Japanese name for "${fish.english}"?`,
      body: `French: ${fish.french}`,
      answer: fish.japanese,
      options: makeOptions(fish.japanese, fishJapanese),
      category: "glossary",
      source: "Fish names dictionary",
      explanation: `${fish.english} = ${fish.japanese} = ${fish.french}.`,
      difficulty: "hard",
    }),
    makeQuestion({
      prompt: `Which fish matches "${fish.japanese}"?`,
      body: "Choose the English name.",
      answer: fish.english,
      options: makeOptions(fish.english, fishEnglish),
      category: "glossary",
      source: "Fish names dictionary",
      explanation: `${fish.japanese} = ${fish.english} = ${fish.french}.`,
      difficulty: "hard",
    }),
    makeQuestion({
      prompt: `Which French translation matches "${fish.english}"?`,
      body: `Japanese: ${fish.japanese}`,
      answer: fish.french,
      options: makeOptions(fish.french, fishFrench),
      category: "glossary",
      source: "Fish names dictionary",
      explanation: `${fish.english} = ${fish.french}.`,
      difficulty: "hard",
    }),
  ]);

  return [...glossaryQuestions, ...fishQuestions].filter(Boolean);
}

function buildPool() {
  const items = DATA.items.filter((item) => item.description);
  return shuffle([
    ...buildDescriptionQuestions(items),
    ...buildSectionQuestions(items),
    ...buildIngredientQuestions(items),
    ...buildSauceQuestions(),
    ...buildGlossaryQuestions(),
  ]);
}

function filterPool(pool, focus) {
  if (focus === "all") return pool;
  return pool.filter((question) => question.category === focus);
}

function filterByDifficulty(pool, difficulty) {
  if (difficulty === "balanced") return pool;
  if (difficulty === "quick") return pool.filter((question) => question.difficulty !== "hard");
  return pool.filter((question) => question.difficulty !== "easy");
}

function currentPool() {
  const themedPool = filterPool(buildPool(), els.focus.value);
  const preferredPool = filterByDifficulty(themedPool, els.difficulty.value);
  return preferredPool.length > 0 ? preferredPool : themedPool;
}

function updateAvailableCount() {
  const total = currentPool().length;
  els.questionCount.max = String(total);
  els.availableCount.textContent = `${total} questions available for this setup`;
  if (Number(els.questionCount.value) > total) {
    els.questionCount.value = String(total);
  }
}

function scrollToActiveQuiz() {
  requestAnimationFrame(() => {
    const top = els.quizView.getBoundingClientRect().top + window.scrollY - 12;
    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    window.scrollTo({ top, behavior: isMobile ? "auto" : "smooth" });
  });
}

function startQuiz(customQuestions = null) {
  const requestedCount = Math.max(1, Number(els.questionCount.value) || 20);
  state.pace = els.pace.value;
  const usablePool = currentPool();
  const count = Math.min(requestedCount, usablePool.length);
  state.questions = customQuestions || sample(usablePool, count);
  state.index = 0;
  state.selected = null;
  state.score = 0;
  state.misses = [];
  state.locked = false;
  if (state.questions.length === 0) return;
  renderQuestion();
  showView(els.quizView);
  scrollToActiveQuiz();
}

function renderQuestion() {
  const question = state.questions[state.index];
  const current = state.index + 1;
  const total = state.questions.length;

  state.selected = null;
  state.locked = false;
  els.submitAnswer.disabled = true;
  els.submitAnswer.hidden = false;
  els.nextQuestion.hidden = true;
  els.feedback.hidden = true;
  els.feedback.textContent = "";

  els.questionMeta.textContent = `Question ${current} / ${total} - ${question.source}`;
  els.questionTitle.textContent = question.prompt;
  els.questionBody.textContent = question.body;
  els.scorePill.textContent = `${state.score} / ${state.index}`;
  els.progressBar.style.width = `${((current - 1) / total) * 100}%`;

  els.answers.innerHTML = "";
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(button, option));
    els.answers.append(button);
  });
}

function chooseAnswer(button, option) {
  if (state.locked) return;
  state.selected = option;
  els.submitAnswer.disabled = false;
  [...els.answers.children].forEach((child) => child.classList.remove("selected"));
  button.classList.add("selected");
}

function submitCurrentAnswer() {
  if (!state.selected) return;

  const question = state.questions[state.index];
  const isCorrect = state.selected === question.answer;
  state.locked = true;

  if (isCorrect) {
    state.score += 1;
  } else {
    state.misses.push({
      question,
      selected: state.selected,
    });
  }

  [...els.answers.children].forEach((button) => {
    button.disabled = true;
    if (button.textContent === question.answer) button.classList.add("correct");
    if (button.textContent === state.selected && !isCorrect) button.classList.add("incorrect");
  });

  els.scorePill.textContent = `${state.score} / ${state.index + 1}`;
  els.progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  els.submitAnswer.hidden = true;

  if (state.pace === "review") {
    els.feedback.hidden = false;
    els.feedback.innerHTML = isCorrect
      ? `<strong>Correct.</strong> ${question.explanation}`
      : `<strong>Not yet.</strong> Correct answer: ${question.answer}. ${question.explanation}`;
    els.nextQuestion.hidden = false;
    els.nextQuestion.textContent = state.index === state.questions.length - 1 ? "See results" : "Next";
  } else {
    goNext();
  }
}

function goNext() {
  if (state.index < state.questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    renderResults();
  }
}

function renderResults() {
  const total = state.questions.length;
  const percent = Math.round((state.score / total) * 100);
  els.resultTitle.textContent =
    state.misses.length === 0 ? "Perfect, no mistakes." : `${state.misses.length} point(s) to review.`;
  els.finalScore.textContent = `${percent}%`;
  els.retryWrong.hidden = state.misses.length === 0;

  els.mistakesList.innerHTML = "";
  if (state.misses.length === 0) {
    const empty = document.createElement("p");
    empty.className = "mistake-meta";
    empty.textContent = "No missed questions in this session.";
    els.mistakesList.append(empty);
  } else {
    state.misses.forEach(({ question, selected }, index) => {
      const item = document.createElement("article");
      item.className = "mistake-item";
      item.innerHTML = `
        <p class="mistake-meta">Mistake ${index + 1} - ${question.source}</p>
        <p><strong>${question.prompt}</strong></p>
        <p>${question.body}</p>
        <p class="wrong-line">Your answer: ${selected}</p>
        <p class="correct-line">Correct answer: ${question.answer}</p>
        <p class="mistake-meta">${question.explanation}</p>
      `;
      els.mistakesList.append(item);
    });
  }
  showView(els.resultView);
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  startQuiz();
});

els.focus.addEventListener("change", updateAvailableCount);
els.difficulty.addEventListener("change", updateAvailableCount);
els.submitAnswer.addEventListener("click", submitCurrentAnswer);
els.nextQuestion.addEventListener("click", goNext);
els.restart.addEventListener("click", () => showView(els.idleView));
els.retryWrong.addEventListener("click", () => {
  const retryQuestions = state.misses.map((miss) => miss.question);
  if (retryQuestions.length > 0) startQuiz(shuffle(retryQuestions));
});

updateAvailableCount();
