package com.example.demo.controller;

import com.example.demo.entity.Question;
import com.example.demo.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/health")
    public String healthCheck() {
        return "CI/CD Pipeline is working! Version 2 deployed automatically.";
    }

    @PostMapping("/setup")
    public String setupData() {
        if (questionRepository.count() == 0) {
            questionRepository.save(new Question("What does CI stand for?", "Continuous Integration", "Continuous Iteration", "Code Integration", "Continuous Inspection", "A"));
            questionRepository.save(new Question("Which tool is used for containerization?", "Jenkins", "Maven", "Docker", "Git", "C"));
            questionRepository.save(new Question("Which database is embedded and runs in-memory?", "PostgreSQL", "MySQL", "MongoDB", "H2", "D"));
            return "Sample questions added successfully!";
        }
        return "Questions already exist in the database.";
    }

    @GetMapping("/all")
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @PostMapping("/submit")
    public String submitAnswers(@RequestBody Map<Long, String> answers) {
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