-- ============================================
-- SAMPLE DATA FOR KUMAUNI SIKSHA
-- Run this AFTER creating the tables
-- Matches actual production schema
-- ============================================

-- 1. Sample Users (passwords are hashed - "password123")
INSERT INTO users (full_name, email, phone, password, is_active, created_at) VALUES
('Rajesh Kumar', 'rajesh@example.com', '+919876543210', '$2a$10$X7Z5qKqJ8YvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8O', true, NOW()),
('Priya Singh', 'priya@example.com', '+919876543211', '$2a$10$X7Z5qKqJ8YvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8O', true, NOW()),
('Amit Sharma', 'amit@example.com', '+919876543212', '$2a$10$X7Z5qKqJ8YvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8OYvGxJ9ZqKqJ8O', true, NOW());

-- 2. Sample Stories
INSERT INTO stories (title, subtitle, description, content, category, level, image_url, audio_url, estimated_time, word_count, xp_reward, is_famous) VALUES
('The Mountain Village', 'एक पहाड़ी गाँव की कहानी', 'A beautiful story about life in a Kumauni village', 'In the heart of the Kumaon hills, there lived a small village surrounded by tall deodar trees...', 'folklore', 'beginner', '/images/kumaun1.png', NULL, 10, 500, 15, true),
('The River''s Song', 'नदी का गीत', 'Learn about the sacred rivers of Kumaon', 'The river flowed gently through the valley, carrying stories from the mountains to the plains...', 'nature', 'beginner', '/images/kumaun2.jpg', NULL, 12, 600, 15, false),
('Festival of Colors', 'रंगों का त्योहार', 'Celebrating Holi in Kumaoni tradition', 'The village came alive with colors as Holi approached. Everyone prepared sweets and colors...', 'culture', 'intermediate', '/images/kumaun3.jpg', NULL, 15, 750, 20, true),
('The Wise Old Teacher', 'समझदार गुरु', 'A tale of wisdom and learning', 'In the old temple school, there lived a wise teacher who knew all the ancient stories...', 'education', 'intermediate', '/images/kumaun4.jpg', NULL, 18, 900, 20, false),
('The Harvest Festival', 'फसल का त्योहार', 'Celebrating the bounty of Kumaon', 'As autumn arrived, the farmers gathered to celebrate their successful harvest...', 'culture', 'advanced', '/images/kumaun5.jpg', NULL, 20, 1000, 25, true);

-- 3. Sample Lessons
INSERT INTO lessons (title, description, content, content_type, level, video_url, audio_url, duration) VALUES
('Introduction to Kumaoni Greetings', 'Learn basic greetings in Kumaoni', 'In this lesson, you will learn how to say hello, goodbye, and thank you in Kumaoni...', 'text', 'beginner', NULL, NULL, 5),
('Numbers 1-10 in Kumaoni', 'Count from 1 to 10', 'Let''s learn the numbers: Ek (1), Du (2), Teen (3)...', 'text', 'beginner', NULL, NULL, 5),
('Common Daily Phrases', 'Essential phrases for everyday use', 'Learn phrases like "How are you?", "What is your name?", and more...', 'text', 'beginner', NULL, NULL, 8),
('Kumaoni Alphabet - Vowels', 'Learn the vowel sounds', 'The Kumaoni language has several vowel sounds that are essential...', 'text', 'beginner', NULL, NULL, 10),
('Family Members in Kumaoni', 'Vocabulary for family relationships', 'Learn how to refer to mother, father, brother, sister, and more...', 'text', 'intermediate', NULL, NULL, 7),
('Market Conversations', 'Shopping and bargaining phrases', 'When you visit the local market, you''ll need these phrases...', 'text', 'intermediate', NULL, NULL, 10);

-- 4. Sample Lesson Blocks (for Lesson 1)
INSERT INTO lesson_blocks (lesson_id, block_type, title, data, order_index) VALUES
(1, 'text', 'Basic Greetings', '{"content": "Namaste (नमस्ते) - Hello/Goodbye\nKemi chau? (केमी छौ?) - How are you?\nThik chu (ठीक छु) - I am fine\nDhanyavaad (धन्यवाद) - Thank you"}', 1),
(1, 'quiz', 'Practice Greetings', '{"questions": [{"question": "How do you say Hello in Kumaoni?", "options": ["Namaste", "Khana", "Jaane", "Aaune"], "correct": 0}]}', 2),
(1, 'word_meaning', 'Key Vocabulary', '{"words": [{"english": "Hello", "kumaoni": "Namaste"}, {"english": "How are you?", "kumaoni": "Kemi chau?"}]}', 3);

-- 5. Sample Quiz Questions
INSERT INTO quiz_questions (question, options, correct_answer, module, level) VALUES
('How do you say "Hello" in Kumaoni?', '["Namaste", "Khana", "Jaane", "Aaune"]', 0, 'greetings', 'beginner'),
('What does "Kemi chau?" mean?', '["How are you?", "Where are you?", "What is this?", "Who is there?"]', 0, 'greetings', 'beginner'),
('How do you say "Thank you" in Kumaoni?', '["Dhanyavaad", "Shukriya", "Kripaya", "Maaf"]', 0, 'greetings', 'beginner'),
('What is the number 3 in Kumaoni?', '["Teen", "Do", "Char", "Paanch"]', 0, 'numbers', 'beginner'),
('What does "Pani" mean?', '["Water", "Food", "Fire", "Air"]', 0, 'vocabulary', 'beginner'),
('How do you say "House" in Kumaoni?', '["Ghar", "Gaon", "Bagh", "Nadi"]', 0, 'vocabulary', 'beginner');

-- 6. Sample Leaderboard entries
INSERT INTO leaderboard (user_id, xp_total, updated_at) VALUES
(1, 150, NOW()),
(2, 120, NOW()),
(3, 90, NOW());

-- ============================================
-- Note: Progress tables are intentionally left empty
-- They will be populated as users interact with the app
-- ============================================
