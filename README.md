# GeoGuessr-Better-Breakdown-UI

A Tampermonkey script for improving GeoGuessr Breakdown UI with enhanced features and better code organization.

## Features

- 🎯 Enhanced panorama tooltips with distance information
- 🗺️ Improved marker interactions with Street View integration
- 🎨 Clean, organized UI with better visual feedback
- 📊 Better breakdown information display

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click on the Tampermonkey icon and select "Create a new script"
3. Copy the contents of `betterui.js` and paste it into the editor
4. Save the script (Ctrl+S or Cmd+S)
5. Visit [GeoGuessr](https://www.geoguessr.com/) and the script will automatically activate

## Code Structure

The script follows a clean, modular architecture with:

- **Helper Functions**: Reusable utilities for common operations
- **Observer Managers**: Efficient DOM mutation tracking
- **Unified Tooltip System**: Consistent marker interactions
- **Organized Styles**: CSS grouped by functionality for easy maintenance

## Development

### Refactoring Patterns Applied

This script has been refactored to follow best practices:

1. **Observer Factory Pattern**: Eliminates duplicate observer management code
2. **Safe Data Extraction**: Centralized error handling for data access
3. **Unified Tooltip Logic**: Single function handles both guess and answer markers
4. **Grouped CSS**: Styles organized by feature for better maintainability
5. **Address Parsing Helper**: Centralized address extraction logic

## License

MIT License - See [LICENSE](LICENSE) file for details

## Author

Saka1zum1
