
function redirectToNFTDetails(nftId) {
    window.location.href = `./productdetails.html?id=${nftId}`;
}

function redirectToAuctionDetails(auctionId) {
    window.location.href = `./auctiondetails.html?id=${auctionId}`;
}


function redirectToCreatorProfile(creatorId) {
    const loggedInUserId = localStorage.getItem("userId"); // Get user ID as a string

    if (loggedInUserId && loggedInUserId === creatorId) {
        window.location.href = `./owncreatorpage.html?id=${loggedInUserId}`;
    } else {
        window.location.href = `./creatorpage.html?id=${creatorId}`;
    }
}
