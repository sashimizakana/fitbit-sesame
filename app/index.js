import * as document from "document";
import { peerSocket } from "messaging";

const lock = document.getElementById("lock");
const battery = document.getElementById("battery");
lock.addEventListener("click", async () => {
  if (lock.class == "loading") {
    return;
  }
  lock.class = "loading";
  await peerSocket.send("toggle");
});

function setStatus(message) {
  if (message.noSetting) {
    battery.text = "No settings";
    return;
  }
  if (message.CHSesame2Status == "locked") {
    lock.href = "locked.png";
  } else if (message.CHSesame2Status == "unlocked") {
    lock.href = "opened.png";
  }
  battery.text = `${message.batteryPercentage}%`;
  lock.class = "";
}

peerSocket.onopen = function () {
  peerSocket.send("status");
};

peerSocket.onmessage = async function (evt) {
  const { data } = evt;
  switch (data.type) {
    case "status":
      setStatus(data.message);
      break;
  }
};
