const searchForm = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const resultsContainer = document.getElementById('results');
const statusLabel = document.getElementById('status');
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');

const fallbackResults = [
  {
    title: 'Deepseek startup ready',
    description: 'Enter a query above to fetch results from Deepseek. This is a placeholder response while your API is configured.',
    meta: 'Sample result'
  },
  {
    title: 'Antigravity-inspired desktop UI',
    description: 'The app is designed to feel light, polished, and focused on search with floating glass surfaces.',
    meta: 'Interface design'
  }
];

function showStatus(message, isError = false) {
  statusLabel.textContent = message;
  statusLabel.style.color = isError ? '#ff7a7a' : '#a5b8d8';
}

function renderResults(items) {
  resultsContainer.innerHTML = '';

  if (!items || items.length === 0) {
    resultsContainer.innerHTML = '<div class="result-card"><h2>No results</h2><p>Try a different query or check your Deepseek credentials.</p></div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <h2>${item.title || item.name || 'Result'}</h2>
      <p>${item.description || item.snippet || 'No description available.'}</p>
      <div class="result-meta">${item.meta || item.source || item.id || ''}</div>
    `;
    resultsContainer.appendChild(card);
  });
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) {
    showStatus('Please type a search query before submitting.', true);
    return;
  }

  showStatus('Searching Deepseek...', false);
  resultsContainer.innerHTML = '';

  try {
    const response = await window.api.searchDeepseek(query);

    if (response.error) {
      showStatus(response.message || 'Deepseek search returned an error.', true);
      renderResults([]);
      return;
    }

    showStatus(`Found ${response.results.length} results.`);
    renderResults(response.results);
  } catch (error) {
    showStatus(error.message || 'Search failed.', true);
    renderResults([]);
  }
});

function handleWindowControl(action) {
  if (window.api && window.api.windowControl) {
    window.api.windowControl(action);
  }
}

if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => handleWindowControl('minimize'));
}

if (maximizeBtn) {
  maximizeBtn.addEventListener('click', () => handleWindowControl('maximize'));
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => handleWindowControl('close'));
}

window.addEventListener('DOMContentLoaded', () => {
  renderResults(fallbackResults);
});
