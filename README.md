# Email Reminder System

A modern web application for scheduling and managing email reminders. This system allows users to create, schedule, edit, and manage automated email notifications.

## Features

- 📧 Schedule emails for future delivery
- 👥 Support for multiple recipients
- 📅 Flexible scheduling options
- ✏️ Edit scheduled emails
- 🗑️ Delete pending emails
- 📊 Status tracking for each email
- 🔒 Secure user authentication
- 📱 Responsive design for all devices

## Technologies Used

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - For type-safe code
- **Bootstrap 5** - For responsive UI components
- **React Icons** - For beautiful icons
- **Axios** - For HTTP requests
- **React Hot Toast** - For notifications
- **React Hook Form** - For form handling

### Backend
- **Node.js** - Runtime environment
- **MongoDB** - Database for storing user and email data
- **Mongoose** - MongoDB object modeling
- **JWT** - For user authentication
- **Nodemailer** - For sending emails
- **Node-cron** - For scheduling email tasks

### Development Tools
- **ESLint** - For code linting
- **Prettier** - For code formatting
- **Git** - For version control

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
TOKEN_SECRET=your_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   └── pages/         # App pages
├── models/           # MongoDB models
├── helpers/         # Utility functions
└── dbConfig/        # Database configuration
```

## Features in Detail

### User Authentication
- Secure signup and login
- JWT-based authentication
- Password hashing

### Email Management
- Create and schedule emails
- Edit pending emails
- Delete scheduled emails
- View email status (pending/sent/failed)
- Support for multiple recipients

### Error Handling
- Comprehensive error messages
- Failed email retry mechanism
- Automatic cleanup of old failed emails

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors
- Built with Next.js and MongoDB
- Powered by Node.js and React

---
Available on my youtube channel
[Youtube channel link](https://www.youtube.com/@HiteshChoudharydotcom)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
## Assignment
1. Improve the UI of the application
2. Add feature of forgot password

---
### Hint:
For forgot password feature.
1. User needs a page to enter his email and submit.
2. Validate if user exists, if yes, send him same token email that we discussed in this course
3. User clicks on email and get a page to enter new password with a submit button.
4. As soon as he click submit button, he is sending you a token and new password.
5. Verify the token and save the new password after encrypting it.

---
## your completed assignments

- Add your repo link here
- 