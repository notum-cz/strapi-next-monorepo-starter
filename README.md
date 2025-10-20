# New World Kids Platform

Welcome to the official repository for the New World Kids educational platform. Our mission is to move young people from "survival mode" to a state of purpose and dignity by providing them with the skills and tools to build a better future.

## ✨ A New Way of Building: The MCP-Augmented Workflow

This project is built and maintained using a state-of-the-art, AI-augmented development process. We leverage a suite of nine integrated  (MCP) servers** to automate, validate, and accelerate our work. This is not just a codebase; it's an intelligent, self-improving development ecosystem.



### Our Integrated MCP Suite

Our workflow is powered by the following specialized AI assistants:

| Phase     | MCP Server      | Purpose                                     |
| :-------- | :-------------- | :------------------------------------------ |
| ****   | **Linear**      | The System of Record for all tasks.         |
|           | **GitHub**      | Automates repository and PR management.     |
|           | **Perplexity**  | Our Research Partner for best practices.    |
| *** |       **Semgrep**     | Our automated Security Analyst.             |
|           | **Playwright**  | Validates UI changes and prevents regressions.|
| **** |      **Firebase**    | A secure co-pilot for backend operations.   |
|           | **Context7**    | Provides always-up-to-date documentation.   |
| ****|       **Vibe Check**  | Our Architectural Conscience.               |
|           | **Pieces**      | Our collective Long-Term Memory.            |

For a detailed guide on how these tools work together, see [`docs/mcp/SYSTEM_PROMPT.md`](docs/mcp/SYSTEM_PROMPT.md).

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/newworldkids/platform.git
    cd platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Initialize the MCP Suite:**
    This script will configure all the necessary MCP servers for your local environment.
    ```bash
    chmod +x scripts/mcp/initialize-mcps.sh
    ./scripts/mcp/initialize-mcps.sh
    ```

4.  **Run the Demo Workflow:**
    To see the full power of our augmented workflow in action, run the demonstration script:
    ```bash
    chmod +x scripts/mcp/run-mcp-suite.sh
    ./scripts/mcp/run-mcp-suite.sh
    ```

---

## Contributing

All contributions must follow the MCP-Augmented Workflow. Pull Requests will not be considered if they have not been processed through our automated security and quality gates. Please create a Linear issue before starting any work.

---

*This project is built with passion, purpose, and a little help from our AI friends.*
