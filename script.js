const DEV_MODE = window.location.search.includes("dev");

if (DEV_MODE) {
  document.body.classList.add("dev-mode");
}

const DEBUG_PANELS = {
  motion: "debug-text1",
  audio: "debug-text2",
  audioEvent: "debug-text3"
};

let lastTriggerTime = 0;
let motionModeEnabled = false;
let motionListenerAdded = false;
const COOLDOWN = 500;
let triggerCounter = 0;

const sounds = {
  ouch: new Audio("assets/ouch2.mp3"),
  up: new Audio("assets/up.mp3"),
  down: new Audio("assets/down.mp3"),
  left: new Audio("assets/left.mp3"),
  right: new Audio("assets/right.mp3")
};

// 页面加载时预加载音频
Object.values(sounds).forEach(audio => {
  audio.load();
});

function formatAudioState(audio) {
  return (
    "paused=" + audio.paused +
    " time=" + audio.currentTime.toFixed(3) +
    " readyState=" + audio.readyState +
    " networkState=" + audio.networkState
  );
}

function attachAudioDebugListeners(audio, label) {
  const events = [
    "play",
    "playing",
    "seeking",
    "seeked",
    "pause",
    "ended",
    "waiting",
    "stalled",
    "canplay"
  ];

  events.forEach(eventName => {
    audio.addEventListener(eventName, () => {
      updateDebug(
        "audioEvent",
        label + " " + eventName + " " + formatAudioState(audio),
        40
      );
    });
  });
}

// 给所有音频对象都挂上生命周期调试监听
Object.entries(sounds).forEach(([name, audio]) => {
  attachAudioDebugListeners(audio, name);
});

function playSound(name) {
  const audio = sounds[name];
  if (!audio) return;

  updateDebug(
    "audio",
    "before " + name + " " + formatAudioState(audio),
    20
  );

  audio.pause();
  audio.currentTime = 0;

  updateDebug(
    "audio",
    "after reset " + name + " " + formatAudioState(audio),
    20
  );

  audio.play()
    .then(() => {
      updateDebug(
        "audio",
        "play ok " + name + " " + formatAudioState(audio),
        20
      );
    })
    .catch((err) => {
      updateDebug(
        "audio",
        "play fail " + name + " " + err.name + " " + formatAudioState(audio),
        20
      );
    });
}

function updateStatus(text) {
  const statusEl = document.getElementById("status-text");
  if (statusEl) {
    statusEl.textContent = text;
  }
}

function updateDebug(panel, text, maxLines) {
  if (!DEV_MODE) return;

  const id = DEBUG_PANELS[panel];
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  const time = new Date().toLocaleTimeString();
  const line = `[${time}] ${text}`;

  let lines = el.textContent ? el.textContent.split("\n") : [];
  lines.push(line);

  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(lines.length - maxLines);
  }

  el.textContent = lines.join("\n");
  el.scrollTop = el.scrollHeight;
}

function handleMotion(event) {
  if (!motionModeEnabled) return;

  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const now = Date.now();

  updateDebug(
    "motion",
    "motion=" + magnitude.toFixed(2) +
    " cooldown=" + (now - lastTriggerTime) +
    " trigger count=" + triggerCounter,
    10
  );

  if (now - lastTriggerTime < COOLDOWN) return;

  if (magnitude > 20) {
    lastTriggerTime = now;
    playSound("ouch");
    updateStatus("检测到动作，已触发 OUCH");
    triggerCounter++;

    setTimeout(() => {
      if (motionModeEnabled) {
        updateStatus("正在监听");
      }
    }, 800);
  }
}

async function toggleMotionMode() {
  try {
    if (!motionModeEnabled) {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        const permission = await DeviceMotionEvent.requestPermission();

        if (permission === "granted") {
          updateStatus("动作权限已授予");
        } else if (permission === "denied") {
          updateStatus("动作权限被拒绝 做完如下步骤或等足够长时间后刷新网页重新授权：IOS至设置-APP-Safari-高级(最下方)-网站数据-搜索github.io-右下角编辑删除网站数据");
          return;
        } else {
          updateStatus("无法获取动作权限");
          return;
        }
      }

      if (!motionListenerAdded) {
        window.addEventListener("devicemotion", handleMotion);
        motionListenerAdded = true;
      }

      audio.play()
        .then(() => {
          audio.pause();
          audio.muted = false;
          updateDebug("audio", "warmup ok " + formatAudioState(audio), 20);
        })
        .catch((err) => {
          audio.muted = false;
          updateDebug("audio", "warmup fail " + err.name + " " + formatAudioState(audio), 20);
        });
    }

    motionModeEnabled = !motionModeEnabled;

    const btn = document.getElementById("mode-btn");
    if (!btn) {
      updateStatus("未找到动作模式按钮");
      return;
    }

    if (motionModeEnabled) {
      btn.textContent = "关闭动作模式";
      updateStatus("动作模式已开启");
    } else {
      btn.textContent = "开启动作模式";
      updateStatus("动作模式已关闭");
    }
  } catch (error) {
    console.error("toggleMotionMode failed:", error);

    updateDebug(
      "motion",
      "toggle fail: " + (error && error.message ? error.message : String(error)),
      20
    );
    
    updateStatus("切换动作模式失败");
  }
}