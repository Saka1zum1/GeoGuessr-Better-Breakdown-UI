# GeoGuessr Better Breakdown UI

🎮 A Tampermonkey script that enhances your GeoGuessr experience by providing convenient tools to view and analyze your guesses after each round.

## ✨ Features

- **📍 Street View Preview**: Hover over map markers to preview the Street View image at that location
- **📏 Distance Display**: See the distance between your guess and the nearest Street View coverage point
- **🗺️ Built-in Street View Viewer**: Click markers to open Street View directly in-page without leaving the site
- **⏰ Historical Street View**: Switch between different Street View images captured at different times
- **🎯 Coverage Layer**: Display Google Street View coverage to help you better analyze the map
- **💾 Map Making Integration**: Save locations to [Map Making App](https://map-making.app) with one click

## 🎹 Keyboard Shortcuts

| Key | Function |
|------|------|
| `P` | Toggle real-time Street View preview tooltip |

## 📥 Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension (compatible with Chrome, Firefox, Edge, and other major browsers)
2. Install the script using one of these methods:
   - [Install from Greasy Fork](https://greasyfork.org/en/scripts/563091)
   - [Install from GitHub](https://github.com/Saka1zum1/GeoGuessr-Better-Breakdown-UI)
3. Visit [GeoGuessr](https://www.geoguessr.com/) to play, the script will activate automatically

### Manual Installation

1. Click the Tampermonkey icon in your browser
2. Select "Create a new script"
3. Copy the contents of `GeoGuessr Better Breakdown UI.js` and paste it into the editor
4. Press `Ctrl+S` (or `Cmd+S` on Mac) to save

## 🔧 Map Making Integration Setup

If you want to save Street View locations to Map Making App:

1. Click the save button (upload icon) in the Street View viewer
2. On first use, you'll be prompted to enter your API Key
3. Visit [map-making.app/keys](https://map-making.app/keys) to generate your API Key
4. Enter your API Key and start saving locations

## 💡 Tips & Tricks

- **View guess details**: After a round ends, hover over your guess marker to preview the Street View
- **Analyze correct location**: Click on the correct location marker (green) to view the actual Street View
- **Switch historical views**: Use the dropdown menu at the bottom of the viewer to select different capture dates
- **Copy Street View link**: Click the copy button in the bottom-left corner of the viewer to get a Google Maps short link

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 👨‍💻 Author

KaKa, Alien Perfect
