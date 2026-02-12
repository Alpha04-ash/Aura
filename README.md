# Aura - AI Lifestyle Architect

Aura is a sophisticated lifestyle architect and AI coaching platform designed to help users master their routines and achieve deep work through minimalist systems.

## 🌟 Features

- **Specialized AI Coaches**: Chat with Marcus (Productivity), Elara (Mindfulness), and Julian (Creativity)
- **Deep Work Integration**: Real-time schedule injection into AI context for personalized advice
- **Holistic Habit Tracking**: Track nutrition, skin care, hair care, and study hours
- **Premium Experience**: Smooth animations, haptic feedback, and elegant dark/light modes
- **RevenueCat Integration**: Seamless subscription management for premium features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- OpenAI API Key

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy config example
cp src/config.example.ts src/config.ts

# Add your OpenAI API key to src/config.ts

# Start the app
npm start
```

### Running on Different Platforms

```bash
# Web
npm run web

# iOS (requires Mac)
npm run ios

# Android
npm run android
```

## 📦 Building

### Android APK
```bash
npx eas login
npx eas build --platform android --profile preview
```

## 🛠 Built With

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **OpenAI API** - AI coaching intelligence
- **RevenueCat** - Subscription management
- **Moti** - Smooth animations
- **React Navigation** - Navigation

## 📱 Download

[Download APK](https://expo.dev/accounts/alpha04s-organization/projects/aura/builds/e26976e8-463f-4e72-bf24-20cc33edf28a)

## 🏆 Hackathon

Built for the **RevenueCat Shipyard Creator Contest**

## 📄 License

MIT
