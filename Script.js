let candles = [];
let trendlines = [];
let supportResistanceLevels = [];
let rangeZones = [];
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let lastOffsetX = 0;
let lastOffsetY = 0;
let currentPrice = null;
let zoomLevel = 1.0;
let isUpdating = false;
let rsiValue = 50;
let blinkState = false;
let patternDirection = null;
let detectedPatternName = null;
let patternDetectionTime = null;
let pattern15mDirection = null;
let detectedPattern15mName = null;
let pattern15mDetectionTime = null;
let rsiLevelMarkers = [];
let patternLines = [];
let tablePosition = null;
let isDraggingTable = false;
let tableDragStartTime = 0;
let tableDragTimeout = null;
let alertAudio = null;
let currentNotification = null;
let lastAlertLevel = null;
let maSignal = 'neutral';
let fastMA = [];
let slowMA = [];
let volumeProfileLines = [];
let wakeLock = null;
let keepAliveVideo = null;

const CHART_API = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=280';
const RSI_API = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=30m&limit=100';
const PATTERN_API = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=55';
const PATTERN_15M_API = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=15m&limit=20';
const FAST_MA_PERIOD = 10;
const SLOW_MA_PERIOD = 20;
const VP_ROW_SIZE = 19;
const VP_SECTION_SIZE = 70;
const VP_PROXIMITY_THRESHOLD = 0.005;

const RANGE_COLORS = [
  'rgba(255,192,203,0.15)',
  'rgba(173,216,230,0.15)',
  'rgba(255,255,224,0.15)',
  'rgba(221,160,221,0.15)',
  'rgba(152,251,152,0.15)',
  'rgba(255,218,185,0.15)'
];

const RSI_LEVELS = [
  { target: 82, tolerance: 1 },
  { target: 70, tolerance: 1 },
  { target: 50, tolerance: 1 },
  { target: 30, tolerance: 1 },
  { target: 18, tolerance: 1 }
];

const RSI_TARGET_LEVELS = [82, 70, 30, 18];

const PATTERN_TYPES = {
  'Bearish Double Top': 'reversal',
  'Bullish Double Bottom': 'reversal',
  'Bearish Head and Shoulders': 'reversal',
  'Bullish Inverted Head and Shoulders': 'reversal',
  'Bearish Rising Wedge': 'reversal',
  'Bullish Falling Wedge': 'reversal',
  'Ascending Triangle': 'continuation',
  'Descending Triangle': 'continuation',
  'Symmetrical Triangle': 'continuation',
  'Bullish Flag Pattern': 'continuation',
  'Bearish Flag Pattern': 'continuation',
  'Bullish Pennant Pattern': 'continuation',
  'Bearish Pennant Pattern': 'continuation',
  'Bearish Triple Top': 'reversal',
  'Bullish Triple Bottom': 'reversal',
  'Bullish Expanding Triangle': 'continuation',
  'Bearish Expanding Triangle': 'continuation'
};

function createInvisibleVideo() {
  try {
    var video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.style.position = 'fixed';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.01';

    var source = document.createElement('source');
    source.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAABzHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGIAAAQAAAEAAAAAA0ttZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAADwAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAM2bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAC9nN0YmwAAACyc3RzZAAAAAAAAAABAAAAomF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAACAAABAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAwYXZjQwFkAAr/4QAYZ2QACqzZQJgz5eEAAAMAAQAAAwBkDxYtlgEABmjr48siwAAAABhzdHRzAAAAAAAAAAEAAAABAAACAAAAAAQc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAACtwAAAAEAAAAUc3RjbwAAAAAAAAABAAAAMAAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTguNDUuMTAw';
    source.type = 'video/mp4';

    video.appendChild(source);
    document.body.appendChild(video);

    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        video.loop = true;
        console.log('Video invisibile avviato per keep-alive');
      }).catch(function (e) {
        console.log('Impossibile avviare video:', e);
      });
    }

    return video;
  } catch (e) {
    console.log('Errore creazione video:', e);
    return null;
  }
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', function () {
        console.log('Wake Lock rilasciato');
      });
      console.log('Wake Lock attivato');
      return true;
    }
  } catch (err) {
    console.log('Wake Lock non disponibile, uso metodo alternativo');
    keepAliveVideo = createInvisibleVideo();
    return false;
  }
}

document.addEventListener('visibilitychange', async function () {
  if (document.visibilityState === 'visible') {
    if (wakeLock === null && !keepAliveVideo) {
      await requestWakeLock();
    }
  }
});

function showNotificationOverlay() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;

  var overlay = document.getElementById('notificationOverlay');
  if (overlay) overlay.style.display = 'block';
}

function hideNotificationOverlay() {
  var overlay = document.getElementById('notificationOverlay');
  if (overlay) overlay.style.display = 'none';
}

function initNotificationConsent() {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    showNotificationOverlay();
  }
}

function enableNotifications() {
  if (!('Notification' in window)) return;

  Notification.requestPermission().then(function (permission) {
    console.log('Permesso notifiche:', permission);

    if (permission === 'granted') {
      hideNotificationOverlay();
      showTestNotification();
    } else {
      hideNotificationOverlay();
    }
  });
}

function showTestNotification() {
  if (Notification.permission === 'granted') {
    new Notification('Sistema Notifiche Attivo', {
      body: 'Le notifiche sono state abilitate correttamente',
      silent: true
    });
  }
}

function keepAlive() {
  setInterval(function () {
    try {
      fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' }).catch(function () {});
      var img = new Image();
      img.src = '/favicon.ico?' + Date.now();
    } catch (e) {
      console.log('Keep-alive ping:', e);
    }
  }, 25000);
}

function calculateMovingAverage(prices, period) {
  var ma = [];
  for (var i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ma.push(null);
    } else {
      var sum = 0;
      for (var j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      ma.push(sum / period);
    }
  }
  return ma;
}

function detectMACrossover(fMA, sMA) {
  if (fMA.length < 2 || sMA.length < 2) return 'neutral';

  var currentFast = fMA[fMA.length - 1];
  var currentSlow = sMA[sMA.length - 1];
  var previousFast = fMA[fMA.length - 2];
  var previousSlow = sMA[sMA.length - 2];

  if (currentFast === null || currentSlow === null || previousFast === null || previousSlow === null) {
    return 'neutral';
  }

  if (previousFast <= previousSlow && currentFast > currentSlow) {
    return 'buy';
  }
  if (previousFast >= previousSlow && currentFast < currentSlow) {
    return 'sell';
  }
  if (currentFast > currentSlow) {
    return 'buy';
  } else if (currentFast < currentSlow) {
    return 'sell';
  }
  return 'neutral';
}

function countPriceReactions(price, sectionCandles, tolerance) {
  var reactions = 0;

  for (var i = 1; i < sectionCandles.length; i++) {
    var prevCandle = sectionCandles[i - 1];
    var currentCandle = sectionCandles[i];
    var priceTolerance = price * tolerance;

    var touchesPrice =
      (currentCandle.low <= price + priceTolerance && currentCandle.low >= price - priceTolerance) ||
      (currentCandle.high <= price + priceTolerance && currentCandle.high >= price - priceTolerance) ||
      (currentCandle.low < price && currentCandle.high > price);

    if (touchesPrice) {
      var prevDirection = prevCandle.close > prevCandle.open ? 'up' : 'down';
      var currentDirection = currentCandle.close > currentCandle.open ? 'up' : 'down';

      if (prevDirection !== currentDirection) {
        reactions++;
      }

      var bodySize = Math.abs(currentCandle.close - currentCandle.open);
      var totalSize = currentCandle.high - currentCandle.low;

      if (totalSize > 0 && bodySize / totalSize < 0.3) {
        reactions += 0.5;
      }
    }
  }
  return reactions;
}

function filterProximateLines(lines, sectionCandles) {
  if (lines.length === 0) return lines;

  var sortedLines = lines.slice().sort(function (a, b) {
    return a.price - b.price;
  });

  var filtered = [];

  for (var i = 0; i < sortedLines.length; i++) {
    var currentLine = sortedLines[i];
    var shouldKeep = true;
    var indexToReplace = -1;

    for (var j = 0; j < filtered.length; j++) {
      var existingLine = filtered[j];

      if (currentLine.type === existingLine.type) {
        var priceDiff = Math.abs(currentLine.price - existingLine.price) / existingLine.price;

        if (priceDiff < VP_PROXIMITY_THRESHOLD) {
          var currentReactions = countPriceReactions(currentLine.price, sectionCandles, 0.001);
          var existingReactions = countPriceReactions(existingLine.price, sectionCandles, 0.001);

          if (currentReactions > existingReactions) {
            indexToReplace = j;
            shouldKeep = true;
          } else {
            shouldKeep = false;
          }
          break;
        }
      }
    }

    if (indexToReplace >= 0) {
      filtered[indexToReplace] = currentLine;
    } else if (shouldKeep) {
      filtered.push(currentLine);
    }
  }

  return filtered;
}

function calculateVolumeProfile(sectionCandles) {
  if (!sectionCandles || sectionCandles.length === 0) return null;

  var minPrice = Math.min.apply(null, sectionCandles.map(function (c) {
    return c.low;
  }));
  var maxPrice = Math.max.apply(null, sectionCandles.map(function (c) {
    return c.high;
  }));

  var priceRange = maxPrice - minPrice;
  var tickSize = priceRange / VP_ROW_SIZE;
  var volumeAtPrice = new Array(VP_ROW_SIZE).fill(0);
  var totalVolume = 0;
  var totalPriceVolume = 0;

  sectionCandles.forEach(function (candle) {
    var volume = candle.high - candle.low;
    var candleRange = candle.high - candle.low;

    for (var price = candle.low; price <= candle.high; price += tickSize) {
      var index = Math.floor((price - minPrice) / tickSize);

      if (index >= 0 && index < VP_ROW_SIZE) {
        var volumeContribution = volume / (candleRange / tickSize || 1);
        volumeAtPrice[index] += volumeContribution;
        totalVolume += volumeContribution;
        totalPriceVolume += price * volumeContribution;
      }
    }
  });

  var avgVolume = totalVolume / VP_ROW_SIZE;
  var threshold = avgVolume * 1.2;
  var hvnPrices = [];
  var lvnPrices = [];

  for (var i = 0; i < VP_ROW_SIZE; i++) {
    var price = minPrice + (i * tickSize) + (tickSize / 2);

    if (volumeAtPrice[i] > threshold) {
      hvnPrices.push(price);
    } else if (volumeAtPrice[i] < avgVolume * 0.5) {
      lvnPrices.push(price);
    }
  }

  var vwap = totalVolume > 0 ? totalPriceVolume / totalVolume : (minPrice + maxPrice) / 2;

  return {
    hvn: hvnPrices,
    lvn: lvnPrices,
    vwap: vwap
  };
}

function updateVolumeProfileLines() {
  volumeProfileLines = [];
  if (candles.length < VP_SECTION_SIZE) return;

  var sections = 4;

  for (var section = 0; section < sections; section++) {
    var startIdx = section * VP_SECTION_SIZE;
    var endIdx = Math.min(startIdx + VP_SECTION_SIZE, candles.length);
    var sectionCandles = candles.slice(startIdx, endIdx);
    var vpData = calculateVolumeProfile(sectionCandles);

    if (vpData) {
      var tempLines = [];

      vpData.hvn.forEach(function (price) {
        tempLines.push({
          price: price,
          type: 'hvn',
          color: '#FFD700',
          section: section
        });
      });

      vpData.lvn.forEach(function (price) {
        tempLines.push({
          price: price,
          type: 'lvn',
          color: '#FFC0CB',
          section: section
        });
      });

      tempLines.push({
        price: vpData.vwap,
        type: 'vwap',
        color: '#00FF00',
        section: section
      });

      var filteredLines = filterProximateLines(tempLines, sectionCandles);

      for (var fl = 0; fl < filteredLines.length; fl++) {
        volumeProfileLines.push(filteredLines[fl]);
      }
    }
  }
}

function createAlertSound() {
  try {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    gainNode.gain.value = 0.3;

    return {
      audioContext: audioContext,
      oscillator: oscillator,
      gainNode: gainNode
    };
  } catch (e) {
    console.log('AudioContext non disponibile');
    return null;
  }
}

function playAlertSound() {
  if (alertAudio) {
    stopAlertSound();
  }

  alertAudio = createAlertSound();
  if (!alertAudio) return;

  alertAudio.oscillator.start();
  var toggle = true;

  alertAudio.interval = setInterval(function () {
    alertAudio.oscillator.frequency.value = toggle ? 800 : 1000;
    toggle = !toggle;
  }, 300);
}

function stopAlertSound() {
  if (alertAudio) {
    try {
      clearInterval(alertAudio.interval);
      alertAudio.oscillator.stop();
      alertAudio.audioContext.close();
    } catch (e) {
      console.log('Audio gia fermato');
    }
    alertAudio = null;
  }
}

function showRSIAlert(level) {
  if (lastAlertLevel === level) return;
  lastAlertLevel = level;

  var title = '';
  var body = '';
  var icon = '';

  if (level === 82) {
    title = '2 ATTENZIONE 2';
    body = 'RSI livello critico: ' + level;
    icon = String.fromCodePoint(0x1F534);
  } else if (level === 70) {
    title = '1 ATTENZIONE 1';
    body = 'RSI livello: ' + level;
    icon = String.fromCodePoint(0x1F7E0);
  } else if (level === 30) {
    title = '1 ATTENZIONE 1';
    body = 'RSI livello: ' + level;
    icon = String.fromCodePoint(0x1F7E2);
  } else if (level === 18) {
    title = '2 ATTENZIONE 2';
    body = 'RSI livello critico: ' + level;
    icon = String.fromCodePoint(0x1F7E2);
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    playAlertSound();

    if (currentNotification) {
      currentNotification.close();
    }

    try {
      currentNotification = new Notification(icon + ' ' + title, {
        body: body,
        tag: 'rsi-alert-' + level + '-' + Date.now(),
        requireInteraction: true,
        silent: false,
        vibrate: [300, 100, 300],
        renotify: true
      });

      currentNotification.onclick = function () {
        window.focus();
        this.close();
        stopAlertSound();
        currentNotification = null;
      };

      currentNotification.onclose = function () {
        stopAlertSound();
        currentNotification = null;
      };

      currentNotification.onerror = function (e) {
        console.error('Errore notifica:', e);
      };
    } catch (e) {
      console.error('Errore creazione notifica:', e);
    }
  } else {
    console.log('Notifiche non permesse. Stato:', Notification.permission);
  }
}

function checkRSIAlert() {
  for (var i = 0; i < RSI_TARGET_LEVELS.length; i++) {
    var level = RSI_TARGET_LEVELS[i];
    if (Math.abs(rsiValue - level) <= 0.5) {
      showRSIAlert(level);
      break;
    }
  }
}

function saveRSIMarkers() {
  try {
    localStorage.setItem('rsiLevelMarkers', JSON.stringify(rsiLevelMarkers));
  } catch (e) {
    console.log('Errore salvataggio markers');
  }
}

function loadRSIMarkers() {
  try {
    var saved = localStorage.getItem('rsiLevelMarkers');
    if (saved) {
      rsiLevelMarkers = JSON.parse(saved);
    }
  } catch (e) {
    console.log('Errore caricamento markers');
  }
}

function setStatus(msg, isError) {
  var el = document.getElementById('status');
  if (el) {
    el.textContent = msg;
    el.style.background = isError ? '#4a1a1a' : '#2a2a2a';
    el.style.color = isError ? '#ef4444' : 'white';
  }
}

function zoomIn() {
  if (zoomLevel < 3) {
    zoomLevel *= 1.2;
    drawChart();
  }
}

function zoomOut() {
  if (zoomLevel > 0.3) {
    zoomLevel /= 1.2;
    drawChart();
  }
}

async function testAPI() {
  setStatus('Test API...', false);
  try {
    var r = await fetch(CHART_API);
    var d = await r.json();
    setStatus(r.ok && d.length > 0 ? 'API OK' : 'API Error', !r.ok);
  } catch (e) {
    setStatus('Network Error', true);
  }
}

async function fetchCurrentPrice() {
  try {
    var r = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    if (r.ok) {
      var d = await r.json();
      if (d && d.price) {
        var newPrice = parseFloat(d.price);
        checkRSILevelTouch(newPrice);
        currentPrice = newPrice;
      }
    }
  } catch (e) {
    console.error('Price error:', e);
  }
}

function checkRSILevelTouch(price) {
  var lastCandle = candles[candles.length - 1];
  if (!lastCandle) return;

  for (var i = 0; i < RSI_TARGET_LEVELS.length; i++) {
    var level = RSI_TARGET_LEVELS[i];

    if (Math.abs(rsiValue - level) <= 0.5) {
      var exists = rsiLevelMarkers.some(function (m) {
        return Math.abs(m.price - price) < 1 && m.candleIndex === candles.length - 1;
      });

      if (!exists) {
        rsiLevelMarkers.push({
          price: price,
          candleIndex: candles.length - 1,
          candleTime: lastCandle.time.getTime(),
          rsiLevel: level,
          hasLine: false
        });
        saveRSIMarkers();
      }
    }
  }

  var oldestCandleTime = candles[0].time.getTime();
  rsiLevelMarkers = rsiLevelMarkers.filter(function (m) {
    return m.candleTime >= oldestCandleTime;
  });
  saveRSIMarkers();
}

function calculateRSI(prices, period) {
  if (prices.length < period + 1) return 50;

  var gains = 0;
  var losses = 0;

  for (var i = 1; i <= period; i++) {
    var ch = prices[i] - prices[i - 1];
    if (ch > 0) gains += ch;
    else losses -= ch;
  }

  var ag = gains / period;
  var al = losses / period;

  for (var i = period + 1; i < prices.length; i++) {
    var ch = prices[i] - prices[i - 1];
    if (ch > 0) {
      ag = (ag * (period - 1) + ch) / period;
      al = (al * (period - 1)) / period;
    } else {
      ag = (ag * (period - 1)) / period;
      al = (al * (period - 1) - ch) / period;
    }
  }

  if (al === 0) return 100;
  return 100 - (100 / (1 + ag / al));
}

async function fetchRSIData() {
  try {
    var r = await fetch(RSI_API);
    if (r.ok) {
      var d = await r.json();
      var closes = d.map(function (c) {
        return parseFloat(c[4]);
      });

      var oldRSI = rsiValue;
      rsiValue = calculateRSI(closes, 14);

      if (Math.abs(oldRSI - rsiValue) > 0.1) {
        checkRSIAlert();
      }
    }
  } catch (e) {
    console.error('RSI error:', e);
  }
}

function detectPatterns(cndls) {
  if (cndls.length < 10) return { direction: null, name: null };

  var highs = cndls.map(function (c) { return c.high; });
  var lows = cndls.map(function (c) { return c.low; });
  var closes = cndls.map(function (c) { return c.close; });

  if (detectDoubleTop(highs, closes)) return { direction: 'down', name: 'Bearish Double Top' };
  if (detectDoubleBottom(lows, closes)) return { direction: 'up', name: 'Bullish Double Bottom' };
  if (detectHeadAndShoulders(highs, closes)) return { direction: 'down', name: 'Bearish Head and Shoulders' };
  if (detectInvertedHeadAndShoulders(lows, closes)) return { direction: 'up', name: 'Bullish Inverted Head and Shoulders' };
  if (detectRisingWedge(highs, lows)) return { direction: 'down', name: 'Bearish Rising Wedge' };
  if (detectFallingWedge(highs, lows)) return { direction: 'up', name: 'Bullish Falling Wedge' };
  if (detectAscendingTriangle(highs, lows)) return { direction: 'up', name: 'Ascending Triangle' };
  if (detectDescendingTriangle(highs, lows)) return { direction: 'down', name: 'Descending Triangle' };

  var symTriangle = detectSymmetricalTriangle(highs, lows, closes);
  if (symTriangle) return { direction: symTriangle, name: 'Symmetrical Triangle' };

  if (detectBullishFlag(highs, lows, closes)) return { direction: 'up', name: 'Bullish Flag Pattern' };
  if (detectBearishFlag(highs, lows, closes)) return { direction: 'down', name: 'Bearish Flag Pattern' };

  var pennant = detectPennant(highs, lows, closes);
  if (pennant) {
    return {
      direction: pennant,
      name: pennant === 'up' ? 'Bullish Pennant Pattern' : 'Bearish Pennant Pattern'
    };
  }

  if (detectTripleTop(highs, closes)) return { direction: 'down', name: 'Bearish Triple Top' };
  if (detectTripleBottom(lows, closes)) return { direction: 'up', name: 'Bullish Triple Bottom' };

  var expanding = detectExpandingTriangle(highs, lows, closes);
  if (expanding) {
    return {
      direction: expanding,
      name: expanding === 'up' ? 'Bullish Expanding Triangle' : 'Bearish Expanding Triangle'
    };
  }

  return { direction: null, name: null };
}

function detectDoubleTop(highs, closes) {
  var len = highs.length;
  if (len < 15) return false;

  var recentHighs = highs.slice(-15);
  var maxHigh = Math.max.apply(null, recentHighs);
  var peaks = [];

  for (var i = 1; i < recentHighs.length - 1; i++) {
    if (recentHighs[i] > recentHighs[i - 1] && recentHighs[i] > recentHighs[i + 1]) {
      if (Math.abs(recentHighs[i] - maxHigh) / maxHigh < 0.02) {
        peaks.push(i);
      }
    }
  }

  if (peaks.length >= 2) {
    var lastPeak = peaks[peaks.length - 1];
    return closes[len - 1] < recentHighs[lastPeak] * 0.98;
  }
  return false;
}

function detectDoubleBottom(lows, closes) {
  var len = lows.length;
  if (len < 15) return false;

  var recentLows = lows.slice(-15);
  var minLow = Math.min.apply(null, recentLows);
  var valleys = [];

  for (var i = 1; i < recentLows.length - 1; i++) {
    if (recentLows[i] < recentLows[i - 1] && recentLows[i] < recentLows[i + 1]) {
      if (Math.abs(recentLows[i] - minLow) / minLow < 0.02) {
        valleys.push(i);
      }
    }
  }

  if (valleys.length >= 2) {
    var lastValley = valleys[valleys.length - 1];
    return closes[len - 1] > recentLows[lastValley] * 1.02;
  }
  return false;
}

function detectHeadAndShoulders(highs, closes) {
  var len = highs.length;
  if (len < 20) return false;

  var recentHighs = highs.slice(-20);
  var peaks = [];

  for (var i = 2; i < recentHighs.length - 2; i++) {
    if (
      recentHighs[i] > recentHighs[i - 1] &&
      recentHighs[i] > recentHighs[i + 1] &&
      recentHighs[i] > recentHighs[i - 2] &&
      recentHighs[i] > recentHighs[i + 2]
    ) {
      peaks.push({ index: i, value: recentHighs[i] });
    }
  }

  if (peaks.length >= 3) {
    var sorted = peaks.slice().sort(function (a, b) {
      return b.value - a.value;
    });

    var head = sorted[0];
    var shoulders = sorted.slice(1, 3);

    if (Math.abs(shoulders[0].value - shoulders[1].value) / shoulders[0].value < 0.02) {
      var neckline = Math.min(shoulders[0].value, shoulders[1].value);
      return closes[len - 1] < neckline;
    }
  }
  return false;
}

function detectInvertedHeadAndShoulders(lows, closes) {
  var len = lows.length;
  if (len < 20) return false;

  var recentLows = lows.slice(-20);
  var valleys = [];

  for (var i = 2; i < recentLows.length - 2; i++) {
    if (
      recentLows[i] < recentLows[i - 1] &&
      recentLows[i] < recentLows[i + 1] &&
      recentLows[i] < recentLows[i - 2] &&
      recentLows[i] < recentLows[i + 2]
    ) {
      valleys.push({ index: i, value: recentLows[i] });
    }
  }

  if (valleys.length >= 3) {
    var sorted = valleys.slice().sort(function (a, b) {
      return a.value - b.value;
    });

    var head = sorted[0];
    var shoulders = sorted.slice(1, 3);

    if (Math.abs(shoulders[0].value - shoulders[1].value) / shoulders[0].value < 0.02) {
      var neckline = Math.max(shoulders[0].value, shoulders[1].value);
      return closes[len - 1] > neckline;
    }
  }
  return false;
}

function detectRisingWedge(highs, lows) {
  if (highs.length < 15) return false;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var highSlope = calculateSlope(recentHighs);
  var lowSlope = calculateSlope(recentLows);

  return highSlope > 0 && lowSlope > 0 && lowSlope > highSlope * 0.7;
}

function detectFallingWedge(highs, lows) {
  if (highs.length < 15) return false;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var highSlope = calculateSlope(recentHighs);
  var lowSlope = calculateSlope(recentLows);

  return highSlope < 0 && lowSlope < 0 && Math.abs(lowSlope) > Math.abs(highSlope) * 0.7;
}

function detectAscendingTriangle(highs, lows) {
  if (highs.length < 15) return false;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var highSlope = calculateSlope(recentHighs);
  var lowSlope = calculateSlope(recentLows);

  return Math.abs(highSlope) < 0.0001 && lowSlope > 0.0005;
}

function detectDescendingTriangle(highs, lows) {
  if (highs.length < 15) return false;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var highSlope = calculateSlope(recentHighs);
  var lowSlope = calculateSlope(recentLows);

  return highSlope < -0.0005 && Math.abs(lowSlope) < 0.0001;
}

function detectSymmetricalTriangle(highs, lows, closes) {
  if (highs.length < 15) return null;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var highSlope = calculateSlope(recentHighs);
  var lowSlope = calculateSlope(recentLows);

  if (highSlope < -0.0003 && lowSlope > 0.0003) {
    var lastClose = closes[closes.length - 1];
    var midpoint = (recentHighs[recentHighs.length - 1] + recentLows[recentLows.length - 1]) / 2;

    return lastClose > midpoint ? 'up' : 'down';
  }
  return null;
}

function detectBullishFlag(highs, lows, closes) {
  if (closes.length < 20) return false;

  var firstHalf = closes.slice(-20, -10);
  var secondHalf = closes.slice(-10);

  var firstSlope = calculateSlope(firstHalf);
  var secondSlope = calculateSlope(secondHalf);

  return firstSlope > 0.001 && secondSlope < -0.0003 && secondSlope > -0.001;
}

function detectBearishFlag(highs, lows, closes) {
  if (closes.length < 20) return false;

  var firstHalf = closes.slice(-20, -10);
  var secondHalf = closes.slice(-10);

  var firstSlope = calculateSlope(firstHalf);
  var secondSlope = calculateSlope(secondHalf);

  return firstSlope < -0.001 && secondSlope > 0.0003 && secondSlope < 0.001;
}

function detectPennant(highs, lows, closes) {
  if (closes.length < 20) return null;

  var poleStart = closes.slice(-20, -15);
  var pennantHighs = highs.slice(-10);
  var pennantLows = lows.slice(-10);

  var poleSlope = calculateSlope(poleStart);
  var highSlope = calculateSlope(pennantHighs);
  var lowSlope = calculateSlope(pennantLows);

  if (Math.abs(highSlope) < 0.0005 && Math.abs(lowSlope) < 0.0005) {
    return poleSlope > 0 ? 'up' : 'down';
  }
  return null;
}

function detectTripleTop(highs, closes) {
  var len = highs.length;
  if (len < 20) return false;

  var recentHighs = highs.slice(-20);
  var maxHigh = Math.max.apply(null, recentHighs);
  var peaks = [];

  for (var i = 2; i < recentHighs.length - 2; i++) {
    if (recentHighs[i] > recentHighs[i - 1] && recentHighs[i] > recentHighs[i + 1]) {
      if (Math.abs(recentHighs[i] - maxHigh) / maxHigh < 0.02) {
        peaks.push(i);
      }
    }
  }
  return peaks.length >= 3 && closes[len - 1] < maxHigh * 0.97;
}

function detectTripleBottom(lows, closes) {
  var len = lows.length;
  if (len < 20) return false;

  var recentLows = lows.slice(-20);
  var minLow = Math.min.apply(null, recentLows);
  var valleys = [];

  for (var i = 2; i < recentLows.length - 2; i++) {
    if (recentLows[i] < recentLows[i - 1] && recentLows[i] < recentLows[i + 1]) {
      if (Math.abs(recentLows[i] - minLow) / minLow < 0.02) {
        valleys.push(i);
      }
    }
  }
  return valleys.length >= 3 && closes[len - 1] > minLow * 1.03;
}

function detectExpandingTriangle(highs, lows, closes) {
  if (highs.length < 15) return null;

  var recentHighs = highs.slice(-15);
  var recentLows = lows.slice(-15);

  var range = recentHighs.map(function (h, i) {
    return h - recentLows[i];
  });

  var rangeSlope = calculateSlope(range);

  if (rangeSlope > 0.0005) {
    var lastClose = closes[closes.length - 1];
    var midpoint = (recentHighs[recentHighs.length - 1] + recentLows[recentLows.length - 1]) / 2;

    return lastClose > midpoint ? 'up' : 'down';
  }
  return null;
}

function calculateSlope(values) {
  var n = values.length;
  if (n < 2) return 0;

  var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (var i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  var denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

function findLastResistanceSupport(direction) {
  if (!candles || candles.length < 10 || !currentPrice) return null;

  var recentCandles = candles.slice(-100);
  var tolerance = 0.005;

  if (direction === 'up') {
    var relevantCandles = recentCandles.filter(function (c) {
      return c.high < currentPrice;
    });

    var priceGroups = {};

    relevantCandles.forEach(function (candle) {
      var price = candle.high;
      var foundGroup = false;

      for (var groupPrice in priceGroups) {
        if (Math.abs(price - parseFloat(groupPrice)) / parseFloat(groupPrice) < tolerance) {
          priceGroups[groupPrice].count++;
          priceGroups[groupPrice].totalPrice += price;
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        priceGroups[price] = { count: 1, totalPrice: price };
      }
    });

    var bestResistance = null;
    var maxBounces = 0;

    for (var groupPrice in priceGroups) {
      var group = priceGroups[groupPrice];
      if (group.count >= 2 && group.count > maxBounces) {
        maxBounces = group.count;
        bestResistance = group.totalPrice / group.count;
      }
    }
    return bestResistance;
  } else {
    var relevantCandles = recentCandles.filter(function (c) {
      return c.low > currentPrice;
    });

    var priceGroups = {};

    relevantCandles.forEach(function (candle) {
      var price = candle.low;
      var foundGroup = false;

      for (var groupPrice in priceGroups) {
        if (Math.abs(price - parseFloat(groupPrice)) / parseFloat(groupPrice) < tolerance) {
          priceGroups[groupPrice].count++;
          priceGroups[groupPrice].totalPrice += price;
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        priceGroups[price] = { count: 1, totalPrice: price };
      }
    });

    var bestSupport = null;
    var maxBounces = 0;

    for (var groupPrice in priceGroups) {
      var group = priceGroups[groupPrice];
      if (group.count >= 2 && group.count > maxBounces) {
        maxBounces = group.count;
        bestSupport = group.totalPrice / group.count;
      }
    }
    return bestSupport;
  }
}

function activatePatternLines() {
  if (!detectedPatternName || !currentPrice) return;

  var resistanceSupport = findLastResistanceSupport(patternDirection);

  if (resistanceSupport) {
    patternLines = [{
      price: resistanceSupport,
      color: '#00FF00',
      type: 'target'
    }];
  } else {
    var fallbackPrice = patternDirection === 'up' ? currentPrice * 1.05 : currentPrice * 0.95;

    patternLines = [{
      price: fallbackPrice,
      color: '#00FF00',
      type: 'target'
    }];
  }
  drawChart();
}

async function fetchPatternData() {
  try {
    var r = await fetch(PATTERN_API);
    if (r.ok) {
      var d = await r.json();

      var patternCandles = d.map(function (c) {
        return {
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4])
        };
      });

      var rawResult = detectPatterns(patternCandles);
      var result = rawResult && typeof rawResult === 'object' ? rawResult : { direction: null, name: null };

      var newDirection = result.direction;
      var newName = result.name;

      if (newDirection !== patternDirection || newName !== detectedPatternName) {
        patternDirection = newDirection;
        detectedPatternName = newName;
        patternDetectionTime = Date.now();
        patternLines = [];
      }
    }
  } catch (e) {
    console.error('Pattern detection error:', e);
  }
}

async function fetchPattern15mData() {
  try {
    var r = await fetch(PATTERN_15M_API);
    if (r.ok) {
      var d = await r.json();

      var pattern15mCandles = d.map(function (c) {
        return {
          high: parseFloat(c[2]),
          low: parseFloat(c[3]),
          close: parseFloat(c[4])
        };
      });

      var rawResult = detectPatterns(pattern15mCandles);
      var result = rawResult && typeof rawResult === 'object' ? rawResult : { direction: null, name: null };

      var newDirection = result.direction;
      var newName = result.name;

      if (newDirection !== pattern15mDirection || newName !== detectedPattern15mName) {
        pattern15mDirection = newDirection;
        detectedPattern15mName = newName;
        pattern15mDetectionTime = Date.now();
      }
    }
  } catch (e) {
    console.error('Pattern 15m detection error:', e);
  }
}

async function fetchFromBinance() {
  var r = await fetch(CHART_API);
  if (!r.ok) throw new Error('API Error');

  var d = await r.json();
  if (!Array.isArray(d)) throw new Error('Invalid Binance response');

  return d.map(function (c) {
    return {
      time: new Date(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      isBullish: parseFloat(c[4]) > parseFloat(c[1]),
      isBearish: parseFloat(c[4]) < parseFloat(c[1])
    };
  });
}

function calculateSupportResistance(cndls) {
  var tol = 0.002;
  var bp = [];
  var wp = [];

  cndls.forEach(function (c) {
    bp.push(c.open, c.close);
    wp.push(c.high, c.low);
  });

  var cluster = function (ps, t) {
    var cls = [];
    var sp = ps.slice().sort(function (a, b) {
      return a - b;
    });

    sp.forEach(function (p) {
      var found = false;

      for (var i = 0; i < cls.length; i++) {
        var cl = cls[i];
        var avg = cl.sum / cl.count;

        if (Math.abs(p - avg) / avg < tol) {
          cl.sum += p;
          cl.count++;
          found = true;
          break;
        }
      }

      if (!found) cls.push({ sum: p, count: 1 });
    });

    return cls
      .map(function (c) {
        return { price: c.sum / c.count, count: c.count };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 8)
      .map(function (c) {
        return { price: c.price, type: t };
      });
  };

  var bodyCluster = cluster(bp, 'body');
  var wickCluster = cluster(wp, 'wick');

  return bodyCluster.concat(wickCluster);
}

function detectRangeZones(cndls, lvls) {
  var zns = [];
  var sl = lvls.slice().sort(function (a, b) {
    return a.price - b.price;
  });

  for (var i = 0; i < sl.length - 1; i++) {
    for (var j = i + 1; j < sl.length; j++) {
      var ll = sl[i].price;
      var ul = sl[j].price;
      var rh = ul - ll;

      if (rh / ll < 0.005 || rh / ll > 0.08) continue;

      var bc = 0;
      var lbt = null;
      var tt = 0.003;

      for (var k = 0; k < cndls.length; k++) {
        var c = cndls[k];
        var tu = Math.abs(c.high - ul) / ul <= tt;
        var tl = Math.abs(c.low - ll) / ll <= tt;

        if (tu && lbt !== 'upper') {
          bc++;
          lbt = 'upper';
        } else if (tl && lbt !== 'lower') {
          bc++;
          lbt = 'lower';
        }
      }

      if (bc >= 14) {
        var ov = zns.some(function (z) {
          return (ll >= z.lower && ll <= z.upper) || (ul >= z.lower && ul <= z.upper);
        });

        if (!ov) zns.push({ lower: ll, upper: ul, bounces: bc });
      }
    }
  }

  var sorted = zns.sort(function (a, b) {
    return a.lower - b.lower;
  });

  for (var i = 0; i < sorted.length; i++) {
    sorted[i].colorIndex = i % RANGE_COLORS.length;
  }

  return sorted;
}

function detectFalseBreakouts(cndls, zns) {
  var fbi = new Set();

  zns.forEach(function (zn) {
    var rh = zn.upper - zn.lower;
    var mbd = rh * 1.5;
    var ir = false;
    var bc = [];

    for (var i = 0; i < cndls.length; i++) {
      var c = cndls[i];
      var ins = c.low >= zn.lower && c.high <= zn.upper;

      if (ir && c.high > zn.upper) {
        bc = [i];

        for (var j = i + 1; j < cndls.length; j++) {
          var nc = cndls[j];

          if (nc.low <= zn.upper) {
            var highValues = bc.map(function (idx) {
              return cndls[idx].high;
            });

            var mp = Math.max.apply(null, highValues);
            if (mp - zn.upper <= mbd) {
              bc.forEach(function (idx) {
                fbi.add(idx);
              });
            }
            break;
          }

          bc.push(j);
          if (nc.high - zn.upper > mbd) break;
        }
      }

      if (ir && c.low < zn.lower) {
        bc = [i];

        for (var j = i + 1; j < cndls.length; j++) {
          var nc = cndls[j];

          if (nc.high >= zn.lower) {
            var lowValues = bc.map(function (idx) {
              return cndls[idx].low;
            });

            var mp = Math.min.apply(null, lowValues);
            if (zn.lower - mp <= mbd) {
              bc.forEach(function (idx) {
                fbi.add(idx);
              });
            }
            break;
          }

          bc.push(j);
          if (zn.lower - nc.low > mbd) break;
        }
      }
      ir = ins;
    }
  });

  return fbi;
}

function shouldBlink(circleIndex) {
  var level = RSI_LEVELS[circleIndex];
  var target = level.target;
  var tolerance = level.tolerance;

  if (circleIndex <= 1) {
    return rsiValue >= target - tolerance && rsiValue <= target + tolerance;
  } else if (circleIndex === 2) {
    return Math.abs(rsiValue - target) <= tolerance;
  } else {
    return rsiValue <= target + tolerance && rsiValue >= target - tolerance;
  }
}

async function fetchData() {
  if (isUpdating) return;

  try {
    isUpdating = true;

    var cd = await fetchFromBinance();
    await fetchCurrentPrice();
    await fetchRSIData();
    await fetchPatternData();
    await fetchPattern15mData();

    if (!cd || cd.length === 0) throw new Error('No data');

    var ifl = candles.length === 0;
    candles = cd;

    var closePrices = candles.map(function (c) {
      return c.close;
    });

    fastMA = calculateMovingAverage(closePrices, FAST_MA_PERIOD);
    slowMA = calculateMovingAverage(closePrices, SLOW_MA_PERIOD);
    maSignal = detectMACrossover(fastMA, slowMA);

    updateVolumeProfileLines();
    supportResistanceLevels = calculateSupportResistance(candles);
    rangeZones = detectRangeZones(candles, supportResistanceLevels);

    var fbi = detectFalseBreakouts(candles, rangeZones);
    trendlines = [];

    for (var i = 0; i < candles.length - 1; i++) {
      var cu = candles[i];
      var nx = candles[i + 1];
      var ifb = fbi.has(i) || fbi.has(i + 1);

      if (cu.isBearish && nx.isBearish) {
        var gu = nx.high > cu.high;
        trendlines.push({
          type: 'bearish',
          startIdx: i,
          endIdx: i + 1,
          startPrice: cu.high,
          endPrice: nx.high,
          color: gu ? '#8B4513' : '#ef4444',
          direction: gu ? 'up' : 'down',
          isFalseBreakout: ifb
        });
      }

      if (cu.isBullish && nx.isBullish) {
        var gd = nx.low < cu.low;
        trendlines.push({
          type: 'bullish',
          startIdx: i,
          endIdx: i + 1,
          startPrice: cu.low,
          endPrice: nx.low,
          color: gd ? '#00BFFF' : '#22c55e',
          direction: gd ? 'down' : 'up',
          isFalseBreakout: ifb
        });
      }
    }

    if (ifl) {
      offsetX = 0;
      offsetY = 0;
      lastOffsetX = 0;
      lastOffsetY = 0;
      zoomLevel = 1;

      loadRSIMarkers();
      await requestWakeLock();
      initNotificationConsent();
      keepAlive();

      createZoomButtons();
      startTimer();
      startBlinkTimer();
      startPatternUpdateTimer();
      startPattern15mUpdateTimer();
      startPatternClearTimer();
      startVolumeProfileTimer();
      setupChartInteraction();
    }

    updateUI();
    drawChart();

    if (ifl) setStatus('Caricato! RSI: ' + rsiValue.toFixed(2), false);
  } catch (e) {
    setStatus('Errore caricamento', true);
    console.error(e);
  } finally {
    isUpdating = false;
  }
}

function startTimer() {
  setInterval(function () {
    drawChart();
  }, 1000);
}

function startBlinkTimer() {
  setInterval(function () {
    blinkState = !blinkState;
    drawChart();
  }, 500);
}

function startPatternUpdateTimer() {
  setInterval(async function () {
    await fetchPatternData();
    drawChart();
  }, 600000);
}

function startPattern15mUpdateTimer() {
  setInterval(async function () {
    await fetchPattern15mData();
    drawChart();
  }, 600000);
}

function startPatternClearTimer() {
  setInterval(function () {
    if (patternDetectionTime && Date.now() - patternDetectionTime >= 7200000) {
      detectedPatternName = null;
      patternDirection = null;
      patternDetectionTime = null;
    }
    if (pattern15mDetectionTime && Date.now() - pattern15mDetectionTime >= 7200000) {
      detectedPattern15mName = null;
      pattern15mDirection = null;
      pattern15mDetectionTime = null;
    }
    drawChart();
  }, 60000);
}

function startVolumeProfileTimer() {
  setInterval(function () {
    updateVolumeProfileLines();
    drawChart();
  }, 3600000);
}

function createZoomButtons() {
  var ec = document.getElementById('zoomButtonsContainer');
  if (ec) ec.remove();

  var cv = document.getElementById('chartCanvas');
  if (!cv) return;

  var ct = document.createElement('div');
  ct.id = 'zoomButtonsContainer';
  ct.style.cssText = 'position:absolute;top:15px;right:90px;display:flex;gap:8px;z-index:1000;';

  var zi = document.createElement('button');
  zi.innerHTML = '<span style="color:#22c55e;font-size:20px;font-weight:bold;">+</span>';
  zi.style.cssText = 'width:40px;height:40px;background:rgba(80,80,80,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;';
  zi.onclick = zoomIn;

  var zo = document.createElement('button');
  zo.innerHTML = '<span style="color:#ef4444;font-size:24px;font-weight:bold;">-</span>';
  zo.style.cssText = 'width:40px;height:40px;background:rgba(80,80,80,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;';
  zo.onclick = zoomOut;

  ct.appendChild(zi);
  ct.appendChild(zo);

  cv.parentElement.style.position = 'relative';
  cv.parentElement.appendChild(ct);
}

function updateUI() {
  if (!candles || candles.length === 0) return;

  var l = candles[candles.length - 1];
  var dp = currentPrice || l.close;

  var e = {
    cp: document.getElementById('currentPrice'),
    hp: document.getElementById('highPrice'),
    lp: document.getElementById('lowPrice'),
    op: document.getElementById('openPrice'),
    bc: document.getElementById('bullishCount'),
    bec: document.getElementById('bearishCount'),
    ut: document.getElementById('updateTime')
  };

  if (e.cp) e.cp.textContent = '$' + dp.toFixed(2);
  if (e.hp) e.hp.textContent = '$' + l.high.toFixed(2);
  if (e.lp) e.lp.textContent = '$' + l.low.toFixed(2);
  if (e.op) e.op.textContent = '$' + l.open.toFixed(2);

  var bu = trendlines.filter(function (t) { return t.type === 'bullish'; }).length;
  var be = trendlines.filter(function (t) { return t.type === 'bearish'; }).length;

  if (e.bc) e.bc.textContent = bu;
  if (e.bec) e.bec.textContent = be;
  if (e.ut) e.ut.textContent = 'Aggiornato: ' + new Date().toLocaleTimeString('it-IT');
}

function setupChartInteraction() {
  var cv = document.getElementById('chartCanvas');
  if (!cv) return;

  cv.addEventListener('mousedown', startDrag);
  cv.addEventListener('mousemove', drag);
  cv.addEventListener('mouseup', endDrag);
  cv.addEventListener('mouseleave', endDrag);

  cv.addEventListener('touchstart', handleTouchStart, { passive: false });
  cv.addEventListener('touchmove', handleTouchMove, { passive: false });
  cv.addEventListener('touchend', handleTouchEnd, { passive: false });

  cv.addEventListener('click', handleCanvasClick);
}

function handleTouchStart(e) {
  var touch = e.touches[0];
  var rect = e.target.getBoundingClientRect();
  var x = touch.clientX - rect.left;
  var y = touch.clientY - rect.top;

  var tableRect = typeof getTableRect === 'function' ? getTableRect() : null;

  if (tableRect && isPointInRect(x, y, tableRect)) {
    isDraggingTable = false;
    tableDragStartTime = Date.now();

    tableDragTimeout = setTimeout(function () {
      isDraggingTable = true;
      startDragX = touch.clientX;
      startDragY = touch.clientY;
    }, 2000);

    e.preventDefault();
  } else {
    e.preventDefault();
    startDrag({ clientX: touch.clientX, clientY: touch.clientY });
  }
}

function handleTouchMove(e) {
  var touch = e.touches[0];

  if (isDraggingTable) {
    var dx = touch.clientX - startDragX;
    var dy = touch.clientY - startDragY;

    if (!tablePosition) {
      var w = e.target.offsetWidth;
      var h = e.target.offsetHeight;
      tablePosition = { x: w - 90, y: 100 };
    }

    tablePosition.x += dx;
    tablePosition.y += dy;

    startDragX = touch.clientX;
    startDragY = touch.clientY;

    drawChart();
    e.preventDefault();
  } else {
    e.preventDefault();
    drag({ clientX: touch.clientX, clientY: touch.clientY });
  }
}

function handleTouchEnd(e) {
  if (tableDragTimeout) {
    clearTimeout(tableDragTimeout);
    tableDragTimeout = null;
  }

  if (isDraggingTable) {
    isDraggingTable = false;
    try {
      localStorage.setItem('tablePosition', JSON.stringify(tablePosition));
    } catch (err) {
      console.log('Errore salvataggio posizione');
    }
  }

  e.preventDefault();
  endDrag();
}

function handleCanvasClick(e) {
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;

  var w = e.target.offsetWidth;
  var h = e.target.offsetHeight;
  var priceScaleWidth = 70;
  var chartWidth = w - priceScaleWidth;
  var prices = [];
  candles.forEach(function (c) {
    prices.push(c.high, c.low);
  });

  var maxP = Math.max.apply(null, prices);
  var minP = Math.min.apply(null, prices);
  var range = maxP - minP;
  var padding = range * 0.1;

  var visibleMin = minP + padding - (offsetY / h) * (range + 2 * padding);
  var visibleMax = maxP + padding - (offsetY / h) * (range + 2 * padding);
  var visibleRange = visibleMax - visibleMin;

  var priceToY = function (p) {
    return h - ((p - visibleMin) / visibleRange) * h;
  };

  for (var mi = 0; mi < rsiLevelMarkers.length; mi++) {
    var marker = rsiLevelMarkers[mi];
    var candleIndex = -1;

    for (var ci = 0; ci < candles.length; ci++) {
      if (candles[ci].time.getTime() === marker.candleTime) {
        candleIndex = ci;
        break;
      }
    }

    if (candleIndex === -1) continue;

    var candW = Math.max((chartWidth / candles.length * 0.6) * zoomLevel, 2);
    var spc = (chartWidth / candles.length) * zoomLevel;

    var markerX = candleIndex * spc + spc / 2 + offsetX;
    var markerY = priceToY(marker.price);
    var rad = Math.min(candW * 0.25, 2.5);

    var dist = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2));

    if (dist <= rad + 8) {
      marker.hasLine = !marker.hasLine;
      saveRSIMarkers();
      drawChart();
      return;
    }
  }

  var buttonRect = getYesButtonRect();
  if (buttonRect && isPointInRect(x, y, buttonRect)) {
    activatePatternLines();
  }
}

function isPointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function getTableRect() {
  var cv = document.getElementById('chartCanvas');
  if (!cv) return null;

  var w = cv.offsetWidth;
  var h = cv.offsetHeight;
  var tableWidth = 90;
  var tableHeight = 120;

  var x = tablePosition ? tablePosition.x : w - tableWidth;
  var y = tablePosition ? tablePosition.y : 100;

  return { x: x, y: y, width: tableWidth, height: tableHeight };
}

function getYesButtonRect() {
  if (!detectedPatternName) return null;

  var tableRect = getTableRect();
  if (!tableRect) return null;

  return {
    x: tableRect.x + 20,
    y: tableRect.y + tableRect.height - 35,
    width: 50,
    height: 25
  };
}

function startDrag(e) {
  if (isDraggingTable) return;

  isDragging = true;
  startDragX = e.clientX;
  startDragY = e.clientY;
  lastOffsetX = offsetX;
  lastOffsetY = offsetY;
}

function drag(e) {
  if (isDraggingTable) return;
  if (!isDragging) return;

  offsetX = lastOffsetX + (e.clientX - startDragX);
  offsetY = lastOffsetY + (e.clientY - startDragY);

  var cv = document.getElementById('chartCanvas');
  if (cv) {
    var mx = cv.offsetWidth * 2;
    var my = cv.offsetHeight;

    offsetX = Math.max(-mx, Math.min(mx, offsetX));
    offsetY = Math.max(-my, Math.min(my, offsetY));

    drawChart();
  }
}

function endDrag() {
  isDragging = false;
}

function drawRSI(ctx, sx, sy) {
  var r = 18;
  var sp = 50;
  var ac = 0;

  if (rsiValue >= 81) ac = 1;
  else if (rsiValue >= 69 && rsiValue < 81) ac = 2;
  else if (Math.abs(rsiValue - 50) <= 8) ac = 3;
  else if (rsiValue <= 31 && rsiValue > 19) ac = 4;
  else if (rsiValue <= 19) ac = 5;

  for (var i = 0; i < 5; i++) {
    var x = sx + i * sp;
    var y = sy;
    var ia = ac === i + 1;
    var sb = shouldBlink(i);
    var fc, sc;

    if (i < 2) {
      fc = ia ? '#ef4444' : 'rgba(100,100,100,0.3)';
      sc = ia ? '#fff' : 'rgba(150,150,150,0.5)';
    } else if (i === 2) {
      fc = ia ? '#FFD700' : 'rgba(100,100,100,0.3)';
      sc = ia ? '#fff' : 'rgba(150,150,150,0.5)';
    } else {
      fc = ia ? '#22c55e' : 'rgba(100,100,100,0.3)';
      sc = ia ? '#fff' : 'rgba(150,150,150,0.5)';
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fc;
    ctx.fill();

    if (sb && blinkState) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = sc;
      ctx.lineWidth = 2;
    }
    ctx.stroke();

    if (!ia) continue;

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    if (i === 0) {
      ctx.strokeRect(x - 8, y - 10, 16, 20);
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y);
    } else if (i === 1) {
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y);
    } else if (i === 2) {
      var aa = rsiValue > 50;

      ctx.fillStyle = aa ? '#22c55e' : 'rgba(34,197,94,0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x - 5, y - 2);
      ctx.lineTo(x + 5, y - 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = !aa ? '#ef4444' : 'rgba(239,68,68,0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x - 5, y + 2);
      ctx.lineTo(x + 5, y + 2);
      ctx.closePath();
      ctx.fill();
    } else if (i === 3) {
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y);
    } else {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x - 9, y + 8);
      ctx.lineTo(x + 9, y + 8);
      ctx.closePath();
      ctx.stroke();

      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y + 2);
    }
  }
}

function drawTimer(ctx, x, y) {
  var now = new Date();
  var it = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Rome' }));

  var m = it.getMinutes();
  var s = it.getSeconds();
  var m30 = m % 30;
  var rm = 29 - m30;
  var rs = 59 - s;

  var ts = String(rm).padStart(2, '0') + ':' + String(rs).padStart(2, '0');

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(x - 5, y - 20, 75, 32);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(ts, x, y);
}

function drawSCGLabel(ctx, x, y) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCG Investment', x, y);
}

function getPatternInitials(patternName) {
  if (!patternName) return '';
  var words = patternName.split(' ');
  return words.map(function (word) {
    return word.charAt(0).toUpperCase();
  }).join('.');
}

function getPatternTypeInitials(patternName) {
  if (!patternName || !PATTERN_TYPES[patternName]) return '';
  var type = PATTERN_TYPES[patternName];
  return type === 'reversal' ? 'R.P' : 'C.P';
}

function drawPatternTable(ctx, x, y, width, height) {
  if (!tablePosition) {
    try {
      var savedPos = localStorage.getItem('tablePosition');
      if (savedPos) {
        tablePosition = JSON.parse(savedPos);
      }
    } catch (e) {
      console.log('Errore caricamento posizione tabella');
    }
  }

  var tableX = tablePosition ? tablePosition.x : x;
  var tableY = tablePosition ? tablePosition.y : y;

  ctx.fillStyle = 'rgba(60, 60, 60, 0.85)';
  ctx.fillRect(tableX, tableY, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(tableX, tableY, width, height);

  var bothPatterns = detectedPatternName && detectedPattern15mName;
  var fontSize = bothPatterns ? 11 : 14;

  if (detectedPatternName) {
    var initials = getPatternInitials(detectedPatternName);
    var typeInitials = getPatternTypeInitials(detectedPatternName);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var yPos = bothPatterns ? tableY + 18 : tableY + 25;
    ctx.fillText(initials, tableX + width / 2, yPos);

    ctx.font = (fontSize - 2) + 'px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    var yPos2 = bothPatterns ? tableY + 32 : tableY + 45;
    ctx.fillText(typeInitials, tableX + width / 2, yPos2);
  }

  if (detectedPattern15mName) {
    var initials15 = '2 ' + getPatternInitials(detectedPattern15mName);
    var typeInitials15 = getPatternTypeInitials(detectedPattern15mName);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var yPos15 = bothPatterns ? tableY + 50 : tableY + 25;
    ctx.fillText(initials15, tableX + width / 2, yPos15);

    ctx.font = (fontSize - 2) + 'px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    var yPos215 = bothPatterns ? tableY + 64 : tableY + 45;
    ctx.fillText(typeInitials15, tableX + width / 2, yPos215);
  }

  if (detectedPatternName || detectedPattern15mName) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.fillRect(tableX + 20, tableY + height - 35, 50, 25);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX + 20, tableY + height - 35, 50, 25);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YES', tableX + 45, tableY + height - 22.5);
  }
}

function drawChart() {
  var cv = document.getElementById('chartCanvas');
  if (!cv) return;

  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var dpr = window.devicePixelRatio || 1;

  cv.width = cv.offsetWidth * dpr;
  cv.height = cv.offsetHeight * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  var w = cv.offsetWidth;
  var h = cv.offsetHeight;

  var psw = 70;
  var chartWidth = w - psw;

  ctx.clearRect(0, 0, w, h);

  if (!candles || candles.length === 0) {
    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Caricamento...', w / 2, h / 2);
    return;
  }

  var ps = [];

  candles.forEach(function (c) {
    ps.push(c.high, c.low);
  });

  var maxP = Math.max.apply(null, ps);
  var minP = Math.min.apply(null, ps);
  var rng = maxP - minP;
  var pd = rng * 0.1;

  var vminP = minP + pd - (offsetY / h) * (rng + 2 * pd);
  var vmaxP = maxP + pd - (offsetY / h) * (rng + 2 * pd);

  var vrng = vmaxP - vminP;

  var candW = Math.max((chartWidth / candles.length * 0.6) * zoomLevel, 2);

  var spc = (chartWidth / candles.length) * zoomLevel;

  var p2y = function (p) {
    return h - ((p - vminP) / vrng) * h;
  };

  var borderColor = '#333';
  var borderWidth = 1;

  if (maSignal === 'buy') {
    borderColor = '#22c55e';
    borderWidth = 4;
  } else if (maSignal === 'sell') {
    borderColor = '#ef4444';
    borderWidth = 4;
  }

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.setLineDash([]);
  ctx.strokeRect(0, 0, chartWidth, h);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);

  for (var i = 0; i <= 10; i++) {
    var y = (h / 10) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(chartWidth, y);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  for (var i = 0; i <= 20; i++) {
    var x = (chartWidth / 20) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  rangeZones.forEach(function (z) {
    var yu = p2y(z.upper);
    var yl = p2y(z.lower);
    var zh = yl - yu;

    if (yl >= 0 && yu <= h) {
      ctx.fillStyle = RANGE_COLORS[z.colorIndex];
      ctx.fillRect(0, yu, chartWidth, zh);
    }
  });

  ctx.lineWidth = 0.5;

  supportResistanceLevels.forEach(function (lv) {
    var y = p2y(lv.price);
    if (y >= 0 && y <= h) {
      ctx.strokeStyle = lv.type === 'body' ? '#0066FF' : '#FFF';
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;

  volumeProfileLines.forEach(function (line) {
    var y = p2y(line.price);
    if (y >= 0 && y <= h) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;

  rsiLevelMarkers.forEach(function (marker) {
    if (!marker.hasLine) return;

    var y = p2y(marker.price);
    if (y >= 0 && y <= h) {
      ctx.strokeStyle = '#FFB6C1';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }
  });

  ctx.setLineDash([]);

  patternLines.forEach(function (line) {
    var y = p2y(line.price);
    if (y >= 0 && y <= h) {
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
    }
  });

  ctx.lineWidth = 0.5;

  trendlines.forEach(function (tl) {
    var x1 = tl.startIdx * spc + spc / 2 + offsetX;
    var x2 = tl.endIdx * spc + spc / 2 + offsetX;
    var y1 = p2y(tl.startPrice);
    var y2 = p2y(tl.endPrice);

    if (x2 === x1) return;

    var slope = (y2 - y1) / (x2 - x1);
    var extendDist = chartWidth * 5;

    var xe = x2 + extendDist;
    var ye = y2 + slope * extendDist;

    if (x1 < chartWidth && xe > 0) {
      ctx.strokeStyle = tl.color;
      ctx.setLineDash(tl.isFalseBreakout ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(xe, ye);
      ctx.stroke();
    }
  });

  ctx.setLineDash([]);
  ctx.lineWidth = 1;

  candles.forEach(function (c, i) {
    var x = i * spc + spc / 2 + offsetX;
    if (x < -spc || x > chartWidth + spc) return;

    var yh = p2y(c.high);
    var yl = p2y(c.low);
    var yo = p2y(c.open);
    var yc = p2y(c.close);

    var color = c.isBullish ? '#22c55e' : '#ef4444';
    var bodyTop = Math.min(yo, yc);
    var bodyHeight = Math.abs(yc - yo);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, yh);
    ctx.lineTo(x, yl);
    ctx.stroke();

    ctx.fillRect(x - candW / 2, bodyTop, candW, Math.max(bodyHeight, 1));
  });

  if (currentPrice !== null && candles.length > 0) {
    var li = candles.length - 1;
    var x = li * spc + spc / 2 + offsetX;
    var y = p2y(currentPrice);

    if (x >= 0 && x <= chartWidth && y >= 0 && y <= h) {
      var arrowSize = 12;
      var rad = Math.min(candW * 0.35, 3.5);

      if (pattern15mDirection) {
        var arrowY15m = y - rad - 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;

        if (pattern15mDirection === 'up') {
          ctx.beginPath();
          ctx.moveTo(x, arrowY15m - arrowSize);
          ctx.lineTo(x - arrowSize / 2, arrowY15m);
          ctx.lineTo(x + arrowSize / 2, arrowY15m);
          ctx.closePath();
          ctx.fill();
        } else if (pattern15mDirection === 'down') {
          ctx.beginPath();
          ctx.moveTo(x, arrowY15m + arrowSize);
          ctx.lineTo(x - arrowSize / 2, arrowY15m);
          ctx.lineTo(x + arrowSize / 2, arrowY15m);
          ctx.closePath();
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      if (patternDirection) {
        var arrowY = y + rad + 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
               ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
    if (patternDirection === 'up') {
      ctx.beginPath();
      ctx.moveTo(x, arrowY - arrowSize);
      ctx.lineTo(x - arrowSize / 2, arrowY);
      ctx.lineTo(x + arrowSize / 2, arrowY);
      ctx.closePath();
      ctx.fill();
    } else if (patternDirection === 'down') {
      ctx.beginPath();
      ctx.moveTo(x, arrowY + arrowSize);
      ctx.lineTo(x - arrowSize / 2, arrowY);
      ctx.lineTo(x + arrowSize / 2, arrowY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
}
rsiLevelMarkers.forEach(function (marker) {
var mx = marker.candleIndex * spc + spc / 2 + offsetX;
var my = p2y(marker.price);
if (mx >= 0 && mx <= chartWidth && my >= 0 && my <= h) {
  var rad = Math.min(candW * 0.35, 3.5);
  ctx.fillStyle = '#FFB6C1';
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(mx, my, rad, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}
});
if (currentPrice !== null && candles.length > 0) {
var li2 = candles.length - 1;
var px = li2 * spc + spc / 2 + offsetX;
var py = p2y(currentPrice);
if (px >= 0 && px <= chartWidth && py >= 0 && py <= h) {
  var rad = Math.min(candW * 0.35, 3.5);
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(px, py, rad, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
}
}
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(chartWidth, 0, psw, h);
ctx.strokeStyle = '#333';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(chartWidth, 0);
ctx.lineTo(chartWidth, h);
ctx.stroke();
ctx.fillStyle = '#888';
ctx.font = '11px Arial';
ctx.textAlign = 'left';
for (var i = 0; i <= 8; i++) {
var pr = vminP + (vrng / 8) * i;
var yy = h - (h / 8) * i;
ctx.strokeStyle = '#333';
ctx.setLineDash([2, 2]);
ctx.beginPath();
ctx.moveTo(chartWidth - 5, yy);
ctx.lineTo(chartWidth, yy);
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = '#fff';
ctx.fillText('$' + pr.toFixed(2), chartWidth + 5, yy + 4);
}
drawTimer(ctx, w - 75, 50);
drawSCGLabel(ctx, w / 2 - 60, 50);
drawRSI(ctx, 80, 100);
var tableWidth = 90;
var tableHeight = 120;
var tableX = w - tableWidth;
var tableY = 100;
drawPatternTable(ctx, tableX, tableY, tableWidth, tableHeight);
}
async function updateCurrentPrice() {
if (isUpdating) return;
try {
await fetchCurrentPrice();
await fetchRSIData();
if (currentPrice !== null) {
  updateUI();
  drawChart();
}
} catch (e) {
console.error(e);
}
}
window.addEventListener('load', function () {
setTimeout(fetchData, 500);
});
setInterval(fetchData, 120000);
setInterval(updateCurrentPrice, 2000);
window.addEventListener('resize', function () {
if (candles.length > 0) {
drawChart();
}
});
document.addEventListener('DOMContentLoaded', function () {
showNotificationOverlay();
});
