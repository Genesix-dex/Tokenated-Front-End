// API endpoints configuration
const API_CONFIG = {
    baseUrl: 'https://backend.tokenated.com/api/news',
    endpoints: {
        featured: '/featured-stories',
        latest: '/latest-articles'
    }
};

// State management for articles
let currentPage = 1;
const articlesPerPage = 6;

// Fetch articles from the backend
async function fetchArticles(type, page = 1, category = 'all') {
    try {
        const endpoint = type === 'featured' ? API_CONFIG.endpoints.featured : API_CONFIG.endpoints.latest;
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}?page=${page}&category=${category}&per_page=${articlesPerPage}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        return null;
    }
}



// Create article card HTML
 function createArticleCard(article, isFeatured = false) {
    const truncateText = (text, limit = 100) => {
        return text.length > limit ? text.substring(0, limit) + "..." : text;
    };
    const excerpt = truncateText(article.content, 50);

    function calculateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes;
    };
    
    const cardClass = isFeatured ? 'md:col-span-2' : '';

    return `
      <article 
        class="group border-2 border-purple-600/30 relative bg-gradient-to-b from-gray-800/30 to-gray-900/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer ${cardClass}"
        data-article-id="${article._id}"
      >
        <div class="aspect-video overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
          <img
            src="${article.imageUrl}"
            alt="${article.title}"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        <div class="p-8 relative z-20 -mt-20">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="px-4 py-1.5 bg-purple-500/30 text-purple-300 rounded-full text-sm font-medium backdrop-blur-sm">
                ${article.category}
            </span>
            <p class="px-4 py-1.5 bg-gray-800/30 text-gray-300 rounded-full text-sm backdrop-blur-sm">
                ${calculateReadTime(article.content)} min read
            </p>
          </div>

          <h3 class="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300 leading-tight truncate">
            ${article.title}
          </h3>
          <p class="text-gray-300 mb-6 leading-relaxed">${excerpt}</p>
          
          <div class="flex items-center space-x-4 border-t border-gray-700/50 pt-6">
            <div class="relative">
              <img
                src="${article.author.avatar || 'https://res.cloudinary.com/dljozrk6n/image/upload/v1740105586/news/news-67ad5763a7d31bee706872ee.jpg'}"
                alt="${article.author.name}"
                class="w-10 h-10 rounded-full ring-2 ring-purple-500/20"
              />
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <p class="text-sm font-medium text-white mb-0.5">${article.author.name || "Tokenated"}</p>
              <p class="text-xs text-gray-400">
                ${new Date(article.publishedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </article>
    `;
}

// Initialize article grid
async function initializeArticleGrids() {
    const featuredContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    const latestContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.lg\\:grid-cols-4');

    // Fetch and render featured stories
    const featuredStories = await fetchArticles('featured');
    if (featuredStories) {
        featuredContainer.innerHTML = featuredStories.data
            .map(article => createArticleCard(article, true))
            .join('');
    }

    // Fetch and render latest articles
    const latestArticles = await fetchArticles('latest');
    if (latestArticles) {
        console.log('Latest Articles:', latestArticles); // Debug log
        latestContainer.innerHTML = latestArticles.data
            .map(article => createArticleCard(article))
            .join('');
    }

    // Add click handlers
    addArticleClickHandlers();
}

// Add click handlers to all articles
function addArticleClickHandlers() {
    const articles = document.querySelectorAll('article[data-article-id]');

    articles.forEach(article => {
        article.addEventListener('click', () => {
            const articleId = article.dataset.articleId;
            navigateToArticleDetails(articleId);
        });
    });
}


function navigateToArticleDetails(articleId) {
    const article = [...document.querySelectorAll('article[data-article-id]')].find(a => a.dataset.articleId === articleId);
    
    if (article) {
        const articleData = {
            title: article.querySelector('h3').textContent,
            category: article.querySelector('span').textContent,
            imageUrl: article.querySelector('img').src,
            author: article.querySelector('.text-sm.font-medium').textContent,
            publishedAt: article.querySelector('.text-xs.text-gray-400').textContent,
            metaTitle: article.getAttribute('data-meta-title'),
            metaDescription: article.getAttribute('data-meta-description'),
            slug: article.getAttribute('data-slug')
        };
        console.log(articleData);
        localStorage.setItem('articleData', JSON.stringify(articleData));
    }
    
    window.location.href = `./articledetails.html?id=${articleId}`;
}



// Handle category filter changes
function handleCategoryChange() {
    const categorySelect = document.querySelector('select');
    categorySelect.addEventListener('change', async (event) => {
        const selectedCategory = event.target.value.toLowerCase();
        const latestArticles = await fetchArticles('latest', 1, selectedCategory);

        const latestContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (latestArticles) {
            latestContainer.innerHTML = latestArticles.data
                .map(article => createArticleCard(article))
                .join('');
            addArticleClickHandlers();
        }
    });
}

// Handle load more button
function handleLoadMore() {
    const loadMoreButton = document.querySelector('button:contains("Load More Articles")');
    loadMoreButton.addEventListener('click', async () => {
        currentPage++;
        const categorySelect = document.querySelector('select');
        const selectedCategory = categorySelect.value.toLowerCase();

        const moreArticles = await fetchArticles('latest', currentPage, selectedCategory);
        if (moreArticles && moreArticles.data.length > 0) {
            const latestContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
            const newArticles = moreArticles.data
                .map(article => createArticleCard(article))
                .join('');

            latestContainer.insertAdjacentHTML('beforeend', newArticles);
            addArticleClickHandlers();

            // Hide load more button if no more articles
            if (moreArticles.data.length < articlesPerPage) {
                loadMoreButton.style.display = 'none';
            }
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeArticleGrids();
    handleCategoryChange();
    handleLoadMore();
});