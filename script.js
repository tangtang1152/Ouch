const DEV_MODE = window.location.search.includes("dev");
if (DEV_MODE) {
  document.body.classList.add("dev-mode");
}

let lastTriggerTime = 0;
let motionModeEnabled = false;
let motionListenerAdded = false;
const COOLDOWN = 500;
let triggerCounter = 0;

//ouch固定双对象池
const ouchPool = [
  new Audio("assets/ouch.mp3"),
  new Audio("assets/ouch.mp3")
];
let ouchIndex = 0;

const sounds = {
  ouch: new Audio("assets/ouch.mp3"),
  up: new Audio("assets/up.mp3"),
  down: new Audio("assets/down.mp3"),
  left: new Audio("assets/left.mp3"),
  right: new Audio("assets/right.mp3")
};

const DEBUG_PANELS = {
  motion: "debug-text1",
  audio: "debug-text2",
  audioEvent: "debug-text3"
};


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

function formatAudioState(audio) {
  return (
    "paused=" + audio.paused +
    " time=" + audio.currentTime.toFixed(3) +
    " readyState=" + audio.readyState +
    " networkState=" + audio.networkState
  );
}

//媒体事件监听
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

//为ouch对象池中的每个Audio对象添加事件监听器
ouchPool.forEach((audio, index) => {
  attachAudioDebugListeners(audio, "ouch[" + index + "]");
});

function playSound(name) {
  if (name === "ouch") {
    const audio = ouchPool[ouchIndex];
    const currentIndex = ouchIndex;

    ouchIndex = (ouchIndex + 1) % ouchPool.length;

    updateDebug(
      "audio",
      "before ouch[" + currentIndex + "] " + formatAudioState(audio),
      20
    );

    audio.pause();
    audio.currentTime = 0;

    updateDebug(
      "audio",
      "after reset ouch[" + currentIndex + "] " + formatAudioState(audio),
      20
    );

    audio.play()
      .then(() => {
        updateDebug(
          "audio",
          "play ok ouch[" + currentIndex + "] " + formatAudioState(audio),
          20
        );
      })
      .catch((err) => {
        updateDebug(
          "audio",
          "play fail ouch[" + currentIndex + "] " + err.name + " " + formatAudioState(audio),
          20
        );
      });

    return;
  }

  const audio = sounds[name];
  if (!audio) return;

  updateDebug(
    "audio",
    "before " + name + " " + formatAudioState(audio),
    20
  );
  
  audio.currentTime = 0;
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

function handleMotion(event) {
  if (!motionModeEnabled) return;

  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const now = Date.now();

  if (now - lastTriggerTime < COOLDOWN) return;

  if (magnitude > 24) {
    lastTriggerTime = now;
    playSound("ouch");
    updateStatus("检测到动作，已触发 OUCH");
    triggerCounter++;
  }

  updateDebug(
    "motion",
    "motion=" + magnitude.toFixed(2) +
    " cooldown=" + (now - lastTriggerTime) +
    " trigger count=" + triggerCounter,
    10);
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
        }
        else if (permission === "denied") {
          updateStatus("动作权限被拒绝 做完如下步骤或等足够长时间后刷新网页重新授权：IOS至设置-APP-Safari-高级(最下方)-网站数据-搜索github.io-右下角编辑删除网站数据");
          return;
        }
        else {
          updateStatus("无法获取动作权限");
          return;
        }
      }

      if (!motionListenerAdded) {
        window.addEventListener("devicemotion", handleMotion);
        motionListenerAdded = true;
      }

       // 预加载声音并静音播放以绕过浏览器的自动播放限制
      const audio = sounds.ouch;
      audio.muted = true;
      audio.play().catch(() => {});
      audio.pause();
      audio.muted = false;
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
    console.error(error);
    updateStatus("切换动作模式失败");
  }
}