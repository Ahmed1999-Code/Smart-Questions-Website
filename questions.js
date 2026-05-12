// Questions Database
// Questions are managed per-user via "Specify Question Type" in the dashboard.
// The administrator feeds questions through question-feed.html for the chosen field.
// Questions are stored in localStorage keyed by the user's email address
// and remain fixed until the admin specifies a new question type / uploads new questions.

// Helper: load questions for the currently logged-in user from localStorage
function loadUserQuestions() {
    try {
        const user = JSON.parse(localStorage.getItem('eduai_current_user') || '{}');
        const email = (user.email || '').toLowerCase().trim();
        if (!email) return [];
        const stored = localStorage.getItem('eduai_questions_' + email);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
}

// quizQuestions is populated at runtime from localStorage (per user email)
const quizQuestions = loadUserQuestions();
