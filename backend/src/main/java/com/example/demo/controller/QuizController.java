package com.example.demo.controller;

import com.example.demo.entity.Question;
import com.example.demo.entity.Quiz;
import com.example.demo.repository.QuestionRepository;
import com.example.demo.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/health")
    public String healthCheck() {
        return "CI/CD Pipeline is working! Version 2 deployed automatically.";
    }

    @PostMapping("/setup")
    public String setupData() {
        if (quizRepository.count() == 0) {
            Quiz sampleQuiz = new Quiz("CI/CD Basics", "A short quiz to test your CI/CD knowledge.");
            
            Question q1 = new Question("What does CI stand for?", "Continuous Integration", "Continuous Iteration", "Code Integration", "Continuous Inspection", "A");
            Question q2 = new Question("Which tool is used for containerization?", "Jenkins", "Maven", "Docker", "Git", "C");
            Question q3 = new Question("Which database is embedded and runs in-memory?", "PostgreSQL", "MySQL", "MongoDB", "H2", "D");
            
            sampleQuiz.addQuestion(q1);
            sampleQuiz.addQuestion(q2);
            sampleQuiz.addQuestion(q3);
            
            quizRepository.save(sampleQuiz);
            return "Sample test added successfully!";
        }
        return "Questions already exist in the database.";
    }

    @GetMapping("/tests")
    public List<Quiz> getAllTests() {
        return quizRepository.findAll();
    }

    @PostMapping("/tests")
    public Quiz createTest(@RequestBody Quiz quiz) {
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                q.setQuiz(quiz);
            }
        }
        return quizRepository.save(quiz);
    }

    @GetMapping("/tests/{id}")
    public Quiz getTest(@PathVariable Long id) {
        return quizRepository.findById(id).orElse(null);
    }

    @PostMapping("/tests/{id}/questions")
    public Question addQuestionToTest(@PathVariable Long id, @RequestBody Question question) {
        Optional<Quiz> quizOpt = quizRepository.findById(id);
        if (quizOpt.isPresent()) {
            Quiz quiz = quizOpt.get();
            quiz.addQuestion(question);
            quizRepository.save(quiz);
            return question;
        }
        return null;
    }

    @GetMapping("/tests/{id}/questions")
    public List<Question> getQuestionsForTest(@PathVariable Long id) {
        return questionRepository.findByQuizId(id);
    }

    @PostMapping("/tests/{id}/submit")
    public String submitAnswers(@PathVariable Long id, @RequestBody Map<Long, String> answers) {
        int score = 0;
        for (Map.Entry<Long, String> entry : answers.entrySet()) {
            Question q = questionRepository.findById(entry.getKey()).orElse(null);
            if (q != null && q.getQuiz().getId().equals(id) && q.getCorrectOption().equalsIgnoreCase(entry.getValue())) {
                score++;
            }
        }
        return "Your score is: " + score + " out of " + answers.size();
    }

    // Kept for backward compatibility of UI while developing
    @GetMapping("/all")
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @PostMapping("/submit")
    public String submitAnswersOld(@RequestBody Map<Long, String> answers) {
        int score = 0;
        for (Map.Entry<Long, String> entry : answers.entrySet()) {
            Question q = questionRepository.findById(entry.getKey()).orElse(null);
            if (q != null && q.getCorrectOption().equalsIgnoreCase(entry.getValue())) {
                score++;
            }
        }
        return "Your score is: " + score + " out of " + answers.size();
    }
}