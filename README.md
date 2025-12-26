# Group Expense Manager - Backend API

A robust Node.js/Express backend API for managing group expenses with Google OAuth authentication.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Run the interactive setup:
```bash
npm run setup
```

Or manually copy and edit `.env`:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 Documentation

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🔑 Key Features

- ✅ **Google OAuth 2.0** - Secure authentication with Google
- ✅ **JWT Tokens** - Stateless authentication
- ✅ **MongoDB** - Scalable database with Mongoose ODM
- ✅ **CORS** - Configured for mobile app access
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Error Handling** - Comprehensive error management
- ✅ **TypeScript** - Type-safe development
- ✅ **Security** - Helmet, compression, and best practices

## 📡 API Endpoints

### Authentication
- `POST /api/auth/google` - Login with Google OAuth
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

### Health Check
- `GET /health` - Server health status

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth 2.0 + JWT
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Scripts

- `npm run setup` - Interactive environment setup
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

## 🔒 Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration time
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `ALLOWED_ORIGINS` - CORS allowed origins

## 🧪 Testing

### Test with cURL
```bash
# Health check
curl http://localhost:5000/health

# Login with Google
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

### Test with Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:5000/api`
3. For protected routes, add `Authorization: Bearer {token}` header

## 📱 Mobile App Integration

### Android Emulator
Use: `http://10.0.2.2:5000/api`

### iOS Simulator
Use: `http://localhost:5000/api`

### Physical Device
Use: `http://YOUR_COMPUTER_IP:5000/api`

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
└── server.ts        # Express app setup
```

## 🔐 Google Cloud Console Setup

**Important**: Configure the redirect URI in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your Web Client ID
4. Add this redirect URI:
   ```
   https://auth.expo.io/@princedev005/group-expense-manager
   ```
5. Save changes

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#-troubleshooting) for common issues and solutions.

## 📄 License

MIT

## 👨‍💻 Author

Prince Kumar
