#  Blockchain Utility Discord Bot


---   A utility Discord bot built for Web3 communities. Helps developers and users manage wallets, inspect tokens/contracts, and work with testnets — all inside Discord.


## Project Structure

```
blockchain-bot/
├── .env.example          ← env template (copy to .env)
├── package.json
├── src/
│   ├── index.js          ← bot entry point
│   ├── deploy.js         ← registers slash commands with Discord
│   ├── config.js         ← env vars + network definitions
│   ├── commands/
│   │   ├── definitions.js   ← all slash command structures
│   │   ├── router.js        ← routes interactions to handlers
│   │   ├── wallet/
│   │   │   ├── verify.js    ← /wallet verify
│   │   │   ├── balance.js   ← /wallet balance
│   │   │   └── network.js   ← /wallet network
│   │   ├── token/
│   │   │   ├── info.js          ← /token info
│   │   │   └── contractVerify.js ← /contract verify
│   │   └── testnet/
│   │       ├── faucet.js    ← /testnet faucet
│   │       ├── status.js    ← /testnet status
│   │       ├── rpcStatus.js ← /rpc status (Dev Mode)
│   │       └── gasPrice.js  ← /gas price
│   ├── utils/
│   │   ├── chainUtils.js    ← provider factory, validation, error diagnosis
│   │   └── store.js         ← in-memory wallet store
│   └── middleware/
│       └── devOnly.js       ← role-based access guard
```

---

## Setup

### 1. Prerequisites
- Node.js 18+ installed
- A Discord account
- A Discord server you own or admin

### 2. Create a Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it → create
3. Go to the **Bot** tab → click **Add Bot**
4. Copy your **Token** (you'll need it)
5. Copy your **Client ID** from the General Information tab
6. Under **Privileged Gateway Intents**, enable **Server Members Intent**
7. Under **OAuth2 → URL Generator**, select:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Manage Roles`, `Read Messages`
8. Copy the generated URL and open it in your browser to invite the bot

### 3. Install & Configure
```bash
git clone <your-repo-url>   # or just copy the project folder
cd blockchain-bot
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `DISCORD_TOKEN` — from step 2
- `DISCORD_CLIENT_ID` — from step 2
- **RPC endpoints** — Use **HTTP** (not WSS) endpoints. Recommended:
  - **Free:** `https://eth-mainnet.g.alchemy.com/v2/demo` (Alchemy demo keys)
  - **Paid:** [Alchemy](https://www.alchemy.com/), [Infura](https://www.infura.io/), [QuickNode](https://www.quicknode.com/)
- **Role IDs** — right-click a role in Discord → Copy ID (enable Developer Mode in Discord settings first)

### 4. Deploy Commands & Start
```bash
node src/deploy.js    # registers slash commands (run once)
node src/index.js     # starts the bot
```

For development with auto-restart:
```bash
npm run dev
```

---

## Commands

| Command | Description | Mode |
|---|---|---|
| `/wallet verify <address> [network]` | Link & verify a wallet to your Discord account | User |
| `/wallet balance` | Show native token balance of your verified wallet | User |
| `/wallet network` | Show your connected chain, RPC, and explorer | User |
| `/token info <address> [network]` | Get ERC-20 token name, symbol, decimals, total supply | User |
| `/contract verify <address> [network]` | Check if a contract is deployed + bytecode size | User |
| `/testnet faucet <network>` | Get faucet link for a testnet | User |
| `/testnet status <network>` | Check if a testnet RPC is alive + latest block | User |
| `/rpc status <network>` | Detailed RPC health check with latency + chain ID validation | **Dev Mode** |
| `/gas price <network>` | Current gas price + EIP-1559 fee data + transfer cost estimate | User |

### Supported Networks
- **Mainnet:** Ethereum
- **Testnets:** Sepolia, Goerli, Polygon Amoy, Base Sepolia

---

## 🔧 Key Features

### Smart Error Diagnosis
When blockchain calls fail, the bot doesn't just say "error". It analyzes the error and tells you:
-  Wrong network / chain ID mismatch
-  Insufficient gas or funds (+ links to faucets)
-  Contract not deployed
-  Missing token approval
-  RPC connection issues
-  Nonce / pending transaction conflicts

### Role-Based Access (Dev Mode)
- Certain commands (like `/rpc status`) are locked behind a **Dev Mode** role
- The `devOnly` middleware checks for the role before running the command
- Assign the role ID in your `.env`

### Modular Architecture
- Each command lives in its own file
- Adding a new command = create a handler → add it to `definitions.js` → add it to `router.js`
- Middleware is reusable — wrap any handler with `devOnly()` or create your own guards

---

##  Roadmap (Future Features)

These are natural next steps to build on top of this MVP:

### Signature-Based Wallet Verification
The current verify flow checks on-chain activity. To prove wallet ownership:
1. Generate a unique nonce per user
2. Have the user sign a message (via a small web page with ethers.js/wagmi)
3. Verify the signature with `ethers.verifyMessage()`
4. See the comments in `wallet/verify.js` for implementation details

### Persistent Storage
Replace the in-memory `store.js` with a real database:
- **SQLite** (`better-sqlite3`) — zero setup, great for small bots
- **MongoDB** — good if you want flexibility
- **PostgreSQL** — best for production scale

### NFT Ownership Verification
- Query NFT contracts (ERC-721 / ERC-1155) to check if a user holds a specific token
- Auto-assign roles based on holdings

### Token-Gated Roles
- Hold X tokens → get role
- Re-check on an interval (e.g., every 24h)
- Revoke role if balance drops

### Price Feeds
- Add `/price <token>` using CoinGecko API
- Add price alerts with thresholds

### Wallet Activity Alerts
- Monitor specific wallets for new transactions
- Push alerts into a Discord channel

---

##  Troubleshooting

### ❌ "Used disallowed intents"
**Cause:** The bot doesn't have the required intents enabled in Discord Developer Portal.  
**Fix:** Go to Discord Developer Portal → Your Bot → **Privileged Gateway Intents** → Enable:
- ✅ **Server Members Intent**

### ❌ "Unsupported protocol wss"
**Cause:** RPC endpoint is using WebSocket (`wss://`) instead of HTTP.  
**Fix:** Update your `.env` to use **HTTPS endpoints**, not WSS:
```bash
# ❌ Wrong (WebSocket)
ETH_MAINNET_RPC=wss://ethereum-rpc.publicnode.com

# ✅ Correct (HTTP)
ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/demo
```

### ❌ "Failed to fetch gas price" or Command Timeouts
**Cause:** RPC endpoint is slow or rate-limited.  
**Fix:** Use a reliable paid endpoint:
- [Alchemy](https://www.alchemy.com/) (recommended)
- [Infura](https://www.infura.io/)
- [QuickNode](https://www.quicknode.com/)

### ❌ Commands not showing in Discord
**Cause:** Deployment script didn't run, or bot isn't in your server.  
**Fix:**
1. Run `node src/deploy.js` to register commands
2. Re-invite the bot with correct scopes (`bot` + `applications.commands`)
3. Close & reopen Discord to refresh
4. Make sure the bot is running: `node src/index.js`

### ❌ Role assignments not working
**Cause:** Bot doesn't have `Manage Roles` permission or role IDs are incorrect.  
**Fix:**
1. Discord Server → Bot Role → Permissions → Enable **Manage Roles**
2. Verify role IDs in `.env` (right-click role → Copy ID)
3. Enable Developer Mode in Discord (Settings → Advanced)

---

##  Tips

- **Developer Mode:** Enable it in Discord (Settings → Advanced) so you can copy Role IDs and User IDs by right-clicking.
- **Ephemeral Replies:** Most responses are ephemeral (only you can see them) to keep channels clean.
- **Rate Limits:** Public RPCs have rate limits. For production, use paid endpoints (Alchemy, Infura, QuickNode).
- **Token:** Never commit your `.env` file. It's already in `.gitignore`.
- **RPC Endpoints:** Always use **HTTP/HTTPS**, not WebSocket (WSS) for this bot.

