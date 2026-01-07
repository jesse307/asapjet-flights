# LegalCore

A modern front-door application for in-house legal departments with customizable modules based on user roles and involvement.

## Features

### AI-Powered Assistant

**Ledes AI** - An intelligent chatbot powered by Claude (Anthropic) that:
- Answers questions about your contracts, entities, and billing data in real-time
- Provides insights and analytics on deadlines and upcoming items
- Offers contract playbook guidance and redlining advice
- Has full access to your Supabase database for accurate, contextual responses

### Modules

1. **Entity Management** - Manage corporate entities, governance structure, and organizational hierarchies
2. **Legal Billing** - Track legal expenses, manage vendor invoices, and monitor department budgets with Mitratech integration
3. **Contracts** - Create, review, and manage legal contracts and agreements

### User Role System

The application supports role-based access control with the following user levels:

- `admin` - Full access to all modules and administrative features
- `manager` - Access to most modules with management capabilities
- `user` - Standard access to assigned modules
- `viewer` - Read-only access to specific modules

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd legal-department-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
- **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key
- **ANTHROPIC_API_KEY** - Your Anthropic API key (get it from https://console.anthropic.com/)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
legal-department-portal/
├── app/
│   ├── modules/           # Module-specific pages
│   │   ├── corporate-compliance/
│   │   ├── legal-billing/
│   │   └── compliance/
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── Header.tsx
│   └── ModuleCard.tsx
├── lib/                  # Utility functions and data
│   └── modules.ts        # Module definitions
├── types/                # TypeScript type definitions
│   └── index.ts
└── public/               # Static assets
```

## Customization

### Adding New Modules

1. Define your module in `lib/modules.ts`:
```typescript
{
  id: 'new-module',
  title: 'New Module',
  description: 'Module description',
  icon: 'icon-name',
  color: 'blue',
  href: '/modules/new-module',
  allowedRoles: ['admin', 'manager'],
}
```

2. Create a new page at `app/modules/new-module/page.tsx`

### Modifying User Roles

Edit the `UserLevel` type in `types/index.ts` to add or remove roles.

### Styling

The application uses Tailwind CSS for styling. Modify `app/globals.css` for global styles or component files for component-specific styles.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **UI Components**: Custom React components

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Next Steps

- Implement authentication (e.g., NextAuth.js, Clerk, or Auth0)
- Connect to a database (e.g., PostgreSQL, MongoDB)
- Add API routes for data management
- Implement actual module functionality
- Add user management interface
- Set up deployment (Vercel, AWS, etc.)

## License

Proprietary - Legal Department Internal Use Only

