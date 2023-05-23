const cx = 'd12e2d99b583540be'; // Replace with your unique CX ID (Search engine ID)
const apiKey = 'AIzaSyAXjXZeka2IzdYJpD6voJ6kMazq1zadK1s'; // Replace with your Google API key
var currentPage = 1;
var resultsPerPage = 10;
var totalResults = 0;
var nextPageToken = '';
var prevPageToken = '';
var externalVideoLink = ''

function search(page = 1) {
    var startIndex = (page - 1) * resultsPerPage + 1;
    var searchTerm = document.getElementById('search-term').value || ' ';
    var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchTerm)}&key=${apiKey}&maxResults=${resultsPerPage}`

    // Send an HTTP request to the Google Custom Search API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // var data = 
            var results = data.items;
            try {
                if (data && data.pageInfo && data.pageInfo.totalResults) {
                    totalResults = parseInt(data.pageInfo.totalResults);
                }
            } catch (e) {
                console.log("not able to get total records")
            }

            try {
                if (data.nextPageToken) {
                    pageToken = data.nextPageToken;
                }
            }
            catch (e) { }
            var listItemsHtml = document.getElementById('list');
            listItemsHtml.innerHTML = ''
            if (results) {
                results.forEach(async result => {

                    var fetchedVideoUrl = ''
                    var fetchedViewCount = ''
                    var videoId = result.id.videoId;
                    var videoThumbnail = ''
                    var videoTile = ' '


                    videoThumbnail = result.snippet.thumbnails.default.url || '/images/video-thum.png'
                    videoTile = result.snippet.title

                    try {


                        var viewCount = '';

                        // Retrieve and display video URL and view count
                        await getVideoDetails(videoId, function (videoUrl, viewCount) {
                            fetchedVideoUrl = videoUrl;
                            fetchedViewCount = viewCount + ' Views';


                        });


                        listItemsHtml.innerHTML += `
                    <div class="card item">
                        <div class="thumb-part">
                            <img src="${videoThumbnail}" onclick="showVideo('${fetchedVideoUrl}')" />
                            </div>
                            <div class="title">
                                <h4 class="video-title" onclick="showVideo('${fetchedVideoUrl}')" style="cursor:pointer">
                                  ${videoTile}
                                </h4>
                            <div class="signer"> ddfdf</div>
                            <div class="title-bottom">
                                <div class="yt-brand">
                                    <img src="./images/yt.png" /> <span>Youtube.com</span>
                                </div>
                                <div class="views">
                                    ${fetchedViewCount} 
                                </div>
                            </div>
                        </div>
                    </div>`;
                    } catch (e) {
                        console.log(e)
                    }
                });


            } else {
                console.log('No results found.');
            }
            updatePaginationControls();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function updatePaginationControls() {

    var prevButton = document.getElementById('prev-button');
    var nextButton = document.getElementById('next-button');

    // Show/hide pagination buttons based on current page
    if (currentPage === 1) {
        prevButton.style.display = 'none';
        document.getElementById('current-page').style.display = 'none';
    } else {
        prevButton.style.display = 'flex';
        document.getElementById('current-page').style.display = 'flex';
    }
    if (currentPage * resultsPerPage >= totalResults) {
        nextButton.style.display = 'none';
    } else {
        nextButton.style.display = 'flex';
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        search(currentPage);
    }
}

function goToNextPage() {

    var totalPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        search(currentPage);
    }
}

function showVideo(videoId) {
    document.getElementById('display-video').src = "https://www.youtube.com/embed/" + videoId;
    document.getElementById('modal-pop').style.display = 'block';

    externalVideoLink = 'https://www.youtube.com/watch?v=' + videoId;


}



function visitVideo() {

    window.open(externalVideoLink);
}

function closeModal() {
    document.getElementById('display-video').src = ''
    document.getElementById('modal-pop').style.display = 'none';
}

async function getVideoDetails(videoId, callback) {
    if (videoId) {
        var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;

        // Send an HTTP request to the YouTube Data API
        await fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    var videoID = videoId;
                    var viewCount = data.items[0].statistics.viewCount;
                    callback(videoID, viewCount);
                } else {
                    callback(videoID, '');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                callback(videoID, '');
            });
    } else {
        callback(videoID, '');
    }
}
search();