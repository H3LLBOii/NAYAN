const fs = require("fs-extra");
const path = require("path");

const activeGroupsFilePath = path.join(__dirname, "..", "events", "Nayan", "groupSettings.json");

let activeGroups = {};
if (fs.existsSync(activeGroupsFilePath)) {
  try {
    const fileData = fs.readFileSync(activeGroupsFilePath, "utf-8");
    activeGroups = JSON.parse(fileData);

    if (typeof activeGroups !== "object") {
      console.warn("activeGroups data is not an object. Initializing to empty object.");
      activeGroups = {};
    }
  } catch (error) {
    console.error("Error loading active groups:", error);
  }
}

const saveActiveGroups = () => {
  try {
    fs.writeFileSync(activeGroupsFilePath, JSON.stringify(activeGroups, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving active groups:", error);
  }
};

module.exports = {
  config: {
    name: "antichange",
    version: "1.0.0",
    permission: 0,
    credits: "Nayan",
    description: "Prevents unauthorized group changes",
    prefix: false,
    category: "box",
    usages: "antichange [on/off]",
    cooldowns: 5,
  },

  start: async function ({ nayan, events, args, Threads }) {
    const threadID = events.threadID;
    const senderID = events.senderID;
    const botAdmins = global.config.ADMINBOT;

    // Check if the user is an admin or bot admin
    const threadInfo = await nayan.getThreadInfo(threadID);
    const groupAdmins = threadInfo.adminIDs.map(admin => admin.id);

    if (!groupAdmins.includes(senderID) && !botAdmins.includes(senderID)) {
      return nayan.sendMessage("⚠️ Only group admins or bot admins can use this command.", threadID);
    }

    const initialThreadInfo = await nayan.getThreadInfo(threadID);
    const initialGroupName = initialThreadInfo.threadName;
    const initialGroupImage = initialThreadInfo.imageSrc || "";

    const { setData, getData, delData } = Threads;

    if (args[0] === "on") {
    const groupData = await getData(threadID);
    const dataThread = groupData.threadInfo;

    if (!activeGroups[threadID]) {
    // Join remaining args as new name if provided
    const customGroupName = args.slice(1).join(" ").trim();

    const lockedGroupName = customGroupName || initialGroupName;

    activeGroups[threadID] = {
      name: lockedGroupName,
      image: initialGroupImage,
    };

    await setData(threadID, { threadInfo: dataThread });
    saveActiveGroups();

    nayan.sendMessage(`✅ Anti-change feature has been activated.\n🔒 Locked name: "${lockedGroupName}"`, threadID);
  } else {
    nayan.sendMessage("⚠️ Anti-change feature is already active for this group.", threadID);
  }
}

    } else if (args[0] === "off") {
      if (activeGroups[threadID]) {
        delete activeGroups[threadID];
        await delData(threadID);
        saveActiveGroups();
        nayan.sendMessage("🚫 Anti-change feature has been deactivated for this group.", threadID);
      } else {
        nayan.sendMessage("⚠️ Anti-change feature is not active for this group.", threadID);
      }
    } else {
      nayan.sendMessage("⚠️ Invalid option. Please use 'antichange on' or 'antichange off'.", threadID);
    }
  }
};
