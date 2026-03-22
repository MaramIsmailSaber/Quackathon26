/* ══════════════════════════════════════════════════════
   FLO — Core Application Logic
   Navigation, Accounts, Insights, Flo AI
   ══════════════════════════════════════════════════════ */

// ── Mock Transaction Data (from seed_db.py) ─────────
const ACCOUNTS = [
  {
    id: 'bank-a',
    bank_name: 'Bank A',
    sort_code: '80-22-60',
    account_number: '12345678',
    balance_pence: 184520,
    currency: 'GBP',
    holder: 'Abishik Sharma',
  },
  {
    id: 'bank-b',
    bank_name: 'Bank B',
    sort_code: '83-41-00',
    account_number: '87654321',
    balance_pence: 63210,
    currency: 'GBP',
    holder: 'Abishik Sharma',
  }
];

const TRANSACTIONS = [
  // Bank A
  { id: 't1', account_id: 'bank-a', date: '2026-03-18T20:00:00Z', description: 'Part-time Wages – Tesco Express', amount_pence: 48750, category: 'Income', transaction_type: 'CREDIT', payment_network: 'BACS Direct Credit' },
  { id: 't2', account_id: 'bank-a', date: '2026-03-15T16:00:00Z', description: 'University of Dundee – Library Fine', amount_pence: 350, category: 'Education', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't3', account_id: 'bank-a', date: '2026-03-12T11:30:00Z', description: 'Transfer to Flatmate – Utilities Share', amount_pence: 4250, category: 'Transfers', transaction_type: 'DEBIT', payment_network: 'Faster Payments' },
  { id: 't4', account_id: 'bank-a', date: '2026-03-10T09:00:00Z', description: 'Spotify Premium – Monthly', amount_pence: 599, category: 'Subscriptions', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't5', account_id: 'bank-a', date: '2026-03-08T14:00:00Z', description: 'Amazon.co.uk – Textbook', amount_pence: 2499, category: 'Education', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't6', account_id: 'bank-a', date: '2026-03-06T18:45:00Z', description: 'The Phoenix Bar – Drinks', amount_pence: 1620, category: 'Entertainment', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't7', account_id: 'bank-a', date: '2026-03-05T10:00:00Z', description: 'Grant Property – March Rent', amount_pence: 55000, category: 'Housing', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't8', account_id: 'bank-a', date: '2026-03-03T08:30:00Z', description: 'Xplore Dundee – Day Ticket', amount_pence: 480, category: 'Transport', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't9', account_id: 'bank-a', date: '2026-03-01T12:00:00Z', description: 'Aldi Dundee – Groceries', amount_pence: 3847, category: 'Groceries', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't10', account_id: 'bank-a', date: '2026-03-01T09:00:00Z', description: 'SAAS Maintenance Loan – Spring Term', amount_pence: 191625, category: 'Income', transaction_type: 'CREDIT', payment_network: 'BACS Direct Credit' },

  // Bank B
  { id: 't11', account_id: 'bank-b', date: '2026-03-19T08:30:00Z', description: 'Pret A Manger – Morning Coffee', amount_pence: 475, category: 'Eating Out', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't12', account_id: 'bank-b', date: '2026-03-18T14:00:00Z', description: 'Part-time Wages – Costa Coffee', amount_pence: 36400, category: 'Income', transaction_type: 'CREDIT', payment_network: 'BACS Direct Credit' },
  { id: 't13', account_id: 'bank-b', date: '2026-03-17T09:00:00Z', description: 'Scottish Water – Quarterly Bill', amount_pence: 4200, category: 'Utilities', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't14', account_id: 'bank-b', date: '2026-03-16T19:00:00Z', description: 'Nando\'s Edinburgh – Dinner Out', amount_pence: 1845, category: 'Eating Out', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't15', account_id: 'bank-b', date: '2026-03-15T11:30:00Z', description: 'Waterstones Edinburgh – Book', amount_pence: 899, category: 'Education', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't16', account_id: 'bank-b', date: '2026-03-14T16:00:00Z', description: 'Transfer to Flatmate – Broadband Split', amount_pence: 1750, category: 'Transfers', transaction_type: 'DEBIT', payment_network: 'Faster Payments' },
  { id: 't17', account_id: 'bank-b', date: '2026-03-13T12:45:00Z', description: 'Boots – Pharmacy', amount_pence: 895, category: 'Health', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't18', account_id: 'bank-b', date: '2026-03-12T10:00:00Z', description: 'SAAS Maintenance Loan – Spring Term', amount_pence: 191625, category: 'Income', transaction_type: 'CREDIT', payment_network: 'BACS Direct Credit' },
  { id: 't19', account_id: 'bank-b', date: '2026-03-11T15:00:00Z', description: 'EE Mobile – Monthly Bill', amount_pence: 1800, category: 'Utilities', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't20', account_id: 'bank-b', date: '2026-03-10T09:30:00Z', description: 'Apple iCloud+ – Monthly', amount_pence: 299, category: 'Subscriptions', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't21', account_id: 'bank-b', date: '2026-03-09T20:00:00Z', description: 'Odeon Edinburgh – Film Night', amount_pence: 1150, category: 'Entertainment', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't22', account_id: 'bank-b', date: '2026-03-08T17:30:00Z', description: 'Sainsbury\'s Local – Essentials', amount_pence: 1245, category: 'Groceries', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't23', account_id: 'bank-b', date: '2026-03-07T08:00:00Z', description: 'ScotRail – Edinburgh to Glasgow Return', amount_pence: 2870, category: 'Transport', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't24', account_id: 'bank-b', date: '2026-03-06T13:00:00Z', description: 'Transfer from Abishik – Gig Tickets', amount_pence: 3500, category: 'Transfers', transaction_type: 'CREDIT', payment_network: 'Faster Payments' },
  { id: 't25', account_id: 'bank-b', date: '2026-03-05T11:00:00Z', description: 'Student Accommodation Ltd – March Rent', amount_pence: 62500, category: 'Housing', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't26', account_id: 'bank-b', date: '2026-03-04T14:20:00Z', description: 'Greggs Edinburgh – Lunch', amount_pence: 385, category: 'Eating Out', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't27', account_id: 'bank-b', date: '2026-03-03T09:00:00Z', description: 'Netflix – Monthly Subscription', amount_pence: 1099, category: 'Subscriptions', transaction_type: 'DEBIT', payment_network: 'BACS Direct Debit' },
  { id: 't28', account_id: 'bank-b', date: '2026-03-02T19:30:00Z', description: 'Brewdog Edinburgh – Dinner', amount_pence: 2480, category: 'Eating Out', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't29', account_id: 'bank-b', date: '2026-03-02T07:45:00Z', description: 'Lothian Buses – Monthly Pass', amount_pence: 5500, category: 'Transport', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
  { id: 't30', account_id: 'bank-b', date: '2026-03-01T10:15:00Z', description: 'Lidl Edinburgh – Weekly Shop', amount_pence: 2963, category: 'Groceries', transaction_type: 'DEBIT', payment_network: 'Visa Debit' },
];

// ── Utility Functions ────────────────────────────────
function penceToPounds(pence) {
  return (pence / 100).toFixed(2);
}

function formatCurrency(pence) {
  const pounds = pence / 100;
  return '£' + pounds.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getCategoryIcon(cat) {
  const icons = {
    'Groceries': '\u{1F6D2}',
    'Housing': '\u{1F3E0}',
    'Transport': '\u{1F68C}',
    'Entertainment': '\u{1F3AD}',
    'Income': '\u{1F4B0}',
    'Education': '\u{1F4DA}',
    'Subscriptions': '\u{1F4F1}',
    'Transfers': '\u{2194}\u{FE0F}',
    'Eating Out': '\u{1F37D}\u{FE0F}',
    'Utilities': '\u{26A1}',
    'Health': '\u{1F48A}',
  };
  return icons[cat] || '\u{1F4C4}';
}

function getCategoryColor(cat) {
  const colors = {
    'Groceries': 'var(--accent)',
    'Housing': 'var(--orange)',
    'Transport': 'var(--blue)',
    'Entertainment': 'var(--purple)',
    'Subscriptions': 'var(--purple)',
    'Eating Out': 'var(--red)',
    'Utilities': 'var(--orange)',
    'Education': 'var(--blue)',
    'Transfers': 'var(--cyan)',
    'Health': 'var(--red)',
    'Income': 'var(--accent)',
  };
  return colors[cat] || 'var(--text-dim)';
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── State ────────────────────────────────────────────
let activeAccountIndex = 0;

// ══════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen:not(.sub-screen)');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.screen;

      // Hide all sub-screens
      document.querySelectorAll('.sub-screen').forEach(s => s.classList.remove('active'));
      // Show bottom nav
      document.getElementById('bottom-nav').style.display = '';

      // Switch main screens
      screens.forEach(s => s.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');

      navItems.forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const backTo = btn.dataset.back;
      // Hide current sub-screen
      btn.closest('.screen').classList.remove('active');

      // If going back to a main screen
      const target = document.getElementById(backTo);
      if (target) {
        target.classList.add('active');
        // Show bottom nav if target is a main screen
        if (!target.classList.contains('sub-screen')) {
          document.getElementById('bottom-nav').style.display = '';
        }
      }
    });
  });
}

function navigateToSubScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById(screenId).classList.add('active');
}

// ══════════════════════════════════════════════════════
// ACCOUNTS SCREEN
// ══════════════════════════════════════════════════════
function initAccounts() {
  const carousel = document.getElementById('cards-carousel');
  const dotsContainer = document.getElementById('carousel-dots');

  // Render cards
  ACCOUNTS.forEach((acc, i) => {
    const card = document.createElement('div');
    card.className = `bank-card ${i === 0 ? 'active-card' : ''}`;
    card.innerHTML = `
      <div class="card-bank-name">
        <div class="card-bank-icon">
          <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="6" width="14" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 6V4a4 4 0 018 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </div>
        ${acc.bank_name}
      </div>
      <div class="card-number">XXXX XXXX XXXX ${acc.account_number.slice(-4)}</div>
      <div class="card-holder">${acc.holder}</div>
      <div class="card-details-line">Sort: ${acc.sort_code} • Acc: ${acc.account_number}</div>
    `;
    carousel.appendChild(card);
  });

  // Render dots
  ACCOUNTS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `dot ${i === 0 ? 'active' : ''}`;
    dotsContainer.appendChild(dot);
  });

  // Scroll detection
  carousel.addEventListener('scroll', () => {
    const cardWidth = carousel.firstElementChild.offsetWidth + 14;
    const idx = Math.round(carousel.scrollLeft / cardWidth);
    if (idx !== activeAccountIndex) {
      activeAccountIndex = idx;
      updateActiveCard();
    }
  });

  updateActiveCard();
  renderTransactionPreview();
}

function updateActiveCard() {
  const cards = document.querySelectorAll('.bank-card');
  const dots = document.querySelectorAll('.dot');
  cards.forEach((c, i) => c.classList.toggle('active-card', i === activeAccountIndex));
  dots.forEach((d, i) => d.classList.toggle('active', i === activeAccountIndex));

  const acc = ACCOUNTS[activeAccountIndex];
  document.getElementById('balance-amount').textContent = formatCurrency(acc.balance_pence);

  // Calculate weekly change (mock)
  const accTxns = TRANSACTIONS.filter(t => t.account_id === acc.id);
  const weekCredits = accTxns.filter(t => t.transaction_type === 'CREDIT').reduce((s, t) => s + t.amount_pence, 0);
  const weekDebits = accTxns.filter(t => t.transaction_type === 'DEBIT').reduce((s, t) => s + t.amount_pence, 0);
  const netWeek = weekCredits - weekDebits;
  const sign = netWeek >= 0 ? '+' : '';
  document.getElementById('balance-change').textContent = `${sign}${formatCurrency(Math.abs(netWeek))} this month`;

  renderTransactionPreview();
}

function renderTransactionPreview() {
  const acc = ACCOUNTS[activeAccountIndex];
  const txns = TRANSACTIONS.filter(t => t.account_id === acc.id).slice(0, 5);
  const list = document.getElementById('txn-list-preview');

  list.innerHTML = txns.map(t => `
    <div class="txn-item">
      <div class="txn-icon ${t.category.toLowerCase().replace(/\s+/g, '-')}">${getCategoryIcon(t.category)}</div>
      <div class="txn-details">
        <div class="txn-desc">${t.description}</div>
        <div class="txn-cat">${t.category} • ${formatDate(t.date)}</div>
      </div>
      <div class="txn-amount ${t.transaction_type === 'CREDIT' ? 'credit' : 'debit'}">
        ${t.transaction_type === 'CREDIT' ? '+' : '-'}${formatCurrency(t.amount_pence)}
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════
// INSIGHTS SCREEN
// ══════════════════════════════════════════════════════
function initInsights() {
  const allTxns = TRANSACTIONS;
  const credits = allTxns.filter(t => t.transaction_type === 'CREDIT');
  const debits = allTxns.filter(t => t.transaction_type === 'DEBIT');

  const totalIn = credits.reduce((s, t) => s + t.amount_pence, 0);
  const totalOut = debits.reduce((s, t) => s + t.amount_pence, 0);
  const netFlow = totalIn - totalOut;

  document.getElementById('total-in').textContent = formatCurrency(totalIn);
  document.getElementById('total-out').textContent = formatCurrency(totalOut);
  document.getElementById('net-flow').textContent = `${netFlow >= 0 ? '+' : ''}${formatCurrency(Math.abs(netFlow))}`;

  renderSpendingChart();
  renderDonutChart();
}

function renderSpendingChart() {
  const canvas = document.getElementById('spending-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;

  // Generate monthly spending data (simulated from transactions)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const values = [1200, 1450, 1380, 1520, 1280, 1600, 1420, 1350, 1480];

  const padL = 10, padR = 10, padT = 20, padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = Math.max(...values) * 1.1;

  // Grid lines
  ctx.strokeStyle = 'rgba(30, 51, 85, 0.5)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const y = padT + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
  }

  // Data points
  const points = values.map((v, i) => ({
    x: padL + (chartW / (values.length - 1)) * i,
    y: padT + chartH - (v / maxVal) * chartH
  }));

  // Area fill gradient
  const gradient = ctx.createLinearGradient(0, padT, 0, h);
  gradient.addColorStop(0, 'rgba(45, 212, 168, 0.25)');
  gradient.addColorStop(1, 'rgba(45, 212, 168, 0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, h - padB);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, h - padB);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#2dd4a8';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Dots
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2dd4a8';
    ctx.fill();
  });

  // Month labels
  ctx.fillStyle = '#5a7093';
  ctx.font = '11px DM Sans';
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    const x = padL + (chartW / (months.length - 1)) * i;
    ctx.fillText(m, x, h - 8);
  });
}

function getDonutColors() {
  return [
    '#ffaa42', // Housing - orange
    '#2dd4a8', // Transport - green/accent
    '#4d9fff', // Eating Out - blue
    '#ff5c72', // Transfers - red
    '#e866e8', // Utilities - pink
    '#22d3ee', // Groceries - cyan
    '#a78bfa', // Education - purple
    '#fbbf24', // Entertainment - yellow
    '#5dffd0', // Subscriptions - bright green
    '#ff9f43', // Health - light orange
  ];
}

function renderDonutChart() {
  const debits = TRANSACTIONS.filter(t => t.transaction_type === 'DEBIT');
  const catTotals = {};

  debits.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount_pence;
  });

  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const totalSpent = debits.reduce((s, t) => s + t.amount_pence, 0);
  const colors = getDonutColors();

  // Update center label
  document.getElementById('donut-total').textContent = formatCurrency(totalSpent);

  // Draw donut on canvas
  const canvas = document.getElementById('donut-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 100;
  const innerRadius = 65;
  let startAngle = -Math.PI / 2; // Start from top

  sorted.forEach(([cat, total], i) => {
    const sliceAngle = (total / totalSpent) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
    ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    // Add a tiny gap between segments
    ctx.strokeStyle = '#0a1628';
    ctx.lineWidth = 2;
    ctx.stroke();

    startAngle = endAngle;
  });

  // Render legend
  const legend = document.getElementById('donut-legend');
  legend.innerHTML = sorted.map(([cat, total], i) => {
    const pct = ((total / totalSpent) * 100).toFixed(1);
    return `
      <div class="donut-legend-item">
        <span class="legend-dot" style="background: ${colors[i % colors.length]}"></span>
        <span class="legend-name">${cat}</span>
        <span class="legend-amount">${formatCurrency(total)}</span>
        <span class="legend-pct">${pct}%</span>
      </div>
    `;
  }).join('');
}

// ══════════════════════════════════════════════════════
// SCENARIOS SCREEN
// ══════════════════════════════════════════════════════
function initScenarios() {
  document.getElementById('tile-investment').addEventListener('click', () => {
    navigateToSubScreen('screen-invest-learn');
  });

  document.getElementById('start-stock-select').addEventListener('click', () => {
    navigateToSubScreen('screen-stock-select');
  });

  initStockSelection();
}

function initStockSelection() {
  const options = document.querySelectorAll('.stock-option');
  const startBtn = document.getElementById('start-trading-btn');
  const selected = new Set();

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const stock = opt.dataset.stock;
      if (selected.has(stock)) {
        selected.delete(stock);
        opt.classList.remove('selected');
      } else {
        selected.add(stock);
        opt.classList.add('selected');
      }

      if (selected.size > 0) {
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
      } else {
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
      }
    });
  });

  startBtn.addEventListener('click', () => {
    if (selected.size > 0) {
      if (typeof initTrading === 'function') {
        initTrading([...selected]);
      }
      navigateToSubScreen('screen-trading');
    }
  });
}

// ══════════════════════════════════════════════════════
// FLO AI CHAT
// ══════════════════════════════════════════════════════
function initFloChat() {
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance_pence, 0);
  document.getElementById('flo-balance').textContent = formatCurrency(totalBalance);

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messagesDiv = document.getElementById('chat-messages');

  function sendMessage(text) {
    if (!text.trim()) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.innerHTML = `
      <div class="msg-bubble"><p>${escapeHtml(text)}</p></div>
    `;
    messagesDiv.appendChild(userMsg);
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.innerHTML = `
      <div class="msg-avatar">
        <svg width="24" height="24" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--accent)"/><circle cx="13" cy="15" r="2" fill="var(--bg)"/><circle cx="23" cy="15" r="2" fill="var(--bg)"/><path d="M13 22a5 5 0 0010 0" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    `;
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Generate response
    setTimeout(() => {
      typing.remove();
      const response = generateFloResponse(text.toLowerCase());
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      botMsg.innerHTML = `
        <div class="msg-avatar">
          <svg width="24" height="24" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--accent)"/><circle cx="13" cy="15" r="2" fill="var(--bg)"/><circle cx="23" cy="15" r="2" fill="var(--bg)"/><path d="M13 22a5 5 0 0010 0" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="msg-bubble">${response}</div>
      `;
      messagesDiv.appendChild(botMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 1200);
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  // Chips
  document.querySelectorAll('.flo-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const queries = {
        'budget': 'Can you do a budget check for me?',
        'overspending': 'Am I overspending anywhere?',
        'save': 'How can I save more money?',
        'subscriptions': 'Check my subscriptions spending',
        'weekly': 'Give me a weekly spending plan',
        'top-expenses': 'What are my top expenses?',
      };
      sendMessage(queries[chip.dataset.query] || chip.textContent);
    });
  });
}

function generateFloResponse(query) {
  const allDebits = TRANSACTIONS.filter(t => t.transaction_type === 'DEBIT');
  const totalSpent = allDebits.reduce((s, t) => s + t.amount_pence, 0);
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance_pence, 0);

  // Category breakdown
  const catTotals = {};
  allDebits.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount_pence;
  });
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  if (query.includes('budget') || query.includes('budget check')) {
    return `<p>Here's your budget overview for March:</p>
    <p><strong>Total income:</strong> ${formatCurrency(TRANSACTIONS.filter(t => t.transaction_type === 'CREDIT').reduce((s, t) => s + t.amount_pence, 0))}</p>
    <p><strong>Total spent:</strong> ${formatCurrency(totalSpent)}</p>
    <p><strong>Balance remaining:</strong> ${formatCurrency(totalBalance)}</p>
    <p>Your biggest expense is <strong>${sorted[0][0]}</strong> at ${formatCurrency(sorted[0][1])}. You're spending about ${formatCurrency(Math.round(totalSpent / 19))} per day on average.</p>`;
  }

  if (query.includes('overspend')) {
    const eating = catTotals['Eating Out'] || 0;
    const entertainment = catTotals['Entertainment'] || 0;
    return `<p>Let me check... 🔍</p>
    <p>Your <strong>eating out</strong> spending is ${formatCurrency(eating)} this month — that's about ${((eating / totalSpent) * 100).toFixed(1)}% of your total spending. For a student budget, you might want to aim for under £30/month.</p>
    <p>Entertainment is at ${formatCurrency(entertainment)}. Consider free student events or DUSA activities to save here!</p>`;
  }

  if (query.includes('save') || query.includes('saving')) {
    return `<p>Great question! Here are 3 quick wins based on your spending:</p>
    <p><strong>1. Meal prep</strong> — You're spending ${formatCurrency(catTotals['Eating Out'] || 0)} on eating out. Batch cooking could halve that.</p>
    <p><strong>2. Review subscriptions</strong> — You have Spotify (£5.99), Netflix (£10.99), and iCloud+ (£2.99) = ${formatCurrency((catTotals['Subscriptions'] || 0))}. Any you don't use daily?</p>
    <p><strong>3. Transport hack</strong> — Check if a monthly bus pass saves vs. individual tickets.</p>`;
  }

  if (query.includes('subscription')) {
    const subs = TRANSACTIONS.filter(t => t.category === 'Subscriptions');
    const subTotal = subs.reduce((s, t) => s + t.amount_pence, 0);
    return `<p>You have <strong>${subs.length} active subscriptions</strong> totalling ${formatCurrency(subTotal)}/month:</p>
    ${subs.map(s => `<p>• ${s.description}: ${formatCurrency(s.amount_pence)}</p>`).join('')}
    <p>That's ${formatCurrency(subTotal * 12)} per year! Worth reviewing if you use them all regularly.</p>`;
  }

  if (query.includes('weekly') || query.includes('plan')) {
    const weeklyBudget = Math.round((totalBalance - 55000) / 4);
    return `<p>Here's a suggested weekly plan based on your balance of ${formatCurrency(totalBalance)}:</p>
    <p><strong>Rent set aside:</strong> £550.00</p>
    <p><strong>Weekly budget:</strong> ~${formatCurrency(weeklyBudget)}</p>
    <p>• Groceries: ~£40</p>
    <p>• Transport: ~£15</p>
    <p>• Fun money: ~£20</p>
    <p>• Savings buffer: rest</p>
    <p>Try the <strong>envelope method</strong> — withdraw your weekly budget in cash so you can physically see what's left!</p>`;
  }

  if (query.includes('top') || query.includes('expense')) {
    return `<p>Your top spending categories this month:</p>
    ${sorted.slice(0, 5).map(([ cat, amt ], i) => 
      `<p><strong>${i + 1}. ${cat}</strong> — ${formatCurrency(amt)} (${((amt / totalSpent) * 100).toFixed(1)}%)</p>`
    ).join('')}
    <p>Housing is typically the biggest student expense — yours is ${((sorted.find(s => s[0] === 'Housing')?.[1] || 0) / totalSpent * 100).toFixed(1)}% of spending, which is within the normal range.</p>`;
  }

  // Default response
  return `<p>That's a great question! Let me help with that.</p>
  <p>Your combined balance is <strong>${formatCurrency(totalBalance)}</strong>. You've spent ${formatCurrency(totalSpent)} this month across ${allDebits.length} transactions.</p>
  <p>Try asking me about your <strong>budget</strong>, <strong>subscriptions</strong>, <strong>top expenses</strong>, or how to <strong>save money</strong> — I can give you specific tips based on your actual spending!</p>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════════════════
// QUICK ACTIONS
// ══════════════════════════════════════════════════════
function initQuickActions() {
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'details') {
        const acc = ACCOUNTS[activeAccountIndex];
        showToast(`${acc.bank_name}: Sort ${acc.sort_code}, Acc ${acc.account_number}`, 'info');
      } else if (action === 'send') {
        showToast('Send money — coming soon!', 'info');
      } else if (action === 'manage') {
        showToast('Account management — coming soon!', 'info');
      }
    });
  });

  document.getElementById('see-all-txn').addEventListener('click', () => {
    // Navigate to insights
    document.querySelector('[data-screen="screen-insights"]').click();
  });
}

// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAccounts();
  initInsights();
  initScenarios();
  initFloChat();
  initQuickActions();
});
