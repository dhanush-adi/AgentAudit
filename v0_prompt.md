# V0.dev Prompt for AgentAudit Dashboard

Copy the following text and paste it into v0.dev to generate the exact frontend dashboard for AgentAudit:

---

**Prompt:**

Generate a Next.js App Router project for "AgentAudit" — a crypto tollbooth dashboard for AI Agent APIs (think "Stripe for AI").
The application allows users to view real-time API call logs from their AI agents, track USDC earnings from per-call micro-transactions, and configure ERC-8004 decentralized identity on the Base network.

The dashboard should use a very sleek, premium dark-mode aesthetic. Think Aceternity UI, Vercel, or Linear — glassmorphism, subtle glowing accents (electric green `##00ff88` and cyan `##00ccff`), dark backgrounds (`#0a0a0a`), and smooth micro-animations. Use modern typography like Inter and Space Mono for data/code.

Please build the entire shell including the sidebar navigation and four main page views:

1. **Dashboard Layout / Sidebar & Navbar**
   - Fixed sidebar with a sleek logo: "Agent[Audit]" (Audit in electric green).
   - Links: Overview, Call Logs, Earnings, Identity, Reputation, Docs.
   - At the bottom of the sidebar, display a mock connected wallet (e.g., "🟢 0x1A...2b3C") and a disconnect button.

2. **Overview Page (`/dashboard`)**
   - Top stats row: Total Revenue ($840.50), Total Calls (84.05k), Active Agents (3), and Avg Reputation Score.
   - A beautiful area chart in the center showing "Earnings Over Time" with a glowing gradient fill.
   - A "Live Feed" panel on the right side simulating real-time API call events coming from a Supabase websocket (e.g., "Paid $0.001 - /analyze - 12ms").

3. **Call Logs Page (`/dashboard/calls`)**
   - A sleek, data-dense data table similar to shadcn/ui's table but highly stylized.
   - Columns: Status Badge (Verified/Rejected/Pending), Time, Agent Name, Caller Address (monospaced), Endpoint hit, Amount earned, and Latency.
   - Add filters, search, and a "Export CSV" button.

4. **Earnings Page (`/dashboard/earnings`)**
   - Big bold display: "Available Balance to withdraw: $5,240.50 USDC".
   - A stacked area chart or bar chart breaking down earnings per specific Agent.
   - List of pending settlements.

5. **Identity Configuration (`/dashboard/identity`)**
   - A form to register a new agent visually as an ERC-8004 NFT on Base.
   - Inputs: Agent Name, Description, Image Upload box (drag & drop), and an "Agent Payment Wallet Address" field.
   - A grid of "Your Current Agents" displayed as futuristic NFT cards, showing their IPFS Hash, On-chain Wallet, and a "Rotate Wallet" button.

Make the UI fully responsive, utilize Shadcn UI-style components (Buttons, Cards, Badges, Tables, Inputs), and add Framer Motion style transitions when rendering cards. Include placeholder data so it looks incredible out of the box.
