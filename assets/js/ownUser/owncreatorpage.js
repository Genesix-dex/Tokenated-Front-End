const API_BASE_URL = 'https://backend.tokenated.com/api';



// Profile Data Management
async function fetchProfileData() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            window.location.href = './index.html';
            return; 
        }
        

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error(`Error fetching profile: ${response.statusText}`);
        
        const profileData = await response.json();
        updateProfileUI(profileData);
    } catch (error) {
        console.error('Error:', error);
        
    }
}


async function checkAuthState() {
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
        localStorage.removeItem('userId');
        window.location.href = './index.html';
        return;
    }

    try {
        const response = await fetch('https://backend.tokenated.com/api/auth/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();

        // Fetch user profile explicitly
        const profileResponse = await fetch('https://backend.tokenated.com/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${data.accessToken}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const userProfile = await profileResponse.json();

        // Update tokens and user profile
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
    } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
    }
}



function updateProfileUI(profileData) {
    document.getElementById('profileName').textContent = profileData.name;
    
    // Verification badge
    const nameElement = document.getElementById('profileName');
    if (profileData.isVerified) {
        nameElement.innerHTML += ' <span class="inline-block ml-2 bg-transparent text-white text-xs rounded-full"><img src="./assets/images/icons8-verified-48.png" class="w-5 md:w-8"></span>';
    }
    
    // Get the bio container
    const bioContainer = document.getElementById('profileBio');
    
    // Create a wrapper for bio text and see more button
    const bioWrapper = document.createElement('div');
    
    // Create text span for bio
    const bioTextSpan = document.createElement('span');
    if (profileData.bio) {
        
        bioTextSpan.textContent = profileData.bio;
    } else {
        bioTextSpan.textContent = `'no bio'`;
        console.log("no bio");
    }
    
    // Create see more button
    const seeMoreBtn = document.createElement('button');
    seeMoreBtn.textContent = 'See More';
    seeMoreBtn.className = 'text-purple-500 ml-2 hover:underline';
    
    // Set initial bio display
    bioTextSpan.classList.add('line-clamp-3', 'block');
    
    // Toggle bio visibility
    let isExpanded = false;
    seeMoreBtn.addEventListener('click', () => {
        if (!isExpanded) {
            // Expand bio
            bioTextSpan.classList.remove('line-clamp-3');
            seeMoreBtn.textContent = 'See Less';
            isExpanded = true;
        } else {
            // Collapse bio
            bioTextSpan.classList.add('line-clamp-3');
            seeMoreBtn.textContent = 'See More';
            isExpanded = false;
        }
    });
    
    // Only show see more button if bio is longer than 3 lines
    if (profileData.bio && profileData.bio.split('\n').length > 3) {
        bioWrapper.appendChild(bioTextSpan);
        bioWrapper.appendChild(seeMoreBtn);
        bioContainer.innerHTML = '';
        bioContainer.appendChild(bioWrapper);
    } else {
        // If bio is short, just display it normally
        bioContainer.textContent = profileData.bio;
    }
    
    // Set profile image
    document.getElementById('profileImage').src = profileData.profileImage || '/default-avatar.png';

    // Update social media links
    const socialLinks = document.querySelectorAll('.mt-4.flex.justify-center.space-x-4 a');
    
    // Mapping of icon classes to social media platforms
    const platformMap = {
        'twitter': { 
            key: 'twitter', 
            iconClass: 'fab fa-twitter', 
            baseUrl: 'https://twitter.com/' 
        },
        'linkedin': { 
            key: 'linkedin', 
            iconClass: 'fab fa-linkedin', 
            baseUrl: 'https://linkedin.com/in/' 
        },
        'instagram': { 
            key: 'instagram', 
            iconClass: 'fab fa-instagram', 
            baseUrl: 'https://instagram.com/' 
        }
    };

    socialLinks.forEach((link, index) => {
        const platforms = Object.keys(platformMap);
        const platform = platforms[index];
        const platformInfo = platformMap[platform];

        if (profileData.socialLinks && profileData.socialLinks[platformInfo.key]) {
            const username = profileData.socialLinks[platformInfo.key];
            link.href = `${platformInfo.baseUrl}${username}`;
            link.classList.remove('text-gray-400');
            link.classList.add('text-white');
            
            // Update icon
            const icon = link.querySelector('i');
            icon.className = `${platformInfo.iconClass} text-2xl`;
        } else {
            link.href = '#';
            link.classList.add('text-gray-400');
            link.classList.remove('text-white');
        }
    });
}

// Tab Content Loading
async function loadTabContent(tab = 'created') {
    showLoading();
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No auth token found. Please log in.');

        const response = await fetch(
            `${API_BASE_URL}/users/me/${tab}?sort=recent&page=1&limit=12`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error(`Error fetching content: ${response.statusText}`);

        const { items, hasMore } = await response.json();

        // Highlight the active tab button
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('bg-indigo-500/40'));
        var activeTab = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add("bg-indigo-500/40");
        }
        
        if (!items?.length) {
            renderEmptyState(tab);
            return;
        }

        

        renderNFTGrid(items, tab);
        updateLoadMoreButton(hasMore);
    } catch (error) {
        console.error('Error:', error);
       
    } finally {
        hideLoading();
    }
}

// Tab Switching
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('border-purple-500', 'text-white'));
            tab.classList.add('border-purple-500', 'text-white');
            loadTabContent(tab.dataset.tab);
        });
    });
}

function renderEmptyState(tab) {
    const messages = {
        created: 'Start creating your digital masterpieces!',
        owned: 'Explore and collect unique NFTs!',
        listed: 'List your NFTs for sale.',
        auctions: 'Create exciting auctions for your NFTs.',
        bids: 'You haven\'t placed any bids yet.'
    };

    document.getElementById('nftGrid').innerHTML = `
        <div class="col-span-full">
            <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-center">
                <div class="bg-purple-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h3 class="text-white text-xl font-bold mb-2">No ${tab.charAt(0).toUpperCase() + tab.slice(1)} NFTs</h3>
                <p class="text-gray-400 text-sm">${messages[tab]}</p>
            </div>
        </div>
    `;
    document.getElementById('loadMoreBtn').style.display = 'none';
}



function createNFTCard(nft, tab) {
    console.log(nft);
    const getStatusBadge = () => {
        if (nft.isAuction) {
            return `<span class="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Live Auction</span>`;
        }
        if (nft.isListed) {
            return `<span class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Listed</span>`;
        }
        return '';
    };


    
    function getActionButtons() {
        if (tab === 'created') return '';
        
        if (tab === 'listed') {
            return `
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button class="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                            data-nft-action="unlist" 
                            data-token-id="${nft.tokenId}">
                        Unlist
                    </button>
                </div>
            `;
        }
        
        if (tab === 'owned') {
            if (nft.isListed) {
                return `
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <button class="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                                data-nft-action="unlist" 
                                data-token-id="${nft.tokenId}"
                                data-current-price="${nft.price || 0}">
                            Unlist
                        </button>
                    </div>
                `;
            }
            
           
            if (!nft.isListed) {
                return `
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                        <button class="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                                data-nft-action="list" 
                                data-token-id="${nft.tokenId}">
                            List for Sale
                        </button>
                        <button class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                                data-nft-action="auction" 
                                data-token-id="${nft.tokenId}">
                            Auction
                        </button>
                    </div>
                `;
            }
        }
    
        return '';
    }

    const getAuctionDetails = () => {
        if (tab !== 'auctions') return '';
        
        const endTime = new Date(nft.auctionEndTime);
        const timeLeft = endTime - new Date();
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return `
            <div class="mt-2 pt-2 border-t border-gray-700">
                <div class="flex justify-between text-xs">
                    <span class="text-gray-400">Ends in:</span>
                    <span class="text-white">${days}d ${hours}h</span>
                </div>
                <div class="flex justify-between text-xs mt-1">
                    <span class="text-gray-400">Bids:</span>
                    <span class="text-white">${nft.bidCount || 0}</span>
                </div>
            </div>
        `;
    };

    return `
        <a href="./productdetails/${nft.tokenId}">
            <div class="bg-gray-800 rounded-lg overflow-hidden group hover:shadow-lg transition-all p-1 border-2 border-purple-500/20" 
                 data-token-id="${nft.tokenId}">
                <div class="relative aspect-square border-2 border-purple-500/20 rounded-lg mb-1">
                    ${getStatusBadge()}
                    <img src="${nft.image}" alt="${nft.name}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg">
                    ${getActionButtons()}
                </div>
                <div class="px-3 py-2 bg-gray-900 rounded-lg border-2 border-purple-500/20">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-white font-medium text-sm truncate">${nft.name}</h3>
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span class="text-xs text-gray-400">${nft.likes || 0}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                        <span class="text-purple-400 text-sm font-medium">
                            ${tab === 'auctions' ? `${nft.currentBid || 0} ETH` : `${nft.price || 0} ETH`}
                        </span>
                    </div>
                    ${getAuctionDetails()}
                </div>
            </div>
        </a>
    `;
}


function renderNFTGrid(items, tab) {
    const nftGrid = document.getElementById('nftGrid');
    nftGrid.innerHTML = items.map(nft => createNFTCard(nft, tab)).join('');
}

function updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
}

function showLoading() {
    // First, remove any existing loading modals to prevent duplicates
    const existingLoadingModal = document.getElementById('loadingModal');
    if (existingLoadingModal) {
        existingLoadingModal.remove();
    }

    const loadingHTML = `
        <div id="loadingModal" class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div class="bg-gray-800 p-8 rounded-xl flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-white text-lg">Loading...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hideLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
       
        loadingModal.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        
       
        setTimeout(() => {
            loadingModal.remove();
        }, 300);
    }
}



// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProfileData();
    loadTabContent('created');
    setupTabSwitching();
   checkAuthState();
});

