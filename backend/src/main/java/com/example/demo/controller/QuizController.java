package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @GetMapping("/health")
    public String healthCheck() {
        return "CI/CD Pipeline is working! Version 2 deployed automatically.";
    }

    // Add @PostMapping("/submit") and @GetMapping("/all") here later
}