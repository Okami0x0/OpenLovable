# 🚀 Dira-Tak-Builder

**Build something lovable, just by talking to it.**

Dira-Tak-Builder is an open-source, AI-driven web application builder. It's a "no-code" tool with a conversational interface, allowing you to describe the application you want to build, and watch as an AI agent writes the code, sets up the files, and brings your vision to life in real time.

## 📸 Demo Screenshots

### Dashboard
![Dashboard](public/assets/dashboard.png)

### AI Agent in Action
![Editor](public/assets/editor.png)

### Live Preview
![Live Preview](public/assets/live-preview.png)

### Generated Website Example
![Website Demo](public/assets/website-demo-1.png)

## ✨ Vision

The goal of Dira-Tak-Builder is to dramatically accelerate the software development process. Instead of manually writing boilerplate, setting up components, and wrestling with CSS, you can act as the architect. You provide the high-level vision through prompts, and the Lovable Agent acts as your expert full-stack developer, handling the implementation details.

This project is built on the belief that AI should be a collaborative partner in creation, making development more accessible, faster, and more fun.

## 🛠️ How It Works

Dira-Tak-Builder combines a frontend built with Vite and React with a backend powered by Bun and ElysiaJS.

1.  **Prompt:** You describe what you want to build on the homepage (e.g., "a beautiful todo application").
2.  **Project Setup:** The backend instantly scaffolds a new React + TypeScript + Tailwind project for you in a sandboxed folder.
3.  **AI Generation:** Your prompt, combined with a carefully crafted system prompt, is sent to the Google Gemini API.
4.  **Live Parsing:** The AI's response, which is a stream of structured commands and code, is parsed in real-time on the frontend.
5.  **UI Updates:** As the parser identifies commands (`<lov-write>`, `<lov-rename>`, etc.), it updates the UI to show you the agent's plan and the code being generated.
6.  **File Operations:** Simultaneously, these commands are sent to the backend, which performs the actual file system operations—writing, renaming, and deleting files within your project's sandboxed directory.
7.  **Live Preview:** Watch your application come to life with an integrated live preview that updates as the AI writes code.

## 💻 Tech Stack

-   **Frontend:** React, TypeScript, Vite, Tailwind CSS
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Backend:** Bun, [ElysiaJS](https://elysiajs.com/)
-   **AI:** Google Gemini API (supports multiple models: `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.5-pro`)
-   **State Management:** Zustand
-   **API Communication:** Axios, Native Web Streams API

## 🚀 Getting Started

Follow these steps to get Dira-Tak-Builder running on your local machine.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your system.
-   A Google Gemini API Key. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).
-   Billing enabled on your Google Cloud project associated with the API key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Dira-Tak-Builder.git
    cd Dira-Tak-Builder
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up your environment variables:**
    -   Create a new file named `.env` in the root of the project.
    -   Add your Gemini API key to this file:
        ```
        GEMINI_API_KEY="your_google_api_key_here"
        ```

4.  **Run the application:**
    -   This single command starts both the frontend Vite server and the backend ElysiaJS server concurrently.
    ```bash
    bun run dev
    ```

5.  **Open your browser:**
    -   Navigate to `http://localhost:8080` (or whatever port Vite announces). You should see the Dira-Tak-Builder homepage.

## ✨ Features

- **🤖 AI-Powered Development:** Describe your app and watch AI build it
- **📱 Live Preview:** See your application update in real-time as code is generated
- **📁 Project Management:** Dashboard to manage multiple projects
- **🔄 Real-time Streaming:** Watch the AI agent think and code in real-time
- **🎨 Modern UI:** Clean, responsive interface built with Tailwind CSS
- **🔧 Multiple AI Models:** Choose from different Gemini models based on your needs
- **💾 Persistent Projects:** All projects are saved and can be reopened anytime

## 🗺️ Project Roadmap

Dira-Tak-Builder is actively being developed. Here are some of the features and improvements planned:

-   [x] **Live Preview:** An `<iframe>` panel that shows a real-time, sandboxed preview of the generated application as the code is written.
-   [ ] **Interactive Editing:** Allow users to click on elements in the preview to inspect and modify their properties.
-   [ ] **Follow-up Prompts:** Implement a chat interface to allow for iterative development ("Now, change the color of the primary button to blue").
-   [x] **Dependency Management:** Handle `<lov-add-dependency>` commands to automatically install new packages with `bun add`.
-   [ ] **Deployment:** A one-click button to deploy the generated project to a hosting provider like Vercel or Netlify.
-   [x] **Model Flexibility:** Allow users to choose between different AI models.
-   [ ] **Export Projects:** Download generated projects as ZIP files
-   [ ] **Template Library:** Pre-built templates for common application types

## 🤝 Contributing

We welcome contributions! Whether you want to:

- 🐛 Report bugs
- 💡 Suggest new features  
- 📝 Improve documentation
- 🔧 Submit code changes

Please feel free to open an issue or submit a pull request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is open-source and licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Bun](https://bun.sh/) and [Vite](https://vitejs.dev/)

---

**Made with ❤️ by AniketDandgavhan for Community**
