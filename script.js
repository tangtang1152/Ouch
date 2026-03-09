let lastTriggerTime = 0;
let motionModeEnabled = false;
let motionListenerAdded = false;
const COOLDOWN = 500;

function playSound(name) {
  const audio = new Audio(`assets/${name}.mp3`);
  audio.play();
}

function updateStatus(text) {
  const statusEl = document.getElementById("status-text");
  if (statusEl) {
    statusEl.textContent = text;
  }
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

  if (magnitude > 24 && now - lastTriggerTime > COOLDOWN) {
    lastTriggerTime = now;
    playSound("ouch");
    updateStatus("检测到动作，已触发 OUCH");
  }
}

async function toggleMotionMode() {
  try {
    const willEnable = !motionModeEnabled;

    if (willEnable) {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
          updateStatus("动作权限未授予");
          return;
        }
      }

      if (!motionListenerAdded) {
        window.addEventListener("devicemotion", handleMotion);
        motionListenerAdded = true;
      }
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