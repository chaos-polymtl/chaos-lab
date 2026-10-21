// random-youtube.js — dynamic aspect ratio fix
(function () {
  const playerEl = document.querySelector(".yt-random-player");
  if (!playerEl) return;

  // Use wrapper for sizing (YouTube replaces playerEl with iframe)
  const wrapper = playerEl.closest(".yt-wrapper") || playerEl.parentElement;
  const jsonPath = playerEl.getAttribute("data-videos-src");

  async function loadVideos() {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error("videos.json not found");
    const data = await res.json();

    // Normalize input
    return (Array.isArray(data) ? data : []).map(v =>
      typeof v === "string"
        ? { id: v, ratio: "16/9" }
        : { id: v.id, ratio: v.ratio || "16/9" }
    ).filter(v => v.id);
  }

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function waitForYT() {
    return new Promise(resolve => {
      const check = () => (window.YT && window.YT.Player) ? resolve() : setTimeout(check, 100);
      check();
    });
  }

  async function init() {
    try {
      // Load YouTube API once
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }

      const [videos] = await Promise.all([loadVideos(), waitForYT()]);
      if (!videos.length) throw new Error("No videos found");

      let queue = shuffle(videos);
      function nextVideo() {
        if (queue.length === 0) queue = shuffle(videos);
        return queue.pop();
      }

      // Track current ratio for resize handler
      let currentRatio = "16/9";

      // --- dynamic sizing helper (operates on wrapper) ---
      function setAspect(ratioStr) {
        const [w, h] = ratioStr.split("/").map(Number);
        if (!w || !h) return;
        currentRatio = ratioStr;
        const ratio = h / w;
        const width = wrapper.clientWidth;
        wrapper.style.height = `${width * ratio}px`;
      }

      const first = nextVideo();
      setAspect(first.ratio);

      const player = new YT.Player(playerEl, {
        videoId: first.id,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              const next = nextVideo();
              setAspect(next.ratio);
              e.target.loadVideoById(next.id);
            }
          },
        },
      });

      // Update size on window resize
      window.addEventListener("resize", () => setAspect(currentRatio));
    } catch (err) {
      console.error("YouTube init failed:", err);
      wrapper.innerHTML =
        '<p>Unable to load YouTube video. <a href="https://youtube.com">Visit our channel</a>.</p>';
    }
  }

  init();
})();
