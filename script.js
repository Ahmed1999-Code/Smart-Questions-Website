// ===================================
// IMAGE UPLOAD AND PERSISTENCE
// ===================================

function setupImageUploads() {
    const photoCardInners = document.querySelectorAll('.photo-card-inner');

    photoCardInners.forEach(cardInner => {
        // Find the hidden file input and the image tag associated with this card
        const fileInput = cardInner.parentNode.querySelector('input[type="file"]');
        const imgPreview = cardInner.querySelector('.photo-circle img');
        const imgId = imgPreview.id;

        // Load saved image from localStorage on page load
        const savedImage = localStorage.getItem(`photo_${imgId}`);
        if (savedImage) {
            imgPreview.src = savedImage;
        }

        // Handle file upload
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = function(event) {
                    const imageData = event.target.result;
                    imgPreview.src = imageData;
                    // Save to localStorage
                    localStorage.setItem(`photo_${imgId}`, imageData);
                }

                reader.readAsDataURL(file);
            }
        });
    });
}

// Setup name inputs persistence
function setupNamePersistence() {
    const nameInputs = document.querySelectorAll('.name-input');
    
    nameInputs.forEach((input, index) => {
        const nameId = `name_${index}`;
        
        // Load saved name
        const savedName = localStorage.getItem(nameId);
        if (savedName) {
            input.value = savedName;
        }
        
        // Save on change
        input.addEventListener('input', function() {
            localStorage.setItem(nameId, input.value);
        });
    });
}

// Initialize image uploads and name persistence
setupImageUploads();
setupNamePersistence();


// ===================================
// QUIZ LOGIC
// ===================================

let currentQuestionIndex = 0;
let score = 0;
let studentName = '';
let studentCode = '';
let userAnswers = []; // Store user's answers
let timeLeft = 30; // 30 seconds per question
let timerInterval = null;
let selectedAnswerIndex = null;

// Get screen elements
const registrationScreen = document.getElementById('registration-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

// Initialize screen visibility based on URL hash
function initializeScreenVisibility() {
    // Only run on index.html, not on questions.html or results.html
    if (window.location.pathname.includes('questions.html') || 
        window.location.pathname.includes('results.html')) {
        return;
    }
    
    if (window.location.hash === '#results' && resultsScreen) {
        // Show results screen
        resultsScreen.classList.add('active');
        if (registrationScreen) registrationScreen.classList.remove('active');
        if (quizScreen) quizScreen.classList.remove('active');
        // Display results after a short delay to ensure DOM is ready
        setTimeout(function() {
            displayResults();
        }, 200);
    } else {
        // Show registration screen by default
        if (registrationScreen) registrationScreen.classList.add('active');
        if (resultsScreen) resultsScreen.classList.remove('active');
        if (quizScreen) quizScreen.classList.remove('active');
    }
}

// Get registration elements
const startQuizBtn = document.getElementById('start-quiz-btn');
const studentNameInput = document.getElementById('student-name');
const studentCodeInput = document.getElementById('student-code');

// Get quiz elements
const studentInfoDisplay = document.getElementById('student-info-display');
const questionCounter = document.getElementById('question-counter');
const timerBar = document.getElementById('timer-fill');
const questionContainer = document.getElementById('question-container');
const nextQuestionBtn = document.getElementById('next-question-btn');

// Load student info from sessionStorage if on questions page
if (quizScreen && window.location.pathname.includes('questions.html')) {
    const savedName = sessionStorage.getItem('studentName');
    const savedCode = sessionStorage.getItem('studentCode');
    if (savedName && savedCode) {
        studentName = savedName;
        studentCode = savedCode;
        if (studentInfoDisplay) {
            studentInfoDisplay.textContent = `${studentName} (${studentCode})`;
        }
        // Initialize quiz
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        loadQuestion();
    }
}

// Start Quiz Button Click
if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function() {
        studentName = studentNameInput.value.trim();
        studentCode = studentCodeInput.value.trim();
        
        if (studentName === '' || studentCode === '') {
            alert('Please enter your name and access code.');
            return;
        }
        
        // Store student info in sessionStorage for questions page
        sessionStorage.setItem('studentName', studentName);
        sessionStorage.setItem('studentCode', studentCode);
        
        // Navigate to questions page
        window.location.href = 'questions.html';
    });
}

// Load Question
function loadQuestion() {
    // Check if we've completed all questions
    if (currentQuestionIndex >= quizQuestions.length) {
        // Record the last answer if not already recorded
        if (userAnswers.length < quizQuestions.length) {
            const lastQuestion = quizQuestions[userAnswers.length];
            if (lastQuestion) {
                userAnswers.push({
                    questionIndex: userAnswers.length,
                    question: lastQuestion.question,
                    options: lastQuestion.options,
                    userAnswer: selectedAnswerIndex,
                    correctAnswer: lastQuestion.correctAnswer,
                    isCorrect: selectedAnswerIndex === lastQuestion.correctAnswer
                });
                
                // Update score
                if (selectedAnswerIndex === lastQuestion.correctAnswer) {
                    score++;
                }
            }
        }
        showResults();
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    selectedAnswerIndex = null;
    if (nextQuestionBtn) nextQuestionBtn.disabled = true;
    
    // Update counter
    questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${quizQuestions.length}`;
    
    // Clear and build question display
    questionContainer.innerHTML = '';
    
    // Question text with animation
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question;
    questionContainer.appendChild(questionText);
    
    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        
        optionBtn.addEventListener('click', function() {
            selectAnswer(index, optionsContainer);
        });
        
        optionsContainer.appendChild(optionBtn);
    });
    
    questionContainer.appendChild(optionsContainer);
    
    // Start timer
    startTimer();
}

// Select Answer
function selectAnswer(index, container) {
    if (selectedAnswerIndex !== null) return; // Already answered
    
    selectedAnswerIndex = index;
    nextQuestionBtn.disabled = false;
    
    // Highlight selected option
    const allOptions = container.querySelectorAll('.option-btn');
    allOptions[index].classList.add('selected');
    
    // Stop timer
    clearInterval(timerInterval);
}

// Timer Function
function startTimer() {
    timeLeft = 30;
    timerBar.style.width = '100%';
    timerBar.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
    
    timerInterval = setInterval(function() {
        timeLeft--;
        const percentage = (timeLeft / 30) * 100;
        timerBar.style.width = percentage + '%';
        
        // Change color as time runs out
        if (timeLeft <= 10) {
            timerBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (timeLeft <= 20) {
            timerBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// Handle Timeout
function handleTimeout() {
    selectedAnswerIndex = null; // Mark as unanswered
    nextQuestionBtn.disabled = false;
    
    // Show timeout message
    const allOptions = questionContainer.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.classList.add('disabled'));
}

// Next Question Button
if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', function() {
        // Make sure we have a valid question index
        if (currentQuestionIndex >= quizQuestions.length) {
            showResults();
            return;
        }
        
        const question = quizQuestions[currentQuestionIndex];
        
        // Record answer for current question
        userAnswers.push({
            questionIndex: currentQuestionIndex,
            question: question.question,
            options: question.options,
            userAnswer: selectedAnswerIndex,
            correctAnswer: question.correctAnswer,
            isCorrect: selectedAnswerIndex === question.correctAnswer
        });
        
        // Update score
        if (selectedAnswerIndex === question.correctAnswer) {
            score++;
        }
        
        // Clear timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // Move to next question
        currentQuestionIndex++;
        
        // Load next question (or show results if done)
        loadQuestion();
    });
}

// Show Results
function showResults() {
    // Make sure all answers are recorded
    // If we have fewer answers than questions, record any missing ones
    while (userAnswers.length < quizQuestions.length) {
        const missingIndex = userAnswers.length;
        const question = quizQuestions[missingIndex];
        userAnswers.push({
            questionIndex: missingIndex,
            question: question.question,
            options: question.options,
            userAnswer: null, // Unanswered
            correctAnswer: question.correctAnswer,
            isCorrect: false
        });
    }
    
    // Store results in sessionStorage
    sessionStorage.setItem('quizResults', JSON.stringify({
        studentName: studentName,
        studentCode: studentCode,
        score: score,
        totalQuestions: quizQuestions.length,
        userAnswers: userAnswers
    }));
    
    // Navigate to results page (results.html)
    if (window.location.pathname.includes('questions.html')) {
        // Small delay to ensure data is saved
        setTimeout(function() {
            window.location.href = 'results.html';
        }, 100);
    } else if (window.location.pathname.includes('results.html')) {
        // Already on results page, just display results
        displayResults();
    } else {
        // If on index.html, navigate to results page
        setTimeout(function() {
            window.location.href = 'results.html';
        }, 100);
    }
}

// Display Results (called when results screen is shown)
function displayResults() {
    let resultsData;
    
    // Try to get from sessionStorage first
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
        resultsData = JSON.parse(storedResults);
    } else {
        // Fallback to current variables
        resultsData = {
            studentName: studentName,
            studentCode: studentCode,
            score: score,
            totalQuestions: quizQuestions.length,
            userAnswers: userAnswers
        };
    }
    
    // Calculate answered questions (questions that have an answer, even if wrong)
    const answeredCount = resultsData.userAnswers.filter(answer => answer.userAnswer !== null).length;
    
    // Display summary metrics
    const finalNameEl = document.getElementById('final-name');
    const totalQEl = document.getElementById('total-q');
    const answeredCountEl = document.getElementById('answered-count');
    const correctCountEl = document.getElementById('correct-count');
    
    if (finalNameEl) finalNameEl.textContent = `${resultsData.studentName} (${resultsData.studentCode})`;
    if (totalQEl) totalQEl.textContent = resultsData.totalQuestions;
    if (answeredCountEl) answeredCountEl.textContent = answeredCount;
    if (correctCountEl) correctCountEl.textContent = resultsData.score;
    
    // Display detailed review
    const reviewList = document.getElementById('review-list');
    const incorrectSection = document.getElementById('incorrect-section');
    
    if (!reviewList) return;
    
    reviewList.innerHTML = '';
    
    // Filter incorrect answers
    const incorrectAnswers = resultsData.userAnswers.filter(answer => !answer.isCorrect);
    
    if (incorrectAnswers.length === 0) {
        if (incorrectSection) incorrectSection.style.display = 'none';
        reviewList.innerHTML = '<div class="perfect-score-message"><i class="fas fa-crown"></i><h3>Perfect Score!</h3><p>You answered all questions correctly! Outstanding performance!</p></div>';
    } else {
        if (incorrectSection) incorrectSection.style.display = 'block';
        incorrectAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            const userAnswerText = answer.userAnswer !== null 
                ? answer.options[answer.userAnswer] 
                : 'No answer (Time expired)';
            
            const userAnswerLetter = answer.userAnswer !== null 
                ? String.fromCharCode(65 + answer.userAnswer)
                : '-';
            const correctAnswerLetter = String.fromCharCode(65 + answer.correctAnswer);
            
            reviewItem.innerHTML = `
                <div class="review-item-header">
                    <span class="review-question-number">Question ${answer.questionIndex + 1}</span>
                    <span class="review-badge">Needs Correction</span>
                </div>
                <div class="review-question-text">${answer.question}</div>
                <div class="review-corrections">
                    <div class="correction-item incorrect-item">
                        <div class="correction-label">
                            <i class="fas fa-times-circle"></i>
                            <span>Your Answer</span>
                        </div>
                        <div class="correction-content">
                            <span class="answer-letter">${userAnswerLetter}</span>
                            <span class="answer-text">${userAnswerText}</span>
                        </div>
                    </div>
                    <div class="correction-arrow">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="correction-item correct-item">
                        <div class="correction-label">
                            <i class="fas fa-check-circle"></i>
                            <span>Correct Answer</span>
                        </div>
                        <div class="correction-content">
                            <span class="answer-letter">${correctAnswerLetter}</span>
                            <span class="answer-text">${answer.options[answer.correctAnswer]}</span>
                        </div>
                    </div>
                </div>
            `;
            
            reviewList.appendChild(reviewItem);
        });
    }
}

// Check if we should show results on page load
window.addEventListener('DOMContentLoaded', function() {
    initializeScreenVisibility();
});

// Also check on hash change
window.addEventListener('hashchange', function() {
    initializeScreenVisibility();
});

// Initialize immediately if DOM is already loaded (for cases where script loads after DOM)
if (document.readyState === 'loading') {
    // DOM is still loading, will be handled by DOMContentLoaded
} else {
    // DOM is already loaded, initialize now
    setTimeout(initializeScreenVisibility, 100);
}
