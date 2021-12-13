import { peerSocket } from "messaging";
import * as sesame from "./sesame";

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

// Listen for the onmessage event
peerSocket.onmessage = async function (evt) {
  let type, message;
  switch (evt.data) {
    case "toggle":
      await sesame.toggleLock();
      await wait(2500);
    case "status":
      type = "status";
      message = await sesame.fetchStatus();
      break;
  }
  peerSocket.send({
    type,
    message,
  });
};
