/* ══════════════════════════════════════════════════════
   FLO — Trading Simulator
   Educational stock trading with fictional companies
   ══════════════════════════════════════════════════════ */

// ── Stock Definitions ────────────────────────────────
const STOCKS = {
  TNOV: {
    name: 'TechNova',
    ticker: 'TNOV',
    sector: 'AI & Cloud',
    color: '#4d9fff',
    startPrice: 42.50,
    // Pre-generated price data: 7 days, ~8 ticks per day
    volatility: 0.035,
  },
  GVLT: {
    name: 'GreenVolt',
    ticker: 'GVLT',
    sector: 'Renewable Energy',
    color: '#2dd4a8',
    startPrice: 28.75,
    volatility: 0.028,
  },
  FMRT: {
    name: 'FreshMart',
    ticker: 'FMRT',
    sector: 'Online Grocery',
    color: '#ffaa42',
    startPrice: 15.20,
    volatility: 0.022,
  }
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TICKS_PER_DAY = 8;
const TICK_INTERVAL_MS = 1500; // 1.5s per tick
const STARTING_CASH = 100000; // £1000 in pence

// ── Trading State ────────────────────────────────────
let tradingState = null;

function createTradingState(selectedStocks) {
  // Generate price histories with seeded randomness for realistic movement
  const priceHistories = {};

  selectedStocks.forEach(ticker => {
    const stock = STOCKS[ticker];
    const prices = [stock.startPrice];
    let price = stock.startPrice;

    // Generate all ticks for 7 days
    for (let day = 0; day < 7; day++) {
      // Each day has a general trend
      const dayTrend = (Math.random() - 0.48) * 0.02; // slight upward bias
      for (let tick = 0; tick < TICKS_PER_DAY; tick++) {
        if (day === 0 && tick === 0) continue; // already have start price
        const change = (Math.random() - 0.5) * 2 * stock.volatility * price + dayTrend * price;
        price = Math.max(price * 0.7, price + change); // floor at 70% of current
        prices.push(Math.round(price * 100) / 100);
      }
    }

    priceHistories[ticker] = prices;
  });

  return {
    selectedStocks,
    priceHistories,
    cash: STARTING_CASH,
    holdings: {}, // { TNOV: { shares: 5, avgCost: 4250 } }
    tradeLog: [],
    currentTick: 0,
    totalTicks: 7 * TICKS_PER_DAY,
    activeStock: selectedStocks[0],
    quantity: 1,
    isPlaying: false,
    tickTimer: null,
    isComplete: false,
  };
}

// ── Initialise Trading ───────────────────────────────
function initTrading(selectedStocks) {
  tradingState = createTradingState(selectedStocks);

  renderStockTabs();
  renderDayLabels();
  updateTradingUI();
  startAutoPlay();
}

// ── Auto Play ────────────────────────────────────────
function startAutoPlay() {
  if (tradingState.tickTimer) clearInterval(tradingState.tickTimer);

  tradingState.isPlaying = true;
  tradingState.tickTimer = setInterval(() => {
    if (tradingState.currentTick < tradingState.totalTicks - 1) {
      tradingState.currentTick++;
      updateTradingUI();
    } else {
      stopAutoPlay();
      endTrading();
    }
  }, TICK_INTERVAL_MS);
}

function stopAutoPlay() {
  tradingState.isPlaying = false;
  if (tradingState.tickTimer) {
    clearInterval(tradingState.tickTimer);
    tradingState.tickTimer = null;
  }
}

// ── Render Functions ─────────────────────────────────
function renderStockTabs() {
  const container = document.getElementById('stock-tabs');
  container.innerHTML = tradingState.selectedStocks.map((ticker, i) => {
    const stock = STOCKS[ticker];
    return `<button class="stock-tab ${i === 0 ? 'active' : ''}" data-ticker="${ticker}" style="--tab-color: ${stock.color}">
      ${stock.name} (${ticker})
    </button>`;
  }).join('');

  container.querySelectorAll('.stock-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tradingState.activeStock = tab.dataset.ticker;
      container.querySelectorAll('.stock-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateTradingUI();
    });
  });
}

function renderDayLabels() {
  const container = document.getElementById('day-labels');
  container.innerHTML = DAYS.map(d => `<span class="day-label">${d}</span>`).join('');
}

function updateTradingUI() {
  if (!tradingState) return;

  const { activeStock, currentTick, totalTicks, cash, holdings, priceHistories, selectedStocks } = tradingState;
  const stock = STOCKS[activeStock];
  const prices = priceHistories[activeStock];
  const currentPrice = prices[currentTick];
  const startPrice = prices[0];
  const priceChange = currentPrice - startPrice;
  const priceChangePercent = (priceChange / startPrice) * 100;

  // Current price display
  document.getElementById('current-price').textContent = `£${currentPrice.toFixed(2)}`;
  const changeEl = document.getElementById('price-change');
  changeEl.textContent = `${priceChange >= 0 ? '+' : ''}£${priceChange.toFixed(2)} (${priceChange >= 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%)`;
  changeEl.className = `price-change ${priceChange >= 0 ? 'up' : 'down'}`;

  // Day progress
  const currentDay = Math.floor(currentTick / TICKS_PER_DAY);
  const dayProgress = ((currentTick + 1) / totalTicks) * 100;
  document.getElementById('day-fill').style.width = `${dayProgress}%`;
  document.getElementById('day-status').textContent = `Day ${currentDay + 1} of 7 — ${DAYS[currentDay]}`;

  // Day labels
  document.querySelectorAll('.day-label').forEach((label, i) => {
    label.classList.remove('current', 'past');
    if (i === currentDay) label.classList.add('current');
    else if (i < currentDay) label.classList.add('past');
  });

  // Cash & Portfolio display
  document.getElementById('cash-display').textContent = formatCurrency(cash);

  let portfolioValue = 0;
  selectedStocks.forEach(ticker => {
    if (holdings[ticker]) {
      portfolioValue += holdings[ticker].shares * Math.round(priceHistories[ticker][currentTick] * 100);
    }
  });
  document.getElementById('portfolio-display').textContent = formatCurrency(portfolioValue);

  // Quantity & cost
  const qty = tradingState.quantity;
  const costPence = Math.round(currentPrice * 100) * qty;
  document.getElementById('qty-value').textContent = qty;
  document.getElementById('trade-cost').textContent = `Cost: ${formatCurrency(costPence)}`;

  // Buy/Sell button states
  document.getElementById('btn-buy').disabled = costPence > cash || tradingState.isComplete;
  document.getElementById('btn-sell').disabled = !holdings[activeStock] || holdings[activeStock].shares < qty || tradingState.isComplete;

  // Render chart
  renderTradingChart();
  renderHoldings();
}

function renderTradingChart() {
  const canvas = document.getElementById('trading-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const pad = { t: 15, r: 10, b: 15, l: 10 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  const { activeStock, currentTick, priceHistories } = tradingState;
  const stock = STOCKS[activeStock];
  const allPrices = priceHistories[activeStock];
  const visiblePrices = allPrices.slice(0, currentTick + 1);

  if (visiblePrices.length < 2) return;

  const minP = Math.min(...allPrices) * 0.98;
  const maxP = Math.max(...allPrices) * 1.02;
  const totalTicks = allPrices.length;

  // Grid
  ctx.strokeStyle = 'rgba(30, 51, 85, 0.4)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const y = pad.t + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }

  // Day separators
  ctx.strokeStyle = 'rgba(30, 51, 85, 0.6)';
  ctx.setLineDash([3, 3]);
  for (let d = 1; d < 7; d++) {
    const x = pad.l + (d * TICKS_PER_DAY / totalTicks) * chartW;
    ctx.beginPath();
    ctx.moveTo(x, pad.t);
    ctx.lineTo(x, h - pad.b);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Map price to canvas coordinates
  function px(tick) { return pad.l + (tick / (totalTicks - 1)) * chartW; }
  function py(price) { return pad.t + chartH - ((price - minP) / (maxP - minP)) * chartH; }

  // Area gradient
  const gradient = ctx.createLinearGradient(0, pad.t, 0, h);
  const isUp = visiblePrices[visiblePrices.length - 1] >= visiblePrices[0];
  const lineColor = isUp ? stock.color : '#ff5c72';

  gradient.addColorStop(0, (isUp ? stock.color : '#ff5c72') + '40');
  gradient.addColorStop(1, (isUp ? stock.color : '#ff5c72') + '05');

  ctx.beginPath();
  ctx.moveTo(px(0), h - pad.b);
  visiblePrices.forEach((p, i) => ctx.lineTo(px(i), py(p)));
  ctx.lineTo(px(visiblePrices.length - 1), h - pad.b);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  visiblePrices.forEach((p, i) => i === 0 ? ctx.moveTo(px(i), py(p)) : ctx.lineTo(px(i), py(p)));
  ctx.stroke();

  // Current price dot
  const lastIdx = visiblePrices.length - 1;
  ctx.beginPath();
  ctx.arc(px(lastIdx), py(visiblePrices[lastIdx]), 5, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px(lastIdx), py(visiblePrices[lastIdx]), 8, 0, Math.PI * 2);
  ctx.strokeStyle = lineColor + '60';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Price label at top right
  ctx.fillStyle = '#5a7093';
  ctx.font = '10px DM Sans';
  ctx.textAlign = 'right';
  ctx.fillText(`£${maxP.toFixed(2)}`, w - pad.r, pad.t + 10);
  ctx.fillText(`£${minP.toFixed(2)}`, w - pad.r, h - pad.b - 4);
}

function renderHoldings() {
  const { holdings, priceHistories, currentTick, selectedStocks } = tradingState;
  const list = document.getElementById('holdings-list');

  const held = selectedStocks.filter(t => holdings[t] && holdings[t].shares > 0);

  if (held.length === 0) {
    list.innerHTML = '<div class="empty-holdings">No stocks held yet — start buying!</div>';
    return;
  }

  list.innerHTML = held.map(ticker => {
    const stock = STOCKS[ticker];
    const h = holdings[ticker];
    const currentPrice = Math.round(priceHistories[ticker][currentTick] * 100);
    const currentValue = h.shares * currentPrice;
    const totalCost = h.shares * h.avgCost;
    const pl = currentValue - totalCost;
    const plPercent = (pl / totalCost) * 100;

    return `<div class="holding-item">
      <div>
        <div class="holding-name" style="color: ${stock.color}">${stock.name}</div>
        <div class="holding-shares">${h.shares} share${h.shares !== 1 ? 's' : ''} @ £${(h.avgCost / 100).toFixed(2)} avg</div>
      </div>
      <div class="holding-value">
        ${formatCurrency(currentValue)}
        <div class="holding-pl ${pl >= 0 ? 'up' : 'down'}">
          ${pl >= 0 ? '+' : ''}${formatCurrency(Math.abs(pl))} (${pl >= 0 ? '+' : ''}${plPercent.toFixed(1)}%)
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderTradeLog() {
  const log = document.getElementById('trade-log');
  if (tradingState.tradeLog.length === 0) {
    log.innerHTML = '<div class="empty-log">Your trades will appear here</div>';
    return;
  }

  log.innerHTML = tradingState.tradeLog.slice().reverse().map(trade => {
    const stock = STOCKS[trade.ticker];
    return `<div class="trade-log-item">
      <span class="log-action ${trade.action}">${trade.action}</span>
      <span class="log-details">${trade.shares}x ${stock.name} @ £${(trade.price / 100).toFixed(2)} — ${DAYS[trade.day]}</span>
      <span class="log-amount">${formatCurrency(trade.total)}</span>
    </div>`;
  }).join('');
}

// ── Trade Execution ──────────────────────────────────
function executeBuy() {
  if (!tradingState || tradingState.isComplete) return;
  const { activeStock, currentTick, priceHistories, quantity } = tradingState;
  const pricePence = Math.round(priceHistories[activeStock][currentTick] * 100);
  const totalCost = pricePence * quantity;

  if (totalCost > tradingState.cash) {
    showToast('Not enough cash!', 'error');
    return;
  }

  tradingState.cash -= totalCost;

  if (!tradingState.holdings[activeStock]) {
    tradingState.holdings[activeStock] = { shares: 0, avgCost: 0 };
  }

  const h = tradingState.holdings[activeStock];
  const totalShares = h.shares + quantity;
  h.avgCost = Math.round((h.avgCost * h.shares + pricePence * quantity) / totalShares);
  h.shares = totalShares;

  tradingState.tradeLog.push({
    action: 'buy',
    ticker: activeStock,
    shares: quantity,
    price: pricePence,
    total: totalCost,
    day: Math.floor(currentTick / TICKS_PER_DAY),
    tick: currentTick,
  });

  showToast(`Bought ${quantity}x ${STOCKS[activeStock].name} for ${formatCurrency(totalCost)}`, 'success');
  renderTradeLog();
  updateTradingUI();
}

function executeSell() {
  if (!tradingState || tradingState.isComplete) return;
  const { activeStock, currentTick, priceHistories, quantity, holdings } = tradingState;

  if (!holdings[activeStock] || holdings[activeStock].shares < quantity) {
    showToast('Not enough shares to sell!', 'error');
    return;
  }

  const pricePence = Math.round(priceHistories[activeStock][currentTick] * 100);
  const totalSale = pricePence * quantity;

  tradingState.cash += totalSale;
  holdings[activeStock].shares -= quantity;

  if (holdings[activeStock].shares === 0) {
    holdings[activeStock].avgCost = 0;
  }

  tradingState.tradeLog.push({
    action: 'sell',
    ticker: activeStock,
    shares: quantity,
    price: pricePence,
    total: totalSale,
    day: Math.floor(currentTick / TICKS_PER_DAY),
    tick: currentTick,
  });

  showToast(`Sold ${quantity}x ${STOCKS[activeStock].name} for ${formatCurrency(totalSale)}`, 'success');
  renderTradeLog();
  updateTradingUI();
}

// ── End of Week ──────────────────────────────────────
function endTrading() {
  tradingState.isComplete = true;

  // Calculate final portfolio value
  let portfolioValue = tradingState.cash;
  tradingState.selectedStocks.forEach(ticker => {
    if (tradingState.holdings[ticker] && tradingState.holdings[ticker].shares > 0) {
      const finalPrice = Math.round(tradingState.priceHistories[ticker][tradingState.totalTicks - 1] * 100);
      portfolioValue += tradingState.holdings[ticker].shares * finalPrice;
    }
  });

  const profitLoss = portfolioValue - STARTING_CASH;
  const plPercent = (profitLoss / STARTING_CASH) * 100;

  document.getElementById('result-final').textContent = formatCurrency(portfolioValue);
  const plEl = document.getElementById('result-pl');
  plEl.textContent = `${profitLoss >= 0 ? '+' : ''}${formatCurrency(Math.abs(profitLoss))} (${profitLoss >= 0 ? '+' : ''}${plPercent.toFixed(1)}%)`;
  plEl.style.color = profitLoss >= 0 ? 'var(--accent)' : 'var(--red)';

  let message = '';
  if (profitLoss > 5000) {
    message = "Excellent work! You've shown great instincts for reading the market. Remember — real markets are much more unpredictable, but the principles of buying low and selling high always apply.";
  } else if (profitLoss > 0) {
    message = "Nice! You made a profit, even if modest. In real trading, consistent small gains are often better than chasing big wins. You're learning the right approach!";
  } else if (profitLoss === 0) {
    message = "Breaking even is actually not bad for a beginner! You preserved your capital, which is rule #1 of investing. Many professional traders wish they could say the same.";
  } else if (profitLoss > -5000) {
    message = "A small loss is a great teacher. Most first-time traders lose money — the important thing is understanding why. Review your trade log to see what you might do differently.";
  } else {
    message = "Tough week! But remember, this is exactly why we practice with dummy money. Real markets are risky, and this experience will help you make better decisions in the future.";
  }

  document.getElementById('result-message').textContent = message;

  // Show results with slight delay
  setTimeout(() => {
    document.getElementById('results-overlay').classList.add('visible');
  }, 500);

  updateTradingUI();
}

// ── Event Listeners ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Quantity controls
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (tradingState && tradingState.quantity > 1) {
      tradingState.quantity--;
      updateTradingUI();
    }
  });

  document.getElementById('qty-plus').addEventListener('click', () => {
    if (tradingState) {
      tradingState.quantity++;
      updateTradingUI();
    }
  });

  // Buy/Sell
  document.getElementById('btn-buy').addEventListener('click', executeBuy);
  document.getElementById('btn-sell').addEventListener('click', executeSell);

  // Results overlay buttons
  document.getElementById('result-restart').addEventListener('click', () => {
    document.getElementById('results-overlay').classList.remove('visible');
    stopAutoPlay();
    if (tradingState) {
      initTrading(tradingState.selectedStocks);
    }
  });

  document.getElementById('result-back').addEventListener('click', () => {
    document.getElementById('results-overlay').classList.remove('visible');
    stopAutoPlay();
    tradingState = null;
    // Navigate back to scenarios
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-scenarios').classList.add('active');
    document.getElementById('bottom-nav').style.display = '';
    // Reset stock selection
    document.querySelectorAll('.stock-option').forEach(opt => opt.classList.remove('selected'));
    const startBtn = document.getElementById('start-trading-btn');
    startBtn.disabled = true;
    startBtn.classList.add('disabled');
  });
});
