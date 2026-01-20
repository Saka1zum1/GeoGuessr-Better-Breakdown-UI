// ==UserScript==
// @name         GeoGuessr Better Breakdown UI
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  A tampermonkey script for improving GeoGuessr Breakdown UI
// @author       Saka1zum1
// @match        https://www.geoguessr.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      maps.googleapis.com
// ==/UserScript==

(function() {
    'use strict';

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Factory function to create an observer manager
     * Replaces startMarkerObserver/stopMarkerObserver and starMapObserver/stopMapObserver patterns
     */
    function createObserverManager() {
        let observer = null;
        let timer = null;
        
        return {
            start(callback, options = { childList: true, subtree: true }) {
                this.stop();
                observer = new MutationObserver(callback);
                observer.observe(document.body, options);
            },
            stop() {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            },
            setTimer(t) { timer = t; },
            getTimer() { return timer; }
        };
    }

    /**
     * Safe data extraction helper
     * Replaces repeated try-catch blocks in parseMeta
     */
    function safeGet(obj, pathArray, defaultValue = null) {
        try {
            return pathArray.reduce((o, k) => o[k], obj) ?? defaultValue;
        } catch {
            return defaultValue;
        }
    }

    /**
     * Parse address from data structure
     * Extracts repeated address parsing logic from parseMeta
     */
    function parseAddress(data) {
        const paths = [
            [1, 0, 3, 2, 1, 0],
            [1, 0, 3, 2, 0, 0]
        ];
        
        for (const path of paths) {
            const address = safeGet(data, path);
            if (address) {
                const parts = address.split(',');
                return {
                    region: parts.length > 1 ? parts[parts.length - 1].trim() : address,
                    locality: parts.length > 1 ? parts[0].trim() : null
                };
            }
        }
        return { region: null, locality: null };
    }

    /**
     * Format distance for display
     */
    function formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    }

    /**
     * Get Street View thumbnail URL
     */
    function getStreetViewThumbUrl(pano) {
        const { lat, lng, heading = 0 } = pano;
        return `https://maps.googleapis.com/maps/api/streetview?size=200x150&location=${lat},${lng}&heading=${heading}&key=YOUR_API_KEY`;
    }

    /**
     * Unified function to apply panorama tooltip to markers
     * Merges applyPanoToGuessMarker and applyPanoToAnswerMarker
     */
    function applyPanoToMarker(marker, pano, roundId, type = 'guess') {
        const bindKey = `${type}_${roundId}`;
        if (marker.dataset?.peekBound === bindKey) return;
        marker.dataset.peekBound = bindKey;

        marker.style.cursor = "pointer";
        marker.style.pointerEvents = "auto";
        
        const tooltipClass = type === 'guess' ? 'peek-tooltip' : 'peek-answer-tooltip';
        marker.querySelectorAll(`.${tooltipClass}`).forEach(t => t.remove());

        const tooltip = document.createElement("div");
        tooltip.className = tooltipClass;
        
        // Build different tooltip content based on type
        if (type === 'guess') {
            marker.dataset.pano = pano.error ? "false" : "true";
            if (pano.error) {
                tooltip.innerHTML = `<div class="peek-error">No Street View found within 250km</div>`;
            } else {
                tooltip.innerHTML = `
                    <div class="peek-header">
                        <span class="peek-dist">${formatDistance(pano.radius)}</span> away
                    </div>
                    <div class="peek-body">
                        <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb" alt="Preview">
                    </div>
                    <div class="peek-note">Click pin to view Street View</div>
                `;
            }
        } else {
            tooltip.innerHTML = `
                <div class="peek-note">Click pin to view Street View</div>
                <div class="peek-body">
                    <img src="${getStreetViewThumbUrl(pano)}" class="peek-thumb">
                </div>
            `;
        }

        // Shared click handling logic
        if (!pano.error || type === 'answer') {
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                removePeekMarker();
                openNativeStreetView(pano);
            };
            marker.removeEventListener("click", marker._peekHandler);
            marker._peekHandler = clickHandler;
            marker.addEventListener("click", clickHandler);
        }

        marker.appendChild(tooltip);
    }

    /**
     * Parse metadata using safe extraction
     */
    function parseMeta(data) {
        const heading = safeGet(data, [1, 0, 5, 0, 1, 2, 0], 0);
        const pitch = safeGet(data, [1, 0, 5, 0, 1, 2, 1], 0);
        const country = safeGet(data, [1, 0, 5, 0, 1, 4], null);
        const altitude = safeGet(data, [1, 0, 5, 0, 1, 1, 0], null);
        const lat = safeGet(data, [1, 0, 5, 0, 1, 0, 0], null);
        const lng = safeGet(data, [1, 0, 5, 0, 1, 0, 1], null);
        const panoId = safeGet(data, [1, 0, 1], null);
        const imageDate = safeGet(data, [1, 0, 6, 7], null);
        
        const { region, locality } = parseAddress(data);

        return {
            heading,
            pitch,
            country,
            altitude,
            lat,
            lng,
            panoId,
            imageDate,
            region,
            locality
        };
    }

    /**
     * Remove peek marker
     */
    function removePeekMarker() {
        // Implementation for removing peek marker
    }

    /**
     * Open native Street View
     */
    function openNativeStreetView(pano) {
        const { lat, lng, heading = 0, pitch = 0 } = pano;
        const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}&pitch=${pitch}`;
        window.open(url, '_blank');
    }

    // ============================================================================
    // OBSERVER MANAGERS
    // ============================================================================

    const markerObserverManager = createObserverManager();
    const mapObserverManager = createObserverManager();

    // ============================================================================
    // MAIN FUNCTIONALITY
    // ============================================================================

    function initBreakdownUI() {
        console.log('[GeoGuessr Better Breakdown UI] Initializing...');
        
        // Start observers
        markerObserverManager.start(() => {
            // Handle marker mutations
            console.log('[Marker Observer] Detected changes');
        });

        mapObserverManager.start(() => {
            // Handle map mutations
            console.log('[Map Observer] Detected changes');
        });
    }

    // ============================================================================
    // STYLES
    // ============================================================================

    const STYLES = {
        tooltip: `
            /* Tooltip Styles */
            .peek-tooltip,
            .peek-answer-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 10px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
                padding: 12px;
                pointer-events: none;
                z-index: 1000;
                min-width: 200px;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .peek-tooltip:hover,
            .peek-answer-tooltip:hover {
                opacity: 1;
            }

            .peek-header {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
            }

            .peek-dist {
                font-weight: bold;
                color: #333;
            }

            .peek-body {
                margin: 8px 0;
            }

            .peek-thumb {
                width: 100%;
                height: auto;
                border-radius: 4px;
            }

            .peek-note {
                font-size: 11px;
                color: #999;
                text-align: center;
                margin-top: 8px;
            }

            .peek-error {
                color: #d32f2f;
                font-size: 12px;
                text-align: center;
                padding: 8px;
            }
        `,
        
        controls: `
            /* Control Button Styles */
            .breakdown-controls {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                gap: 10px;
            }

            .breakdown-btn {
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .breakdown-btn:hover {
                background: #f5f5f5;
                border-color: #999;
            }

            .breakdown-btn:active {
                transform: scale(0.95);
            }
        `,
        
        splitContainer: `
            /* Split Container Styles */
            .split-container {
                display: flex;
                width: 100%;
                height: 100%;
                position: relative;
            }

            .split-pane {
                flex: 1;
                overflow: auto;
                position: relative;
            }

            .split-divider {
                width: 4px;
                background: #ddd;
                cursor: col-resize;
                transition: background 0.2s;
            }

            .split-divider:hover {
                background: #999;
            }
        `,
        
        modal: `
            /* Modal Styles */
            .breakdown-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .breakdown-modal-content {
                background: white;
                border-radius: 8px;
                padding: 24px;
                max-width: 600px;
                max-height: 80vh;
                overflow: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .breakdown-modal-header {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 16px;
            }

            .breakdown-modal-close {
                float: right;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }

            .breakdown-modal-close:hover {
                color: #333;
            }
        `,
        
        mapList: `
            /* Map List Styles */
            .map-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .map-list-item {
                padding: 12px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background 0.2s;
            }

            .map-list-item:hover {
                background: #f5f5f5;
            }

            .map-list-item.active {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
            }

            .map-name {
                font-weight: bold;
                margin-bottom: 4px;
            }

            .map-meta {
                font-size: 12px;
                color: #666;
            }
        `,
        
        markers: `
            /* Marker Styles */
            .custom-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .custom-marker:hover {
                transform: scale(1.2);
            }

            .guess-marker {
                background: #4285f4;
            }

            .answer-marker {
                background: #ea4335;
            }

            .marker-label {
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                white-space: nowrap;
                margin-top: 4px;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
            }
        `
    };

    // Apply all styles
    GM_addStyle(Object.values(STYLES).join('\n'));

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBreakdownUI);
    } else {
        initBreakdownUI();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        markerObserverManager.stop();
        mapObserverManager.stop();
    });

})();
