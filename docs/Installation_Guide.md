# Installation Guide

## AI Workspace

This guide explains how to install and run the AI Workspace project on your local machine.

---

# System Requirements

Before installing the project, ensure the following software is installed:

- Node.js (Version 20 or later)
- npm (Version 10 or later)
- Git
- Visual Studio Code (Recommended)
- Modern Web Browser (Google Chrome, Microsoft Edge, or Firefox)

---

# Clone the Repository

Clone the repository using Git.

```bash
git clone https://github.com/Mr-AbdurRehman-147/AI-Workspace-Assistant.git
```

---

# Navigate to the Project

```bash
cd AI-Workspace-Assistant
```

---

# Install Dependencies

Install all required packages.

```bash
npm install
```

---

# Run the Development Server

Start the application.

```bash
npm run dev
```

After the server starts, open the URL displayed in your terminal (usually http://localhost:5173).

---

# Build for Production

Create an optimized production build.

```bash
npm run build
```

---

# Preview the Production Build

Run the production preview server.

```bash
npm run preview
```

---

# Project Structure

```text
AI-Workspace-Assistant/
│
├── public/
├── src/
├── docs/
├── package.json
├── package-lock.json
├── README.md
├── requirements.txt
└── vite.config.ts
```

---

# Main Features

The application includes:

- AI Chat Interface
- System Prompt Configuration
- AI Model Selection
- Prompt Templates
- Conversation History
- Markdown Rendering
- Responsive Design
- Dark Mode
- Export Chat
- Error Handling

---

# Troubleshooting

## Node.js Not Found

Install the latest version of Node.js from:

https://nodejs.org/

---

## Dependencies Fail to Install

Run:

```bash
npm install
```

again or delete the `node_modules` folder and reinstall the dependencies.

---

## Development Server Does Not Start

Verify that all dependencies are installed correctly.

Run:

```bash
npm install
npm run dev
```

---

## Build Errors

Check for TypeScript or dependency-related issues and ensure all project packages are installed.

---

# Browser Compatibility

The application has been tested with:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

---

# Future Enhancements

Future versions may include:

- OpenAI API Integration
- Google Gemini Integration
- Voice Input
- Image Understanding
- PDF Chat
- Multi-Agent Support
- AI Memory
- Cloud Database Integration

---

# Author

**Abdur Rahman**

BS Artificial Intelligence

NFC Institute of Engineering and Fertilizer Research, Faisalabad

---

# License

This project is developed for educational and learning purposes.
