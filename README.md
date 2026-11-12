# FinPilot – Navigate Your Finances, Make Smarter Decisions

**FinPilot** is a smart financial management platform designed to help individuals and small businesses manage their finances in one place. It provides a centralized dashboard to monitor transactions, understand cash flow, track profit and loss, manage invoices, and explore financial insights.

**Live Demo:** https://fin-pilot-m628.vercel.app/  
**Backend:** https://finpilot-backend-jhm9.onrender.com  
**GitHub Repository:** https://github.com/shrushtigaynar/FinPilot

---

## 1. Problem Statement

Managing finances across different platforms can be complicated and time-consuming. Users often struggle to track income and expenses, monitor cash flow, understand financial performance, and manage payments efficiently.

FinPilot aims to simplify this process by bringing essential financial management features into a single, easy-to-use platform.

## 2. Our Solution

FinPilot provides a centralized financial dashboard that helps users understand and manage their financial activities.

The application combines transaction management, financial visualization, invoice management, payment integration, and data-based insights to make financial information easier to understand and act upon.

## 3. Key Features

- **Financial Dashboard:** A centralized overview of important financial information.
- **Transaction Management:** Track and review income and expenses.
- **Cash Flow Analysis:** Visualize cash inflows and outflows through charts.
- **Profit and Loss Analysis:** Understand financial performance using visual summaries.
- **Transaction Intelligence:** Explore transaction-related information and insights.
- **Predictive Intelligence:** View basic projections based on historical financial data.
- **Invoice Management:** Access and manage invoice-related information.
- **AI Assistant:** An in-app rule-based assistant that responds to supported financial queries.
- **PayPal Payment Integration:** Test payment creation, approval, and capture through PayPal Sandbox.

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| Vite | Frontend development and build tooling |
| JavaScript | Application logic |
| Tailwind CSS v4 | Styling and responsive layouts |
| React Router | Client-side navigation |
| Axios | HTTP requests to backend APIs |
| Chart.js | Financial data visualization |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| REST APIs | Communication between frontend and backend |
| Mongoose | MongoDB object modeling |

### Database and External Services

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| PayPal Developer Platform | Payment integration and testing |
| PayPal JavaScript SDK | Payment checkout experience |
| PayPal Orders API | Creating payment orders |
| PayPal Capture API | Capturing approved payments |
| OAuth 2.0 | Obtaining PayPal API access tokens |
| Git and GitHub | Version control and collaboration |
| Vercel | Frontend deployment |
| Render | Backend deployment |

## 5. System Architecture

FinPilot follows a client-server architecture with a separate frontend and backend.

```text
                 USER
                   |
                   v
          REACT FRONTEND
          (Vercel Hosting)
                   |
                   | HTTP Requests
                   | Axios
                   v
          NODE.JS + EXPRESS
          (Render Hosting)
                   |
          +--------+--------+
          |                 |
          v                 v
     MONGODB ATLAS     PAYPAL SANDBOX
     Database          Payment Services
          |                 |
          v                 v
     Financial Data    Create / Approve /
                       Capture Payments
```

### How the application works

1. The user interacts with the React frontend.
2. Axios sends requests to the Express backend.
3. The backend processes requests and communicates with MongoDB Atlas.
4. The backend handles PayPal payment operations through PayPal APIs.
5. The response is returned to the frontend and displayed to the user.

## 6. PayPal Integration

FinPilot integrates the **PayPal Developer Platform using its free Sandbox environment**.

The integration allows the application to test payment workflows without using real money.

### PayPal tools used

**1. PayPal JavaScript SDK**
- Provides the PayPal checkout experience in the frontend.
- Allows users to interact with the payment approval flow.

**2. OAuth 2.0**
- Used by the backend to obtain an access token.
- Authenticates requests made to PayPal APIs.

**3. Orders API**
- Creates a payment order before checkout.
- Provides the order information needed for the approval process.

**4. Capture API**
- Captures the payment after the buyer approves the order.
- Returns the payment result to the application.

### Payment workflow

```text
User initiates payment
        |
        v
Frontend requests payment creation
        |
        v
Backend obtains PayPal OAuth token
        |
        v
PayPal Orders API creates order
        |
        v
User approves payment in Sandbox
        |
        v
Backend captures approved order
        |
        v
Payment result returned to frontend
```

**Sandbox Environment:** https://developer.paypal.com/tools/sandbox/

All payment testing is performed using Sandbox accounts. No real transactions or live money are involved.

## 7. AI and Intelligent Features

FinPilot currently includes basic intelligent features to make financial information easier to understand.

### In-app Assistant
The current assistant uses rule-based logic to respond to supported financial queries and provide predefined guidance.

### Predictive Intelligence
The predictive module uses historical financial data and basic average-based calculations to provide simple projections.

### AI Development Tools
ChatGPT was used as an AI-assisted development tool for brainstorming, understanding technical concepts, troubleshooting, and documentation.

**Current implementation note:** An external LLM API or trained machine-learning model has not yet been integrated into the application. The current assistant is rule-based, and predictive insights are based on historical data rather than a trained AI model.

## 8. Project Structure

The project is organized into separate frontend and backend directories.

```text
FinPilot/
│
├── finpilot/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CashFlowChart.jsx
│   │   │   ├── ProfitLossChart.jsx
│   │   │   └── RecentTransactions.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── InvoiceManagment.jsx
│   │   │   ├── PredictiveIntelligence.jsx
│   │   │   └── TransactionIntelligence.jsx
│   │   │
│   │   └── config/
│   │       └── api.js
│   │
│   └── package.json
│
├── server/                           # Express backend
│   ├── services/
│   │   └── paypalService.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: This is a high-level overview of the main project files. Additional files and folders may exist in the repository.*

## 9. Installation and Setup

Follow these steps to run FinPilot locally.

### Prerequisites

Make sure you have installed:

- Node.js and npm
- Git
- MongoDB Atlas account or a MongoDB instance
- PayPal Developer account

### Step 1: Clone the repository

```bash
git clone https://github.com/shrushtigaynar/FinPilot.git
cd FinPilot
```

### Step 2: Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
MONGO_URI=your_mongodb_connection_string
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

If your backend package does not define a start script, use its configured development command instead.

### Step 3: Set up the frontend

Open another terminal:

```bash
cd finpilot
npm install
```

Create a `.env` file inside the `finpilot` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

## 10. Environment Variables

The application uses environment variables to configure backend connectivity and PayPal integration.

| Variable | Location | Description |
|---|---|---|
| MONGO_URI | Backend | MongoDB connection string |
| PAYPAL_CLIENT_ID | Backend | PayPal Sandbox client ID |
| PAYPAL_CLIENT_SECRET | Backend | PayPal Sandbox secret |
| PAYPAL_API_BASE | Backend | PayPal Sandbox API base URL |
| CLIENT_URL | Backend | Frontend URL allowed by backend configuration |
| VITE_API_URL | Frontend | Backend API base URL |
| VITE_PAYPAL_CLIENT_ID | Frontend | PayPal Sandbox client ID for checkout |

**Security note:** Never commit `.env` files, API secrets, database credentials, or private keys to GitHub. Keep sensitive values in the deployment platform's environment variable settings.

## 11. Deployment

FinPilot is deployed using the following services:

| Component | Hosting Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Payment Testing | PayPal Sandbox |

### Deployment workflow

1. Push the project code to GitHub.
2. Import the frontend project into Vercel.
3. Configure the frontend environment variables.
4. Deploy the backend using Render.
5. Configure backend environment variables.
6. Connect the backend to MongoDB Atlas.
7. Configure the frontend URL in the backend CORS settings.
8. Test the deployed application and PayPal Sandbox payment flow.

**Note:** Render's free service may take some time to respond after periods of inactivity because the service can enter a sleep state.

## 12. Challenges and Learnings

During development, we gained practical experience in:

- Connecting a React frontend with a Node.js and Express backend.
- Designing and consuming REST APIs.
- Managing data using MongoDB Atlas and Mongoose.
- Integrating PayPal Sandbox payment workflows.
- Understanding OAuth 2.0 authentication.
- Handling frontend-backend communication and deployment configuration.
- Debugging environment variables, API requests, and deployment issues.
- Understanding how historical financial data can be used to generate basic insights.

## 13. Future Scope

We plan to improve FinPilot with:

- LLM-powered financial assistance.
- Machine-learning-based fraud and anomaly detection.
- More advanced cash-flow forecasting.
- Secure user authentication and role-based access.
- Bank account integrations through supported financial APIs.
- Automated invoice generation and payment reminders.
- Recurring payment support.
- Downloadable financial reports.
- Production PayPal integration after appropriate testing and approval.

## 14. Current Limitations

- The in-app assistant currently uses rule-based responses.
- Predictive insights rely on basic historical-data calculations.
- Advanced machine-learning-based fraud detection is not implemented.
- PayPal integration currently uses Sandbox and does not process real payments.
- The deployed free backend may experience cold-start delays.

## 15. License

This project is intended to be released under the **MIT License**.

Add an approved OSI license to the repository by creating a `LICENSE` file containing the official MIT License text and filling in the correct copyright holder and year before submission.

## 16. Acknowledgements

We acknowledge the developers and platforms whose tools supported the development of FinPilot:

- React and Vite
- Node.js and Express.js
- MongoDB Atlas
- PayPal Developer Platform
- Chart.js
- Tailwind CSS
- Vercel and Render
- ChatGPT for AI-assisted development

---

**FinPilot – Navigate Your Finances, Make Smarter Decisions.**

*Bringing financial information, insights, and payment workflows together in one platform.*
