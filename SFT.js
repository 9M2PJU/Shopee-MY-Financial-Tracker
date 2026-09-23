// ==UserScript==
// @name         Shopee MY Financial Tracker
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Track and analyze your Shopee Malaysia purchases with comprehensive financial reporting (MYR)
// @author       9M2PJU (Original by Ryu-Sena & pataanggs)
// @match        https://shopee.com.my/*
// @match        https://shopee.co.id/*
// @icon         https://shopee.com.my/favicon.ico
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      shopee.com.my
// @connect      shopee.co.id
// @updateURL    https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.user.js
// @downloadURL  https://raw.githubusercontent.com/9M2PJU/Shopee-MY-Financial-Tracker/main/SFT.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        PAGE_LOAD_TIMEOUT: 18000,
        BETWEEN_DELAY: 5000,
        MAX_RETRIES: 5,
        UI_TOGGLE_KEY: 'KeyM',
        THEME_KEY: 'shopee_parser_theme',
        CSV_DELIMITER: ';',
        SORT_DIRECTIONS: {
            ASC: 'asc',
            DESC: 'desc'
        },
        FILTER_TYPES: {
            CONTAINS: 'contains',
            EQUALS: 'equals',
            GREATER_THAN: 'greater_than',
            LESS_THAN: 'less_than'
        }
    };

    // Global State
    let isParsing = false;
    let currentEntry = 1;
    let parsedData = [];
    let isUIHidden = false;
    let isDarkMode = localStorage.getItem(CONFIG.THEME_KEY) === 'dark';
    let currentSort = {
        column: null,
        direction: CONFIG.SORT_DIRECTIONS.ASC
    };
    let currentFilters = [];
    let searchQuery = '';

    // === Inject UI Styles ===
    const style = document.createElement('style');
    style.textContent = `
:root {
    --bg-primary: ${isDarkMode ? '#1a1a1a' : '#ffffff'};
    --bg-secondary: ${isDarkMode ? '#2d2d2d' : '#f9fafb'};
    --text-primary: ${isDarkMode ? '#ffffff' : '#1a1a1a'};
    --text-secondary: ${isDarkMode ? '#9ca3af' : '#6b7280'};
    --border-color: ${isDarkMode ? '#404040' : '#e5e7eb'};
    --hover-bg: ${isDarkMode ? '#404040' : '#e5e7eb'};
    --shadow-color: ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'};
    --accent-color: #ee4d2d;
    --success-color: #22c55e;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}

#parser-ui {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 999999;
    background: var(--bg-primary);
    border-radius: 16px;
    box-shadow: 0 8px 24px var(--shadow-color);
    padding: 24px;
    width: 90vw;
    max-width: 1400px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-primary);
    display: ${isUIHidden ? 'none' : 'block'};
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    resize: both;
}

.parser-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.parser-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    cursor: move;
    user-select: none;
}

.parser-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-controls {
    display: flex;
    gap: 8px;
}

.parser-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.875rem;
    border-radius: 8px;
    overflow: hidden;
}

.parser-table th, .parser-table td {
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    text-align: left;
    vertical-align: top;
}

.parser-table th {
    background: var(--bg-secondary);
    font-weight: 600;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
}

.parser-table tr:nth-child(even) {
    background: var(--bg-secondary);
}

.parser-table tr:hover {
    background: var(--hover-bg);
}

.parser-controls {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.parser-textarea {
    width: 100%;
    height: 150px;
    margin-top: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    resize: vertical;
    font-family: monospace;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.parser-textarea:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
}

.btn:active {
    transform: translateY(0);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.btn-green { background: var(--success-color); color: white; }
.btn-red { background: var(--error-color); color: white; }
.btn-blue { background: #3b82f6; color: white; }
.btn-yellow { background: var(--warning-color); color: white; }
.btn-purple { background: #8b5cf6; color: white; }
.btn-gray { background: var(--bg-secondary); color: var(--text-primary); }

.parser-status {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 8px;
    padding: 12px;
    border-radius: 8px;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: pre-line;
}

.credit {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.guide-modal {
    position: fixed;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999999;
    background: var(--bg-primary);
    border-radius: 16px;
    box-shadow: 0 8px 24px var(--shadow-color);
    padding: 24px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    display: none;
    flex-direction: column;
    gap: 16px;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.modal-content {
    white-space: pre-wrap;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
}

.modal-close {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: var(--hover-bg);
}

.theme-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px var(--shadow-color);
    transition: all 0.3s ease;
}

.theme-toggle:hover {
    transform: scale(1.1);
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    box-shadow: 0 4px 12px var(--shadow-color);
    z-index: 9999999;
    transform: translateX(120%);
    transition: transform 0.3s ease;
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 8px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success { border-left: 4px solid var(--success-color); }
.notification.error { border-left: 4px solid var(--error-color); }
.notification.warning { border-left: 4px solid var(--warning-color); }
.notification.info { border-left: 4px solid #3b82f6; }

.price {
    font-family: monospace;
    font-weight: 500;
}

.price.positive { color: var(--success-color); }
.price.negative { color: var(--error-color); }
.price.total { font-weight: 600; color: var(--accent-color); }

/* Scrollbar Styling */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

.resize-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    z-index: 1000;
}

.resize-handle::after {
    content: '';
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent var(--text-secondary) transparent;
}

.filter-controls {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.search-box {
    flex: 1;
    min-width: 200px;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
}

.search-box:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
}

.filter-group {
    display: flex;
    gap: 8px;
    align-items: center;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
}

.filter-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    width: 120px;
}

.filter-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 4px;
}

.filter-btn:hover {
    background: var(--hover-bg);
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.filter-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    font-size: 0.75rem;
}

.filter-tag button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    font-size: 0.75rem;
}

.filter-tag button:hover {
    color: var(--error-color);
}

.sortable {
    cursor: pointer;
    user-select: none;
}

.sortable:hover {
    background: var(--hover-bg);
}

.sortable::after {
    content: ' ↕';
    margin-left: 4px;
    opacity: 0.5;
}

.sortable.asc::after {
    content: ' ↑';
    opacity: 1;
}

.sortable.desc::after {
    content: ' ↓';
    opacity: 1;
}

.stats-panel {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    flex-wrap: wrap;
}

.stat-item {
    flex: 1;
    min-width: 200px;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.stat-value.positive { color: var(--success-color); }
.stat-value.negative { color: var(--error-color); }

.guide-highlight {
    border: 2px solid #f59e0b !important;
    box-shadow: 0 0 12px 2px #f59e0b66 !important;
    animation: pulse-guide 1.2s infinite;
    position: relative;
}

@keyframes pulse-guide {
    0% { box-shadow: 0 0 12px 2px #f59e0b66; }
    50% { box-shadow: 0 0 24px 6px #f59e0b99; }
    100% { box-shadow: 0 0 12px 2px #f59e0b66; }
}

.guide-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #f59e0b;
    color: #fff;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 8px;
    z-index: 2;
    box-shadow: 0 2px 6px #f59e0b55;
}
`;

    document.head.appendChild(style);

    // === UI HTML ===
    const uiHTML = `
        <div id="parser-ui">
            <div class="parser-container">
                <div class="parser-header">
                    <div class="parser-title">
                        <span>📊 Shopee MY Financial Tracker v2.1</span>
                    </div>
                    <div class="header-controls">
                        <button class="btn btn-gray" id="guide-btn">📘 Guide</button>
                        <button class="btn btn-gray" id="theme-btn">${isDarkMode ? '☀️' : '🌙'}</button>
                    </div>
                </div>
                <div class="resize-handle"></div>
                <textarea id="url-input" placeholder="Paste Shopee order links here (one per line) or click 'Extract Order Links'" class="parser-textarea"></textarea>
                <div class="parser-controls">
                    <button class="btn btn-green" id="start-btn">▶️ Start</button>
                    <button class="btn btn-red" id="stop-btn" disabled>⏹️ Stop</button>
                    <button class="btn btn-yellow" id="clear-btn">🗑️ Clear</button>
                    <button class="btn btn-gray" id="remove-dupes-btn">🔍 Remove Duplicates</button>
                    <button class="btn btn-blue" id="csv-btn">📊 Export CSV</button>
                    <button class="btn btn-purple" id="md-btn">📝 Export Markdown</button>
                    <button class="btn btn-gray" id="extract-btn">🔗 Extract Order Links</button>
                </div>
                <div class="parser-status" id="status">Ready</div>
                <div id="progress-bar-container" style="width: 100%; margin: 12px 0; display: none; position: relative; background: var(--bg-secondary); border-radius: 8px; overflow: hidden; height: 18px;">
                    <div id="progress-bar" style="height: 100%; width: 0; background: var(--accent-color); border-radius: 8px; transition: width 0.2s;"></div>
                    <div id="progress-bar-label" style="position: absolute; width: 100%; text-align: center; top: 0; line-height: 18px; color: var(--text-primary); font-size: 0.75rem; font-weight: 500;"></div>
                </div>
                <div class="filter-controls">
                    <input type="text" class="search-box" id="search-input" placeholder="Search orders, shops, items...">
                    <div class="filter-group">
                        <select class="filter-select" id="filter-column">
                            <option value="Shop">Shop</option>
                            <option value="Order Date">Order Date</option>
                            <option value="Item">Item</option>
                            <option value="Original Price">Original Price</option>
                            <option value="Discount Price">Discount Price</option>
                            <option value="Quantity">Quantity</option>
                            <option value="Total">Total</option>
                        </select>
                        <select class="filter-select" id="filter-type">
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="greater_than">Greater Than</option>
                            <option value="less_than">Less Than</option>
                        </select>
                        <input type="text" class="filter-input" id="filter-value" placeholder="Value...">
                        <button class="filter-btn" id="add-filter-btn">Add Filter</button>
                    </div>
                </div>
                <div class="filter-tags" id="filter-tags"></div>
                <div class="stats-panel" id="stats-panel">
                    <div class="stat-item">
                        <div class="stat-label">Total Orders</div>
                        <div class="stat-value" id="total-orders">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total Spent</div>
                        <div class="stat-value" id="total-spent">RM 0.00</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Average Order Value</div>
                        <div class="stat-value" id="avg-order">RM 0.00</div>
                    </div>
                </div>
                <table class="parser-table" id="results-table">
                    <thead>
                        <tr>
                            <th class="sortable" data-column="Entry">Entry</th>
                            <th class="sortable" data-column="Shop">Shop</th>
                            <th class="sortable" data-column="Order Date">Order Date</th>
                            <th class="sortable" data-column="Item">Item</th>
                            <th class="sortable" data-column="Original Price">Original Price</th>
                            <th class="sortable" data-column="Discount Price">Discount Price</th>
                            <th class="sortable" data-column="Quantity">Quantity</th>
                            <th class="sortable" data-column="Total">Total</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody id="results-body"></tbody>
                </table>
                <div id="grand-total-container" style="margin-top: 20px; text-align: right;">
                    <span style="font-size: 1.25rem; font-weight: bold; color: var(--accent-color);">Grand Total: <span id="grand-total-value">RM 0.00</span></span>
                </div>
                <div class="credit">Shopee MY Financial Tracker | Adapted by <a href="https://github.com/9M2PJU" target="_blank" style="color: #3b82f6; text-decoration: underline;">9M2PJU</a> | Original by <a href="https://github.com/tukangcode" target="_blank" style="color: #3b82f6; text-decoration: underline;">Ryu-Sena</a></div>
            </div>
            <div class="guide-modal" id="guide-modal">
                <div class="modal-header">
                    <div class="modal-title">📘 User Guide / Panduan Pengguna</div>
                    <button class="modal-close" id="modal-close">✕</button>
                </div>
                <div class="modal-content">📘 How to Use (Shopee Malaysia):

1. Enable Popups for Shopee Malaysia (shopee.com.my):
   - Chrome / Brave / Edge: 🔐 (Site Info) > Site Settings > Allow Popups & Redirects
   - Firefox: ⓘ (Site Info) > Permissions > Allow Popups

2. Extract Order Links:
   - Go to "My Purchases" (Pesanan Saya) page on shopee.com.my.
   - Click on the "Completed" (Selesai) tab.
   - Scroll down to load order items on the screen.
   - Click [🔗 Extract Order Links] to capture visible order URLs into the box.

3. Clean Duplicate Links:
   - Click [🔍 Remove Duplicates] to remove any duplicate order links.

4. Start Parsing:
   - Click [▶️ Start] to begin extracting order details in Malaysian Ringgit (MYR).
   - The script will automatically open and parse order pages safely with rate-limiting.

5. If CAPTCHA Appears:
   - The script pauses automatically for you to solve the CAPTCHA manually.
   - Once solved, the script resumes processing.

6. Export Results:
   - [📊 Export CSV]: Optimized for Microsoft Excel / Google Sheets with proper currency format.
   - [📝 Export Markdown]: Formatted Markdown table for documentation and note-taking.

7. UI Controls:
   - Press Ctrl+M anytime to toggle UI visibility.
   - Click 🌙 / ☀️ to toggle dark/light mode.
   - Drag header to reposition or drag corner to resize.
                </div>
                <div class="modal-footer">
                    <button class="modal-close" id="modal-ok">OK</button>
                </div>
            </div>
        </div>
        <div class="theme-toggle" id="theme-toggle">${isDarkMode ? '☀️' : '🌙'}</div>
        <div class="notification" id="notification"></div>
    `;

    const div = document.createElement('div');
    div.innerHTML = uiHTML;
    document.body.appendChild(div);

    // === DOM Elements ===
    const parserUI = document.getElementById('parser-ui');
    const urlInput = document.getElementById('url-input');
    const statusText = document.getElementById('status');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const clearBtn = document.getElementById('clear-btn');
    const csvBtn = document.getElementById('csv-btn');
    const mdBtn = document.getElementById('md-btn');
    const extractBtn = document.getElementById('extract-btn');
    const removeDupesBtn = document.getElementById('remove-dupes-btn');
    const resultsBody = document.getElementById('results-body');
    const guideBtn = document.getElementById('guide-btn');
    const guideModal = document.getElementById('guide-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    const themeBtn = document.getElementById('theme-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const notification = document.getElementById('notification');
    const searchInput = document.getElementById('search-input');
    const filterColumn = document.getElementById('filter-column');
    const filterType = document.getElementById('filter-type');
    const filterValue = document.getElementById('filter-value');
    const addFilterBtn = document.getElementById('add-filter-btn');
    const filterTags = document.getElementById('filter-tags');
    const totalOrders = document.getElementById('total-orders');
    const totalSpent = document.getElementById('total-spent');
    const avgOrder = document.getElementById('avg-order');
    const grandTotalValue = document.getElementById('grand-total-value');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const progressBarLabel = document.getElementById('progress-bar-label');

    // === Helper Functions ===
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function updateStatus(text, type = 'info') {
        statusText.textContent = text;
        statusText.className = `parser-status ${type}`;
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        localStorage.setItem(CONFIG.THEME_KEY, isDarkMode ? 'dark' : 'light');
        document.documentElement.style.setProperty('--bg-primary', isDarkMode ? '#1a1a1a' : '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', isDarkMode ? '#2d2d2d' : '#f9fafb');
        document.documentElement.style.setProperty('--text-primary', isDarkMode ? '#ffffff' : '#1a1a1a');
        document.documentElement.style.setProperty('--text-secondary', isDarkMode ? '#9ca3af' : '#6b7280');
        document.documentElement.style.setProperty('--border-color', isDarkMode ? '#404040' : '#e5e7eb');
        document.documentElement.style.setProperty('--hover-bg', isDarkMode ? '#404040' : '#e5e7eb');
        document.documentElement.style.setProperty('--shadow-color', isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)');
        themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }

    function extractOrderNumber(url) {
        if (!url) return null;
        const match = url.match(/\/user\/purchase\/order\/([a-zA-Z0-9_-]+)/i) ||
                      url.match(/[?&]order_id=([a-zA-Z0-9_-]+)/i) ||
                      url.match(/\/purchase\/order\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
            return match[1];
        }
        const pattern = '/user/purchase/order/';
        const startIndex = url.indexOf(pattern);
        if (startIndex !== -1) {
            const idStart = startIndex + pattern.length;
            const cleanId = url.substring(idStart).split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
            if (cleanId) return cleanId;
        }
        return null;
    }

    function removeDuplicatesFromInput() {
        const urls = urlInput.value
            .split('\n')
            .map(u => u.trim())
            .filter(Boolean);

        const seen = new Set();
        const uniqueUrls = [];

        for (const url of urls) {
            const orderNumber = extractOrderNumber(url);
            const key = orderNumber || url;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueUrls.push(url);
            }
        }

        urlInput.value = uniqueUrls.join('\n');
        const removedCount = urls.length - uniqueUrls.length;
        if (removedCount > 0) {
            showNotification(`✅ Removed ${removedCount} duplicate(s)`, 'success');
        } else {
            showNotification('ℹ️ No duplicates found', 'info');
        }
    }

    function extractOrderLinks() {
        const origin = window.location.origin.includes('shopee') ? window.location.origin : 'https://shopee.com.my';
        const selectors = [
            'a[href*="/user/purchase/order/"]',
            'a[href*="/user/purchase/order"]',
            'a[href*="/purchase/order"]',
            'a[href*="/order/"]'
        ];
        const allAnchors = Array.from(document.querySelectorAll(selectors.join(', ')));

        const seen = new Set();
        const uniqueLinks = [];

        for (const a of allAnchors) {
            const href = a.getAttribute('href');
            if (!href) continue;

            let fullUrl = href;
            if (!fullUrl.startsWith('http')) {
                fullUrl = `${origin}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
            }

            const orderNumber = extractOrderNumber(fullUrl);
            const key = orderNumber || fullUrl;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueLinks.push(fullUrl);
            }
        }

        if (uniqueLinks.length > 0) {
            const existingUrls = urlInput.value
                .split('\n')
                .map(u => u.trim())
                .filter(Boolean);

            const allUrlsSet = new Set(existingUrls);
            let addedCount = 0;
            uniqueLinks.forEach(u => {
                if (!allUrlsSet.has(u)) {
                    existingUrls.push(u);
                    addedCount++;
                }
            });

            urlInput.value = existingUrls.join('\n');
            showNotification(`✅ Found ${addedCount || uniqueLinks.length} order link(s)`, 'success');
            return uniqueLinks.length;
        } else {
            showNotification('⚠️ No order links found on current screen.\n👉 Please go to "My Purchases" (shopee.com.my/user/purchase), select Completed tab, and scroll down.', 'warning');
            return 0;
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    function parseCurrency(amount) {
        if (typeof amount === 'number') return isNaN(amount) ? 0 : amount;
        if (!amount) return 0;

        let str = amount.toString().replace(/RM|Rp/gi, '').trim();
        str = str.replace(/[^\d,.-]/g, '');
        if (!str) return 0;

        // In Shopee MY (MYR), standard format is 1,234.50 (comma thousands, dot decimals)
        if (str.includes(',') && str.includes('.')) {
            if (str.indexOf(',') < str.indexOf('.')) {
                // MYR/USD format 1,234.56
                str = str.replace(/,/g, '');
            } else {
                // Indonesian format 1.234,56
                str = str.replace(/\./g, '').replace(/,/g, '.');
            }
        } else if (str.includes(',')) {
            const parts = str.split(',');
            if (parts.length === 2 && parts[1].length === 2) {
                str = str.replace(',', '.');
            } else {
                str = str.replace(/,/g, '');
            }
        } else if (str.includes('.')) {
            const parts = str.split('.');
            if (parts.length > 2) {
                str = str.replace(/\./g, '');
            }
        }

        const val = parseFloat(str);
        return isNaN(val) ? 0 : val;
    }

    function updateStats() {
        const filteredData = getFilteredData();
        const total = filteredData.reduce((sum, order) => {
            return sum + (order.items || []).reduce((itemSum, item) => {
                return itemSum + (item.total || 0);
            }, 0);
        }, 0);

        totalOrders.textContent = filteredData.length;
        totalSpent.textContent = formatCurrency(total);
        avgOrder.textContent = formatCurrency(total / (filteredData.length || 1));
        updateGrandTotal();
    }

    function updateGrandTotal() {
        const filteredData = getFilteredData();
        const grandTotal = filteredData.reduce((sum, order) => {
            return sum + (order.items || []).reduce((itemSum, item) => {
                return itemSum + (item.total || 0);
            }, 0);
        }, 0);
        if (grandTotalValue) {
            grandTotalValue.textContent = formatCurrency(grandTotal);
        }
    }

    function getFilteredData() {
        let filtered = [...parsedData];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => {
                return (order.Shop && order.Shop.toLowerCase().includes(query)) ||
                       (order['Order Date'] && order['Order Date'].toLowerCase().includes(query)) ||
                       (order.items && order.items.some(item =>
                           (item.name && item.name.toLowerCase().includes(query)) ||
                           (item.originalPrice && item.originalPrice.toLowerCase().includes(query)) ||
                           (item.discountPrice && item.discountPrice.toLowerCase().includes(query)) ||
                           (item.quantity && item.quantity.toString().includes(query)) ||
                           (item.totalPesanan && item.totalPesanan.toLowerCase().includes(query))
                       ));
            });
        }

        // Apply filters
        currentFilters.forEach(filter => {
            filtered = filtered.filter(order => {
                return (order.items || []).some(item => {
                    let value = '';
                    if (filter.column === 'Shop') value = order.Shop;
                    else if (filter.column === 'Order Date') value = order['Order Date'];
                    else if (filter.column === 'Item') value = item.name;
                    else if (filter.column === 'Original Price') value = item.originalPrice;
                    else if (filter.column === 'Discount Price') value = item.discountPrice;
                    else if (filter.column === 'Quantity') value = item.quantity;
                    else if (filter.column === 'Total') value = item.totalPesanan;
                    else value = item[filter.column] || order[filter.column];

                    if (value === undefined || value === null) return false;

                    switch (filter.type) {
                        case CONFIG.FILTER_TYPES.CONTAINS:
                            return value.toString().toLowerCase().includes(filter.value.toLowerCase());
                        case CONFIG.FILTER_TYPES.EQUALS:
                            return value.toString().toLowerCase() === filter.value.toLowerCase();
                        case CONFIG.FILTER_TYPES.GREATER_THAN:
                            return parseCurrency(value) > parseCurrency(filter.value);
                        case CONFIG.FILTER_TYPES.LESS_THAN:
                            return parseCurrency(value) < parseCurrency(filter.value);
                        default:
                            return true;
                    }
                });
            });
        });

        // Apply sorting
        if (currentSort.column) {
            filtered.sort((a, b) => {
                let aValue = '';
                let bValue = '';
                if (currentSort.column === 'Entry') {
                    aValue = a.Entry;
                    bValue = b.Entry;
                } else if (currentSort.column === 'Shop') {
                    aValue = a.Shop || '';
                    bValue = b.Shop || '';
                } else if (currentSort.column === 'Order Date') {
                    aValue = a['Order Date'] || '';
                    bValue = b['Order Date'] || '';
                } else if (currentSort.column === 'Item') {
                    aValue = a.items[0]?.name || '';
                    bValue = b.items[0]?.name || '';
                } else if (currentSort.column === 'Original Price') {
                    aValue = a.items[0]?.originalPrice || 0;
                    bValue = b.items[0]?.originalPrice || 0;
                } else if (currentSort.column === 'Discount Price') {
                    aValue = a.items[0]?.discountPrice || 0;
                    bValue = b.items[0]?.discountPrice || 0;
                } else if (currentSort.column === 'Quantity') {
                    aValue = a.items[0]?.quantity || 0;
                    bValue = b.items[0]?.quantity || 0;
                } else if (currentSort.column === 'Total') {
                    aValue = a.items[0]?.total || 0;
                    bValue = b.items[0]?.total || 0;
                }

                if (['Entry', 'Quantity', 'Original Price', 'Discount Price', 'Total'].includes(currentSort.column)) {
                    const aNum = parseCurrency(aValue);
                    const bNum = parseCurrency(bValue);
                    return currentSort.direction === CONFIG.SORT_DIRECTIONS.ASC ? aNum - bNum : bNum - aNum;
                }

                const comparison = String(aValue).localeCompare(String(bValue));
                return currentSort.direction === CONFIG.SORT_DIRECTIONS.ASC ? comparison : -comparison;
            });
        }

        return filtered;
    }

    function updateTable() {
        const filteredData = getFilteredData();
        resultsBody.innerHTML = '';

        filteredData.forEach(order => {
            (order.items || []).forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.Entry}</td>
                    <td>${escapeHtml(order.Shop)}</td>
                    <td>${escapeHtml(order['Order Date'])}</td>
                    <td>${escapeHtml(item.name)}</td>
                    <td class="price">${escapeHtml(item.originalPrice || '-')}</td>
                    <td class="price">${escapeHtml(item.discountPrice || '-')}</td>
                    <td>${item.quantity || '-'}</td>
                    <td class="price total">${escapeHtml(item.totalPesanan || '-')}</td>
                    <td><a href="${escapeHtml(order.URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(order.URL)}</a></td>
                `;
                resultsBody.appendChild(row);
            });
        });

        updateStats();
    }

    function updateFilterTags() {
        filterTags.innerHTML = '';
        currentFilters.forEach((filter, index) => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                ${escapeHtml(filter.column)} ${escapeHtml(filter.type)} "${escapeHtml(filter.value)}"
                <button type="button" data-index="${index}">×</button>
            `;
            tag.querySelector('button').addEventListener('click', () => removeFilter(index));
            filterTags.appendChild(tag);
        });
    }

    function addFilter() {
        const column = filterColumn.value;
        const type = filterType.value;
        const value = filterValue.value.trim();

        if (!value) {
            showNotification('⚠️ Please enter a filter value', 'warning');
            return;
        }

        currentFilters.push({ column, type, value });
        filterValue.value = '';
        updateFilterTags();
        updateTable();
    }

    function removeFilter(index) {
        currentFilters.splice(index, 1);
        updateFilterTags();
        updateTable();
    }

    function handleSort(column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === CONFIG.SORT_DIRECTIONS.ASC
                ? CONFIG.SORT_DIRECTIONS.DESC
                : CONFIG.SORT_DIRECTIONS.ASC;
        } else {
            currentSort.column = column;
            currentSort.direction = CONFIG.SORT_DIRECTIONS.ASC;
        }

        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('asc', 'desc');
            if (th.dataset.column === column) {
                th.classList.add(currentSort.direction);
            }
        });

        updateTable();
    }

    function addResult(result) {
        if (!result || !result.items || !result.items.length) return;
        parsedData.push(result);
        result.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.Entry}</td>
                <td>${escapeHtml(result.Shop)}</td>
                <td>${escapeHtml(result['Order Date'])}</td>
                <td>${escapeHtml(item.name)}</td>
                <td class="price">${escapeHtml(item.originalPrice || '-')}</td>
                <td class="price">${escapeHtml(item.discountPrice || '-')}</td>
                <td>${item.quantity || '-'}</td>
                <td class="price total">${escapeHtml(item.totalPesanan || '-')}</td>
                <td><a href="${escapeHtml(result.URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(result.URL)}</a></td>
            `;
            resultsBody.appendChild(row);
        });
        updateStats();
    }

    function clearResults() {
        while (resultsBody.firstChild) {
            resultsBody.removeChild(resultsBody.firstChild);
        }
        parsedData = [];
        currentFilters = [];
        searchQuery = '';
        currentSort = {
            column: null,
            direction: CONFIG.SORT_DIRECTIONS.ASC
        };
        updateFilterTags();
        updateStats();
        updateStatus("🧹 Cleared", 'info');
    }

    function exportData(format) {
        if (!parsedData.length) {
            showNotification("⚠️ No data to export!", 'error');
            return;
        }
        if (format === 'csv') {
            exportToCSV(parsedData);
        } else {
            exportToMarkdown(parsedData);
        }
    }

    function exportToCSV(data) {
        const headers = ['Entry', 'Shop', 'Order Date', 'Item', 'Original Price (MYR)', 'Discount Price (MYR)', 'Quantity', 'Total (MYR)', 'URL'];
        let csv = headers.join(CONFIG.CSV_DELIMITER) + '\n';
        let grandTotal = 0;
        data.forEach(order => {
            (order.items || []).forEach(item => {
                const originalPriceFormatted = item.originalPrice ? parseCurrency(item.originalPrice).toFixed(2) : '';
                const discountPriceFormatted = item.discountPrice ? parseCurrency(item.discountPrice).toFixed(2) : '';
                const totalPesananFormatted = (item.total || 0).toFixed(2);

                grandTotal += item.total || 0;

                csv += [
                    order.Entry,
                    `"${(order.Shop || '').replace(/"/g, '""')}"`,
                    `"${(order['Order Date'] || '').replace(/"/g, '""')}"`,
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    originalPriceFormatted,
                    discountPriceFormatted,
                    item.quantity || '1',
                    totalPesananFormatted,
                    `"${order.URL}"`
                ].join(CONFIG.CSV_DELIMITER) + '\n';
            });
        });

        // Summary row for Grand Total
        csv += [
            '', '', '', '', '', '', 'Grand Total', grandTotal.toFixed(2), ''
        ].join(CONFIG.CSV_DELIMITER) + '\n';

        downloadFile(csv, 'shopee_my_orders.csv');
        showNotification('✅ CSV exported successfully!', 'success');
    }

    function exportToMarkdown(data) {
        const headers = ['Entry', 'Shop', 'Order Date', 'Item', 'Original Price', 'Discount Price', 'Quantity', 'Total', 'URL'];
        let md = '# Shopee Malaysia Orders Report\n\n';
        md += headers.map(h => `**${h}**`).join(' | ') + '\n';
        md += headers.map(() => '---').join(' | ') + '\n';
        let grandTotal = 0;

        data.forEach(order => {
            (order.items || []).forEach(item => {
                grandTotal += item.total || 0;
                md += [
                    order.Entry,
                    (order.Shop || '').replace(/\|/g, '\\|'),
                    (order['Order Date'] || '').replace(/\|/g, '\\|'),
                    (item.name || '').replace(/\|/g, '\\|'),
                    item.originalPrice || '-',
                    item.discountPrice || '-',
                    item.quantity || '1',
                    item.totalPesanan || '-',
                    `[Link](${order.URL})`
                ].join(' | ') + '\n';
            });
        });

        md += `\n**Grand Total:** ${formatCurrency(grandTotal)}\n`;
        downloadFile(md, 'shopee_my_orders.md');
        showNotification('✅ Markdown exported successfully!', 'success');
    }

    function downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function cancellableDelay(ms) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!isParsing) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            const timeout = setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, ms);
        });
    }

    function waitForPageLoad(win) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Page load timeout'));
            }, CONFIG.PAGE_LOAD_TIMEOUT);

            const checkInterval = setInterval(() => {
                if (!isParsing || !win || win.closed || !win.document) {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    try { win?.close(); } catch (e) {}
                    reject(new Error('Parsing stopped or window closed'));
                    return;
                }

                if (win.document.readyState === 'complete') {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    resolve();
                }
            }, 1000);
        });
    }

    async function scrapeOrderDetail(url, entryNumber) {
        let retryCount = 0;
        while (retryCount <= CONFIG.MAX_RETRIES && isParsing) {
            const win = window.open(url, '_blank');
            if (!win) {
                showNotification("❌ Popup blocked - Please allow popups for Shopee in browser settings", 'error');
                return null;
            }

            try {
                await waitForPageLoad(win);
                if (!isParsing) {
                    win.close();
                    return null;
                }

                await cancellableDelay(5000);
                const doc = win.document;

                // Shop Name
                const shopEl = doc.querySelector('.UDaMW3, .order-detail__header-shop-name, a[href*="/shop/"], [class*="shop-name"]');
                const shopName = shopEl?.textContent.trim() || 'NOT FOUND';

                // Order Date
                const dateEl = doc.querySelector('.stepper__step-date, .order-detail__date, [class*="step-date"], [class*="order-date"]');
                const orderDate = dateEl?.textContent.trim() || 'NOT FOUND';

                // Items
                let itemElements = doc.querySelectorAll('a.mZ1OWk, div.mZ1OWk, .order-detail-product, [class*="order-item__wrapper"]');
                if (!itemElements.length) {
                    itemElements = doc.querySelectorAll('[class*="item-row"], [class*="order-item"]');
                }

                const items = [];

                itemElements.forEach(item => {
                    const nameEl = item.querySelector('.DWVWOJ, [class*="item-name"], [class*="order-content__item-name"]');
                    const name = nameEl?.textContent.trim() || '';
                    if (!name || name === 'NOT FOUND') return;

                    const quantityText = item.querySelector('.j3I_Nh, [class*="item-quantity"], [class*="quantity"]')?.textContent.trim() || 'x1';
                    const quantity = parseInt(quantityText.replace(/[^0-9]/g, '')) || 1;

                    // Prices
                    let originalPriceText = '';
                    let discountPriceText = '';

                    const originalPriceEl = item.querySelector('.q6Gzj5, [class*="original-price"], del, s');
                    const discountPriceEl = item.querySelector('.PNlXhK, [class*="discount-price"]');
                    const regularPriceEl = item.querySelector('.nW_6Oi, [class*="price"]');

                    if (originalPriceEl && discountPriceEl) {
                        originalPriceText = originalPriceEl.textContent.trim();
                        discountPriceText = discountPriceEl.textContent.trim();
                    } else if (discountPriceEl) {
                        discountPriceText = discountPriceEl.textContent.trim();
                        originalPriceText = discountPriceText;
                    } else if (regularPriceEl) {
                        discountPriceText = regularPriceEl.textContent.trim();
                        originalPriceText = discountPriceText;
                    }

                    const discountValue = parseCurrency(discountPriceText);
                    const itemTotal = discountValue * quantity;
                    const totalPesanan = formatCurrency(itemTotal);

                    items.push({
                        name: name,
                        originalPrice: originalPriceText || formatCurrency(discountValue),
                        discountPrice: discountPriceText || formatCurrency(discountValue),
                        quantity: quantity,
                        total: itemTotal,
                        totalPesanan: totalPesanan
                    });
                });

                win.close();

                if (items.length === 0) {
                    retryCount++;
                    if (retryCount > CONFIG.MAX_RETRIES) return null;
                    updateStatus(`🔁 Retrying #${retryCount} for ${url}`, 'warning');
                    await cancellableDelay(3000);
                    continue;
                }

                return {
                    Entry: entryNumber,
                    Shop: shopName,
                    'Order Date': orderDate,
                    items,
                    URL: url
                };
            } catch (err) {
                try { win.close(); } catch (e) {}
                retryCount++;
                if (retryCount > CONFIG.MAX_RETRIES) {
                    showNotification(`❌ Error parsing order: ${err.message}`, 'error');
                    return null;
                }
                updateStatus(`🔁 Retrying #${retryCount}`, 'warning');
                await cancellableDelay(3000);
            }
        }
        return null;
    }

    async function run() {
        isParsing = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        updateStatus('🚀 Starting...', 'info');
        currentEntry = 1;

        let urls = urlInput.value
            .split('\n')
            .map(u => u.trim())
            .filter(u => u.includes('/purchase/order') || u.includes('/order/') || (u.startsWith('http') && u.includes('shopee')));

        // If user didn't extract or paste links first, try auto-extracting from current page
        if (!urls.length) {
            extractOrderLinks();
            urls = urlInput.value
                .split('\n')
                .map(u => u.trim())
                .filter(u => u.includes('/purchase/order') || u.includes('/order/') || (u.startsWith('http') && u.includes('shopee')));
        }

        if (!urls.length) {
            showNotification("⚠️ No valid order URLs found in the text box!\n👉 Go to shopee.com.my/user/purchase, scroll down to load orders, and click [Extract Order Links].", 'error');
            updateStatus("⚠️ No order URLs found. Please scroll down on Purchases page and click [Extract Order Links].", 'warning');
            resetUI();
            return;
        }

        clearResults();
        const totalUrls = urls.length;
        let processedUrls = 0;

        for (const url of urls) {
            if (!isParsing) break;

            processedUrls++;
            const progressPercent = Math.round((processedUrls / totalUrls) * 100);
            updateStatus(`Processing order ${processedUrls} of ${totalUrls} (${progressPercent}%)`, 'info');

            const result = await scrapeOrderDetail(url, currentEntry);
            if (result && isParsing) {
                addResult(result);
                currentEntry++;

                if (processedUrls < totalUrls) {
                    showProgressBar(CONFIG.BETWEEN_DELAY);
                    await cancellableDelay(CONFIG.BETWEEN_DELAY);
                    hideProgressBar();
                }
            }
        }

        if (isParsing) {
            const grandTotal = parsedData.reduce((sum, order) => {
                return sum + (order.items || []).reduce((itemSum, item) => {
                    return itemSum + (item.total || 0);
                }, 0);
            }, 0);

            const completionMessage = `
✅ Parsing completed successfully!

📊 Financial Summary:
• Total Orders: ${parsedData.length}
• Grand Total Spent: ${formatCurrency(grandTotal)}
• Average Order Value: ${formatCurrency(grandTotal / (parsedData.length || 1))}
`;

            updateStatus(completionMessage, 'success');
            showNotification('✅ Parsing completed successfully!', 'success');
        } else {
            updateStatus("🛑 Stopped", 'warning');
            showNotification('🛑 Parsing stopped by user', 'warning');
        }

        resetUI();
    }

    function resetUI() {
        isParsing = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    function toggleUIVisibility() {
        isUIHidden = !isUIHidden;
        parserUI.style.display = isUIHidden ? 'none' : 'block';
        showNotification(`UI ${isUIHidden ? 'hidden' : 'shown'}`, 'info');
    }

    // === Event Listeners ===
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === CONFIG.UI_TOGGLE_KEY) {
            e.preventDefault();
            toggleUIVisibility();
        }
    });

    startBtn.addEventListener('click', () => {
        if (!isParsing) run();
    });

    stopBtn.addEventListener('click', () => {
        if (isParsing) {
            isParsing = false;
            updateStatus("🛑 Stopping...", 'warning');
            showNotification('🛑 Stopping parser...', 'warning');
        }
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("Clear all data?")) {
            clearResults();
            showNotification('🧹 Data cleared', 'info');
        }
    });

    csvBtn.addEventListener('click', () => exportData('csv'));
    mdBtn.addEventListener('click', () => exportData('markdown'));
    extractBtn.addEventListener('click', extractOrderLinks);
    removeDupesBtn.addEventListener('click', removeDuplicatesFromInput);

    guideBtn.addEventListener('click', () => {
        guideModal.style.display = 'flex';
    });

    [modalClose, modalOk].forEach(btn => {
        btn.addEventListener('click', () => {
            guideModal.style.display = 'none';
        });
    });

    [themeBtn, themeToggle].forEach(btn => {
        btn.addEventListener('click', () => {
            toggleTheme();
            showNotification(`Switched to ${isDarkMode ? 'dark' : 'light'} mode`, 'info');
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        updateTable();
    });

    addFilterBtn.addEventListener('click', addFilter);

    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.column));
    });

    // === Initialize ===
    function init() {
        updateStatus("Ready", 'info');
        showNotification('Shopee MY Financial Tracker ready!', 'success');
        makeDraggable(parserUI);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.parser-header');

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function showProgressBar(durationMs) {
        if (!progressBarContainer || !progressBar || !progressBarLabel) return;
        progressBarContainer.style.display = 'block';
        progressBar.style.width = '0%';
        let elapsed = 0;
        const interval = 100;
        const total = durationMs;
        function update() {
            elapsed += interval;
            const percent = Math.min(100, (elapsed / total) * 100);
            progressBar.style.width = percent + '%';
            const secondsLeft = Math.ceil((total - elapsed) / 1000);
            progressBarLabel.textContent = `⏳ Delay ${secondsLeft}s`;
            if (elapsed < total && isParsing) {
                setTimeout(update, interval);
            } else {
                progressBarContainer.style.display = 'none';
            }
        }
        update();
    }

    function hideProgressBar() {
        if (progressBarContainer) progressBarContainer.style.display = 'none';
    }

    // Highlight GUIDE if not read before
    if (guideBtn && !localStorage.getItem('guide_read_my')) {
        guideBtn.classList.add('guide-highlight');
        const badge = document.createElement('span');
        badge.className = 'guide-badge';
        badge.textContent = 'NEW';
        guideBtn.style.position = 'relative';
        guideBtn.appendChild(badge);
    }

    if (guideBtn) {
        guideBtn.addEventListener('click', () => {
            guideBtn.classList.remove('guide-highlight');
            const badge = guideBtn.querySelector('.guide-badge');
            if (badge) badge.remove();
            localStorage.setItem('guide_read_my', '1');
        });
    }

})();
