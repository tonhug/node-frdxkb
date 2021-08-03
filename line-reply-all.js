const functions = require("firebase-functions");
const request = require("request-promise");

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message/reply";
const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer HH+jCnVZafNXzNOSLLcy9DXxntwsphml6udUe3astJ3axRh1+mG1lQVzoSJ2Y39JdWNQamkuRYM93ZIDbAYmuucqUKJQkcUaLt269r1j6dbpZQ7Zky46Ys9Umgp4soT9YLxXNV+StG5kpktVINsBwwdB04t89/1O/w1cDnyilFU=`
};

exports.LineBotReply = functions.https.onRequest((req, res) => {
  if (req.method === "POST"){
    reply(req.body);
  } else {
    return res.status(200).send(`Done`);
  }
});

const reply = bodyResponse => {
  return request({
    method: `POST`,
    uri: LINE_MESSAGING_API,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [{
        type: `text`,
        text: JSON.stringify(bodyResponse)
      }]
    })
  });
};