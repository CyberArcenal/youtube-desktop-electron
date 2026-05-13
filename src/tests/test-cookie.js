const { Innertube } = require("youtubei.js");
const fs = require("fs");

const cookiePath = "./data/youtube-cookie.json";
const cookie = JSON.parse(fs.readFileSync(cookiePath, "utf8")).cookie;

(async () => {
  const yt = await Innertube.create({ cookie });
  const account = await yt.account.getInfo();
  console.log("Account:", account?.name);
})();