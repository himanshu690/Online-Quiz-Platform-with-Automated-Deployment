document.addEventListener('DOMContentLoaded', () => {
    const setupBtn = document.getElementById('setupBtn');
    const submitBtn = document.getElementById('submitBtn');
    const quizContainer = document.getElementById('quizContainer');
    const questionsList = document.getElementById('questionsList');
    const emptyState = document.getElementById('emptyState');
    const resultModal = document.getElementById('resultModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resultScore = document.getElementById('resultScore');
    const resultMessage = document.getElementById('resultMessage');

    // Fetch questions on load
    fetchQuestions();

    setupBtn.addEventListener('click', async () => {
        setupBtn.disabled = true;
        setupBtn.textContent = 'Initializing...';
        try {
            const response = await fetch('/api/quiz/setup', { method: 'POST' });
            if (response.ok) {
                await fetchQuestions();
            }
        } catch (error) {
            console.error('Error setting up database:', error);
        } finally {
            setupBtn.disabled = false;
            setupBtn.textContent = 'Initialize Database';
        }
    });

    submitBtn.addEventListener('click', async () => {
        const answers = {};
        const questions = document.querySelectorAll('.question-item');
        let allAnswered = true;

        questions.forEach(q => {
            const id = q.dataset.id;
            const selected = q.querySelector('input[type="radio"]:checked');
            if (selected) {
                answers[id] = selected.value;
            } else {
                allAnswered = false;
            }
        });

        if (!allAnswered) {
            alert('Please answer all questions before submitting!');
            return;
        }

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers)
            });
            
            if (response.ok) {
                const resultText = await response.text();
                showResult(resultText, questions.length);
            }
        } catch (error) {
            console.error('Error submitting answers:', error);
        }
    });

    closeModalBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    async function fetchQuestions() {
        try {
            const response = await fetch('/api/quiz/all');
            if (response.ok) {
                const questions = await response.json();
                renderQuestions(questions);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    function renderQuestions(questions) {
        if (!questions || questions.length === 0) {
            quizContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        questionsList.innerHTML = '';

        questions.forEach((q, index) => {
            const div = document.createElement('div');
            div.className = 'question-item glass-panel';
            div.style.animationDelay = `${index * 0.1}s`;
            div.dataset.id = q.id;

            div.innerHTML = `
                <div class="question-text">${index + 1}. ${q.questionText}</div>
                <div class="options-grid">
                    <label class="option-label">
                        <input type="radio" name="q${q.id}" value="A">
                        <span>${q.optionA}</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="q${q.id}" value="B">
                        <span>${q.optionB}</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="q${q.id}" value="C">
                        <span>${q.optionC}</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="q${q.id}" value="D">
                        <span>${q.optionD}</span>
                    </label>
                </div>
            `;
            questionsList.appendChild(div);
        });
    }

    function showResult(text, total) {
        // Extract score from "Your score is: X out of Y"
        const match = text.match(/(\d+)\s*out of/);
        const score = match ? match[1] : 0;
        
        resultScore.textContent = `${score}/${total}`;
        
        const percentage = (score / total) * 100;
        if (percentage === 100) {
            resultMessage.textContent = 'Perfect! You are a CI/CD master! 🏆';
        } else if (percentage >= 50) {
            resultMessage.textContent = 'Good job! Keep practicing. 👍';
        } else {
            resultMessage.textContent = 'You might want to review the material. 📚';
        }
        
        resultModal.classList.remove('hidden');
    }
});
