
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("nftCreationForm");
  const attributesContainer = document.getElementById("attributesContainer");
  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const createBtn = document.getElementById("createBtn");
  const addAttributeBtn = document.getElementById("addAttributeBtn");
  const imageInput = document.querySelector('input[name="image"]');
  const imagePreview = document.getElementById("imagePreview");
  const noImageText = document.getElementById("noImageText");
  const isListedCheckbox = document.querySelector('input[name="isListed"]');

  function checkAuthState() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!(accessToken && refreshToken);
  }

  function createLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'fixed inset-0 z-[100] bg-black/80 flex items-center justify-center';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        <div class="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <h2 class="text-2xl font-bold text-white mb-4">Login Required</h2>
        </div>
        <div class="p-6">
          <p class="text-gray-300 mb-6">You must be logged in to create an NFT.</p>
          <div class="flex space-x-4">
            <a href="/login" class="flex-1 text-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
              Log In
            </a>
            <button onclick="document.getElementById('loginModal').remove()" class="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function updateAttributeIndices() {
    const attributeElements = attributesContainer.querySelectorAll("[data-attribute-index]");
    attributeElements.forEach((attributeDiv, index) => {
      attributeDiv.setAttribute("data-attribute-index", index);

      const inputs = attributeDiv.querySelectorAll('input[name^="attributes"]');
      inputs.forEach((input, inputIndex) => {
        input.name = `attributes[${index}][${inputIndex === 0 ? 'trait_type' : 'value'}]`;
      });
    });
  }

  attributesContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-attribute-btn")) {
      if (attributesContainer.children.length > 1) {
        e.target.closest("[data-attribute-index]").remove();
        updateAttributeIndices();
      } else {
        alert("At least one attribute is required");
      }
    }
  });

  addAttributeBtn.addEventListener("click", function () {
    const index = attributesContainer.children.length;
    const newAttribute = document.createElement("div");
    newAttribute.className = "flex items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full gap-2 border-2 border-transparent border-t-gray-700 py-2";
    newAttribute.setAttribute("data-attribute-index", index);
    newAttribute.innerHTML = `
      <div 
        class="flex flex-1 md:flex-row flex-col gap-4">
        <!-- Input Fields -->
        <input 
          type="text" 
          name="attributes[${index}][trait_type]" 
          placeholder="Trait Type" 
          class="glass-input rounded-lg px-4 py-2 text-white flex-1" />
        <input 
          type="text" 
          name="attributes[${index}][value]" 
          placeholder="Value" 
          class="glass-input rounded-lg px-4 py-2 text-white  flex-1" />
      </div>
      <!-- Close Button -->
      <button 
        type="button" 
        class="remove-attribute-btn bg-red-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-600 transition-colors">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor">
          <path 
            fill-rule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clip-rule="evenodd" />
        </svg>
      </button>
    `;
    attributesContainer.appendChild(newAttribute);
  });

  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove("hidden");
        noImageText.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      imagePreview.classList.add("hidden");
      noImageText.classList.remove("hidden");
    }
  });

  // Loading State
  function showLoading() {
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

  function removeLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) modal.remove();
  }

  function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <span class="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 class="text-xl text-red-500 mb-4">Error</h2>
        <p class="text-gray-700">${message}</p>
        <button class="mt-4 bg-red-500 text-white px-4 py-2 rounded" onclick="this.closest('div').remove()">Close</button>
      </span>
    `;
    document.body.appendChild(modal);
  }

  function createMintedNFTModal(nftData, listingDetails) {
    const modal = document.createElement('div');
    modal.id = 'mintedNFTModal';
    modal.className = 'fixed inset-0 z-[70] bg-black/90 flex items-center justify-center';

    const fireworksCount = 5;
    const fireworksHTML = Array(fireworksCount).fill(0).map((_, i) => `
        <div class="firework" style="--delay: ${i * 0.2}s; --x: ${Math.random() * 100}%; --y: ${Math.random() * 100}%"></div>
    `).join('');

    modal.innerHTML = `
        <style>
            @keyframes paint {
                0% { stroke-dashoffset: 100%; }
                100% { stroke-dashoffset: 0; }
            }
            
            @keyframes firework {
                0% { transform: translate(var(--x), 100%) scale(0); opacity: 1; }
                50% { transform: translate(var(--x), var(--y)) scale(1); opacity: 1; }
                100% { transform: translate(var(--x), var(--y)) scale(1.2); opacity: 0; }
            }

            @keyframes slideDown {
                0% { transform: translateY(-20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }

            .graffiti-text {
                font-family: 'Arial', sans-serif;
                -webkit-text-stroke: 2px #fff;
                text-shadow: 3px 3px 0 #ff3d00,
                            6px 6px 0 #2196f3;
                animation: paint 1s linear forwards;
            }

            .success-banner {
                animation: slideDown 0.5s ease-out forwards;
            }

            .firework {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: radial-gradient(circle, 
                    #ff3d00,
                    #ff9100,
                    #ffea00,
                    #00e676,
                    #2196f3
                );
                animation: firework 1.5s ease-out infinite;
                animation-delay: var(--delay);
            }
        </style>

        ${fireworksHTML}

        <div class="bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 rounded-3xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl border-2 border-purple-500/50">
            <!-- Success Banner -->
            <div class="success-banner bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-white">Successfully Minted "${nftData.name}"!</h2>
                </div>
            </div>

            <div class="relative p-6">
                <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <svg class="absolute top-0 left-0" width="100%" height="100%">
                        <path d="M0,0 Q50,20 100,0" stroke="#ff3d00" stroke-width="2" fill="none" style="stroke-dasharray: 100%; animation: paint 1s ease-out forwards;" />
                        <path d="M0,100 Q50,80 100,100" stroke="#2196f3" stroke-width="2" fill="none" style="stroke-dasharray: 100%; animation: paint 1s ease-out forwards;" />
                    </svg>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                    <div class="relative">
                        <div class="aspect-square rounded-2xl overflow-hidden border-4 border-gradient p-1 transform hover:scale-105 transition-transform duration-300">
                            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                            <img src="${nftData.image}" alt="${nftData.name}" class="w-full h-full object-cover rounded-xl">
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="graffiti-text text-3xl font-bold text-white mb-6">${nftData.name}</h3>
                        
                        <div class="space-y-4">
                            <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <p class="text-purple-300 text-sm font-medium">Token ID</p>
                                <p class="text-white font-bold">#${nftData.tokenId}</p>
                            </div>
                            
                            <div class="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <p class="text-purple-300 text-sm font-medium">Blockchain</p>
                                <p class="text-white font-bold">Lisk Sepolia</p>
                            </div>
                        </div>
                        
                        <div class="mt-8 flex space-x-4">
                            <a href="/productdetails/${nftData.tokenId}" 
                               class="flex-1 text-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                View NFT
                            </a>
                            <button onclick="document.getElementById('mintedNFTModal').remove()" 
                                    class="flex-1 text-center bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}


async function signMessage(name, description) {
  const walletType = localStorage.getItem('wallet'); // e.g., 'metamask' or 'marcedivault'
  const rawMessage = `Sign this message to mint your NFT: ${name} - ${description}`;

  try {
    if (walletType === 'marcedivault') {
      // Optionally hash or encode the message if needed before signing
      const payload = {
        reason: 'Sign NFT Mint Message',
        action: 'personal_sign',
        message: rawMessage
      };

      const { signature, userAddress } = await marcediSignMessage(payload); // You handle signing + UI flow inside the SDK

      return {
        signature,
        userAddress,
        message: rawMessage
      };
    } else {
      // MetaMask fallback
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [rawMessage, userAddress]
      });

      return {
        signature,
        userAddress,
        message: rawMessage
      };
    }
  } catch (error) {
    console.error('Signature error:', error);
    return null;
  }
}


  async function submitForm() {
    const formData = new FormData(form);
    const accessToken = localStorage.getItem('accessToken');

    const name = formData.get('name');
    const description = formData.get('description');
    const royalty = formData.get('royalty');
    const attributes = [];

    const attributeElements = form.querySelectorAll("[data-attribute-index]");
    attributeElements.forEach(el => {
        const traitType = el.querySelector('input[name$="[trait_type]"]').value;
        const value = el.querySelector('input[name$="[value]"]').value;
        if (traitType && value) {
            attributes.push({ trait_type: traitType, value });
        }
    });

    const imageFile = form.querySelector('input[type="file"]').files[0];

    try {
        showLoading();

        const messageSignature = await signMessage(name, description);
        if (!messageSignature) {
            removeLoadingModal();
            return;
        }

        const createFormData = new FormData();
        createFormData.append('name', name);
        createFormData.append('description', description);
        createFormData.append('signature', messageSignature.signature);
        createFormData.append('userAddress', messageSignature.userAddress);
        createFormData.append('royalty', royalty);
        createFormData.append('attributes', JSON.stringify(attributes));
        createFormData.append('image', imageFile);

        const createResponse = await fetch('https://backend.tokenated.com/api/transactions/nft', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: createFormData
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.message || 'NFT Creation failed');
        }

        const { txObject, metadata } = await createResponse.json();

        // Convert gas, gasPrice, value to hex
        txObject.gas = '0x' + BigInt(txObject.gas).toString(16);
        txObject.gasPrice = '0x' + BigInt(txObject.gasPrice).toString(16);
        txObject.value = '0x' + BigInt(txObject.value).toString(16);

        console.log('Final TX Object:', txObject);

        // Detect wallet type
        const walletType = localStorage.getItem('walletType'); // "metamask" or "marcedivault"
        let txHash;

        if (walletType === 'marcedivault') {
            // Use MarcediVault SDK
            const { signTransaction } = await import('marcedi.js/secure/sign.js');
            txHash = await signTransaction(txObject);
        } else {
            // Default to MetaMask
            txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txObject]
            });
        }

        // Confirm with backend
        const confirmResponse = await fetch('https://backend.tokenated.com/api/transactions/confirmMintNFT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                transactionHash: txHash,
                metadata: metadata
            })
        });

        if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || 'NFT Confirmation failed');
        }

        const finalNFT = await confirmResponse.json();

        removeLoadingModal();
        createMintedNFTModal(finalNFT);

        localStorage.removeItem("nftDraft");
        form.reset();
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
        noImageText.classList.remove("hidden");

    } catch (error) {
        removeLoadingModal();
        showErrorModal(error.message || "Submission failed. Please try again.");
        console.error('Error:', error);
    }
}

  saveDraftBtn.addEventListener("click", function () {
    if (!checkAuthState()) {
      createLoginModal();
      return;
    }

    const draftData = Object.fromEntries(new FormData(form));

    // Manually handle attributes
    const attributes = [];
    const attributeElements = form.querySelectorAll("[data-attribute-index]");
    attributeElements.forEach(el => {
      const traitType = el.querySelector('input[name$="[trait_type]"]').value;
      const value = el.querySelector('input[name$="[value]"]').value;
      if (traitType && value) {
        attributes.push({ trait_type: traitType, value });
      }
    });

    draftData.attributes = attributes;
    localStorage.setItem("nftDraft", JSON.stringify(draftData));
    alert("Draft saved successfully!");
  });

  window.addEventListener("load", function () {
    const savedDraft = localStorage.getItem("nftDraft");
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);

      // Reset attributes container
      attributesContainer.innerHTML = "";

      // Restore form fields
      for (let [key, value] of Object.entries(draftData)) {
        if (key === "attributes") {
          value.forEach((attr, index) => {
            const newAttribute = document.createElement("div");
            newAttribute.className = "flex items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full gap-2 border-2 border-transparent border-t-gray-700 py-2";
            newAttribute.setAttribute("data-attribute-index", index);
            newAttribute.innerHTML = `
            <div 
              class="flex flex-1 md:flex-row flex-col gap-4">
              <!-- Input Fields -->
              <input type="text" 
                name="attributes[${index}][trait_type]" 
                placeholder="Trait Type" 
                value="${attr.trait_type || ""}"
                class="flex-1 glass-input rounded-lg px-4 py-2 text-white">
              <input type="text" 
                name="attributes[${index}][value]" 
                placeholder="Value" 
                value="${attr.value || ""}"
                class="flex-1 glass-input rounded-lg px-4 py-2 text-white">
              </div>
              <!-- Close Button -->
              <button 
                type="button" 
                class="remove-attribute-btn bg-red-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-600 transition-colors">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor">
                  <path 
                    fill-rule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clip-rule="evenodd" />
                </svg>
              </button>
            `;
            attributesContainer.appendChild(newAttribute);
          });
        } else if (key === 'image') {
          // Handle image restoration
          if (value) {
            imagePreview.src = value;
            imagePreview.classList.remove("hidden");
            noImageText.classList.add("hidden");
          }
        } else {
          const field = form.elements[key];
          if (field) {
            // Restore checkbox state
            if (field.type === 'checkbox') {
              field.checked = value === 'true' || value === true;
            } else {
              field.value = value;
            }
          }
        }
      }
    }
  });
  createBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    if (!checkAuthState()) {
      createLoginModal();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    await submitForm();
  });

 
});