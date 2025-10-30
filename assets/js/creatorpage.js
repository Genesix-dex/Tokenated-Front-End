// Constants
const API_BASE_URL = 'https://backend.tokenated.com';
const ITEMS_PER_PAGE = 12;

// State management
let currentPage = 1;
let isLoading = false;
let currentView = 'grid';
{/* <div class="flex items-center justify-center mt-2 space-x-2">
                  <span id="creatorAddress" class="text-gray-400"></span>
                  <button
                    class="text-gray-400 hover:text-purple-500 copy-button"
                    onclick="copyAddress()"
                  >
                    <i class="far fa-copy"></i>
                  </button>
                </div> */}
// DOM Elements
const nftGrid = document.getElementById('nftGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const profileImageContainer = document.getElementById('profileImage');
const creatorName = document.getElementById('creatorName');
const creatorAddress = document.getElementById('creatorAddress');
const totalItems = document.getElementById('totalItems');
const totalSales = document.getElementById('totalSales');
const floorPrice = document.getElementById('floorPrice');
const creatorBio = document.getElementById('creatorBio');
const socialLinks = document.getElementById('socialLinks');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const sortSelect = document.getElementById('sortSelect');
const mobileMenu = document.getElementById('mobileMenu');

// Copy address functionality
function formatAddress(address) {
    if (!address) return '';
    const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return {
      short: shortened,
      full: address
    };
  }
  function updateWalletAddress(address) {
    const formatted = formatAddress(address);
    const container = document.querySelector('.wallet-address');
    if (!container) return;

    container.innerHTML = `
      <span class="address address-short">${formatted.short}</span>
      <button class="copy-button">
        <i class="far fa-copy"></i>
        <span class="copy-tooltip" style="display: none;">Copied!</span>
      </button>
    `;

    // Add event listener properly
    const copyButton = container.querySelector('.copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', () => copyAddress(formatted.full, copyButton));
    }
}
function copyAddress(fullAddress, button) {
    if (!button || !fullAddress) return;

    navigator.clipboard.writeText(fullAddress)
        .then(() => {
            const tooltip = button.querySelector('.copy-tooltip');
            if (tooltip) {
                tooltip.style.display = 'inline';
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 2000);
            }
        })
        .catch(err => {
            console.error('Failed to copy address:', err);
        });
}



  function copyAddress(event) {
    const button = event.currentTarget;
    const addressElement = document.querySelector('.address-full');
    const address = addressElement.textContent;

    navigator.clipboard.writeText(address)
      .then(() => {
        button.classList.add('copied');
        setTimeout(() => {
          button.classList.remove('copied');
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy address:', err);
      });
  }


  function updateBioContainer(bio) {
    const bioContainer = document.querySelector('.bio-container');
    const bioText = document.querySelector('.bio-text');
    
    if (!bioContainer || !bioText) return;
    
    bioText.textContent = bio || 'No bio available';
    
    // Check if content overflows
    const isOverflowing = bioText.scrollHeight > bioText.clientHeight;
    bioContainer.classList.toggle('has-overflow', isOverflowing);
    
    // Add tooltip if overflowing
    if (isOverflowing) {
      const tooltip = document.createElement('div');
      tooltip.className = 'bio-tooltip';
      tooltip.textContent = bio;
      bioContainer.appendChild(tooltip);
    }
  }

  function updateUsername(name) {
    const nameContainer = document.querySelector('.name-container');
    const profileName = document.querySelector('.profile-name');
    
    if (!nameContainer || !profileName) return;
    
    profileName.textContent = name;
    
    // Check if content overflows
    const isOverflowing = profileName.scrollHeight > profileName.clientHeight;
    
    // Add tooltip if overflowing
    if (isOverflowing) {
      const tooltip = document.createElement('div');
      tooltip.className = 'name-tooltip';
      tooltip.textContent = name;
      nameContainer.appendChild(tooltip);
    }
  }


  function updateSocialLinks(links) {
    console.log(links);
    const socialLinksContainer = document.querySelector('.social-links');
    const showMoreButton = document.querySelector('.show-more-socials');
    
    if (!socialLinksContainer) return;
    
    // Clear existing links
    socialLinksContainer.innerHTML = '';
    
    // Convert object to array of { platform, url } objects
    const linksArray = Object.entries(links).map(([platform, url]) => ({ platform, url }));
    
    // Remove any existing count badge
    const existingBadge = document.querySelector('.social-links-count');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add social links count if more than 4 links
    if (linksArray.length > 4) {
      const countBadge = document.createElement('div');
      countBadge.className = 'social-links-count';
      countBadge.textContent = `${linksArray.length}`;
      socialLinksContainer.parentElement.appendChild(countBadge);
    }
    
    // Create social links
    linksArray.forEach(link => {
      const socialLink = document.createElement('a');
      socialLink.href = link.url;
      socialLink.target = '_blank';
      socialLink.rel = 'noopener noreferrer';
      socialLink.className = 'social-link';
      
      // Get appropriate icon class based on platform
      const iconClass = getSocialIconClass(link.platform);
      
      socialLink.innerHTML = `
        <div class="social-link-icon">
          <i class="${iconClass}"></i>
        </div>
        <span class="social-link-text">${formatPlatformName(link.platform)}</span>
      `;
      
      socialLinksContainer.appendChild(socialLink);
    });
    
    // Show 'Show More' button if there are more than 4 links
    if (linksArray.length > 4 && showMoreButton) {
      showMoreButton.classList.add('visible');
    } else if (showMoreButton) {
      showMoreButton.classList.remove('visible');
    }
  }
  
  // Helper function to get the appropriate icon class
  function getSocialIconClass(platform) {
    const platformLower = platform.toLowerCase();
    const iconMap = {
      twitter: 'fab fa-twitter',
      x: 'fab fa-x-twitter',
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      linkedin: 'fab fa-linkedin',
      youtube: 'fab fa-youtube',
      github: 'fab fa-github',
      discord: 'fab fa-discord',
      telegram: 'fab fa-telegram',
      medium: 'fab fa-medium',
      default: 'fas fa-link'
    };
    
    return iconMap[platformLower] || iconMap.default;
  }
  
  // Helper function to format platform name
  function formatPlatformName(platform) {
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  }
  
  // Toggle function for showing more social links
  function toggleSocialLinks() {
    const socialLinks = document.querySelector('.social-links');
    const showMoreButton = document.querySelector('.show-more-socials');
    
    if (socialLinks.classList.contains('expanded')) {
      socialLinks.classList.remove('expanded');
      showMoreButton.textContent = 'Show More';
    } else {
      socialLinks.classList.add('expanded');
      showMoreButton.textContent = 'Show Less';
    }
  }


  // Expand social links container
  function toggleSocialLinks() {
    const container = document.querySelector('.social-links-container');
    const button = document.querySelector('.show-more-socials');
    
    if (!container || !button) return;
    
    if (container.style.height === '120px') {
      container.style.height = 'auto';
      button.textContent = 'Show Less';
    } else {
      container.style.height = '120px';
      button.textContent = 'Show More';
    }
  }

// Fetch creator profile data
async function fetchCreatorProfile(creatorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/user/profile/${creatorId}`);
        if (!response.ok) throw new Error('Failed to fetch creator data');
        
        const data = await response.json();
        updateCreatorProfile(data);
        checkIsVerified(data);
        console.log(checkIsVerified(data));
        console.log(updateCreatorProfile(data));
    } catch (error) {
        console.error('Error fetching creator profile:', error);
    }
}

// Update creator profile in the UI
function updateCreatorProfile(data) {
    // Create and append profile image
    const img = document.createElement('img');
    img.src = data.profileImage || 'assets/images/placeholder.jpg';
    img.alt = `${data.name}'s profile`;
    img.className = 'w-full h-full object-cover';
    profileImageContainer.appendChild(img);

    // creatorName.textContent = data.name;
    totalItems.textContent = data.stats.items;
    totalSales.textContent = data.totalSales;
    // floorPrice.textContent = data.floorPrice
    updateWalletAddress(data.walletAddress);
    updateUsername(data.name);
    updateBioContainer(data.bio);
    if (data.socialLinks) {
        updateSocialLinks(data.socialLinks);
      }

     
}


function checkIsVerified(data){
  const verifiedIcon = document.getElementById("verified-icon");
  const verifiedBadge = document.getElementById("verified-badge");
  if(data.isVerified == true){
    verifiedIcon.classList.remove('hidden');
    verifiedBadge.classList.remove('hidden');
  }else{

    console.log('not verified');
  }
  console.log("is verified value",data.isVerified);
  console.log('data:',data)
}

// Fetch NFTs
async function fetchNFTs(page = 1, sortBy = 'recent') {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/nfts/nfts`);
        if (!response.ok) throw new Error('Failed to fetch NFTs');
        
        const data = await response.json();
        if (page === 1) {
            nftGrid.innerHTML = '';
        }
        
        console.log(data);
        data.forEach(nft => {
            nftGrid.appendChild(createNFTCard(nft));
        });
        
        loadMoreBtn.style.display = data.nfts.length < ITEMS_PER_PAGE ? 'none' : 'block';
        currentPage = page;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
    } finally {
        isLoading = false;
    }
}

// Create NFT card element
function createNFTCard(nft) {
    const card = document.createElement('div');
    card.className = 'group relative bg-gray-800/40 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300';
    
    // Add data-token-id to the card div
    card.dataset.tokenId = nft.tokenId;
    
    card.innerHTML = `
        <div class="relative aspect-square" onclick="redirectToNFTDetails('${nft.tokenId}')">
            <img src="${nft.image}"  alt="${nft.name}" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2">
            <h3 class="text-lg font-semibold text-white truncate">${nft.name}</h3>
            <div class="flex items-center justify-end mb-2">
              <span class="text-xs text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">
                  #${nft.tokenId}
              </span>
            </div>
          </div>
            <div class="flex items-center justify-between mt-4">
                <div>
                    <p class="text-xs text-gray-400">Price</p>
                    <p class="text-sm font-bold text-white flex items-center">
                        <img src="assets/images/ethereum-icon.png" alt="ETH" class="w-4 h-4 mr-1">
                        ${nft.price} ETH
                    </p>
                </div>
                <button class="buy-nft-btn px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                    Buy
                </button>
            </div>
        </div>
    `;
    
    return card;
}


// Handle likes
async function handleLike(nftId) {
    try {
        const response = await fetch(`${API_BASE_URL}/nfts/${nftId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to like NFT');
        
        // Refresh NFTs to update like count
        fetchNFTs(currentPage, sortSelect.value);
    } catch (error) {
        console.error('Error liking NFT:', error);
    }
}

// View mode handlers
function setViewMode(mode) {
    currentView = mode;
    if (mode === 'grid') {
        gridViewBtn.className = 'p-2 bg-purple-600 rounded-lg text-white';
        listViewBtn.className = 'p-2 bg-gray-800/40 rounded-lg text-gray-400 hover:text-white';
        nftGrid.className = 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    } else {
        listViewBtn.className = 'p-2 bg-purple-600 rounded-lg text-white';
        gridViewBtn.className = 'p-2 bg-gray-800/40 rounded-lg text-gray-400 hover:text-white';
        nftGrid.className = 'flex flex-col space-y-4';
    }
    fetchNFTs(1, sortSelect.value);
}



function redirectToNFTDetails(nftId) {
    window.location.href = `./productdetails.html?id=${nftId}`;
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const creatorId = new URLSearchParams(window.location.search).get('id');
    const loggedInUserId = localStorage.getItem("userId");

    if (loggedInUserId && loggedInUserId === creatorId) {
        // Preserve authentication token before redirecting
        const authToken = localStorage.getItem("authToken"); // If using a token
        sessionStorage.setItem("redirected", "true"); // Flag to track redirection

        window.location.href = `./owncreatorpage.html?id=${loggedInUserId}`;

        return; // Stop further execution
    }


    fetchCreatorProfile(creatorId); 
    fetchNFTs(1);
    
    // Load more button handler
    loadMoreBtn.addEventListener('click', () => {
        fetchNFTs(currentPage + 1, sortSelect.value);
    });
    
    // Sort handler
    sortSelect.addEventListener('change', (e) => {
        currentPage = 1;
        fetchNFTs(1, e.target.value);
    });
    
    // View mode handlers
    gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    listViewBtn.addEventListener('click', () => setViewMode('list'));
});