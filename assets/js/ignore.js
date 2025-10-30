/*<div class="w-full max-w-4xl bg-[#151821] p-6 rounded-xl shadow-lg">
<!-- Main Content Grid -->
<div class="bg-green-500/20 rounded-lg p-4 flex items-center justify-between">
          <span class="text-green-400 font-semibold">Fixed Price</span>
          <span class="px-3 py-1 bg-green-500/30 rounded-full text-green-300">
            #${nftData.tokenId}
          </span>
        </div>
<div class="grid md:grid-cols-2 gap-6">
    
    <!-- Left Side: Image Box -->
    <div class="relative bg-[#080A10] rounded-xl p-4 border border-blue-500">
        <img src="${nftData.image}" alt="${nftData.name}" class="rounded-xl w-full">
        
        <!-- Top Circle Indicator -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
    </div>

    <!-- Right Side: Details -->
    <div class="space-y-4">
        <h2 class="text-xl font-bold">${nftData.name}</h2>
        <p class="text-sm text-gray-400">
             ${nftData.description}
        </p>
        <!-- Owner Info -->
        <div class="bg-gray-900/50 rounded-lg p-4">
          <h3 class="text-white font-semibold mb-4">Current Owner</h3>
          <div class="flex items-center space-x-3">
            <img src="${nftData.owner?.profileImage}" alt="" class="w-10 h-10 rounded-full">
            <div>
              <p class="text-white">${nftData.owner?.username || 'Unknown'}</p>
              <p class="text-sm text-gray-400">Owner since ${new Date(nftData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
    </div>
</div>

<!-- Bid Information -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
    <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
        <p class="text-sm text-gray-400">Current price</p>
        <p class="text-lg font-bold">${nftData.price["$numberDecimal"]} ETH</p>
        <p class="text-lg font-bold">≈ $${(nftData.price["$numberDecimal"] * 3000).toLocaleString()} USD </p>
    </div>

    <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
    <button class="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg transition-colors " data-nft-action="buy"
        data-token-id="${nftData.tokenId}"
        data-nft-name="${nftData.name}"
        data-nft-image="${nftData.image}"
        data-current-price="${nftData.price["$numberDecimal"]}">
          Buy Now for ${nftData.price["$numberDecimal"]} ETH
        </button>
    </div>
</div>


</div>*/









/*

  <div class="w-full max-w-4xl bg-[#151821] p-6 rounded-xl shadow-lg nft-details-container">
    <!-- Main Content Grid -->
    <div class="bg-purple-500/20 rounded-lg p-4 flex items-center justify-between mb-4">
      <div>
        <span class="text-purple-400 font-semibold">
          ${isEnded ? 'Auction Ended' : 'Live Auction'}
        </span>
        <p class="text-sm text-gray-300 mt-1">Created by ${nftData.creatorName}</p>
      </div>
      <span class="px-3 py-1 bg-purple-500/30 rounded-full text-purple-300">
        #${nftData.tokenId}
      </span>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
        
        <!-- Left Side: Image Box -->
        <div class="relative bg-[#080A10] rounded-xl p-4 border border-blue-500">
            <img src="https://via.placeholder.com/400x300" alt="NFT Image" class="rounded-xl w-full nft-image">
            
            <!-- Top Circle Indicator -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
        </div>
    
        <!-- Right Side: Details -->
        <div class="space-y-4">
            <h2 class="text-xl font-bold nft-title">THE CYROPUNCKS</h2>
            <p class="text-sm text-gray-400 nft-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac lorem nec sapien vehicula.
            </p>
        </div>
    </div>
    
    <!-- Bid Information -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
            <p class="text-sm text-gray-400">Current price</p>
            <p class="text-lg font-bold">0.2 ETH</p>
        </div>
    
        <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
            <button class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg buy-button">
            buy
        </button>
        </div>
    </div>
    
    
    </div>
    */







    

    /*
        <div class="container mx-auto px-4 py-16 nft-details-container mt-6">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- NFT Image -->
        <div>
            <img class="nft-image w-full rounded-lg" src="" alt="NFT Image">
        </div>

        <!-- NFT Details -->
        <div>
            <h1 class="nft-title text-3xl font-bold mb-4"></h1>
            <p class="nft-description text-gray-400 mb-6"></p>

            <!-- Creator Info -->
            <div class="flex items-center mb-6">
                <img class="creator-avatar w-12 h-12 rounded-full mr-4" src="" alt="Creator">
                <div>
                    <p class="text-gray-500">Created by</p>
                    <h3 class="nft-creator font-semibold"></h3>
                </div>
            </div>

            <!-- Price and Buy Section -->
            <div class="bg-gray-800 p-6 rounded-lg">
                <p class="text-gray-400 mb-2">Current Price</p>
                <div class="flex justify-between items-center">
                    <span class="nft-price text-2xl font-bold"></span>
                    <button class="buy-button bg-purple-600 text-white px-6 py-2 rounded-lg">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    </div>
  </div>
  */






  /*
  <!-- Main Content Grid -->
      <div class="bg-purple-500/20 rounded-lg p-4 flex items-center justify-between mb-4">
        <div>
          <span class="text-purple-400 font-semibold">
           <!-- ${isEnded ? 'Auction Ended' : 'Live Auction'}-->
          </span>
          <p class="text-sm text-gray-300 mt-1">Created by <!-- ${nftData.creatorName} --></p>
        </div>
        <span class="px-3 py-1 bg-purple-500/30 rounded-full text-purple-300">
         <!--  #${nftData.tokenId} -->
        </span>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Left Side: Image Box -->
          <div class="relative bg-[#080A10] rounded-xl p-4 border border-blue-500">
              <img src="https://via.placeholder.com/400x300" alt="NFT Image" class="rounded-xl w-full nft-image">
              
              <!-- Top Circle Indicator -->
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
      
          <!-- Right Side: Details -->
          <div class="space-y-4">
              <h2 class="text-xl font-bold nft-title">THE CYROPUNCKS</h2>
              <p class="text-sm text-gray-400 nft-description">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac lorem nec sapien vehicula.
              </p>
          </div>
      </div>
      
      <!-- Bid Information -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
              <p class="text-sm text-gray-400">Current price</p>
              <p class="text-lg font-bold"></p>
          </div>
      
          <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2">
              <button class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg buy-button">
              buy
          </button>
          </div>
      </div>
      */




      
      
      
//  <div class="group relative flex-shrink-0 w-64 sm:w-72 md:w-full" data-creator-id="${creator._id}">
//           <div class="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl p-4 transition-transform hover:scale-[1.02]">
//             <div class="flex flex-col items-center space-y-4">
//             <div class="flex items-center space-x-4 w-full">
//                 <img loading="lazy"
//                 src="${creator.profileImage}" 
//                 alt="${creator.username}" 
//                 class="w-16 h-16 rounded-full border-2 border-white/20 object-cover transition group-hover:scale-110 flex-shrink-0"
//                 >
//                 <div class="flex-grow min-w-0">
//                 <h3 class="text-base font-bold text-white truncate">${creator.username}</h3>
//                 <div class="flex justify-between mt-1">
//                     <div class="text-center">
//                     <p class="text-gray-400 text-xs">NFTs</p>
//                     <p class="text-white font-semibold text-sm">${creator.nftCount}</p>
//                     </div>
//                     <div class="text-center">
//                     <p class="text-gray-400 text-xs">Volume</p>
//                     <p class="text-white font-semibold text-sm">${creator.totalVolume?.$numberDecimal ? creator.totalVolume["$numberDecimal"] : 0} ETH</p>
//                     </div>
//                 </div>
//                 </div>
//             </div>
//             <button 
//                 onclick="redirectToCreatorProfile('${creator._id}')" 
//                 class="w-full bg-purple-600/50 backdrop-blur-lg text-white py-2 rounded-xl hover:bg-purple-600/70 transition-colors duration-300 text-sm"
//             >
//                 View Profile
//             </button>
//             </div>
//           </div>
//         </div>


// ${isOwner ? `
//             <div class="mt-3 pt-3 border-t border-gray-700">
//                 <p class="text-sm text-gray-400">
//                     <span class="text-purple-400">${requestCount}</span> ${requestCount === 1 ? 'user has' : 'users have'} requested you list this NFT
//                 </p>
//             </div>` : ''}