// Modal HTML templates

const accessToken = localStorage.getItem('accessToken');
if (!accessToken) throw new Error('No auth token found. Please log in.');

const editProfileModalTemplate = `
  <div class="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-2xl p-6 w-[400px] max-w-full relative overflow-hidden">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-white">Edit Profile</h2>
      <button class="text-white/70 hover:text-white close-modal">&times;</button>
    </div>
    
    <form id="editProfileForm" class="space-y-4">
      <div class="flex flex-col items-center mb-4">
        <div class="relative">
          <img id="profileImagePreview" src="/default-avatar.png" class="w-24 h-24 rounded-full object-cover border-2 border-gray-600/50">
          <input type="file" id="profileImageInput" accept="image/*" class="hidden">
          <label for="profileImageInput" class="absolute bottom-0 right-0 bg-gray-700/50 rounded-full p-1 cursor-pointer hover:bg-gray-600/50">
            <i class="fas fa-camera"></i>
          </label>
        </div>
      </div>

      <input type="text" id="usernameInput" placeholder="Username" class="w-full bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
      <textarea id="aboutInput" placeholder="About" class="w-full bg-gray-900/30 text-white p-2 rounded h-20 border border-gray-700/30 focus:border-purple-500 focus:outline-none"></textarea>

      <div class="grid grid-cols-3 gap-2">
        <input type="text" id="twitterInput" placeholder="Twitter" class="bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
        <input type="text" id="linkedinInput" placeholder="LinkedIn" class="bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
        <input type="text" id="githubInput" placeholder="GitHub" class="bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
      </div>

      <div class="space-y-2">
        <h3 class="text-white text-sm font-semibold">Authentication Methods</h3>
        <div id="connectedAccounts" class="space-y-2">
          <!-- Connected accounts will be inserted here -->
        </div>
        <button type="button" id="addAuthMethod" class="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
          + Add Auth Method
        </button>
      </div>

      <button type="submit" class="w-full bg-purple-500 hover:bg-purple-600 transition-colors text-white py-2 rounded-lg font-medium">
        Save Profile
      </button>
    </form>
  </div>
`;

const authMethodModalTemplate = `
  <div class="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-2xl p-6 w-[400px] max-w-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-white">Add Authentication Method</h2>
      <button class="text-white/70 hover:text-white close-modal">&times;</button>
    </div>

    <div class="space-y-4">
      <div id="authMethodSelector" class="space-y-4">
        <!-- Auth method buttons will be added dynamically -->
      </div>

      <div id="emailForm" class="hidden space-y-4">
        <input type="email" id="emailInput" placeholder="Email" class="w-full bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
        <input type="password" id="passwordInput" placeholder="Password" class="w-full bg-gray-900/30 text-white p-2 rounded border border-gray-700/30 focus:border-purple-500 focus:outline-none">
        <button type="button" id="submitEmail" class="w-full bg-purple-500 hover:bg-purple-600 transition-colors text-white py-2 rounded-lg">
          Link Email
        </button>
      </div>
    </div>
  </div>
`;

const resultsModalTemplate = `
  <div class="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-2xl p-6 w-[400px] max-w-full relative overflow-hidden">
    <div class="flex justify-between items-center mb-4">
      <h2 id="resultsTitle" class="text-xl font-semibold text-white">Operation Result</h2>
      <button class="text-white/70 hover:text-white close-modal">&times;</button>
    </div>
    
    <div id="resultsContent" class="space-y-4">
      <div id="resultsIcon" class="flex justify-center mb-2">
        <!-- Icon will be inserted here -->
      </div>
      
      <div id="resultsMessage" class="text-white text-center">
        <!-- Message will be inserted here -->
      </div>
      
      <div id="resultsDetails" class="text-gray-300 text-sm bg-gray-900/30 p-3 rounded-lg max-h-40 overflow-y-auto hidden">
        <!-- Additional details will be inserted here if needed -->
      </div>
    </div>
    
    <div class="mt-6 flex justify-center">
      <button id="resultsCloseBtn" class="bg-purple-500 hover:bg-purple-600 transition-colors text-white py-2 px-6 rounded-lg font-medium">
        Close
      </button>
    </div>
  </div>
`;

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
        // Add a fade-out animation before removing
        loadingModal.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        
        // Remove the modal after the animation
        setTimeout(() => {
            loadingModal.remove();
        }, 300);
    }
}
class Modal {
    constructor(template, modalId, userData = null) {
        this.modalId = modalId;
        this.template = template;
        this.userData = userData;
        this.modal = null;
        this.isVisible = false;
        this.createModal();
    }

    createModal() {
        const modalContainer = document.createElement('div');
        modalContainer.id = this.modalId;
        modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center';
        modalContainer.innerHTML = this.template;
        document.body.appendChild(modalContainer);

        this.modal = modalContainer;
        
        // If user data is provided and the modal is for edit profile, populate fields
        if (this.userData && this.modalId === 'editProfileModal') {
            this.populateEditProfileFields();
        }

        this.setupEventListeners();
    }

    populateEditProfileFields() {
        const data = this.userData;
        if (!data) return;

        // Profile image
        const profileImage = this.modal.querySelector('#profileImagePreview');
        if (profileImage && data.profilePicture) {
            profileImage.src = data.profilePicture;
        }

        // Input fields
        const fields = [
            { id: 'usernameInput', key: 'username' },
            { id: 'aboutInput', key: 'about' },
            { id: 'twitterInput', key: 'twitter' },
            { id: 'linkedinInput', key: 'linkedin' },
            { id: 'githubInput', key: 'github' }
        ];

        fields.forEach(field => {
            const input = this.modal.querySelector(`#${field.id}`);
            if (input) {
                input.value = data[field.key] || '';
            }
        });
    }

    setupEventListeners() {
        const closeBtn = this.modal.querySelector('.close-modal');
        closeBtn?.addEventListener('click', () => this.hide());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        this.modal.classList.remove('hidden');
        this.isVisible = true;
    }

    hide() {
        this.modal.classList.add('hidden');
        this.isVisible = false;
    }

    reset() {
        const forms = this.modal.querySelectorAll('form');
        forms.forEach(form => form.reset());

        if (this.modalId === 'authMethodModal') {
            const selector = this.modal.querySelector('#authMethodSelector');
            const emailForm = this.modal.querySelector('#emailForm');
            if (selector && emailForm) {
                selector.classList.remove('hidden');
                emailForm.classList.add('hidden');
            }
        }
    }
}
class ProfileManager {
    constructor() {
        this.editProfileModal = new Modal(editProfileModalTemplate, 'editProfileModal');
        this.authMethodModal = new Modal(authMethodModalTemplate, 'authMethodModal');
        this.resultsModal = new Modal(resultsModalTemplate, 'resultsModal');
        this.connectedAuthMethods = new Set();
        this.userData = null;
        this.initialized = false;
        
        // Setup event listeners first
        this.setupEventListeners();
    }

    populateEditProfileForm() {
        if (!this.userData) {
            console.warn('No user data available to update form fields');
            return;
        }
        
        const data = this.userData;
        
        // Debugging log
        console.log('Populating edit profile form with data:', data);
        
        // Update profile image
        const profileImage = document.getElementById('profileImagePreview');
        if (profileImage) {
            profileImage.src = data.profilePicture || '/default-avatar.png';
        }

        // Update input fields
        const fields = [
            { id: 'usernameInput', key: 'username' },
            { id: 'aboutInput', key: 'about' },
            { id: 'twitterInput', key: 'twitter' },
            { id: 'linkedinInput', key: 'linkedin' },
            { id: 'githubInput', key: 'github' }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.value = data[field.key] || '';
            }
        });

        // Update connected auth methods
        this.updateAuthMethodsUI(data);

        // Show the modal
        this.editProfileModal.show();
    }

    async handleApiResponse(response, defaultErrorMessage) {
        try {
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || defaultErrorMessage);
            }
            
            return data;
        } catch (error) {
            if (error.name === 'SyntaxError') {
                throw new Error(`Server returned invalid response: ${response.statusText || defaultErrorMessage}`);
            } else if (error.message === 'Failed to fetch') {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            }
            
            throw error;
        }
    }

    async fetchUserProfile() {
        try {
            showLoading();
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('No auth token found. Please log in.');

            const response = await fetch('https://backend.tokenated.com/api/users/profile', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }).catch(() => {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            });
            
            const data = await this.handleApiResponse(response, 'Failed to fetch profile');
            
            // Store the user data
            this.userData = data.user || data; // Handle both {user: {...}} and direct user object
            
            // Update UI with the fetched data
           
            this.updateAuthMethodsUI(this.userData);
            
            return this.userData;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            this.showResults('error', 'Profile Fetch Failed', error.message);
            throw error;
        } finally {
            hideLoading();
        }
    }

    setupEventListeners() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.populateEditProfileForm();
                this.editProfileModal.show();
            });
        }

        const profileImageInput = document.getElementById('profileImageInput');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', this.handleImagePreview.bind(this));
        }

        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        const addAuthMethod = document.getElementById('addAuthMethod');
        if (addAuthMethod) {
            addAuthMethod.addEventListener('click', () => {
                this.authMethodModal.reset();
                this.populateAuthMethodSelector();
                this.authMethodModal.show();
            });
        }

        const authMethodSelector = document.getElementById('authMethodSelector');
        if (authMethodSelector) {
            authMethodSelector.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-method]');
                if (button) {
                    this.handleAuthMethodSelection(button.dataset.method);
                }
            });
        }

        const submitEmail = document.getElementById('submitEmail');
        if (submitEmail) {
            submitEmail.addEventListener('click', () => this.handleEmailLink());
        }
        
        const resultsCloseBtn = document.getElementById('resultsCloseBtn');
        if (resultsCloseBtn) {
            resultsCloseBtn.addEventListener('click', () => {
                this.resultsModal.hide();
            });
        }
    }

    populateAuthMethodSelector() {
        const selector = document.getElementById('authMethodSelector');
        if (!selector) return;
        
        selector.innerHTML = '';
        
        const authMethods = [
            { id: 'email', icon: 'fas fa-envelope', label: 'Link Email' },
            { id: 'wallet', icon: 'fas fa-wallet', label: 'Link Wallet' },
            { id: 'google', icon: 'fab fa-google', label: 'Link Google' }
        ];
        
        // Filter out already connected methods
        const availableMethods = authMethods.filter(method => 
            !this.connectedAuthMethods.has(method.id)
        );
        
        // Add buttons for available methods
        availableMethods.forEach(method => {
            const button = document.createElement('button');
            button.dataset.method = method.id;
            button.className = 'w-full bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2';
            button.innerHTML = `
                <i class="${method.icon}"></i>
                <span>${method.label}</span>
            `;
            selector.appendChild(button);
        });
        
        // Show a message if no methods are available
        if (availableMethods.length === 0) {
            const message = document.createElement('div');
            message.className = 'text-center text-gray-400 py-4';
            message.textContent = 'All authentication methods have been linked to your account.';
            selector.appendChild(message);
        }
    }

    async populateEditProfileForm() {
        console.group('🔍 Populating Edit Profile Form');
        console.time('populateEditProfileForm');
    
        try {
            // Check if user data exists
            if (!this.userData || Object.keys(this.userData).length === 0) {
                console.log('❗ No user data found. Fetching profile...');
                try {
                    await this.fetchUserProfile();
                    console.log('✅ User profile successfully fetched');
                } catch (error) {
                    console.error('❌ Failed to fetch user profile:', error);
                    this.showResults('error', 'Profile Load Error', 'Could not load user profile');
                    return;
                }
            }
    
            // Log the entire user data for comprehensive debugging
            console.log('📦 User Data:', JSON.parse(JSON.stringify(this.userData)));
    
            // Define fields to update with their corresponding data keys
            const fieldsToUpdate = [
                { elementId: 'profileImagePreview', dataKey: 'profileImage', type: 'image' },
                { elementId: 'usernameInput', dataKey: 'name', type: 'input' },
                { elementId: 'aboutInput', dataKey: 'bio', type: 'input' },
                { elementId: 'twitterInput', dataKey: 'socialLinks.twitter', type: 'input' },
                { elementId: 'linkedinInput', dataKey: 'socialLinks.linkedin', type: 'input' },
                { elementId: 'githubInput', dataKey: 'socialLinks.github', type: 'input' }
            ];
    
            // Update each field with detailed logging
            fieldsToUpdate.forEach(field => {
                try {
                    this.updateField(field.elementId, field.dataKey, field.type);
                } catch (fieldError) {
                    console.warn(`⚠️ Error updating field ${field.elementId}:`, fieldError);
                }
            });
    
            // Update connected auth methods
            try {
                this.updateAuthMethodsUI(this.userData);
                console.log('✅ Auth methods UI updated successfully');
            } catch (authMethodError) {
                console.error('❌ Failed to update auth methods:', authMethodError);
            }
    
            // Show the modal
            this.editProfileModal.show();
            console.log('🖼️ Edit profile modal displayed');
    
        } catch (generalError) {
            console.error('❌ Unexpected error in populateEditProfileForm:', generalError);
            this.showResults('error', 'Profile Form Error', 'An unexpected error occurred while preparing the profile form');
        } finally {
            console.timeEnd('populateEditProfileForm');
            console.groupEnd();
        }
    }
    
    updateField(elementId, dataKey, type = 'input') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`❗ Element with id ${elementId} not found`);
            return;
        }
    
        // Get the value, handling nested keys
        let value = this.userData;
        const keys = dataKey.split('.');
        for (const key of keys) {
            value = value ? value[key] : '';
        }
    
        // Fallback to empty string if value is undefined
        value = value || '';
    
        console.log(`🔧 Updating ${elementId}:`, {
            dataKey,
            rawValue: value,
            type
        });
    
        try {
            if (type === 'image') {
                // Special handling for profile image
                element.src = value || '/default-avatar.png';
                console.log(`🖼️ Set image source to: ${element.src}`);
            } else {
                // For input fields
                element.value = value;
                console.log(`✏️ Set input value to: ${element.value}`);
            }
        } catch (error) {
            console.error(`❌ Failed to update ${elementId}:`, error);
        }
    }

    showResults(type, title, message, details = null) {
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsIcon = document.getElementById('resultsIcon');
        const resultsMessage = document.getElementById('resultsMessage');
        const resultsDetails = document.getElementById('resultsDetails');
        
        if (resultsTitle) resultsTitle.textContent = title;
        
        if (resultsIcon) {
            let iconClass, iconColor;
            
            switch (type) {
                case 'success':
                    iconClass = 'fas fa-check-circle';
                    iconColor = 'text-green-400';
                    break;
                case 'error':
                    iconClass = 'fas fa-exclamation-circle';
                    iconColor = 'text-red-400';
                    break;
                case 'warning':
                    iconClass = 'fas fa-exclamation-triangle';
                    iconColor = 'text-yellow-400';
                    break;
                case 'info':
                default:
                    iconClass = 'fas fa-info-circle';
                    iconColor = 'text-blue-400';
                    break;
            }
            
            resultsIcon.innerHTML = `<i class="${iconClass} ${iconColor} text-4xl"></i>`;
        }
        
        if (resultsMessage) resultsMessage.textContent = message;
        
        if (resultsDetails) {
            if (details) {
                resultsDetails.textContent = typeof details === 'object' ? 
                    JSON.stringify(details, null, 2) : details;
                resultsDetails.classList.remove('hidden');
            } else {
                resultsDetails.classList.add('hidden');
            }
        }
        
        this.resultsModal.show();
    }

    async handleAuthMethodSelection(method) {
        try {
            switch (method) {
                case 'email':
                    const selector = document.getElementById('authMethodSelector');
                    const emailForm = document.getElementById('emailForm');
                    if (selector && emailForm) {
                        selector.classList.add('hidden');
                        emailForm.classList.remove('hidden');
                    }
                    break;

                case 'wallet':
                    await this.handleWalletLink();
                    break;

                case 'google':
                    await this.handleGoogleLink();
                    break;
            }
        } catch (error) {
            console.error('Auth method selection failed:', error);
            this.showResults('error', 'Authentication Error', error.message);
            this.authMethodModal.hide();
        }
    }

    async handleEmailLink() {
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        
        if (!emailInput || !passwordInput) {
            this.showResults('warning', 'Form Error', 'Email or password input fields not found');
            return;
        }
        
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            this.showResults('warning', 'Validation Error', 'Please provide both email and password.');
            return;
        }

        try {
            showLoading();
            const accessToken = localStorage.getItem('accessToken');
            
            const response = await fetch('https://backend.tokenated.com/api/auth/link/email', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            }).catch(() => {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            });

            const data = await this.handleApiResponse(response, 'Failed to link email account');
            
            this.authMethodModal.hide();
            this.showResults('success', 'Email Verification Sent', data.message || `Verification email sent to: ${email}`);
            
            if (data.user) {
                this.userData = data.user;
                this.updateAuthMethodsUI(data.user);
                this.connectedAuthMethods.add('email');
            }
        } catch (error) {
            console.error('Email link failed:', error);
            this.showResults('error', 'Email Link Failed', error.message);
        } finally {
            hideLoading();
        }
    }

    async handleWalletLink() {
        if (!window.ethereum) {
            this.showResults('error', 'Wallet Error', 'MetaMask is not installed. Please install MetaMask to link a wallet.');
            throw new Error('MetaMask is not installed');
        }

        try {
            showLoading();
            
            let accounts;
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                throw new Error(`MetaMask connection failed: ${error.message}`);
            }
            
            const address = accounts[0];
            let signature;
            
            try {
                const message = `Link wallet ${address} to account`;
                signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, address]
                });
            } catch (error) {
                throw new Error(`Signature request failed: ${error.message}`);
            }

            const accessToken = localStorage.getItem('accessToken');
            const message = `Link wallet ${address} to account`;
            
            const response = await fetch('https://backend.tokenated.com/api/auth/link/wallet', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address, signature, message })
            }).catch(() => {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            });

            const data = await this.handleApiResponse(response, 'Failed to link wallet');

            this.userData = data.user;
            this.updateAuthMethodsUI(data.user);
            this.connectedAuthMethods.add('wallet');
            this.authMethodModal.hide();
            this.showResults('success', 'Wallet Linked', `Successfully linked wallet: ${address.slice(0, 6)}...${address.slice(-4)}`);
        } catch (error) {
            console.error('Wallet link failed:', error);
            this.showResults('error', 'Wallet Link Failed', error.message);
        } finally {
            hideLoading();
        }
    }

    async handleGoogleLink() {
        try {
            showLoading();
            
            let googleToken;
            try {
                const auth2 = await gapi.auth2.getAuthInstance();
                const googleUser = await auth2.signIn();
                googleToken = googleUser.getAuthResponse().id_token;
            } catch (error) {
                throw new Error(`Google authentication failed: ${error.message}`);
            }

            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('https://backend.tokenated.com/api/auth/link/google', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ googleToken })
            }).catch(() => {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            });

            const data = await this.handleApiResponse(response, 'Failed to link Google account');

            this.userData = data.user;
            this.updateAuthMethodsUI(data.user);
            this.connectedAuthMethods.add('google');
            this.authMethodModal.hide();
            this.showResults('success', 'Google Account Linked', `Successfully linked Google account: ${data.user.googleEmail}`);
        } catch (error) {
            console.error('Google link failed:', error);
            this.showResults('error', 'Google Link Failed', error.message);
        } finally {
            hideLoading();
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        // First, show a confirmation modal
        const confirmed = await this.showConfirmationModal();
        if (!confirmed) return;

        try {
            showLoading();
            const formData = new FormData();
            
            // Get form elements safely
            const usernameInput = document.getElementById('usernameInput');
            const aboutInput = document.getElementById('aboutInput');
            const twitterInput = document.getElementById('twitterInput');
            const linkedinInput = document.getElementById('linkedinInput');
            const githubInput = document.getElementById('githubInput');
            const profileImageInput = document.getElementById('profileImageInput');
            
           
            
            // Add form data if elements exist
            if (usernameInput) {
                console.log("Username:", usernameInput.value);
                formData.append('username', usernameInput.value);
            }
            if (aboutInput) {
                console.log("About:", aboutInput.value);
                formData.append('about', aboutInput.value);
            }
            if (twitterInput) {
                console.log("Twitter:", twitterInput.value);
                formData.append('twitter', twitterInput.value);
            }
            if (linkedinInput) {
                console.log("LinkedIn:", linkedinInput.value);
                formData.append('linkedin', linkedinInput.value);
            }
            if (githubInput) {
                console.log("GitHub:", githubInput.value);
                formData.append('github', githubInput.value);
            }
            
            if (profileImageInput && profileImageInput.files[0]) {
                console.log("Profile Image Selected:", profileImageInput.files[0].name);
                formData.append('profileImage', profileImageInput.files[0]);
            }
            
            // Log FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }
            
            
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('https://backend.tokenated.com/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            }).catch(() => {
                throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
            });
            
            const data = await this.handleApiResponse(response, 'Failed to update profile');
            
            this.userData = data.user || data;
            this.editProfileModal.hide();
            this.showResults('success', 'Profile Updated', 'Your profile has been successfully updated.');
            
            // Refresh the form fields with the updated data
            await this.populateEditProfileForm();
        } catch (error) {
            console.error('Profile update failed:', error);
            this.showResults('error', 'Profile Update Failed', error.message);
        } finally {
            hideLoading();
        }
    }

    showConfirmationModal() {
        return new Promise((resolve) => {
            const confirmationTemplate = `
                <div class="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/50 rounded-xl shadow-2xl p-6 w-[400px] max-w-full">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold text-white">Confirm Profile Update</h2>
                    </div>
                    
                    <div class="text-white mb-4">
                        Are you sure you want to update your profile with the current changes?
                    </div>
                    
                    <div class="flex justify-between space-x-4">
                        <button id="confirmUpdateBtn" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                            Confirm
                        </button>
                        <button id="cancelUpdateBtn" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            const confirmationModal = document.createElement('div');
            confirmationModal.id = 'confirmationModal';
            confirmationModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center';
            confirmationModal.innerHTML = confirmationTemplate;
            document.body.appendChild(confirmationModal);

            const confirmBtn = confirmationModal.querySelector('#confirmUpdateBtn');
            const cancelBtn = confirmationModal.querySelector('#cancelUpdateBtn');

            const cleanup = () => {
                confirmationModal.remove();
                document.removeEventListener('keydown', escapeHandler);
            };

            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve(false);
                }
            };

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            document.addEventListener('keydown', escapeHandler);
        });
    }


    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const profileImagePreview = document.getElementById('profileImagePreview');
                if (profileImagePreview) {
                    profileImagePreview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    updateAuthMethodsUI(userData) {
        if (!userData) {
            console.warn('No user data available to update auth methods UI');
            return;
        }
        
        const container = document.getElementById('connectedAccounts');
        if (!container) return;

        container.innerHTML = '';
        this.connectedAuthMethods.clear();

        if (userData.email) this.connectedAuthMethods.add('email');
        if (userData.walletAddress) this.connectedAuthMethods.add('wallet');
        if (userData.googleId) this.connectedAuthMethods.add('google');

        this.connectedAuthMethods.forEach(method => {
            const methodEl = document.createElement('div');
            methodEl.className = 'flex items-center justify-between bg-gray-900/30 p-2 rounded';

            const icon = this.getAuthMethodIcon(method);
            const value = this.getAuthMethodValue(method, userData);

            methodEl.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="${icon} text-gray-400"></i>
                    <span class="text-white">${value}</span>
                </div>
            `;
            
            container.appendChild(methodEl);
        });

        const addButton = document.getElementById('addAuthMethod');
        if (addButton) {
            addButton.disabled = this.connectedAuthMethods.size >= 3;
        }
    }

    getAuthMethodIcon(method) {
        switch (method) {
            case 'email': return 'fas fa-envelope';
            case 'wallet': return 'fas fa-wallet';
            case 'google': return 'fab fa-google';
            default: return 'fas fa-key';
        }
    }

    getAuthMethodValue(method, userData) {
        switch (method) {
            case 'email': return userData.email;
            case 'wallet': return `${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`;
            case 'google': return userData.googleEmail;
            default: return method;
        }
    }

   
}

// Initialize the ProfileManager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});

put