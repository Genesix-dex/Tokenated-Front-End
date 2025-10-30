document.addEventListener('DOMContentLoaded', () => {
    const searchbar = document.getElementById('mobSearchBar');
    const searchInput = document.getElementById('mobSearch');
    const mobSearchResults = document.getElementById('mobSearchResults');
    const randitem = document.getElementById('randitem');
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'searchResults';
    searchResultsContainer.className = ' w-full bg-gray-900 border border-gray-700 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto';
    mobSearchResults.appendChild(searchResultsContainer);

    let debounceTimer;

    function debounce(func, delay) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(func, delay);
    }

    function toggleSearch() {
        searchbar.classList.remove('hidden');
        searchInput.focus();
    }

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            toggleSearch();
        }
        if (event.key === 'Escape') {
            searchbar.classList.add('hidden');
            searchInput.value = '';
            searchResultsContainer.innerHTML = '';
        }
    });

    async function performSearch() {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '';
            return;
        }

        try {
            console.log('Search Query:', query);
            const response = await fetch(`https://backend.tokenated.com/api/nfts/search?query=${encodeURIComponent(query)}`);
            console.log('Raw API Response:', response);
            const { results } = await response.json();
            console.log('Parsed API Response:', results);


            if (results.length === 0) {
                searchResultsContainer.innerHTML = '<div class="p-4 text-gray-500 text-center">No results found</div>';
                return;
            }

            const resultElements = results.map(nft => {
                console.log('NFT Object:', nft); // Debug log
                const element = document.createElement('a');
                element.href = `./productdetails.html?id=${nft.tokenId}`; // Using _id instead of id
                element.className = 'search-result-item block p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-700 transition-colors duration-200';
                element.innerHTML = `
                    <div class="flex items-center">
                        <img src="${nft.image}" alt="${nft.name}" class="w-16 h-16 object-cover rounded-md mr-4 shadow-md">
                        <div class="flex-grow">
                            <h3 class="text-white font-bold text-lg mb-1">${nft.name}</h3>
                            <p class="text-gray-400 text-sm mb-1">${nft.creator.username}</p>
                            <span class="text-green-500 font-semibold">${nft.price} ETH</span>
                        </div>
                    </div>
                `;
                return element;
            });

            searchResultsContainer.innerHTML = '';
            resultElements.forEach(element => searchResultsContainer.appendChild(element));
        } catch (error) {
            console.error('Search failed:', error);
            searchResultsContainer.innerHTML = '<div class="p-4 text-red-500 text-center">Error performing search</div>';
        }
    }

    searchInput.addEventListener('input', () => debounce(performSearch, 300));

    document.addEventListener('click', (event) => {
        if (!searchbar.contains(event.target)) {
            searchResultsContainer.innerHTML = '';
        }
    });
});


        // // Get elements
        // const searchIcon = document.getElementById('searchIcon');
        // const searchOverlay = document.getElementById('searchOverlay');
        // const closeSearch = document.getElementById('closeSearch');

        // // Toggle search overlay
        // searchIcon.addEventListener('click', () => {
        //     searchOverlay.classList.remove('hidden');
        // });

        // // Close search overlay
        // closeSearch.addEventListener('click', () => {
        //     searchOverlay.classList.add('hidden');
        // });

        // // Optional: Close overlay when clicking outside
        // window.addEventListener('click', (event) => {
        //     if (event.target === searchOverlay) {
        //         searchOverlay.classList.add('hidden');
        //     }
        // });