# 🔥 Building with Strapi and Next.js: Guide to the Strapi-Next Monorepo Starter

[The Strapi-Next Monorepo Starter](https://github.com/notum-cz/strapi-next-monorepo-starter) by software agency [Notum Technologies](https://notum.cz/) offers a comprehensive solution for building web applications and websites. Leveraging the power of Strapi (a popular headless CMS) and Next.js(a React-based framework), this starter template allows developers to kickstart development of full-stack applications with modern tooling, all housed in a monorepo structure.

## 📚 Before Getting Started

This blog post covers the key features and provides information and instructions for setting up the Strapi-Next monorepo starter. For more detailed information, refer to the [project repo here](https://github.com/notum-cz/strapi-next-monorepo-starter).

### 🥞 Tech Stack

- **Strapi v5**: Customizable headless CMS. [Docs](https://strapi.io/)
- **Next.js App Router v14**: Server-side rendering and API routes. [Docs](https://nextjs.org/docs/14)
- **Turborepo**: Efficient monorepo management tool. [Docs](https://turbo.build/)
- **Shadcn/ui**: TailwindCSS-based UI components. [Docs](https://ui.shadcn.com/)
- **TypeScript**: For type safety and improved developer experience.
- **PostgreSQL**: Database for storing application data locally.
- **Docker**: Containerization tool for local development and deployment.
- **NodeJS 20**: Server-side JavaScript runtime.
- **yarn**: Package manager for JavaScript projects.

### 📦 What's Inside?

We use Turborepo to manage the monorepo structure, which includes the following apps and packages:

- **Apps**:
  - `apps/ui`: Next.js web app with Shadcn/ui components.
  - `apps/strapi`: Strapi v5 API with page-builder components.
- **Packages**:
  - `packages/eslint-config`: ESLint configurations for client-side applications.
  - `packages/prettier-config`: Prettier configuration with import sort plugin and Tailwind plugin included.
  - `packages/typescript-config`: tsconfig JSONs used throughout the monorepo.

Thanks to the monorepo structure, we can manage shared configurations and dependencies across multiple apps and packages. For example we share Content-Types typing between the Strapi and Next.js app.

## 🚀 Setup Project

Open your terminal and clone the repository:

```bash
git clone https://github.com/notum-cz/strapi-next-monorepo-starter
```

To not persist the git history of the starter you should remove the `.git` folder and initialize a new git repository using `git init`.

_Alternatively, you can click the "Use this template" button on the GitHub repository page to create a new repository based on this template._

**[Optionally, but recommended]** Rename the project folder, name, description in root `package.json`, and other configurations to match your project name. Optionally, update the names in the `/apps` and `/packages` as well but keep the `@repo` prefix if you don't prefer a different scope/company. If you do so, then find and replace all occurrences.

**[Optionally, but recommended]** Modify `README.md` files of apps to be less general (eg. update projects names, customize tech stack). Project-specific READMEs should not contain general leftovers from the template.

### Install Dependencies

Navigate to the project folder and install the required packages with correct Node version and yarn:

```bash
cd strapi-next-monorepo-starter

# Use the correct Node version - optional
nvm use

yarn
```

### Set Up Environment Variables

Both applications require environment variables to run. The easiest way to set them is to copy the `.env.example` files in the `/apps` folders and rename them to `.env`. The required variables are already set in the example files but you can modify them as needed.

### Run the Project

## Examples and Guides

### Create Strapi Content-type and Fetch Data

### Localize the UI and Data

### Implement Authorization

### Error Handling and Logging

### Page Builder Components

### Sitemap and SEO

### Deployment to Heroku
