Here's the result of running `cat -n` on /home/ubuntu/github_repos/strapi-template-new-world-kids/README.md:
     1	# New World Kids Platform
     2	
     3	Welcome to the official repository for the New World Kids educational platform. Our mission is to move young people from "survival mode" to a state of purpose and dignity by providing them with the skills and tools to build a better future.
[![Deploy to Render](https://i.ytimg.com/vi/yWxBUcG_C7g/maxresdefault.jpg)
     5	[![Deploy to Render](https://i.ytimg.com/vi/l2N65tH8AmY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDyuq-MHXo3FMHfrHdkme8kSKcd8w)
     6	[![Deploy to Cloud Run](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run?git_repo=https://github.com/executiveusa/strapi-template-new-world-kids.git)
     7	
     8	## 🚀 Quick Deploy
     9	
    10	Choose your preferred deployment platform:
    11	
    12	- **Render** (Current): [Deploy Now](https://dashboard.render.com/web/srv-d3vida0gjchc73d9mj8g)
    13	- **Google Cloud**: Run `./gcp-deploy.sh` for one-click deployment
    14	- **Docker**: See [DOCKER_SETUP.md](DOCKER_SETUP.md) for containerization guide
    15	
    16	## 📋 Table of Contents
    17	
    18	- [Features](#-features)
    19	- [Tech Stack](#-tech-stack)
    20	- [Quick Start](#-quick-start)
    21	- [Deployment](#-deployment)
    22	- [MCP-Augmented Workflow](#-mcp-augmented-workflow)
    23	- [Contributing](#-contributing)
    24	
    25	---
    26	
    27	## ✨ Features
    28	
    29	- **🎨 Modern Strapi CMS** - Headless CMS with customizable content types
    30	- **🤖 AI-Powered Agents** - Stellar Agents suite for intelligent automation
    31	- **🔄 Real-time Features** - WebSocket support for live updates
    32	- **🐳 Docker Ready** - Full containerization support
    33	- **☁️ Cloud Native** - Optimized for Google Cloud, Render, and more
    34	- **🔒 Secure by Default** - Built-in security best practices
    35	- **📊 Monorepo Architecture** - Turborepo for efficient builds
    36	- **🌐 Multi-Service** - Microservices architecture ready
    37	
    38	---
    39	
    40	## 🛠️ Tech Stack
    41	
    42	- **Runtime**: Node.js 22.x
    43	- **Package Manager**: Yarn 1.22.x
    44	- **Build System**: Turborepo
    45	- **CMS**: Strapi 4.x
    46	- **Database**: PostgreSQL (recommended for production)
    47	- **AI/ML**: OpenAI, Anthropic Claude, Google Gemini
    48	- **Container**: Docker, Docker Compose
    49	- **Cloud**: Google Cloud Platform, Render
    50	
    51	---
    52	
    53	## 🚀 Quick Start
    54	
    55	### Prerequisites
    56	
    57	- Node.js 22.x ([Install via nvm](https://github.com/nvm-sh/nvm))
    58	- Yarn 1.22.x
    59	- Docker (optional, for containerized development)
    60	
    61	### Local Development
    62	
    63	```bash
    64	# 1. Clone the repository
    65	git clone https://github.com/executiveusa/strapi-template-new-world-kids.git
    66	cd strapi-template-new-world-kids
    67	
    68	# 2. Install dependencies
    69	yarn install
    70	
    71	# 3. Set up environment variables
    72	cp .env.example .env
    73	# Edit .env with your configuration
    74	
    75	# 4. Start development server
    76	yarn dev
    77	
    78	# Or start specific services
    79	yarn dev:cms      # Strapi CMS on http://localhost:1337
    80	yarn dev:stream   # Stream service
    81	yarn dev:web      # Web application
    82	```
    83	
    84	### Docker Development
    85	
    86	```bash
    87	# Start all services with Docker Compose
    88	docker-compose up
    89	
    90	# Or start specific services
    91	docker-compose up stellar-agents browser-service
    92	
    93	# Build and start
    94	docker-compose up --build
    95	```
    96	
    97	---
    98	
    99	## 🌐 Deployment
### 🚀 Railway (Recommended - Zero-Secrets Deploy)

**NEW: Deploy in 5 minutes with automatic cost protection!**

```bash
# Quick deploy
npm i -g @railway/cli
railway login
railway init
railway add --plugin postgresql
railway variables set STRAPI_ADMIN_JWT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") 
railway up
```

**Features:** ✅ Zero secrets | ✅ Cost protection | ✅ Auto-sleep | ✅ Easy Coolify migration

**📚 Guides**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md) | [RAILWAY_ZERO_SECRETS_DEPLOYMENT.md](RAILWAY_ZERO_SECRETS_DEPLOYMENT.md)

### 🐳 Coolify (Self-Hosted)

For production with fixed costs and full control. See [COOLIFY_SUPPORT.md](COOLIFY_SUPPORT.md)


   100	
   101	### Render (Production)
   102	
   103	**Current Deployment**: https://strapi-template-new-world-kids.onrender.com
   104	
   105	**Quick Deploy:**
   106	```bash
   107	# Trigger deployment via webhook
   108	curl -X POST https://api.render.com/deploy/srv-d3vida0gjchc73d9mj8g?key=zSsWyMmdX7U
   109	```
   110	
   111	**Configuration**: See `render.yaml` for service configuration.
   112	
   113	### Google Cloud Platform
   114	
   115	**One-Click Deploy:**
   116	```bash
   117	chmod +x gcp-deploy.sh
   118	./gcp-deploy.sh
   119	```
   120	
   121	Choose from:
   122	1. **Cloud Run** (Recommended) - Serverless, auto-scaling
   123	2. **App Engine** - Managed platform
   124	3. **Build Only** - Just build and push image
   125	
   126	**Manual Deploy:**
   127	```bash
   128	# Cloud Run
   129	gcloud builds submit --config cloudbuild.yaml
   130	
   131	# App Engine
   132	gcloud app deploy app.yaml
   133	```
   134	
   135	### Docker Production
   136	
   137	```bash
   138	# Build production image
   139	docker build -t strapi-template:prod .
   140	
   141	# Run production container
   142	docker run -d -p 1337:1337 \
   143	  -e NODE_ENV=production \
   144	  -e DATABASE_URL=your_db_url \
   145	  strapi-template:prod
   146	```
   147	
   148	**📚 Full Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive instructions.
   149	
   150	---
   151	
   152	## ✨ A New Way of Building: The MCP-Augmented Workflow
   153	
   154	This project is built and maintained using a state-of-the-art, AI-augmented development process. We leverage a suite of nine integrated Model Context Protocol (MCP) servers to automate, validate, and accelerate our work. This is not just a codebase; it's an intelligent, self-improving development ecosystem.
   155	
   156	### Our Integrated MCP Suite
   157	
   158	Our workflow is powered by the following specialized AI assistants:
   159	
   160	| Phase     | MCP Server      | Purpose                                     |
   161	| :-------- | :-------------- | :------------------------------------------ |
   162	| **Plan**   | **Linear**      | The System of Record for all tasks.         |
   163	|           | **GitHub**      | Automates repository and PR management.     |
   164	|           | **Perplexity**  | Our Research Partner for best practices.    |
   165	| **Build** |       **Semgrep**     | Our automated Security Analyst.             |
   166	|           | **Playwright**  | Validates UI changes and prevents regressions.|
   167	| **Deploy** |      **Firebase**    | A secure co-pilot for backend operations.   |
   168	|           | **Context7**    | Provides always-up-to-date documentation.   |
   169	| **Maintain**|       **Vibe Check**  | Our Architectural Conscience.               |
   170	|           | **Pieces**      | Our collective Long-Term Memory.            |
   171	
   172	For a detailed guide on how these tools work together, see [`docs/mcp/SYSTEM_PROMPT.md`](docs/mcp/SYSTEM_PROMPT.md).
   173	
   174	### Initialize MCP Suite
   175	
   176	```bash
   177	# Configure all MCP servers
   178	chmod +x scripts/mcp/initialize-mcps.sh
   179	./scripts/mcp/initialize-mcps.sh
   180	
   181	# Run demo workflow
   182	chmod +x scripts/mcp/run-mcp-suite.sh
   183	./scripts/mcp/run-mcp-suite.sh
   184	```
   185	
   186	---
   187	
   188	## 🏗️ Project Structure
   189	
   190	```
   191	strapi-template-new-world-kids/
   192	├── services/              # Microservices
   193	│   ├── cms/              # Strapi CMS
   194	│   ├── stellar-agents/   # AI Agents service
   195	│   ├── stream/           # Streaming service
   196	│   ├── blockchain/       # Blockchain service
   197	│   └── ...
   198	├── apps/                 # Applications
   199	├── packages/             # Shared packages
   200	├── scripts/              # Automation scripts
   201	├── Dockerfile            # Production Docker image
   202	├── docker-compose.yml    # Local development services
   203	├── render.yaml           # Render deployment config
   204	├── app.yaml              # Google App Engine config
   205	├── cloudbuild.yaml       # Google Cloud Build config
   206	├── cloudrun.yaml         # Google Cloud Run config
   207	└── turbo.json            # Turborepo configuration
   208	```
   209	
   210	---
   211	
   212	## 🔧 Environment Variables
   213	
   214	### Required Variables
   215	
   216	```bash
   217	# Node Environment
   218	NODE_ENV=production
   219	PORT=1337
   220	
   221	# Database
   222	DATABASE_CLIENT=postgres
   223	DATABASE_HOST=your-db-host
   224	DATABASE_NAME=strapi
   225	DATABASE_USERNAME=your-username
   226	DATABASE_PASSWORD=your-password
   227	
   228	# Strapi Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   229	ADMIN_JWT_SECRET=your-secret
   230	JWT_SECRET=your-secret
   231	API_TOKEN_SALT=your-secret
   232	APP_KEYS=your-keys
   233	
   234	# AI Services (Optional)
   235	OPENAI_API_KEY=your-key
   236	ANTHROPIC_API_KEY=your-key
   237	GOOGLE_API_KEY=your-key
   238	```
   239	
   240	See `.env.example` for complete list.
   241	
   242	---
   243	
   244	## 🧪 Testing
   245	
   246	```bash
   247	# Run all tests
   248	yarn test
   249	
   250	# Test specific service
   251	cd services/stellar-agents
   252	yarn test
   253	
   254	# Type checking
   255	yarn typecheck
   256	
   257	# Linting
   258	yarn lint
   259	```
   260	
   261	---
   262	
   263	## 🤝 Contributing
   264	
   265	We welcome contributions! All contributions must follow the MCP-Augmented Workflow.
   266	
   267	### Contribution Guidelines
   268	
   269	1. **Create a Linear Issue** - All work starts with a tracked issue
   270	2. **Follow the Workflow** - Use our MCP-augmented development process
   271	3. **Security First** - PRs must pass automated security gates (Semgrep)
   272	4. **Quality Gates** - All checks must pass before merge
   273	5. **Documentation** - Update docs for new features
   274	
   275	### Development Process
   276	
   277	```bash
   278	# 1. Create feature branch
   279	git checkout -b feature/your-feature
   280	
   281	# 2. Make changes and commit
   282	git add .
   283	git commit -m "feat: your feature description"
   284	
   285	# 3. Push and create PR
   286	git push origin feature/your-feature
   287	
   288	# 4. PRs automatically trigger:
   289	#    - TypeScript compilation check
   290	#    - Security analysis (Semgrep)
   291	#    - UI validation (Playwright)
   292	#    - Documentation updates (Context7)
   293	```
   294	
   295	---
   296	
   297	## 📚 Documentation
   298	
   299	- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
   300	- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker usage and best practices
   301	- **[docs/mcp/](docs/mcp/)** - MCP workflow documentation
   302	
   303	---
   304	
   305	## 🆘 Support & Troubleshooting
   306	
   307	### Common Issues
   308	
   309	**Build Errors**: See [DEPLOYMENT.md#troubleshooting](DEPLOYMENT.md#troubleshooting)
   310	
   311	**Docker Issues**: See [DOCKER_SETUP.md#troubleshooting](DOCKER_SETUP.md#troubleshooting)
   312	
   313	**Node Version**: Ensure you're using Node 22.x
   314	```bash
   315	nvm use 22
   316	```
   317	
   318	### Get Help
   319	
   320	- 📧 **Email**: support@newworldkids.org
   321	- 🐛 **Issues**: [GitHub Issues](https://github.com/executiveusa/strapi-template-new-world-kids/issues)
   322	- 💬 **Discussions**: [GitHub Discussions](https://github.com/executiveusa/strapi-template-new-world-kids/discussions)
   323	
   324	---
   325	
   326	## 📊 Status
   327	
   328	- **Build Status**: ![Build](https://img.shields.io/badge/build-passing-brightgreen)
   329	- **Deployment**: ![Render](https://img.shields.io/badge/render-deployed-blue)
   330	- **Version**: ![Version](https://img.shields.io/badge/version-1.0.0-blue)
   331	- **Node**: ![Node](https://img.shields.io/badge/node-22.x-green)
   332	- **License**: ![License](https://img.shields.io/badge/license-MIT-blue)
   333	
   334	---
   335	
   336	## 📄 License
   337	
   338	This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
   339	
   340	---
   341	
   342	## 🙏 Acknowledgments
   343	
   344	This project is built with:
   345	- ❤️ Passion and purpose
   346	- 🤖 AI-augmented development workflow
   347	- 🌟 Open source technologies
   348	- 👥 Amazing contributors
   349	
   350	---
   351	
   352	*Moving young people from survival mode to purpose and dignity.*
   353	