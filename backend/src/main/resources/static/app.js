document.addEventListener('DOMContentLoaded', () => {
    // Top-level UI elements
    const setupBtn = document.getElementById('setupBtn');
    const homeBtn = document.getElementById('homeBtn');
    const mainTitle = document.getElementById('mainTitle');
    const mainSubtitle = document.getElementById('mainSubtitle');
    
    // View containers
    const testsListContainer = document.getElementById('testsListContainer');
    const createTestContainer = document.getElementById('createTestContainer');
    const quizContainer = document.getElementById('quizContainer');
    
    // Test List UI
    const testsList = document.getElementById('testsList');
    const showCreateTestBtn = document.getElementById('showCreateTestBtn');
    const noTestsState = document.getElementById('noTestsState');
    
    // Create Test UI
    const testTitle = document.getElementById('testTitle');
    const testDesc = document.getElementById('testDesc');
    const questionsBuilderList = document.getElementById('questionsBuilderList');
    const addQuestionFormBtn = document.getElementById('addQuestionFormBtn');
    const saveTestBtn = document.getElementById('saveTestBtn');
    let questionForms = [];
    
    // Take Test UI
    const currentTestTitle = document.getElementById('currentTestTitle');
    const currentTestDesc = document.getElementById('currentTestDesc');
    const questionsList = document.getElementById('questionsList');
    const submitBtn = document.getElementById('submitBtn');
    const emptyState = document.getElementById('emptyState');
    
    // Modal
    const resultModal = document.getElementById('resultModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const resultScore = document.getElementById('resultScore');
    const resultMessage = document.getElementById('resultMessage');

    let currentTestId = null;

    // Initialize
    fetchTests();

    // Setup Button
    setupBtn.addEventListener('click', async () => {
        setupBtn.disabled = true;
        setupBtn.textContent = 'Initializing...';
        try {
            const response = await fetch('/api/quiz/setup', { method: 'POST' });
            if (response.ok) {
                await fetchTests();
            }
        } catch (error) {
            console.error('Error setting up database:', error);
        } finally {
            setupBtn.disabled = false;
            setupBtn.textContent = 'Initialize Database';
        }
    });

    // Home Button
    homeBtn.addEventListener('click', () => {
        showView('testsList');
        fetchTests();
    });

    // Navigation logic
    function showView(view) {
        testsListContainer.classList.add('hidden');
        createTestContainer.classList.add('hidden');
        quizContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
        homeBtn.classList.remove('hidden');
        
        if (view === 'testsList') {
            testsListContainer.classList.remove('hidden');
            homeBtn.classList.add('hidden');
            mainTitle.textContent = "Online Quiz Platform";
            mainSubtitle.textContent = "Test your knowledge with our CI/CD pipeline integrated app";
        } else if (view === 'createTest') {
            createTestContainer.classList.remove('hidden');
            mainTitle.textContent = "Create New Test";
            mainSubtitle.textContent = "Add a title and multiple questions";
        } else if (view === 'takeTest') {
            // Container shown during fetch
        }
    }

    // --- View 1: List Tests ---
    async function fetchTests() {
        showView('testsList');
        try {
            const response = await fetch('/api/quiz/tests');
            if (response.ok) {
                const tests = await response.json();
                renderTestsList(tests);
            }
        } catch (error) {
            console.error('Error fetching tests:', error);
        }
    }

    function renderTestsList(tests) {
        testsList.innerHTML = '';
        if (!tests || tests.length === 0) {
            noTestsState.classList.remove('hidden');
            return;
        }
        
        noTestsState.classList.add('hidden');
        tests.forEach(test => {
            const card = document.createElement('div');
            card.className = 'test-card';
            card.innerHTML = `
                <h3>${test.title}</h3>
                <p>${test.description || 'No description provided.'}</p>
            `;
            card.addEventListener('click', () => startTest(test));
            testsList.appendChild(card);
        });
    }

    // --- View 2: Create Test ---
    showCreateTestBtn.addEventListener('click', () => {
        showView('createTest');
        testTitle.value = '';
        testDesc.value = '';
        questionsBuilderList.innerHTML = '';
        questionForms = [];
        addQuestionForm(); // Add one empty question by default
    });

    addQuestionFormBtn.addEventListener('click', addQuestionForm);

    function addQuestionForm() {
        const id = Date.now();
        const formHtml = `
            <div class="question-form-card" id="qform-${id}">
                <div class="form-group">
                    <label>Question Text</label>
                    <input type="text" class="form-input q-text" placeholder="Enter question">
                </div>
                <div class="form-group">
                    <label>Option A</label>
                    <input type="text" class="form-input q-opt-a" placeholder="Option A">
                </div>
                <div class="form-group">
                    <label>Option B</label>
                    <input type="text" class="form-input q-opt-b" placeholder="Option B">
                </div>
                <div class="form-group">
                    <label>Option C</label>
                    <input type="text" class="form-input q-opt-c" placeholder="Option C">
                </div>
                <div class="form-group">
                    <label>Option D</label>
                    <input type="text" class="form-input q-opt-d" placeholder="Option D">
                </div>
                <div class="form-group">
                    <label>Correct Option (A, B, C, or D)</label>
                    <input type="text" class="form-input q-correct" placeholder="e.g., A" maxlength="1">
                </div>
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('qform-${id}').remove()">Remove</button>
            </div>
        `;
        questionsBuilderList.insertAdjacentHTML('beforeend', formHtml);
    }

    saveTestBtn.addEventListener('click', async () => {
        const title = testTitle.value.trim();
        if (!title) {
            alert('Title is required');
            return;
        }

        const quizData = {
            title: title,
            description: testDesc.value.trim(),
            questions: []
        };

        const formCards = questionsBuilderList.querySelectorAll('.question-form-card');
        formCards.forEach(card => {
            const qText = card.querySelector('.q-text').value.trim();
            if (qText) {
                quizData.questions.push({
                    questionText: qText,
                    optionA: card.querySelector('.q-opt-a').value.trim(),
                    optionB: card.querySelector('.q-opt-b').value.trim(),
                    optionC: card.querySelector('.q-opt-c').value.trim(),
                    optionD: card.querySelector('.q-opt-d').value.trim(),
                    correctOption: card.querySelector('.q-correct').value.trim().toUpperCase()
                });
            }
        });

        try {
            saveTestBtn.disabled = true;
            saveTestBtn.textContent = 'Saving...';
            
            const response = await fetch('/api/quiz/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData)
            });
            
            if (response.ok) {
                alert('Test created successfully!');
                fetchTests(); // Go back to list
            } else {
                alert('Failed to save test');
            }
        } catch (error) {
            console.error('Error saving test:', error);
        } finally {
            saveTestBtn.disabled = false;
            saveTestBtn.textContent = 'Save Test';
        }
    });

    // --- View 3: Take Test ---
    async function startTest(test) {
        showView('takeTest');
        currentTestId = test.id;
        mainTitle.textContent = "Taking Test";
        mainSubtitle.textContent = test.title;
        currentTestTitle.textContent = test.title;
        currentTestDesc.textContent = test.description || '';
        
        try {
            const response = await fetch('/api/quiz/tests/' + test.id + '/questions');
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
            div.style.animationDelay = (index * 0.1) + 's';
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
            const response = await fetch('/api/quiz/tests/' + currentTestId + '/submit', {
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
        fetchTests(); // Go back to home after closing results
    });

    function showResult(text, total) {
        const match = text.match(/(\d+)\s*out of/);
        const score = match ? match[1] : 0;
        
        resultScore.textContent = score + '/' + total;
        
        const percentage = total > 0 ? (score / total) * 100 : 0;
        if (percentage === 100) {
            resultMessage.textContent = 'Perfect! You are a master! 🏆';
        } else if (percentage >= 50) {
            resultMessage.textContent = 'Good job! Keep practicing. 👍';
        } else {
            resultMessage.textContent = 'You might want to review the material. 📚';
        }
        
        resultModal.classList.remove('hidden');
    }
});
