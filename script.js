let lastTriggerTime = 0;
let motionModeEnabled = false;
let motionListenerAdded = false;

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

  if (magnitude > 24 && now - lastTriggerTime > 1200) {
    lastTriggerTime = now;
    playSound("ouch");
    updateStatus("检测到动作，已触发 OUCH");
  }
}

async function enableMotionMode() {
  try {
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

    motionModeEnabled = true;
    updateStatus("动作模式已开启：摇动手机可触发 OUCH");
  } catch (error) {
    console.error(error);
    updateStatus("开启动作模式失败");
  }
}