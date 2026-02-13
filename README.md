# Thế Giới Gacha Gối Ôm

A full-stack gacha game web application where users can collect virtual items, play gacha rolls, exchange items with codes, and order physical merchandise with shipping.

## Features

### User Features
- **Gacha System**: Roll for items with different rarity levels (Common, Rare, A, S, SS, SSS, EX)
- **Pity System**: Automatically boosts your chances after consecutive non-winning rolls
- **Item Collection**: View and manage your collected items
- **Daily Check-in**: Earn coins by checking in daily
- **Item Exchange**: Generate and claim exchange codes to trade items with other users
- **Physical Orders**: Order physical items with shipping information management
- **User Profile**: Track your coins, collection stats, and manage shipping addresses

### Admin Features
- **Item Management**: Create, edit, and manage items with images, descriptions, and rarity
- **Item Groups**: Organize items into groups with configurable base chances
- **Order Management**: View, process, and update order statuses (pending, shipped, rejected)
- **Exchange Monitoring**: Track item exchange codes and claims
- **Pity Configuration**: Adjust pity system settings (rolls until pity, boost formula, win threshold)
- **User Management**: View user profiles and statistics

## Tech Stack

### Frontend
- [React Router v7](https://reactrouter.com/) - Full-stack React framework
- [React 19](https://react.dev/) - UI library
- [TailwindCSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Lucide React](https://lucide.dev/) - Icon library
- [better-auth](https://www.better-auth.com/) - Authentication

### Backend
- [Elysia](https://elysiajs.com/) - Fast Bun web framework
- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [PostgreSQL](https://www.postgresql.org/) - Database (with PGlite for development)
- [better-auth](https://www.better-auth.com/) - Authentication
- TypeBox - Schema validation

## Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher
- PostgreSQL (for production) or PGlite (auto-installed for development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thế-giới-gacha-gối-ôm
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gacha_db
NODE_ENV=development

# Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

4. Run database migrations:
```bash
cd backend
bun run db:push
```

## Development

The project uses a monorepo structure with separate frontend and backend workspaces.

### Run Frontend (Development)
```bash
cd frontend
bun run dev
```
The frontend will be available at `http://localhost:5173`

### Run Backend (Development)
```bash
cd backend
bun run dev
```
The backend API will be available at `http://localhost:3000`

### Run Both (Recommended)
You can run both frontend and backend simultaneously in separate terminal windows.

## Database Management

### Push Schema Changes
```bash
cd backend
bun run db:push
```

### Run Migrations
```bash
cd backend
bun run db:migrate
```

### Open Drizzle Studio
View and edit your database with a GUI:
```bash
cd backend
bun run db:studio
```

## Building for Production

### Build Frontend
```bash
cd frontend
bun run build
```

### Build Backend
```bash
cd backend
bun run build
```

### Start Production Server
```bash
# Frontend
cd frontend
bun run start

# Backend
cd backend
bun run start
```

## Project Structure

```
thế-giới-gacha-gối-ôm/
├── frontend/              # React Router frontend
│   ├── app/
│   │   ├── routes/       # Route components (HomePage, AdminPage, etc.)
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # Utilities and API client
│   │   └── store/        # Zustand state management
│   └── public/           # Static assets
│
├── backend/              # Elysia backend
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── database/     # Drizzle schema and migrations
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Custom middleware
│   │   └── utils/        # Helper functions
│   └── drizzle/          # Database migrations
│
└── package.json          # Root workspace configuration
```

## Key Features Explained

### Gacha Mechanics
- Items are organized into groups with configurable base chances
- Each item can have a manual chance override or inherit from its group
- Items with `isEx: true` require special eligibility (having at least one EX item)
- Rarity affects the visual presentation and perceived value

### Pity System
- Tracks consecutive rolls without winning items above a certain rarity threshold
- Automatically boosts chances using an inverse formula
- Configurable via admin panel (rolls until pity, boost strength, win threshold)

### Exchange System
- Users can generate unique exchange codes for their items
- Codes can be claimed by other users
- Each code is single-use and tracked in the database

### Order System
- Users can order physical versions of their virtual items
- Shipping information is managed per user
- Orders go through workflow: pending → shipped/rejected
- Admin panel provides order management interface

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
