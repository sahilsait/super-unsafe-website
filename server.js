const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Hardcoded credentials vulnerability
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'SuperSecretPassword123!';
const API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';
const DATABASE_PASSWORD = 'db_password_123';
const JWT_SECRET = 'my_secret_key_never_change_this';

// Simulated database
let comments = [];
let users = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user' }
];

// Missing authentication - admin panel accessible without auth
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Missing authentication - API endpoint without auth
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Missing authentication - delete endpoint without auth
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  users = users.filter(u => u.id !== userId);
  res.json({ success: true, message: 'User deleted' });
});

// XSS vulnerability - comments stored and displayed without sanitization
app.post('/api/comments', (req, res) => {
  const { username, comment } = req.body;
  const newComment = {
    id: comments.length + 1,
    username: username || 'Anonymous',
    comment: comment, // No sanitization - XSS vulnerability
    timestamp: new Date().toISOString()
  };
  comments.push(newComment);
  res.json({ success: true, comment: newComment });
});

app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// Prompt injection vulnerability - AI chat endpoint
app.post('/api/chat', (req, res) => {
  const userMessage = req.body.message;
  
  // Hardcoded system prompt - vulnerable to prompt injection
  const systemPrompt = `You are a helpful AI assistant. Answer the user's questions politely and accurately.
  
User message: ${userMessage}

Please provide a helpful response:`;

  // Simulated AI response (in real scenario, this would call an AI API)
  // The userMessage is directly inserted into the prompt without sanitization
  const response = `I received your message: "${userMessage}". This is a simulated response. In a real implementation, your message would be sent to an AI model with the system prompt: "${systemPrompt}"`;
  
  res.json({ 
    response: response,
    systemPrompt: systemPrompt // Exposed for demonstration
  });
});

// Login endpoint (but credentials are hardcoded and exposed)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'fake_jwt_token', role: 'admin' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Expose credentials endpoint (for demonstration)
app.get('/api/config', (req, res) => {
  res.json({
    apiKey: API_KEY,
    databasePassword: DATABASE_PASSWORD,
    jwtSecret: JWT_SECRET,
    adminUsername: ADMIN_USERNAME,
    adminPassword: ADMIN_PASSWORD
  });
});

app.listen(PORT, () => {
  console.log(`Vulnerable server running on http://localhost:${PORT}`);
  console.log('⚠️  WARNING: This server contains intentional security vulnerabilities!');
});

