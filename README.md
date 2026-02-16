# Bulk Mail Application

A full-stack MERN application for sending bulk emails with admin authentication, mail history tracking, and Nodemailer integration.

## Tech Stack

- **Frontend**: React 18 (Hooks), React Router v6
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Email**: Nodemailer (Gmail SMTP)
- **Authentication**: JWT

## Project Structure

```
Bulkmail/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Express Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Setup Instructions

### 1. Clone & Install Dependencies

```bash
cd Bulkmail
npm run install-all
```

Or manually:

```bash
npm install
cd client && npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail App Password (not regular password) |

**Gmail App Password**: Enable 2FA on your Google account, then create an App Password at [Google App Passwords](https://myaccount.google.com/apppasswords).

### 3. Seed Admin User

Create a default admin user for login:

```bash
node server/scripts/seedAdmin.js
```

Default credentials (or from `.env`):
- **Email**: admin@bulkmail.com
- **Password**: admin123

### 4. Run the Application

**Development (both server + client):**
```bash
npm run dev
```

**Or run separately:**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login (email, password) |

### Mail (Protected - requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mail/send` | Send bulk emails |
| GET | `/api/mail/history` | Get sent mail history (paginated) |

## Features

- ✅ Admin login with JWT
- ✅ Bulk email sending via Nodemailer
- ✅ Recipients as comma-separated list
- ✅ Email validation
- ✅ Partial failure handling (tracks success/failed per recipient)
- ✅ Sent mail history with status
- ✅ Responsive UI

## Deployment

1. Set `NODE_ENV=production`
2. Build frontend: `cd client && npm run build`
3. Serve static files from `client/build` in Express
4. Use a process manager (PM2) for the Node server

## License

MIT
