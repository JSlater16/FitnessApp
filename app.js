const workoutForm = document.querySelector("#workout-form");
const calorieForm = document.querySelector("#calorie-form");
const weightForm = document.querySelector("#weight-form");
const workoutList = document.querySelector("#workout-list");
const calorieList = document.querySelector("#calorie-list");
const weightList = document.querySelector("#weight-list");
const summaryWorkouts = document.querySelector("#summary-workouts");
const summaryCalories = document.querySelector("#summary-calories");
const summaryWeight = document.querySelector("#summary-weight");
const clearAllButton = document.querySelector("#clear-all");

const storageKey = "pulseTrackData";

const state = {
  workouts: [],
  calories: [],
  weights: [],
};

const formatDate = (value) => {
  if (!value) {
    return new Date().toLocaleDateString();
  }
  return new Date(value).toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }
  return value;
};

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const loadState = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return;
  }
  const parsed = JSON.parse(stored);
  state.workouts = parsed.workouts ?? [];
  state.calories = parsed.calories ?? [];
  state.weights = parsed.weights ?? [];
};

const updateSummary = () => {
  summaryWorkouts.textContent = state.workouts.length.toString();
  const calorieTotal = state.calories.reduce(
    (total, entry) => total + entry.calories,
    0
  );
  summaryCalories.textContent = calorieTotal.toLocaleString();

  if (state.weights.length === 0) {
    summaryWeight.textContent = "--";
    return;
  }

  const latest = [...state.weights].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  summaryWeight.textContent = `${latest.weight} lbs`;
};

const renderList = (list, items, formatter) => {
  list.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No entries yet.";
    list.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = formatter(item);
    list.appendChild(li);
  });
};

const renderAll = () => {
  renderList(workoutList, state.workouts, (workout) => {
    return `
      <strong>${workout.name}</strong>
      <span>${workout.duration} min · ${workout.intensity} intensity</span>
      <span>${workout.notes}</span>
    `;
  });

  renderList(calorieList, state.calories, (entry) => {
    return `
      <strong>${entry.meal}</strong>
      <span>${entry.calories} calories · ${formatTime(entry.time)}</span>
      <span>${entry.date}</span>
    `;
  });

  renderList(weightList, state.weights, (entry) => {
    return `
      <strong>${entry.weight} lbs</strong>
      <span>${entry.date}</span>
      <span>${entry.notes}</span>
    `;
  });

  updateSummary();
};

workoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(workoutForm);
  const workout = {
    name: formData.get("name").toString().trim(),
    duration: Number(formData.get("duration")),
    intensity: formData.get("intensity").toString(),
    notes: formData.get("notes").toString().trim() || "No notes added.",
  };
  state.workouts.unshift(workout);
  workoutForm.reset();
  saveState();
  renderAll();
});

calorieForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(calorieForm);
  const entry = {
    meal: formData.get("meal").toString().trim(),
    calories: Number(formData.get("calories")),
    time: formData.get("time").toString(),
    date: formatDate(),
  };
  state.calories.unshift(entry);
  calorieForm.reset();
  saveState();
  renderAll();
});

weightForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(weightForm);
  const entry = {
    weight: Number(formData.get("weight")),
    date: formatDate(formData.get("date").toString()),
    notes: formData.get("notes").toString().trim() || "No notes added.",
  };
  state.weights.unshift(entry);
  weightForm.reset();
  saveState();
  renderAll();
});

clearAllButton.addEventListener("click", () => {
  state.workouts = [];
  state.calories = [];
  state.weights = [];
  saveState();
  renderAll();
});

loadState();
renderAll();
