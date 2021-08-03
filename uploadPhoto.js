const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
const UUID = require('uuid-v4');
const path = require('path');
const os = require('os');
const fs = require('fs');
admin.initializeApp();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot';
const LINE_CONTENT_API = 'https://api-data.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization:
    'Bearer HH+jCnVZafNXzNOSLLcy9DXxntwsphml6udUe3astJ3axRh1+mG1lQVzoSJ2Y39JdWNQamkuRYM93ZIDbAYmuucqUKJQkcUaLt269r1j6dbpZQ7Zky46Ys9Umgp4soT9YLxXNV+StG5kpktVINsBwwdB04t89/1O/w1cDnyilFU='
};

exports.uploadPhoto = functions.https.onRequest(async (req, res) => {
  let event = req.body.events[0];
  if (event.type === 'message' && event.message.type === 'image') {
    let urls = await upload(event);
    await reply(event.replyToken, {
      type: 'flex',
      altText: 'Flex Message',
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: urls.original,
          size: 'full',
          aspectRatio: '1:1',
          aspectMode: 'cover'
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          spacing: 'md',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'Original',
                uri: urls.original
              },
              style: 'secondary'
            },
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'Thumb',
                uri: urls.thumb
              },
              style: 'primary'
            }
          ]
        }
      }
    });
  }
  return res.end();
});

const upload = async event => {
  let url = `${LINE_CONTENT_API}/${event.message.id}/content`;
  let buffer = await request.get({
    headers: LINE_HEADER,
    uri: url,
    encoding: null
  });

  let filename = `${event.timestamp}.jpg`;
  let tempLocalFile = path.join(os.tmpdir(), filename);
  await fs.writeFileSync(tempLocalFile, buffer);

  let uuid = UUID();
  let bucket = admin.storage().bucket();
  let file = await bucket.upload(tempLocalFile, {
    destination: `photos/${event.source.userId}/${filename}`,
    metadata: {
      cacheControl: 'no-cache',
      metadata: {
        firebaseStorageDownloadTokens: uuid
      }
    }
  });
  fs.unlinkSync(tempLocalFile);

  let prefix = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o`;
  let suffix = `alt=media&token=${uuid}`;
  return {
    original: `${prefix}/${encodeURIComponent(file[0].name)}?${suffix}`,
    thumb: `${prefix}/photos${encodeURIComponent(
      `/${event.source.userId}/thumbs/${event.timestamp}_200x200.jpg`
    )}?${suffix}`
  };
};

const reply = (replyToken, payload) => {
  request.post({
    uri: `${LINE_MESSAGING_API}/message/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [payload]
    })
  });
};
