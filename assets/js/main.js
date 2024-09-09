/*
    1. Render songs //done
    2. Scroll top //done
    3. Play/ pause / seek //done -> có lỗi khi tua song
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
const PLAYER_STORAGE_KEY = "Avocado_Player";

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
    const player = $(".player");
    const playlist = $(".playlist");
    const heading = $("header h1");
    const cdThumb = $(".cd-thumb");
    const audio = $("#audio");
    const cd = $(".cd");
    const playBtn = $(".btn-toggle_play");
    const progress = $(".progress");
    const nextBtn = $(".btn-next");
    const prevBtn = $(".btn-prev");
    const randomBtn = $(".btn-shuffle");
    const repeatBtn = $(".btn-repeat");
    // console.log(nextBtn);

    // Program
    const app = {
        currentIndex: 0,
        isPlaying: false,
        isRandom: false,
        isRepeat: false,
        isActive: false,

        config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
        setConfig: function (key, value) {
            this.config[key] = value;
            localStorage.setItem(
                PLAYER_STORAGE_KEY,
                JSON.stringify(this.config)
            );
        },
        // Danh sách bài hát
        songs,

        // Render danh sách nhạc
        render: function () {
            const htmls = this.songs.map((song, index) => {
                return ` <div class="song ${
                    index === this.currentIndex ? "active" : ""
                }" data-id = "${song.id}">
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

        // Định nghĩa các thuộc tính cho object app
        defineProperties: function () {
            Object.defineProperty(this, "currentSong", {
                get: function () {
                    return this.songs[this.currentIndex];
                },
            });
        },

        // Nắm giữ các sự kiện và xử lý
        handleEvents: function () {
            const _this = this;
            const cdWidth = cd.offsetWidth;
            audio.volume = 0.5;

            // Xử lý cd quay, dừng
            const cdThumbAnimate = cdThumb.animate(
                [
                    {
                        transform: "rotate(360deg)",
                    },
                ],
                {
                    duration: 10000, // 10second
                    iterations: Infinity, // Lặp vô hạn
                }
            );
            cdThumbAnimate.pause();

            // Xử lý phóng to,thu nhỏ cd
            document.onscroll = function (e) {
                const scrollTop =
                    window.scrollY || document.documentElement.scrollTop;
                const newCdWidth = cdWidth - scrollTop;

                cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
                cd.style.opacity = newCdWidth / cdWidth;
            };

            // Xử lý khi click play
            playBtn.onclick = function () {
                if (_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            };

            // Khi song được play
            audio.onplay = function () {
                _this.isPlaying = true;
                player.classList.add("playing");
                cdThumbAnimate.play();
            };

            // khi song bị pause
            audio.onpause = function () {
                _this.isPlaying = false;
                player.classList.remove("playing");
                cdThumbAnimate.pause();
            };

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function () {
                if (!Number.isNaN(audio.duration)) {
                    const progressPercent = Math.floor(
                        (audio.currentTime / audio.duration) * 100
                    );

                    progress.value = progressPercent;
                    // console.log(
                    //     Math.floor((audio.currentTime / audio.duration) * 100)
                    // );
                }
            };

            // Xử lý khi tua song
            progress.onchange = function (e) {
                const seekTime = (e.target.value * audio.duration) / 100;
                audio.currentTime = seekTime;
            };

            // Xử lý khi next bài hát
            nextBtn.onclick = function () {
                if (_this.isRandom) {
                    _this.randomSong();
                } else {
                    _this.nextSong();
                }
                audio.play();
                _this.render();
                _this.scrollToAtiveSong();
            };

            // Xử lý khi prev bài hát
            prevBtn.onclick = function () {
                if (_this.isRandom) {
                    _this.randomSong();
                } else {
                    _this.prevSong();
                }
                audio.play();
                _this.render();
                _this.scrollToAtiveSong();
            };

            // Xử lý khi random bài hát
            randomBtn.onclick = function () {
                _this.isRandom = !_this.isRandom;
                _this.setConfig("isRandom", _this.isRandom);
                randomBtn.classList.toggle("active", _this.isRandom);
            };

            // Xử lý phát lại một bài
            repeatBtn.onclick = function (e) {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig("isRepeat", _this.isRepeat);
                repeatBtn.classList.toggle("active", _this.isRepeat);
            };

            // Xử lý next song khi audio ended
            audio.onended = function () {
                if (_this.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.click();
                }
            };

            //Lắng nghe hành vi click vào playlist
            playlist.onclick = function (e) {
                const songNode = e.target.closest(".song:not(.active)");
                const optionNode = e.target.closest(".option");

                if (songNode || optionNode) {
                    // Xử lý khi click vào song
                    if (songNode && !optionNode) {
                        _this.currentIndex = Number(songNode.dataset.id - 1);
                        _this.loadCurrentSong();
                        audio.play();
                        _this.render();
                    }

                    // Xử lý khi click vào song option
                    if (optionNode) {
                        console.log(123);
                    }
                }
            };
        },

        // Tải thông tin bài hát hiện tại
        loadCurrentSong: function () {
            heading.textContent = this.currentSong.name;
            cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
            audio.src = this.currentSong.path;
        },

        // Xử lý config trên local
        loadConfig: function () {
            this.isRandom = this.config.isRandom;
            this.isRepeat = this.config.isRepeat;
        },

        // Nút next và prev bài hát tiếp theo hoặc bài hát trước
        nextSong: function () {
            this.currentIndex++;
            if (this.currentIndex > this.songs.length - 1) {
                this.currentIndex = 0;
            }
            this.loadCurrentSong();
        },
        prevSong: function () {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1;
            }
            this.loadCurrentSong();
        },
        randomSong: function () {
            let holdIndex;
            do {
                holdIndex = Math.floor(Math.random() * this.songs.length);
            } while (this.currentIndex === holdIndex);
            this.currentIndex = holdIndex;
            this.loadCurrentSong();
        },

        // scroll to active song
        scrollToAtiveSong: function () {
            setTimeout(() => {
                $(".song.active").scrollIntoView({
                    behavior: "smooth",
                    block:
                        this.currentIndex === 0 ||
                        this.currentIndex === 1 ||
                        this.currentIndex === 2
                            ? "center"
                            : "nearest",
                });
            }, 500);
        },

        // Hàm start thực thi chương trình khi mở trang web lên
        start: function () {
            // Gán cấu hình từ config vào ứng dụng
            this.loadConfig();

            // Định nghĩa các thuộc tính cho object app
            this.defineProperties();

            // Nắm giữ các sự kiện và xử lý
            this.handleEvents();

            // Tải thông tin bài hát hiện tại
            this.loadCurrentSong();

            this.render(); // Gọi hàm render

            randomBtn.classList.toggle("active", this.isRandom);
            repeatBtn.classList.toggle("active", this.isRepeat);
        },
    };

    app.start(); // gọi hàm start
});
