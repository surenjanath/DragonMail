# DragonMail

DragonMail is a modern temporary email client built with React Native and Expo. It provides disposable email addresses that automatically self-destruct after 10 minutes, perfect for protecting your privacy when signing up for services or avoiding spam. The app integrates with the TempMail API to provide real-time email functionality with a beautiful and intuitive user interface.

## Features

- 📧 Temporary email addresses that self-destruct after 10 minutes
- 🔄 Real-time email synchronization via TempMail API
- 📱 Cross-platform support (iOS, Android, Web)
- 🎨 Beautiful and responsive UI
- 🔒 Privacy-focused with disposable email addresses
- 📎 File attachment support
- 🔍 Advanced search capabilities
- 🌙 Dark/Light mode support
- ⏱️ Automatic email expiration timer
- 📋 Copy email address with one tap
- 🔄 Generate new email addresses instantly
- 📬 Real-time email notifications
- 🗑️ Manual email deletion option

## How It Works

DragonMail uses the TempMail API to create temporary email addresses. Here's how it works:

1. **Email Generation**: When you open the app, it automatically generates a random temporary email address
2. **Real-time Sync**: The app connects to TempMail's API to receive emails in real-time
3. **Auto-destruction**: All emails and the temporary address are automatically deleted after 10 minutes
4. **Privacy**: No personal data is stored, and all emails are temporary
5. **Instant Access**: Receive emails instantly without any registration required

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dragonmail.git
cd dragonmail
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

## Running the App

### Development

To run the app in development mode:

```bash
# Start the Expo development server
npm start
# or
yarn start
```

Then, you can:
- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with Expo Go app on your physical device
- Press `w` to open in web browser

### Building for Production

#### Android
```bash
npm run android
# or
yarn android
```

#### iOS
```bash
npm run ios
# or
yarn ios
```

#### Web
```bash
npm run web
# or
yarn web
```

## Project Structure

```
dragonmail/
├── app/              # Main application screens and navigation
├── assets/           # Images, fonts, and other static files
├── components/       # Reusable UI components
├── constants/        # App-wide constants and configuration
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── services/         # API and external service integrations
├── types/            # TypeScript type definitions
└── scripts/          # Build and utility scripts
```

## Technologies Used

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Axios](https://axios-http.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email@example.com] or open an issue in the GitHub repository.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the Expo team for their amazing framework

DragonMail creates temporary email addresses that self-destruct after the set time.
