const fs = require("fs");
const path = require("path");

const LOCK_FILE = path.join(__dirname, "../groupnamelocks.json");

function saveLock(threadID, name) {
  let locks = {};
  if (fs.existsSync(LOCK_FILE)) {
    locks = JSON.parse(fs.readFileSync(LOCK_FILE));
  }
  locks[threadID] = name;
  fs.writeFileSync(LOCK_FILE, JSON.stringify(locks, null, 2));
}

module.exports = {
  name: "groupnamelock",
  description: "Lock group name",
  execute(api, event, args) {
    if (!args[0]) {
      return api.sendMessage("❌ Group name specify karo! Jaise: groupnamelock MyGroup123", event.threadID);
    }

    const lockName = args.join(" ");
    const threadID = event.threadID;

    saveLock(threadID, lockName);

    api.setTitle(lockName, threadID, (err) => {
      if (err) return api.sendMessage("❌ Naam lock nahi ho paya.", threadID);
      api.sendMessage(`✅ Group name "${lockName}" lock ho gaya!`, threadID);
    });
  }
};
