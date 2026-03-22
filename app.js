/*
   FLO — Core Application Logic
   Loads all data from /app/insights.json
 */

// ── Global Data (loaded from insights.json) ──────────
let BANK_DATA = null;       // overall insights
let INVESTMENT_DATA = null;  // investment_demo
let ACCOUNTS = [];           // overall.accounts
let USER_DATA = {};          // per-user breakdowns
let TRANSACTIONS = [];        // all transactions from all accounts

// Utility Functions
function penceToPounds(pence) {
  return (pence / 100).toFixed(2);
}

function formatCurrency(pence) {
  const pounds = pence / 100;
  return '\u00A3' + pounds.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    'Shopping': '\u{1F6CD}\u{FE0F}',
    'Travel': '\u{2708}\u{FE0F}',
    'Savings': '\u{1F4B3}',
    'Investments': '\u{1F4C8}',
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
    'Shopping': 'var(--purple)',
    'Travel': 'var(--blue)',
    'Savings': 'var(--accent)',
    'Investments': 'var(--cyan)',
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

// State
let activeAccountIndex = 0;

// DATA LOADING
function loadInsightsData() {
  return Promise.all([
    fetch('/app/insights.json').then(r => r.json()),
    fetch('/app/transactions.json').then(r => r.json())
  ])
    .then(([insightsData, txnData]) => {
      BANK_DATA = insightsData.overall;
      INVESTMENT_DATA = insightsData.investment_demo || null;
      USER_DATA = insightsData.users || {};
      ACCOUNTS = insightsData.overall.accounts || [];
      
      // Flatten transactions from all accounts
      TRANSACTIONS = [];
      if (Array.isArray(txnData)) {
        txnData.forEach(accountTxns => {
          if (accountTxns.transactions) {
            TRANSACTIONS.push(...accountTxns.transactions);
          }
        });
      }

      console.log('[OK] Bank data loaded from insights.json');
      console.log('[OK] Transactions loaded:', TRANSACTIONS.length, 'total');
      return insightsData;
    })
    .catch(err => {
      console.error('[ERROR] Failed to load data', err);
      showToast('Failed to load bank data', 'error');
    });
}

// NAVIGATION
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

// ACCOUNTS SCREEN
function initAccounts() {
  const carousel = document.getElementById('cards-carousel');
  const dotsContainer = document.getElementById('carousel-dots');

  // Render cards from insights.json accounts
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
      <div class="card-holder">${acc.bank_name} Account</div>
      <div class="card-details-line">Sort: ${acc.sort_code} \u2022 Acc: ${acc.account_number}</div>
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

  // Find matching per_account data for this account
  const perAcc = BANK_DATA.per_account.find(a => a.account_id === acc.id) || {};
  const moneyIn = perAcc.money_in_pence || 0;
  const moneyOut = perAcc.money_out_pence || 0;
  const netFlow = moneyIn - moneyOut;
  const sign = netFlow >= 0 ? '+' : '';
  document.getElementById('balance-change').textContent = `${sign}${formatCurrency(Math.abs(netFlow))} this period`;

  renderTransactionPreview();
}

function getRecentTransactions(days = 7, limit = 5) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return TRANSACTIONS
    .filter(txn => new Date(txn.date) >= weekAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

function renderTransactionPreview() {
  const list = document.getElementById('txn-list-preview');
  const recentTxns = getRecentTransactions(7, 5);

  if (recentTxns.length === 0) {
    list.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-dim);">No transactions this week</div>';
    return;
  }

  list.innerHTML = recentTxns.map(txn => {
    const account = ACCOUNTS.find(a => a.id === txn.account_id);
    const bankName = account ? account.bank_name : 'Unknown';
    const isDebit = txn.transaction_type === 'DEBIT';
    const amountClass = isDebit ? 'debit' : 'credit';
    const amountSign = isDebit ? '-' : '+';

    return `
    <div class="txn-item">
      <div class="txn-icon ${txn.category.toLowerCase().replace(/\s+/g, '-')}">${getCategoryIcon(txn.category)}</div>
      <div class="txn-details">
        <div class="txn-desc">${txn.description}</div>
        <div class="txn-cat">${txn.category} \u2022 ${bankName}</div>
      </div>
      <div class="txn-amount ${amountClass}">
        ${amountSign}${formatCurrency(txn.amount_pence)}
      </div>
    </div>
  `;
  }).join('');
}

// INSIGHTS SCREEN
function initInsights() {
  const s = BANK_DATA.summary;
  const totalIn = s.total_money_in_pence;
  const totalOut = s.total_money_out_pence;
  const netFlow = s.net_flow_pence;

  document.getElementById('total-in').textContent = formatCurrency(totalIn);
  document.getElementById('total-out').textContent = formatCurrency(totalOut);
  document.getElementById('net-flow').textContent = `${netFlow >= 0 ? '+' : ''}${formatCurrency(Math.abs(netFlow))}`;

  renderHealthScore();
  renderImpactStrip();
  renderDonutChart();
}

function renderHealthScore() {
  const s = BANK_DATA.summary;
  const totalIn = s.total_money_in_pence;
  const totalOut = s.total_money_out_pence;

  // 1. Income vs spending ratio (0-25)
  const ratio = totalOut > 0 ? totalIn / totalOut : 0;
  let incomeScore = 0;
  if (ratio >= 2.0) incomeScore = 25;
  else if (ratio >= 1.5) incomeScore = 20;
  else if (ratio >= 1.2) incomeScore = 15;
  else if (ratio >= 1.0) incomeScore = 8;

  // 2. Rent affordability (0-25)
  const housingCat = BANK_DATA.money_out_by_category['Housing'];
  const totalRent = housingCat ? housingCat.total_pence : 0;
  const rentPct = totalIn > 0 ? (totalRent / totalIn) * 100 : 100;
  let rentScore = 0;
  if (rentPct <= 30) rentScore = 25;
  else if (rentPct <= 40) rentScore = 18;
  else if (rentPct <= 50) rentScore = 10;

  // 3. Subscription load (0-25)
  const subsCat = BANK_DATA.money_out_by_category['Subscriptions'];
  const totalSubs = subsCat ? subsCat.total_pence : 0;
  const subsPct = totalOut > 0 ? (totalSubs / totalOut) * 100 : 0;
  let subsScore = 0;
  if (subsPct <= 3) subsScore = 25;
  else if (subsPct <= 6) subsScore = 18;
  else if (subsPct <= 10) subsScore = 10;

  // 4. Savings buffer (0-25)
  const totalBalance = ACCOUNTS.reduce((sum, a) => sum + a.balance_pence, 0);
  const monthlySpending = totalOut / 3; // 3 months of data
  const bufferMonths = monthlySpending > 0 ? totalBalance / monthlySpending : 0;
  let bufferScore = 0;
  if (bufferMonths >= 3) bufferScore = 25;
  else if (bufferMonths >= 2) bufferScore = 18;
  else if (bufferMonths >= 1) bufferScore = 10;

  const score = incomeScore + rentScore + subsScore + bufferScore;

  // Determine tag
  let tag, tagColor;
  if (score >= 75) { tag = 'Excellent'; tagColor = '#2dd4a8'; }
  else if (score >= 50) { tag = 'Good'; tagColor = '#ffaa42'; }
  else if (score >= 25) { tag = 'Fair'; tagColor = '#ff8c42'; }
  else { tag = 'Needs Work'; tagColor = '#ff5c72'; }

  // Arc colour
  let arcColor;
  if (score >= 75) arcColor = '#2dd4a8';
  else if (score >= 50) arcColor = '#ffaa42';
  else if (score >= 25) arcColor = '#ff8c42';
  else arcColor = '#ff5c72';

  // Draw arc on canvas
  const canvas = document.getElementById('score-arc');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 120 * dpr;
  canvas.height = 120 * dpr;
  canvas.style.width = '120px';
  canvas.style.height = '120px';
  ctx.scale(dpr, dpr);

  const cx = 60, cy = 60, r = 48, lw = 10;
  const startAngle = 0.75 * Math.PI;
  const fullSweep = 1.5 * Math.PI;
  const endAngleFull = startAngle + fullSweep;
  const endAngleScore = startAngle + (score / 100) * fullSweep;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngleFull);
  ctx.strokeStyle = '#1c2e4a';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fill
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngleScore);
  ctx.strokeStyle = arcColor;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Animate score number
  const scoreEl = document.getElementById('score-value');
  const duration = 1000;
  const startTime = performance.now();
  function animateScore(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    scoreEl.textContent = Math.round(eased * score);
    if (progress < 1) requestAnimationFrame(animateScore);
  }
  requestAnimationFrame(animateScore);

  // Tag
  const tagEl = document.getElementById('score-tag');
  tagEl.textContent = tag;
  tagEl.style.color = tagColor;

  // Score value color matches arc
  scoreEl.style.color = arcColor;

  // Factor rows
  const factors = [
    { name: 'Income vs Spend', pts: incomeScore, max: 25 },
    { name: 'Rent Afford.', pts: rentScore, max: 25 },
    { name: 'Subs Load', pts: subsScore, max: 25 },
    { name: 'Savings Buffer', pts: bufferScore, max: 25 },
  ];

  const factorsEl = document.getElementById('score-factors');
  factorsEl.innerHTML = factors.map(f => {
    const pct = (f.pts / f.max) * 100;
    const barColor = pct >= 75 ? '#2dd4a8' : pct >= 50 ? '#ffaa42' : pct >= 25 ? '#ff8c42' : '#ff5c72';
    return `
      <div class="score-factor">
        <span>${f.name}</span>
        <div class="score-factor-bar-wrap">
          <div class="score-factor-bar" style="width:${pct}%;background:${barColor}"></div>
        </div>
        <span>${f.pts}/${f.max}</span>
      </div>
    `;
  }).join('');
}

function renderImpactStrip() {
  const s = BANK_DATA.summary;
  const totalIn = s.total_money_in_pence;
  const totalOut = s.total_money_out_pence;

  // Subscription cost/yr
  const subsCat = BANK_DATA.money_out_by_category['Subscriptions'];
  const subsTotal = subsCat ? subsCat.total_pence : 0;
  const subsYearly = Math.round((subsTotal * 4) / 100); // 3 months data * 4 = yearly

  // Rent % of income
  const housingCat = BANK_DATA.money_out_by_category['Housing'];
  const totalRent = housingCat ? housingCat.total_pence : 0;
  const rentPct = totalIn > 0 ? (totalRent / totalIn * 100).toFixed(0) : 0;

  // Daily spend (3 months ~ 90 days)
  const dailySpend = (totalOut / 90 / 100).toFixed(2);

  // Render
  const rentColor = rentPct > 40 ? 'var(--orange)' : 'var(--accent)';

  document.getElementById('impact-subs').innerHTML = `
    <span class="impact-number">\u00A3${subsYearly}/yr</span>
    <span class="impact-label">on subscriptions</span>
  `;

  document.getElementById('impact-rent').innerHTML = `
    <span class="impact-number" style="color:${rentColor}">${rentPct}%</span>
    <span class="impact-label">of income on rent</span>
  `;

  document.getElementById('impact-daily').innerHTML = `
    <span class="impact-number">\u00A3${dailySpend}/day</span>
    <span class="impact-label">average spend</span>
  `;
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
    '#c084fc', // Shopping - lavender
    '#38bdf8', // Travel - sky blue
    '#4ade80', // Savings - green
    '#f472b6', // Investments - pink
  ];
}

function renderDonutChart() {
  const moneyOut = BANK_DATA.money_out_by_category || {};
  const sorted = Object.entries(moneyOut)
    .map(([cat, data]) => [cat, data.total_pence])
    .sort((a, b) => b[1] - a[1]);

  const totalSpent = sorted.reduce((s, [, amt]) => s + amt, 0);
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


// SCENARIOS SCREEN
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


// FLO AI CHAT

// SYSTEM PROMPT
const SYSTEM_PROMPT = `You are Flo, a friendly and empathetic personal finance assistant built specifically for students and young people. Your goal is to help them understand their money, make smarter decisions, and build healthy financial habits.

PERSONALITY:
- Warm, casual, and non-judgmental \u2014 talk like a smart friend who knows finance, not a bank
- Use simple language, avoid jargon. If you must use a financial term, explain it briefly
- Be honest even when it's uncomfortable, but always constructive and encouraging
- Use occasional emojis to keep it light (but don't overdo it)
- Keep responses concise \u2014 bullet points where helpful, but don't ramble

WHAT YOU CAN HELP WITH:
- Budgeting and tracking spending patterns
- Identifying where money is being wasted
- Saving strategies and goal setting
- Understanding subscriptions and recurring costs
- Weekly/monthly budget planning
- Simple financial habits for students
- Explaining bills, direct debits, overdrafts in plain English

WHAT YOU CANNOT DO:
- Give regulated investment advice (stocks, crypto, etc.)
- Predict markets or guarantee financial outcomes
- Access external systems beyond the data provided

RULES:
- Always base your advice on the user's ACTUAL bank data provided in the context
- Reference specific transactions, amounts, and categories when relevant \u2014 make it personal
- Never judge lifestyle choices, just flag the financial impact
- Always end advice with one small, actionable next step
- If asked about investing or cryptocurrency, briefly acknowledge and redirect to budgeting first
- Remind users you're not a licensed financial advisor when giving serious advice

The user's bank data will be provided at the start of each message. Use it to give hyper-personalised, relevant advice.`;

// CONVERSATION HISTORY
let conversationHistory = [];

// HELPERS
function formatBankContext() {
  if (!BANK_DATA) return '[No bank data available]';

  const s = BANK_DATA.summary;
  const totalIn = (s.total_money_in_pence / 100).toFixed(2);
  const totalOut = (s.total_money_out_pence / 100).toFixed(2);
  const netFlow = (s.net_flow_pence / 100).toFixed(2);

  // Account summaries
  const accountsSummary = ACCOUNTS.map(a =>
    `- ${a.bank_name} (${a.account_number}): \u00A3${(a.balance_pence / 100).toFixed(2)}`
  ).join('\n');

  // Convert categories to readable format
  const categoriesIn = Object.entries(BANK_DATA.money_in_by_category || {}).map(([cat, val]) => ({
    category: cat,
    total: '\u00A3' + (val.total_pence / 100).toFixed(2),
    topMerchants: Object.entries(val.by_merchant)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, pence]) => `${name} \u00A3${(pence / 100).toFixed(2)}`)
      .join(', ')
  }));

  return `[USER'S REAL BANK DATA]
Accounts: ${s.account_count} (${ACCOUNTS.map(a => a.bank_name).join(', ')})
Total Balance: \u00A3${(ACCOUNTS.reduce((sum, a) => sum + a.balance_pence, 0) / 100).toFixed(2)}
Total Money In: \u00A3${totalIn}
Total Money Out: \u00A3${totalOut}
Net Flow: \u00A3${netFlow}
Transactions: ${s.transaction_count}

ACCOUNTS:
${accountsSummary}

INCOME SOURCES:
${categoriesIn.map(c => `- ${c.category}: ${c.total} (top: ${c.topMerchants})`).join('\n')}

SPENDING BY CATEGORY:
${Object.entries(BANK_DATA.money_out_by_category || {}).map(([cat, val]) =>
    `- ${cat}: \u00A3${(val.total_pence / 100).toFixed(2)}`).join('\n')}
[END OF BANK DATA]`;
}

function formatAIText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function initFloChat() {
  const totalBalance = ACCOUNTS.reduce((s, a) => s + a.balance_pence, 0);
  document.getElementById('flo-balance').textContent = formatCurrency(totalBalance);

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const messagesDiv = document.getElementById('chat-messages');

  async function sendMessage(text) {
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

    // Build messages for AI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + formatBankContext() },
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "Couldn't get a response, try again!";

      typing.remove();

      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      botMsg.innerHTML = `
        <div class="msg-avatar">
          <svg width="24" height="24" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--accent)"/><circle cx="13" cy="15" r="2" fill="var(--bg)"/><circle cx="23" cy="15" r="2" fill="var(--bg)"/><path d="M13 22a5 5 0 0010 0" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="msg-bubble">${formatAIText(reply)}</div>
      `;
      messagesDiv.appendChild(botMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      // Track conversation history
      conversationHistory.push({ role: 'user', content: text });
      conversationHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
      typing.remove();
      const errMsg = document.createElement('div');
      errMsg.className = 'chat-msg bot';
      errMsg.innerHTML = `
        <div class="msg-avatar">
          <svg width="24" height="24" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="10" fill="var(--accent)"/><circle cx="13" cy="15" r="2" fill="var(--bg)"/><circle cx="23" cy="15" r="2" fill="var(--bg)"/><path d="M13 22a5 5 0 0010 0" fill="none" stroke="var(--bg)" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="msg-bubble"><p>Hmm, something went wrong. Is the server running? Try again in a moment.</p></div>
      `;
      messagesDiv.appendChild(errMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      console.error('Flo AI error:', err);
    }
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  // Chips
  document.querySelectorAll('.flo-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const queries = {
        'budget': 'Am I on track with my budget this month?',
        'overspending': 'Where am I overspending?',
        'save': 'How can I save more money?',
        'subscriptions': 'Should I cancel any subscriptions?',
        'weekly': 'Give me a simple weekly budget plan',
        'top-expenses': 'What are my biggest expenses?',
      };
      sendMessage(queries[chip.dataset.query] || chip.textContent);
    });
  });
}

// QUICK ACTIONS
function initQuickActions() {
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'details') {
        const acc = ACCOUNTS[activeAccountIndex];
        showToast(`${acc.bank_name}: Sort ${acc.sort_code}, Acc ${acc.account_number}`, 'info');
      } else if (action === 'send') {
        showToast('Send money \u2014 coming soon!', 'info');
      } else if (action === 'manage') {
        showToast('Account management \u2014 coming soon!', 'info');
      }
    });
  });

  document.getElementById('see-all-txn').addEventListener('click', () => {
    // Navigate to insights
    document.querySelector('[data-screen="screen-insights"]').click();
  });
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  // Load data first, then init everything
  loadInsightsData().then(() => {
    if (!BANK_DATA) return;
    initNavigation();
    initAccounts();
    initInsights();
    initScenarios();
    initFloChat();
    initQuickActions();
  });
});
