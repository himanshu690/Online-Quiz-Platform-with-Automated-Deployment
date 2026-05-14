pipeline {
    agent any

    tools {
        // You will configure this name in Jenkins Global Tool Configuration later
        maven 'Maven3' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    // Compiles the code and runs your tests
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Deploy Application') {
            steps {
                // Spins down old containers and starts new ones with the fresh build
                sh 'docker-compose down'
                sh 'docker-compose build --no-cache backend'
                sh 'docker-compose up -d --build'
            }
        }
    }
}