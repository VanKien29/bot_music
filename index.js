const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { GiveawaysManager } = require("discord-giveaways");

function convertTime(time) {
  const timeRegex = /^(\d+)(s|m|h|d|y)$/;
  const match = time.match(timeRegex);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "y":
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const TOKEN =
  "MTI4MzMxNTc1NDE4MzI5OTA3Mg.GWNKX3.gKGF64Zg-stRfW4Hu89awLy05bKwL7VFl936MM";
const PREFIX = ".";

const diceEmojis = [
  "<:Removebg:1283408599699165235>", // Xúc xắc 1
  "<:Removebg:1283408867857928222>", // Xúc xắc 2
  "<:Removebg:1283408864158679084>", // Xúc xắc 3
  "<:Removebg:1283408861943828591>", // Xúc xắc 4
  "<:Removebg:1283408859343356054>", // Xúc xắc 5
  "<:Removebg:1283408857246466079>", // Xúc xắc 6
];

const shakeEmojis = [
  "<a:image:1283328850809327686>",
  "<a:image:1283328850809327686>",
  "<a:image:1283328850809327686>",
];

const bauCuaEmojis = {
  bầu: "<:bc6:1284017498332729418>",
  cua: "<:bc5:1283989231752056832>",
  tôm: "<:bc1:1283989243407892513>",
  cá: "<:bc4:1283989234423959627>",
  gà: "<:bc3:1283989237460635809>",
  nai: "<:bc2:1283989240275009557>",
};

const bauCuaShakeEmojis = [
  "<a:10356852210786836581:1284016780678926346>",
  "<a:10356852210786836581:1284016780678926346>",
  "<a:10356852210786836581:1284016780678926346>",
];

const choices = Object.keys(bauCuaEmojis);

const manager = new GiveawaysManager(client, {
  storage: "./giveaways.json",
  default: {
    botsCanWin: false,
    embedColor: "#FF0000",
    reaction: "🎉",
  },
});

client.once("ready", () => {
  console.log(`Đăng nhập thành công với tên ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ga") {
    const giveaways = message.content
      .slice(PREFIX.length + command.length)
      .trim()
      .split("/");

    if (giveaways.length === 0) {
      return message.reply(
        "Vui lòng nhập đúng định dạng: .ga <thời gian (vd: 1m, 1h)> <số lượng người thắng> <nội dung phần thưởng> | <thời gian> <số lượng người thắng> <nội dung phần thưởng> ..."
      );
    }

    giveaways.forEach(async (giveaway) => {
      const args = giveaway.trim().split(/ +/);

      const timeString = args[0];
      const winnerCount = parseInt(args[1]);
      const prize = args.slice(2).join(" ");

      const time = convertTime(timeString);

      if (!time || !winnerCount || !prize) {
        return message.reply(
          `Giveaway không hợp lệ: ${giveaway}\nVui lòng nhập đúng định dạng: .ga <Thời Gian (vd: 1s, 1m, 1h)> <Số Lượng Người Thắng> <Nội Dung Phần Thưởng>`
        );
      }

      const userAvatar = message.author.displayAvatarURL({ dynamic: true });
      const endTime = Date.now() + time;

      const giveawayEmbed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAYS 🎉")
        .setDescription(
          `Bấm 🎉 để tham gia giveaway!\n\n` +
            `📅 **Kết thúc trong:** ${timeString} sau\n` +
            `👤 **Làm bởi:** <@${message.author.id}>\n\n` +
            `🏆 **Giải thưởng:** ${prize}\n` +
            `🕒 **Kết thúc vào:** ${new Date(endTime).toLocaleString()}`
        )
        .setThumbnail(userAvatar)
        .setColor("#FFCC00")
        .setFooter({
          text: `1 giải • ${new Date().toLocaleDateString()}`,
        });

      const giveawayMessage = await message.channel.send({
        embeds: [giveawayEmbed],
      });

      await giveawayMessage.react("🎉");

      const countdownInterval = setInterval(async () => {
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);

          giveawayEmbed.setDescription(
            `🎉 **Giveaway đã kết thúc!**\n\n` +
              `🏆 **Giải thưởng:** ${prize}\n` +
              `🕒 **Kết thúc vào:** ${new Date(endTime).toLocaleString()}`
          );
          await giveawayMessage.edit({ embeds: [giveawayEmbed] });
          return;
        }

        const timeLeftString = new Date(timeLeft).toISOString().substr(11, 8);
        giveawayEmbed.setDescription(
          `Bấm 🎉 để tham gia giveaway!\n\n` +
            `📅 **Kết thúc trong:** ${timeLeftString}\n` +
            `👤 **Làm bởi:** <@${message.author.id}>\n\n` +
            `🏆 **Giải thưởng:** ${prize}\n` +
            `🕒 **Kết thúc vào:** ${new Date(endTime).toLocaleString()}`
        );
        await giveawayMessage.edit({ embeds: [giveawayEmbed] });
      }, 1000);

      manager.start(giveawayMessage.channel, {
        duration: time,
        prize: prize,
        winnerCount: winnerCount,
        messages: {
          giveaway: "🎉 **GIVEAWAYS** 🎉",
          giveawayEnded: "🎉 **GIVEAWAYS KẾT THÚC** 🎉",
          inviteToParticipate: "Bấm 🎉 để tham gia!",
          winMessage: "🏆 Chúc mừng, {winners}! Bạn đã thắng !",
          winners: "🏅 Người chiến thắng:",
          endedAt: "🕒 Kết thúc vào lúc:",
          noWinner: "❌ Không có người tham gia, giveaway đã bị hủy.",
          drawing: "⌛ Kết thúc trong: {timestamp}",
          embedFooter: "Giveaway",
          reaction: "🎉",
        },
      });
    });

    await message.delete();
  }
  // (TX)
  if (command === "tx") {
    let currentDiceDisplay = shakeEmojis.join(" ");

    const initialMessage = await message.reply({
      content: currentDiceDisplay,
      allowedMentions: { repliedUser: false },
    });

    const diceRolls = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
    const total = diceRolls.reduce((a, b) => a + b, 0);

    const taiXiu = total > 10 ? "Tài" : "Xỉu";
    const chanLe = total % 2 === 0 ? "Chẵn" : "Lẻ";

    const updateDice = async (diceIndex) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const newDiceDisplay = currentDiceDisplay
            .split(" ")
            .map((emoji, index) => {
              if (index === diceIndex) {
                return diceEmojis[diceRolls[diceIndex] - 1];
              }
              return emoji;
            })
            .join(" ");

          currentDiceDisplay = newDiceDisplay;

          await initialMessage.edit({
            content: currentDiceDisplay,
            allowedMentions: { repliedUser: false },
          });
          resolve();
        }, diceIndex * 1000);
      });
    };

    await Promise.all(diceRolls.map((_, i) => updateDice(i)));

    const resultMessage = `\n**${total}** • ${taiXiu} • ${chanLe} <a:0pixelcatmusic:1274534150346641479>`;

    await initialMessage.edit({
      content: `${currentDiceDisplay}${resultMessage}`,
      allowedMentions: { repliedUser: false },
    });
  }

  //  (BC)
  if (command === "bc") {
    let currentShakeDisplay = bauCuaShakeEmojis.join(" ");

    const initialMessage = await message.reply({
      content: currentShakeDisplay,
      allowedMentions: { repliedUser: false },
    });

    const results = [0, 1, 2].map(
      () => choices[Math.floor(Math.random() * choices.length)]
    );

    const updateShake = async (index) => {
      return new Promise((resolve) => {
        const delay = 3000 + index * 2000;
        setTimeout(async () => {
          const newShakeDisplay = currentShakeDisplay
            .split(" ")
            .map((emoji, i) => {
              if (i === index) {
                return bauCuaEmojis[results[index]];
              }
              return emoji;
            })
            .join(" ");

          currentShakeDisplay = newShakeDisplay;

          await initialMessage.edit({
            content: currentShakeDisplay,
            allowedMentions: { repliedUser: false },
          });
          resolve();
        }, delay);
      });
    };

    await Promise.all(results.map((_, i) => updateShake(i)));

    const finalNames = results
      .map(
        (result) => `**${result.charAt(0).toUpperCase() + result.slice(1)}**`
      )
      .join(" • ");

    await initialMessage.edit({
      content: `${currentShakeDisplay}\n${finalNames} <a:0pixeltorospin:1274520633031786547>`,
      allowedMentions: { repliedUser: false },
    });
  }
});
client.login(TOKEN);
