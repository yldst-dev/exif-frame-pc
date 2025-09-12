# Preview Image

<p align="center">
  <img src="https://raw.githubusercontent.com/yldst-dev/exif-frame-pc/refs/heads/main/preview%20image.jpg" alt="Preview image" width="600">
</p>

# EXIF Frame Web App

<p align="center">
  📸 → 🖼️ with EXIF metadata
</p>

A modern web application that adds beautiful frames with EXIF metadata to your photos. This is a redesigned version of the original [EXIF Frame](https://exif-frame.yuru.cam) with enhanced user experience and desktop-focused interface.

## ✨ Features

- **16 Beautiful Themes**: Choose from various frame styles including minimalist, vintage, and custom designs
- **Intuitive Interface**: Modern desktop-optimized UI with sidebar navigation
- **Batch Processing**: Download multiple photos as a ZIP file
- **Theme Customization**: Customize colors, fonts, and layout options
- **EXIF Data Management**: Automatic extraction and display of camera metadata
- **Multiple Languages**: Support for Korean, English, Japanese, and Chinese
- **Dark Mode**: Built-in dark theme support

## 🖥️ Desktop Only

This application is optimized for desktop use only. Mobile users will be redirected to the [original EXIF Frame](https://exif-frame.yuru.cam) for the best mobile experience.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yldst-dev/exif-frame-pc.git
cd exif-frame-pc
```

2. Install dependencies
```bash
cd web
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Vite** for build tooling
- **ExifReader** for metadata extraction

## 📁 Project Structure

```
web/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── pages/      # Page components
│   ├── themes/     # Frame themes
│   ├── core/       # Core functionality
│   ├── icons/      # Icon components
│   └── locales/    # Internationalization
└── ...
```

## 🔄 TODO

- [ ] **Electron App**: Build desktop application using Electron for better native experience
- [ ] **Performance Optimization**: Implement image processing optimization for large files
- [ ] **Mobile Support**: Add responsive mobile interface and remove desktop-only restriction

## Contributors

Special thanks to all the people who have contributed to this project:

- [rhea-so](https://github.com/rhea-so)
- [longfin](https://github.com/longfin)
- [KelvinPuyam](https://github.com/KelvinPuyam)
- [SJC08](https://github.com/SJC08)
