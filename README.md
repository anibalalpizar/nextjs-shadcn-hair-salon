# Hair Salon Management System

A modern, responsive web application built with Next.js and shadcn/ui for managing a hair salon business. This system helps salon owners and staff manage appointments, clients, employees, and billing efficiently.

## 🚀 Live Demo

Check out the live demo at [https://nextjs-shadcn-hair-salon.vercel.app](https://nextjs-shadcn-hair-salon.vercel.app)

## 📸 Screenshots

### Light Mode
<div style="display: flex; gap: 10px; margin-bottom: 20px;">
  <img src="/public/dashboard-white.png" width="49%" alt="Dashboard Light Mode" />
  <img src="/public/example-white.png" width="49%" alt="Example Light Mode" />
</div>

### Dark Mode
<div style="display: flex; gap: 10px; margin-bottom: 20px;">
  <img src="/public/dashboard-dark.png" width="49%" alt="Dashboard Dark Mode" />
  <img src="/public/example-dark.png" width="49%" alt="Example Dark Mode" />
</div>

## Features

- 📅 **Appointment Management**: Schedule and manage client appointments
- 👥 **Client Management**: Keep track of client information and history
- 👨‍💼 **Employee Management**: Manage staff information, schedules, and commissions
- 💰 **Billing System**: Generate and manage invoices
- 📊 **Reports**: View business analytics and performance metrics
- 🌙 **Dark Mode**: Support for light and dark themes
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Recharts](https://recharts.org/) - Charts and graphs
- [date-fns](https://date-fns.org/) - Date utilities
- [Lucide Icons](https://lucide.dev/) - Icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/anibalalpizar/nextjs-shadcn-hair-salon.git
   cd nextjs-shadcn-hair-salon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo Credentials

Use these credentials to test the application:
- Username: `admin`
- Password: `admin`

## Project Structure

```
src/
├── app/                # Next.js app directory
│   ├── billing/        # Billing management
│   ├── clients/        # Client management
│   ├── dashboard/      # Dashboard and analytics
│   ├── employees/      # Employee management
│   ├── reports/        # Reports and statistics
│   └── reservations/   # Appointment management
├── components/         # Reusable components
├── lib/                # Utilities and helpers
└── styles/            # Global styles
```

## Features in Detail

### Dashboard
- Overview of daily operations
- Key performance metrics
- Revenue charts
- Client statistics

### Appointment Management
- Schedule new appointments
- View and manage existing appointments
- Check time slot availability
- Automatic conflict prevention

### Client Management
- Add and edit client profiles
- View client history
- Search and filter capabilities
- Contact information management

### Employee Management
- Staff profiles and schedules
- Commission tracking
- Performance monitoring
- Role management

### Billing System
- Generate invoices
- Track payments
- Apply discounts
- Print receipts

### Reports
- Daily/monthly revenue reports
- Staff performance analytics
- Client attendance statistics
- Peak hours analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[Aníbal Alpízar](https://github.com/anibalalpizar)

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Platform](https://vercel.com)
