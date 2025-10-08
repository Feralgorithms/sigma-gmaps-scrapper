# 🚀 Sigma GMaps Scrapper

A desktop Google Maps scraper built with **Puppeteer + Electron**.  
Easily scrape business data from Google Maps and export it in CSV/JSON.

---

## 📌 Table of Contents

- [Features](#features)  
- [Requirements](#requirements)  
- [Installation (Developer)](#installation-developer)  
- [Usage (Developer)](#usage-developer)  
- [Build](#build)  
- [Installation (User)](#installation-user)  
- [Usage (User)](#usage-user)  
- [File Structure](#file-structure)  
- [License](#license)  

---

## ✨ Features

- Scrape business information from Google Maps  
- Export scraped data as CSV or JSON  
- Desktop app for **Windows**
- Uses **Electron** and **Puppeteer** for automation  

---

## ⚙️ Requirements

- [Node.js](https://nodejs.org/) v18+  
- npm (comes with Node.js)  
- Internet connection for scraping  

---

## 🛠 Installation (Developer)

1. Clone this repository:

```bash
git clone https://github.com/Feralgorithms/sigma-gmaps-scrapper.git
cd sigma-gmaps-scrapper
```

2. Install dependencies:

```bash
npm install
```

---

## 🚀 Usage (Developer)

Run the app in development mode:

```bash
npm start
```

---

## 🏗 Build

To build the executable (Windows):

```bash
npm run build
```

- Output installer will be in \`dist/\` folder  
- Builds an **NSIS installer (.exe)** with the app icon  

---

## 💾 Installation (User)

Download the latest installer from GitHub Release:  

[Download Sigma GMaps Scrapper v1.0.0](https://github.com/Feralgorithms/sigma-gmaps-scrapper/releases/download/v1.0.0/Sigma.GMaps.Scrapper.Setup.1.0.0.exe)

1. Double-click the \`.exe\` file to install.  
2. Follow the installer instructions.  

---

## 🎮 Usage (User)

1. Launch the app from **Start Menu** or **Desktop shortcut**.  
2. Enter Google Maps search parameters. 
3. Enter the maximum amount of data
4. Click **Scrape** to scrape data.  
5. Export results as **CSV** or **JSON**.  

---

## 🗂 File Structure

```
sigma-gmaps-scrapper/
│
├─ main.js             # Main Electron process
├─ preload.js          # Preload script
├─ scraper.js          # Puppeteer scraper logic
├─ utils/              # Helper utilities
├─ assets/             # Icons, images, etc.
├─ renderer/
│   ├─ index.html      # Main HTML page
│   ├─ renderer.js     # Renderer process JS
│   └─ ...             # Other renderer-related files
├─ package.json        # Project config & dependencies
└─ dist/               # Build output (after build)
```

---

## 📄 License

This project is licensed under the **MIT License**.  
© 2025 Ferdy

See [LICENSE](LICENSE) for details.

