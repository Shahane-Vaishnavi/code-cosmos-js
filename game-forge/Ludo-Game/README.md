# 🎲 Ludo Game

A modern, interactive web-based Ludo game built with React, Vite, and Tailwind CSS. Play with friends or challenge AI opponents in this classic board game!

## ✨ Features

- **🎮 Multiple Game Modes**
  - Play with Friends (Multiplayer)
  - Play with Computer (AI opponents)

- **👥 Flexible Player Count**
  - Support for 2-6 players
  - Automatic AI players in computer mode

- **🎨 Beautiful UI**
  - Modern gradient designs
  - Smooth animations and transitions
  - Responsive layout for all screen sizes
  - Interactive dice rolling animation

- **🤖 AI Opponents**
  - Intelligent computer players
  - Automatic turn-based gameplay

- **🏆 Win Detection**
  - Automatic winner announcement
  - Game completion tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Ludo-Game
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`

If it doesn't open automatically, manually navigate to the URL shown in the terminal.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## 🎯 How to Play

1. **Login**: Enter your username on the login screen
2. **Choose Mode**: Select between "Play with Friends" or "Play with Computer"
3. **Select Players**: Choose the number of players (2-6)
4. **Roll Dice**: Click the "Roll Dice" button on your turn
5. **Move Pieces**: 
   - Roll a 6 to move a piece out of the starting area
   - Roll any number to move pieces already on the board
   - Get all 4 pieces to the finish (position 57) to win!

### Game Rules

- Each player has 4 pieces that start at position -1
- Roll a 6 to move a piece from the starting area (position -1 to 0)
- On subsequent turns, pieces move forward by the dice value
- The first player to get all 4 pieces to position 57 wins
- If you roll a 6, you get an extra turn (if a move was made)

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **JavaScript (ES6+)** - Programming language

## 📁 Project Structure

```
Ludo-Game/
├── src/
│   ├── App.jsx          # Main Ludo game component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind CSS imports
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # This file
```

## 🎨 Features in Detail

### Game States

- **Login Screen**: Enter player name
- **Mode Selection**: Choose game mode
- **Player Selection**: Select number of players
- **Game Screen**: Main gameplay interface

### Interactive Elements

- Real-time dice rolling animation
- Visual feedback for current player's turn
- Piece position tracking
- Win condition detection and celebration

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

Enjoy playing Ludo! 🎲🎉

