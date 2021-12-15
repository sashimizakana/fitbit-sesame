import { settingsStorage } from "settings";
import { peerSocket } from "messaging";
import CryptoJS from "./cryptojs-aes-cmac";

function getText(name) {
  return JSON.parse(settingsStorage.getItem(name)).name;
}

function base64ToHex(str) {
  const raw = atob(str);
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : "0" + hex;
  }
  return result;
}

function getSecret() {
  const qr = getText("qr");
  const url = new URL(qr);
  return base64ToHex(url.searchParams.get("sk")).slice(2, 34);
}

function calcAesCmac() {
  const dv = new DataView(new ArrayBuffer(4));
  const date = Math.floor(Date.now() / 1000);
  dv.setUint32(0, date, true);
  const list = new Uint8Array(dv.buffer.slice(1, 4));
  let message = "";
  for (let i = 0; i < list.length; i++) {
    message += list[i].toString(16).toLowerCase();
  }
  message = CryptoJS.enc.Hex.parse(message);
  const secret = getSecret();
  const key = CryptoJS.enc.Hex.parse(secret);
  return CryptoJS.CMAC(key, message).toString();
}

const history = btoa("Fitbit");
export async function toggleLock(cmd = "toggle") {
  const uuid = getText("uuid");
  const apiKey = getText("apiKey");
  const commands = {
    toggle: 88,
    lock: 82,
    unlock: 83,
  };
  const sign = calcAesCmac();
  return await fetch(`https://app.candyhouse.co/api/sesame2/${uuid}/cmd`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      cmd: commands[cmd],
      history,
      sign,
    }),
  });
}

export async function fetchStatus() {
  const uuid = getText("uuid");
  const apiKey = getText("apiKey");
  if (!uuid || !apiKey) {
    return { noSetting: true };
  }
  const statusUrl = `https://app.candyhouse.co/api/sesame2/${uuid}`;
  const response = await fetch(statusUrl, {
    headers: {
      "x-api-key": apiKey,
    },
  });
  return response.json();
}

settingsStorage.addEventListener("change", async (evt) => {
  console.log("change", evt);
  const message = await fetchStatus();
  console.log(message);
  peerSocket.send({
    type: "status",
    message,
  });
});
