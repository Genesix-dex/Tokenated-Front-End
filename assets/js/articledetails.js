// Configuration for API endpoints
const API_CONFIG = {
    baseUrl: 'https://backend.tokenated.com/api/news',
    endpoints: {
        articleDetails: '/articles',
        relatedArticles: '/related-articles'
    }
};

// DOM Elements
const elements = {
    loadingIndicator: document.getElementById('loadingIndicator'),
    mainContent: document.getElementById('mainContent'),
    articleTitle: document.getElementById('articleTitle'),
    articleCategory: document.getElementById('articleCategory'),
    readTime: document.getElementById('readTime'),
    authorName: document.getElementById('authorName'),
    // authorImage: document.getElementById('authorImage'),
    authorImage2: document.getElementById('authorImage2'),
    publishDate: document.getElementById('publishDate'),
    articleImage: document.getElementById('articleImage'),
    articleContent: document.getElementById('articleContent'),
    relatedArticles: document.getElementById('relatedArticles')
};

// Show/hide loading state
const toggleLoading = (show) => {
    if (show) {
        elements.loadingIndicator.classList.remove('hidden');
        elements.mainContent.classList.remove('visible');
    } else {
        elements.loadingIndicator.classList.add('hidden');
        elements.mainContent.classList.add('visible');
    }
};

// Get article ID from URL
const getArticleIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
};

// Fetch article details
async function fetchArticleDetails(articleId) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/${articleId}`);
        if (!response.ok) throw new Error('Failed to fetch article details');
        return await response.json();
    } catch (error) {
        console.error('Error fetching article details:', error);
        return null;
    }
}

// Fetch related articles
async function fetchRelatedArticles(currentArticleId, category) {
    try {
        const response = await fetch(
            `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.relatedArticles}?category=${category}&exclude=${currentArticleId}&limit=3`
        );
        if (!response.ok) throw new Error('Failed to fetch related articles');
        return await response.json();
    } catch (error) {
        console.error('Error fetching related articles:', error);
        return null;
    }
}

// Create related article card
function createRelatedArticleCard(article) {
    console.log(article.imageUrl);
    return `
        <a href="articledetails.html?id=${article._id}" class="section-gradient rounded-2xl overflow-hidden card-hover block p-2">
            <div class="aspect-video overflow-hidden">
                <img src="${article.imageUrl}" alt="${article.title}" class="w-full h-full object-cover rounded-t-xl">
            </div>
            <div class="p-2">
                <div class="flex items-center space-x-2 mb-4">
                    <span class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">${article.category}</span>
                    <span class="text-gray-400 text-sm">${calculateReadTime(article.content)} min read</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2 hover:gradient-text">${article.title}</h3>
                <p class="text-gray-400 mb-4 line-clamp-2">${truncateText(article.content, 120)}</p>
                <div class="flex items-center space-x-3">
                    <img src="${article.author.avatar || "https://res.cloudinary.com/dljozrk6n/image/upload/v1740105586/news/news-67ad5763a7d31bee706872ee.jpg"}" alt="${article.author.name}" class="w-8 h-8 rounded-full">
                    <div>
                        <p class="text-sm font-medium text-white">${article.author.name || 'Tokenated'}</p>
                        <p class="text-xs text-gray-400">${formatDate(article.publishedAt)}</p>
                    </div>
                </div>
            </div>
        </a>
    `;
}

// Utility functions
const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

const truncateText = (text, limit) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Update page content
const updatePageContent = (articleDetails) => {
    elements.articleTitle.textContent = articleDetails.title;
    elements.articleCategory.textContent = articleDetails.category;
    elements.readTime.textContent = `${calculateReadTime(articleDetails.content)} min read`;
    elements.authorName.textContent = articleDetails.author.name;
    // elements.authorImage.src = articleDetails.author.avatar || 'https://res.cloudinary.com/dljozrk6n/image/upload/v1740105586/news/news-67ad5763a7d31bee706872ee.jpg';
    elements.authorImage2.src = articleDetails.author.avatar || 'https://res.cloudinary.com/dljozrk6n/image/upload/v1740105586/news/news-67ad5763a7d31bee706872ee.jpg';
    elements.authorImage2.alt = articleDetails.author.name;
    elements.publishDate.textContent = formatDate(articleDetails.publishedAt);
    elements.articleImage.src = articleDetails.imageUrl;
    elements.articleImage.alt = articleDetails.title;
    elements.articleContent.innerHTML = articleDetails.content;
};

// Initialize the page
async function initializeArticlePage() {
    const articleId = getArticleIdFromUrl();
    if (!articleId) {
        console.error('No article ID found in URL');
        toggleLoading(false);
        return;
    }

    // Retrieve cached data from localStorage
    const cachedArticleData = JSON.parse(localStorage.getItem('articleData'));

    if (cachedArticleData && cachedArticleData.slug === articleId) {
        console.log('Using cached article data for SEO:', cachedArticleData);
        setSEOMetaTags(cachedArticleData);
    }

    try {
        toggleLoading(true);
        
        // Fetch article details from API
        const articleDetails = await fetchArticleDetails(articleId);
        if (!articleDetails) throw new Error('Failed to load article');
        
        // Update page content and SEO
        updatePageContent(articleDetails);
        setSEOMetaTags(articleDetails); // Ensure latest API data is used

        // Fetch and display related articles
        const relatedArticles = await fetchRelatedArticles(articleId, articleDetails.category);
        if (relatedArticles && Array.isArray(relatedArticles)) {
            elements.relatedArticles.innerHTML = relatedArticles
                .map(article => createRelatedArticleCard(article))
                .join('');
        }

        toggleLoading(false);
    } catch (error) {
        console.error('Error initializing page:', error);
        toggleLoading(false);
        elements.mainContent.innerHTML = document.getElementById('errorTemplate').innerHTML;
    }
}


function setSEOMetaTags(article) {
    document.title = `${article.title} | Tokenated Blog`;

    updateOrCreateMetaTag('meta[name="description"]', 'name', 'description', article.metaDescription || truncateText(article.content, 150));
    updateOrCreateMetaTag('meta[name="keywords"]', 'name', 'keywords', article.category);
    updateOrCreateMetaTag('meta[name="author"]', 'name', 'author', article.author);

    updateOrCreateMetaTag('meta[property="og:title"]', 'property', 'og:title', article.title);
    updateOrCreateMetaTag('meta[property="og:description"]', 'property', 'og:description', article.metaDescription || truncateText(article.content, 150));
    updateOrCreateMetaTag('meta[property="og:image"]', 'property', 'og:image', article.imageUrl);
    updateOrCreateMetaTag('meta[property="og:url"]', 'property', 'og:url', window.location.href);
}

// Utility function to update or create meta tags
function updateOrCreateMetaTag(selector, attrName, attrValue, content) {
    let metaTag = document.querySelector(selector);
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attrName, attrValue);
        document.head.appendChild(metaTag);
    }
    metaTag.content = content;
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeArticlePage);

// Add smooth scroll behavior to back button
document.querySelector('a[href="index.html"]').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => window.location.href = 'index.html', 500);
});
