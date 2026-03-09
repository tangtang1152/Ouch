function playSound(name) {
  const audio = new Audio(`assets/${name}.mp3`);
  audio.play();
}