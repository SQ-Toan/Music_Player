/*
    1. Render songs
    2. Scroll top
    3. Play/ pause / seek
    4. CD rotate
    5. Next/ prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/
const url = "http://localhost:3000/songs";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Lấy dữ liệu từ api
async function getObjectSongs() {
    try {
        const response = await fetch(url); // Wait for the fetch to complete
        const songs = await response.json(); // Wait for JSON conversion
        return [...songs]; // Return a copy of the songs array
    } catch (error) {
        console.error("Error fetching songs:", error);
        return []; // Return an empty array or handle the error as needed
    }
}

getObjectSongs().then((songs) => {
    // Get elements
    const playlist = $(".playlist");

    // Program
    const app = {
        songs,
        render: function () {
            const htmls = this.songs.map((song) => {
                return ` <div class="song">
                    <div
                        class="thumb"
                        style="
                            background-image: url('${song.image}');
                        "
                    ></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>`;
            });
            playlist.innerHTML = htmls.join("\n");
        },

        start: function () {
            this.render(); // Gọi hàm render
        },
    };

    app.start(); // gọi hàm start
});
