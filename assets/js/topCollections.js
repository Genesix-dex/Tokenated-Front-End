const baseUrl = 'https://backend.tokenated.com/api';
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let unlistedCurrentPage = 1;
let loading = false;
let unlistedLoading = false;
let accessToken = localStorage.getItem('accessToken');


// Loading Controller Functions
function showPageLoading() {
    const loadingHTML = `
        <div id="loadingModal" class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-gray-800 p-8 rounded-xl flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-white text-lg">Loading...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hidePageLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.remove();
    }
}

// DOM Elements
const listedNftGrid = document.getElementById('listedNftGrid');
const unlistedNftGrid = document.getElementById('unlistedNftGrid');
const loadMoreBtn = document.getElementById('loadMore');
const loadMoreUnlistedBtn = document.getElementById('loadMoreUnlisted');
const loadingState = document.getElementById('loadingState');
const unlistedLoadingState = document.getElementById('unlistedLoadingState');
const sortSelect = document.getElementById('sortSelect');
const unlistedSortSelect = document.getElementById('unlistedSortSelect');

// Utility Functions
const showFeedbackModal = (type, title, message) => {
    const modalHTML = `
        <div id="feedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">${title}</h3>
                    <button class="modal-close text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="mb-6">
                    <p class="text-gray-300">${message}</p>
                </div>
                <button class="modal-close w-full px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                    OK
                </button>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('feedbackModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners
    const modal = document.getElementById('feedbackModal');
    modal.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => hideModal('feedbackModal'));
    });
};

const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
};

const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

const isUserLoggedIn = () => {
    return !!localStorage.getItem('accessToken');
};

const fetchWithAuth = async (endpoint, options = {}) => {
    showPageLoading();
    const token = localStorage.getItem('accessToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);

    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        showFeedbackModal('error', 'Session Expired', 'Please login again');
        window.location.href = '/login';
    }
    hidePageLoading();
    return response;

};

// Fetch Listed NFTs with authentication and pagination
const fetchListedNFTs = async (page, sort) => {
    try {
        loading = true;
        showLoading(true);

        const response = await fetchWithAuth(`/nfts/listed?page=${page}&sort=${sort}&limit=${ITEMS_PER_PAGE}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listed NFTs');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching listed NFTs:', error);
        showFeedbackModal('error', 'Error', 'Failed to load listed NFTs');
        return [];
    } finally {
        loading = false;
        showLoading(false);
    }
};

// Fetch Unlisted NFTs with authentication and pagination
const fetchUnlistedNFTs = async (page, sort) => {
    try {
        unlistedLoading = true;
        showUnlistedLoading(true);

        const response = await fetchWithAuth(`/nfts/unlisted?page=${page}&sort=${sort}&limit=${ITEMS_PER_PAGE}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch unlisted NFTs');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching unlisted NFTs:', error);
        showFeedbackModal('error', 'Error', 'Failed to load unlisted NFTs');
        return [];
    } finally {
        unlistedLoading = false;
        showUnlistedLoading(false);
    }
};

// Request to list an NFT
const requestToListNFT = async (nftId, ownerId) => {
    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Authentication Required', 'Please login to request listing this NFT');
        return false;
    }

    try {
        console.log("📌 Sending listing request for NFT:", { nftId, ownerId });

        const response = await fetchWithAuth(`/interactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nftId,
                ownerId,
                type: "listing_request"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to request listing');
        }

        const data = await response.json();
        console.log("✅ Listing request successful:", data);
        showFeedbackModal('success', 'Request Sent', 'Listing request sent successfully');
        return data;
    } catch (error) {
        console.error("🚨 Error requesting NFT listing:", error);
        showFeedbackModal('error', 'Error', error.message || 'Failed to request listing this NFT');
        return false;
    }
};



const imprintNFT = async (nftId, ownerId) => {
    console.log("🔍 imprintingsdfdfs");
    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Authentication Required', 'Please login to imprint this NFT');
        return false;
    }

    try {
        // Check if the user has already imprinted this NFT
        const hasImprinted = await checkUserImprint(nftId);

        if (hasImprinted) {
            // If already imprinted, remove the imprint
            console.log("🗑️ Removing imprint interaction for NFT:", { nftId });

            const response = await fetchWithAuth(`/interactions/imprint`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nftId,
                    userId: localStorage.getItem('userId')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove imprint');
            }

            const data = await response.json();
            console.log("✅ Imprint removed successfully:", data);
            return { ...data, action: 'removed' };
        } else {
            // If not imprinted, create a new imprint
            console.log("📌 Sending imprint interaction for NFT:", { nftId, ownerId });

            const response = await fetchWithAuth(`/interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nftId,
                    ownerId,
                    type: "imprint"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to imprint NFT');
            }

            const data = await response.json();
            console.log("✅ Imprint interaction successful:", data);
            return { ...data, action: 'added' };
        }
    } catch (error) {
        console.error("🚨 Error with imprint operation:", error);
        showFeedbackModal('error', 'Error', error.message || 'Failed to process imprint action');
        return false;
    }
};


const checkUserRequest = async (nftId) => {
    try {
        const response = await fetchWithAuth(`/interactions?type=listing_request&nftId=${nftId}`);
        if (!response.ok) throw new Error('Failed to fetch listing requests');

        const requests = await response.json();
        const userId = localStorage.getItem('userId');
        return requests.some(request => request.userId === userId);
    } catch (error) {
        console.error('Error checking listing request:', error);
        return false;
    }
};

// For createListedNFTCard
const checkUserImprint = async (nftId) => {
    try {
        const response = await fetchWithAuth(`/interactions?type=imprint&nftId=${nftId}`);
        if (!response.ok) throw new Error('Failed to fetch imprint status');

        const imprints = await response.json();
        const userId = localStorage.getItem('userId');
        return imprints.some(imprint => imprint.userId === userId);
    } catch (error) {
        console.error('Error checking imprint status:', error);
        return false;
    }
};

// Modified createListedNFTCard to use the updated checkUserImprint function
const createListedNFTCard = (nft) => {
    console.log('Creating listed NFT card:', nft);
    const card = document.createElement('div');
    card.className = 'p-2 bg-gray-800/50 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-500/10 border-purple-500/20 border-2';
    card.dataset.tokenId = nft.tokenId;

    const isAuction = nft.isAuction;
    const imprintCount = nft.imprints?.imprintCount || 0;
    const userId = localStorage.getItem('userId');
    const isOwner = nft.owner && nft.owner.userId === userId;
    let hasImprinted = false;

    const updateImprintButton = () => {
        const imprintButton = card.querySelector('[data-nft-action="imprint"]');
        if (!imprintButton) return;
    
        // Remove existing event listeners to prevent duplicates
        imprintButton.replaceWith(imprintButton.cloneNode(true));
    
        // Re-select the button after cloning (previous reference is lost)
        const newImprintButton = card.querySelector('[data-nft-action="imprint"]');
    
        newImprintButton.addEventListener('click', async (e) => {
            e.stopPropagation();
    
            const tokenId = newImprintButton.dataset.tokenId;
            const ownerId = newImprintButton.dataset.ownerId;
    
            const result = await imprintNFT(tokenId, ownerId);
            if (result) {
                hasImprinted = result.action === 'added';
                
                // Update imprint count
                const imprintCountElements = card.querySelectorAll('.imprint-count');
                const newCount = result.action === 'added' ? imprintCount + 1 : imprintCount - 1;
    
                imprintCountElements.forEach(el => {
                    el.textContent = newCount;
                });
    
                // Update button styles
                updateImprintButton();
            }
        });
    
        const imprintCountElements = card.querySelectorAll('.imprint-count');
        const icons = card.querySelectorAll('.nft-icon');

        if (imprintButton) {
            if (hasImprinted) {
                imprintButton.classList.add('text-purple-400');
                imprintButton.classList.remove('text-gray-400');
            } else {
                imprintButton.classList.remove('text-purple-400');
                imprintButton.classList.add('text-gray-400');
            }
        }

        icons.forEach(icon => {
            const parentElement = icon.closest('button, div');
            if (hasImprinted) {
                parentElement.classList.add('text-purple-400');
                parentElement.classList.remove('text-gray-400');
            } else {
                parentElement.classList.remove('text-purple-400');
                parentElement.classList.add('text-gray-400');
            }
        });
    };

    // Check if user has imprinted this NFT when card is created
    checkUserImprint(nft.tokenId).then(result => {
        hasImprinted = result;
        updateImprintButton();
    });

    // Create imprint button
    const imprintButtonHTML = `
        <button class="flex-1 flex justify-center items-center gap-1 px-4 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft.owner?.userId || nft.creator?.userId}">
            <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="text-sm font-medium imprint-count">${imprintCount}</span>
        </button>
    `;

    // Create the appropriate action button (buy or bid)
    const buttonHTML = isAuction
        ? `<button class="px-4 py-2 bg-purple-500 rounded-xl text-white font-medium hover:bg-purple-600 transition-colors" data-nft-action="bid" data-current-price="${nft.currentPrice}">Place Bid</button>`
        : `<button class="px-4 py-2 bg-purple-500 rounded-xl text-white font-medium hover:bg-purple-600 transition-colors flex-1" data-nft-action="buy" data-token-id="${nft.tokenId}" data-nft-name="${nft.name}" data-nft-image="${nft.image}" data-current-price="${nft.price}"> <i class="fas fa-cart-shopping"></i> ${nft.price} </button>`;

    // Build the card with hover overlay similar to the unlisted card
    card.innerHTML = `
        
        <div class="relative group cursor-pointer mb-2 aspect-square">
            <img src="${nft.image}" alt="${nft.name}" class="w-full h-full object-cover rounded-2xl border-purple-500/20 border-2">
            <div class="absolute gap-2 inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden items-end justify-between p-4">
                
                
                ${buttonHTML}
                ${imprintButtonHTML}
                    
            </div>
            <span class="text-sm text-gray-100 absolute top-1 right-2 bg-gray-300/20 backdrop-blur-lg border-gray-500/20 border-2 px-2 rounded-full shadow-2xl">${nft.timeAgo || ''}</span>
        </div>
        <div class="p-4 py-1 bg-gray-900 rounded-2xl border-purple-500/20 border-2">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-lg text-pink-800 truncate">${nft.name}</h3>
                <span class="text-sm text-gray-400">#${nft.tokenId}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <img src="${nft.creator.profileImage || '/images/default-avatar.png'}" alt="${nft.creator.name}" class="w-6 h-6 rounded-full">
                    <span class="text-sm text-gray-400 truncate">${nft.creator.name}</span>
                </div>
                <div class="flex items-center gap-2">
                    ${isAuction ? '<span class="text-sm text-purple-400">Auction</span>' : ''}
                    
                    <div class="flex items-center gap-1 text-gray-400">
                        <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span class="text-sm imprint-count">${imprintCount}</span>
                    </div>
                </div>
            </div>
            ${isOwner ?
            `<div class="mt-3 pt-3 border-t border-gray-700">
                <p class="text-sm text-gray-400">
                    You own this NFT
                </p>
            </div>` : ''}
        </div>
    `;

    // Add click event for NFT details (similar to the unlisted card)
    const imageContainer = card.querySelector('.relative.group');
    imageContainer.addEventListener('click', (e) => {
        // Prevent triggering if clicking the action button
        if (!e.target.closest('[data-nft-action]')) {
            window.location.href = `./productdetails.html?id=${nft.tokenId}`;
        }
    });

    // Add event listener for imprint button
    const imprintButton = card.querySelector('[data-nft-action="imprint"]');
    imprintButton.addEventListener('click', async (e) => {
        e.stopPropagation();

        const tokenId = imprintButton.dataset.tokenId;
        const ownerId = imprintButton.dataset.ownerId;

        const result = await imprintNFT(tokenId, ownerId);
        if (result) {
            // Toggle imprint state
            hasImprinted = !hasImprinted;

            // Update all imprint count elements in this card
            const imprintCountElements = card.querySelectorAll('.imprint-count');
            const newCount = hasImprinted ? imprintCount + 1 : imprintCount - 1;
            const updateRequestButton = () => {
                const requestButton = card.querySelector('[data-nft-action]');
                if (!isOwner && requestButton) {
                    // Base glassmorphism style for both states
                    requestButton.className = 'px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 backdrop-blur-md shadow-lg';

                    if (hasRequested) {
                        // Glassmorphism style for requested state
                        requestButton.innerHTML = 'Request Sent ✅';
                        requestButton.disabled = true;
                        requestButton.classList.add('bg-gray-500/40', 'border', 'border-gray-400/30');
                        requestButton.classList.remove('hover:bg-indigo-600/60', 'bg-indigo-500/40', 'hover:shadow-indigo-300/20', 'border-indigo-400/30');
                        requestButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    } else {
                        // Glassmorphism style for default state
                        requestButton.innerHTML = 'Request to List';
                        requestButton.disabled = false;
                        requestButton.classList.add('bg-indigo-500/40', 'hover:bg-indigo-600/60', 'hover:shadow-indigo-300/20', 'border', 'border-indigo-400/30');
                        requestButton.classList.remove('bg-gray-500/40', 'border-gray-400/30');
                        // Subtle glow effect on hover
                        requestButton.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.15)';
                    }
                }
            };
            imprintCountElements.forEach(el => {
                el.textContent = newCount;
            });

            // Update the styling based on the new state
            updateImprintButton();
        }
    });

    return card;
};


// Create Unlisted NFT Card with Request to List button
const createUnlistedNFTCard = (nft) => {
    console.log('Creating unlisted NFT card:', nft);
    const card = document.createElement('div');
    card.className = 'p-2 bg-gray-800/50 rounded-2xl transition-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-500/10 border-purple-500/20 border-2';
    card.dataset.tokenId = nft.tokenId;

    const userId = localStorage.getItem('userId');
    const isOwner = nft.owner && nft.owner.userId === userId;

    let requestCount = nft.listingRequests ? nft.listingRequests.requestCount : 0;
    let hasRequested = false;

    const updateRequestButton = () => {
        const requestButton = card.querySelector('[data-nft-action]');
        if (!isOwner && requestButton) {
            // Base glassmorphism style for both states
            requestButton.className = 'px-2 py-2 rounded-xl text-white text-sm md:text-medium transition-all duration-300 backdrop-blur-md shadow-lg';

            if (hasRequested) {
                // Glassmorphism style for requested state
                requestButton.innerHTML = '<span class="flex items-center gap-1">Already Requested <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></span>';
                requestButton.disabled = true;
                requestButton.classList.add('bg-gray-500/40', 'border', 'border-gray-400/30');
                requestButton.classList.remove('hover:bg-indigo-600/60', 'bg-indigo-500/40', 'hover:shadow-indigo-300/20', 'border-indigo-400/30');
                requestButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            } else {
                // Glassmorphism style for default state
                requestButton.innerHTML = '<span class="flex items-center gap-1">Request Listing <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg></span>';
                requestButton.disabled = false;
                requestButton.classList.add('bg-indigo-500/40', 'hover:bg-indigo-600/60', 'hover:shadow-indigo-300/20', 'border', 'border-indigo-400/30');
                requestButton.classList.remove('bg-gray-500/40', 'border-gray-400/30');
                // Subtle glow effect on hover
                requestButton.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.15)';
            }
        }
    };


    // Check if user has requested this NFT when card is created
    checkUserRequest(nft.tokenId).then(result => {
        console.log('User has requested:', nft.tokenId, result);
        hasRequested = result;
        updateRequestButton();
    });

    const requestButton = document.createElement('button');
    requestButton.className = 'px-2 py-2 bg-indigo-500 rounded-xl text-white text-sm md:text-medium hover:bg-indigo-600 transition-colors w-full';
    requestButton.dataset.nftAction = isOwner ? 'list' : 'request-list';
    requestButton.dataset.tokenId = nft.tokenId;
    requestButton.dataset.nftName = nft.name;
    requestButton.textContent = isOwner ? 'List for Sale' : 'Request to List';

    if (!isOwner) {
        checkUserRequest();
    }

    // Build the hover dropdown with listing requests
    const requestersList = nft.listingRequests?.latestRequests.map(requester => `
        <div class="flex items-center gap-2 px-3 py-1 hover:bg-gray-700 rounded">
            <img src="${requester.profileImage}" alt="${requester.username}" class="w-6 h-6 rounded-full">
            <span class="text-sm text-white">${requester.username}</span>
        </div>
    `).join('') || '<div class="text-sm text-gray-400 px-3 py-1">No requests</div>';

    card.innerHTML = `
        <div class="relative group cursor-pointer aspect-square mb-2">
            <img src="${nft.image}" alt="${nft.name}" class="w-full h-full object-cover rounded-2xl border-purple-500/20 border-2">

            ${isOwner ? `
                <div class="absolute top-1 left-1/2 -translate-x-1/2 w-[95%] px-2 bg-gray-200/10 backdrop-blur-md rounded-xl">
                    <p class="text-sm text-gray-400">
                        <span class="text-purple-400">${requestCount}</span> ${requestCount === 1 ? 'user' : 'users'} requested you list this NFT
                    </p>
                </div>` : ''}

            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity flex items-end justify-between p-1">
                ${requestButton.outerHTML}
                <div class="relative md:flex hidden">
                    <span class="md:hidden px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:bg-indigo-600/60 backdrop-blur-md shadow-lg bg-indigo-500/40"> see </span>
                    <div class="absolute top-6 -right-10 transform -translate-x-1/2 bg-gray-800/50 backdrop-blur-lg border-purple-500/20 border-2 text-white text-sm shadow-lg rounded-xl w-48 p-2">
                        ${requestersList}
                    </div>
                </div>
            </div>
        </div>
        <div class="p-4 py-1 rounded-2xl bg-slate-900 border-purple-500/20 border-2">
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-lg text-white truncate">${nft.name}</h3>
                <span class="text-sm text-gray-400">#${nft.tokenId}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <img src="${nft.creator.profileImage || '/images/default-avatar.png'}" alt="${nft.creator.name}" class="w-6 h-6 rounded-full">
                    <span class="text-sm text-gray-400 truncate">${nft.creator.name}</span>
                </div>
                <div class="flex items-center gap-1 text-purple-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span class="text-sm">${requestCount}</span>
                </div>
            </div>
            
        </div>
    `;

    // Add event listener to button
    const actionButton = card.querySelector('[data-nft-action]');
    if (!isOwner) {
        actionButton.addEventListener('click', async () => {
            if (!hasRequested) {
                const result = await requestToListNFT(nft.tokenId, nft.owner.userId);
                if (result) {
                    hasRequested = true;
                    requestCount += 1;
                    updateRequestButton();
                }
            }
        });
    }

    return card;
};



// Show/Hide Loading States
const showLoading = (show) => {
    loadingState.classList.toggle('hidden', !show);
    loadMoreBtn.classList.toggle('hidden', show);
};

const showUnlistedLoading = (show) => {
    unlistedLoadingState.classList.toggle('hidden', !show);
    loadMoreUnlistedBtn.classList.toggle('hidden', show);
};

// Load Listed NFTs
const loadListedNFTs = async (reset = false) => {
    if (loading) return;

    if (reset) {
        currentPage = 1;
        listedNftGrid.innerHTML = '';
    }

    try {
        const response = await fetchListedNFTs(currentPage, sortSelect.value);
        const nfts = response.nfts;

        if (!Array.isArray(nfts)) {
            console.error('Expected an array, but received:', nfts);
            return;
        }

        if (nfts.length === 0) {
            loadMoreBtn.style.display = 'none';
            return;
        }

        nfts.forEach(nft => {
            const card = createListedNFTCard(nft);
            listedNftGrid.appendChild(card);
        });

        currentPage++;
    } catch (error) {
        console.error('Error loading listed NFTs:', error);
    }
};


const loadUnlistedNFTs = async (reset = false) => {
    if (unlistedLoading) return;

    if (reset) {
        unlistedCurrentPage = 1;
        unlistedNftGrid.innerHTML = '';
    }

    try {
        const response = await fetchUnlistedNFTs(unlistedCurrentPage, unlistedSortSelect.value);
        const nfts = response.nfts;

        if (!Array.isArray(nfts)) {
            console.error('Expected an array, but received:', nfts);
            return;
        }

        if (nfts.length === 0) {
            loadMoreUnlistedBtn.style.display = 'none';
            return;
        }

        nfts.forEach(nft => {
            const card = createUnlistedNFTCard(nft);
            unlistedNftGrid.appendChild(card);
        });

        unlistedCurrentPage++;
    } catch (error) {
        console.error('Error loading unlisted NFTs:', error);
    }
};

// Handle request to list NFT
const handleRequestToList = async (tokenId, nftName, ownerId) => {
    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Authentication Required', 'Please login to request listing this NFT');
        return;
    }

    try {
        const result = await requestToListNFT(tokenId, ownerId);

        if (result && result.success) {
            // Update the request count in the UI
            const card = document.querySelector(`[data-token-id="${tokenId}"]`);
            if (card) {
                const requestCountElements = card.querySelectorAll('.text-purple-400 span');
                requestCountElements.forEach(el => {
                    const currentCount = parseInt(el.textContent);
                    el.textContent = currentCount + 1;
                });

                // Update text if owner info is displayed
                const ownerInfo = card.querySelector('.border-t.border-gray-700 .text-sm');
                if (ownerInfo) {
                    const countSpan = ownerInfo.querySelector('.text-purple-400');
                    const newCount = parseInt(countSpan.textContent) + 1;
                    countSpan.textContent = newCount;

                    const textNode = ownerInfo.childNodes[1];
                    textNode.textContent = ` ${newCount === 1 ? 'user has' : 'users have'} requested you list this NFT`;
                }
            }

            showFeedbackModal('success', 'Request Sent', `Your request to list "${nftName}" has been sent to the owner.`);
        } else {
            throw new Error('Failed to request listing');
        }
    } catch (error) {
        console.error('Error requesting NFT listing:', error);
        showFeedbackModal('error', 'Request Failed', `Could not send request to list "${nftName}". Please try again later.`);
    }
};



const handleRequestToImprint = async (tokenId, nftName, ownerId) => {
    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Authentication Required', 'Please login to imprint this NFT');
        return;
    }

    try {
        const result = await imprintNFT(tokenId, ownerId);

        if (result) {
            // Update the imprint count in the UI
            const card = document.querySelector(`[data-token-id="${tokenId}"]`);
            if (card) {
                const imprintCountElements = card.querySelectorAll('.imprint-count');
                imprintCountElements.forEach(el => {
                    const currentCount = parseInt(el.textContent);
                    el.textContent = currentCount + 1;
                });

                // Update icons to show imprinted state
                const heartIcons = card.querySelectorAll('[data-nft-action="imprint"] svg, .text-gray-400 svg');
                heartIcons.forEach(icon => {
                    icon.setAttribute('fill', 'currentColor');
                    icon.closest('button, div').classList.add('text-pink-500');
                    icon.closest('button, div').classList.remove('text-gray-400');
                });
            }

            showFeedbackModal('success', 'Imprint Successful', `You have successfully imprinted "${nftName}".`);
        } else {
            throw new Error('Failed to imprint NFT');
        }
    } catch (error) {
        console.error('Error imprinting NFT:', error);
        showFeedbackModal('error', 'Imprint Failed', `Could not imprint "${nftName}". Please try again later.`);
    }
};



// Initialize event listeners
function initializeEventListeners() {
    // Sort change handlers
    sortSelect?.addEventListener('change', () => loadListedNFTs(true));
    unlistedSortSelect?.addEventListener('change', () => loadUnlistedNFTs(true));

    // Load more handlers
    loadMoreBtn?.addEventListener('click', () => loadListedNFTs());
    loadMoreUnlistedBtn?.addEventListener('click', () => loadUnlistedNFTs());

    // Handle NFT actions
    document.addEventListener('click', (e) => {
        const actionButton = e.target.closest('[data-nft-action]');
        if (!actionButton) return;

        const action = actionButton.dataset.nftAction;
        const tokenId = actionButton.dataset.tokenId;
        const nftName = actionButton.dataset.nftName;
        const nftImage = actionButton.dataset.nftImage;
        const currentPrice = actionButton.dataset.currentPrice;
    });

    // Optional: Infinite Scroll
    window.addEventListener('scroll', () => {
        const endOfPage = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000;
        if (endOfPage) {
            if (!loading && document.body.scrollTop > listedNftGrid.offsetTop) {
                loadListedNFTs();
            }
            if (!unlistedLoading && document.body.scrollTop > unlistedNftGrid.offsetTop) {
                loadUnlistedNFTs();
            }
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadListedNFTs();
    loadUnlistedNFTs();
});
