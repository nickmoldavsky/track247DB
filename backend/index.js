const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const puppeteer = require("puppeteer");
//var proxy = require('express-http-proxy');
const request = require("request");
const cron = require("node-cron");
const axios = require("axios");
const app = express();
app.use(express.urlencoded({ extended: false }));
// Middleware to parse JSON in the request body
app.use(express.json());
app.use(cors());

// Create a MySQL connection
const connection = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  port: "3306",
  user: "root",
  password: "q4t2fz",
  database: "track247",
  //database: "time360",
});

///////////////////////////////////////////////////////////////////////track24.7
const EXPO_PUBLIC_API_URL = "https://parcelsapp.com/api/v3/shipments/tracking";
const EXPO_PUBLIC_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzMjUwMDk3MC1mZDNhLTExZWQtYjViZC03MTg2YTk3NzRiOTEiLCJzdWJJZCI6IjY0NzMxZjBmNzNkMGJiNTE5NzllNmJmYiIsImlhdCI6MTY4NTI2NjE5MX0.w4gvxSgOOWM1gsUoKcqR-pTJAWPqjSFPmv7TV_-urCs";
const NOTIFICATIONS_ARRAY = [];
const NOTIFICATION_TITLE = "Your parcel has an update!";
const NOTIFICATION_STATUS = " has an update from";
const PARCEL_DETAILS_ERROR_MESSAGE =
  "No information about your parcel. We checked all relevant couriers for parcel ";

const NOTIFICATION_TITLE_YOUR_PARCEL = {
  en: 'Your parcel ',
  ru: 'У вашей посылки ',
  he: 'Your parcel '
};
const NOTIFICATION_TITLE_HAS_UPDATE = {
  en: ' has an update!',
  ru: ' есть обновление!',
  he: ' has an update!'
};  

const getValidTracks = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT tracks.id, tracks.track_id, tracks.track_title, tracks.delivered, users.push_token AS push_token, users.language AS language, users.location AS location, tracks.last_status FROM tracks LEFT JOIN users ON users.id = tracks.user_id WHERE users.push_notifications = 1 AND tracks.delivered = 0",
     (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      }
    );
  });
};

const poolTrackingStatus = (uuid) => {
  const data = {
    apiKey: EXPO_PUBLIC_API_KEY,
  };

  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://parcelsapp.com/api/v3/shipments/tracking" +
          "?uuid=" +
          uuid +
          "&apiKey=" +
          data.apiKey
      )
      .then((response) => {
        console.log("poolTrackingStatus response.data:", response?.data);
        if (!response.data?.done) {
          setTimeout(() => {
            console.log("Timeout 2 sec...");
            return resolve(poolTrackingStatus(uuid));
          }, 2000);
        } else {
          console.log("return resolve(response)");
          return resolve(response);
        }
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

const checkTrackingStatus = async (params) => {
  console.log('checkTrackingStatus params:', params);
  const data = {
    shipments: [
      {
        trackingId: params.trackingId,
        destinationCountry: params.location,
      },
    ],
    language: params.language,
    apiKey: EXPO_PUBLIC_API_KEY,
  };

  try {
    const response = await axios.post(
      "https://parcelsapp.com/api/v3/shipments/tracking",
      data
    );
    console.log("checkTrackingStatus response.data:", response.data);
    if (response.data?.uuid) {
      const poolResponse = await poolTrackingStatus(response.data.uuid);
      if (
        poolResponse.data.done &&
        poolResponse.data?.shipments[0].lastState.status !==
          JSON.parse(params?.lastStatus).status
      ) {
        console.log(
          "checkTrackingStatus poolTrackingStatus response:",
          poolResponse.data
        );
        const poolNotificationParams = {
          title: NOTIFICATION_TITLE_YOUR_PARCEL[params.language] + params.trackingTitle + NOTIFICATION_TITLE_HAS_UPDATE[params.language],
          body: poolResponse.data?.shipments[0].lastState.status,
          //lastStatus: params.last_status,
          lastStatus: poolResponse.data?.shipments[0].lastState,
          pushToken: params.pushToken,
        };
        NOTIFICATIONS_ARRAY.push(poolNotificationParams);
        return await sendPushNotifications(poolNotificationParams);
      }
    } else {
      if (response.data?.done) {
        console.log("checkTrackingStatus params:", params);
        console.log(
          "response.data?.shipments[0].lastState:",
          JSON.stringify(response.data?.shipments[0].lastState)
        );
        console.log(
          "response.data?.shipments[0].lastState + length:",
          JSON.stringify(response.data?.shipments[0].lastState).length
        );
        console.log(
          "params.lastStatus.status:",
          JSON.parse(params.lastStatus).status
        );
        console.log("params.lastStatus + length:", params.lastStatus.length);
        if (
          response.data?.shipments[0].trackingId === params.trackingId &&
          response.data?.shipments[0].lastState.status !==
            JSON.parse(params.lastStatus).status
        ) {
          const notificationParams = {
            title: NOTIFICATION_TITLE_YOUR_PARCEL[params.language] + params.trackingTitle + NOTIFICATION_TITLE_HAS_UPDATE[params.language],
            body: response.data?.shipments[0].lastState?.status
              ? response.data?.shipments[0].lastState?.status
              : response.data?.shipments[0].status,
            lastStatus: response.data?.shipments[0].lastState.status,
            pushToken: params.pushToken,
            data: {
              trackingNumber: params.trackingId,
              trackingTitle: params.trackingTitle,
              id: 3000
            }
          };
          NOTIFICATIONS_ARRAY.push(notificationParams);
          return await sendPushNotifications(notificationParams);
        } else {
          console.log("checkTrackingStatus response error", response.data?.shipments[0]);
          console.log("checkTrackingStatus params error", params);
          return;
        }
      }
    }
  } catch (err) {
    console.log("checkTrackingStatus console.log error:", err);
    return err;
    //throw new Error("checkTrackingStatus error:", err);
  }
};

const generatePushNotifications = async () => {
  //NOTIFICATIONS_ARRAY = [];
  const tracks = await getValidTracks();
  console.log('generatePushNotifications tracks:', tracks);
  if (tracks && tracks.length > 0) {
    console.log("generatePushNotifications tracks:", tracks.length);

    for (let i = 0; i < tracks.length; i++) {
      console.log("track in for:", tracks[i]);
      const params = {
        trackingId: tracks[i].track_id,
        trackingTitle: tracks[i].track_title,
        //status: tracks[i].status,
        lastStatus: tracks[i].last_status,
        pushToken: tracks[i].push_token,
        language: tracks[i].language,
        location: tracks[i].location
      };
      await checkTrackingStatus(params);
      console.log(
        "************************track finished**************",
        tracks[i].track_title
      );
    }
    //TODO: send notifications here
    console.log("notification array:::", NOTIFICATIONS_ARRAY);
  } else {
    console.log("generatePushNotifications error: no tracks avalible", tracks);
    return;
  }
};

const sendPushNotifications = async (params) => {
  //return;
  const postData = {
    to: params.pushToken,
    sound: "default",
    title: params.title,
    body: params.body,
    data: {
      trackingNumber: params.data.trackingNumber,
      trackingTitle: params.data.trackingTitle,
      id: params.data.id
    }
  };

  const clientServerOptions = {
    uri: "https://exp.host/--/api/v2/push/send",
    body: JSON.stringify(postData),
    method: "POST",
    headers: {
      host: "exp.host",
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
    },
  };

  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      postData,
      {
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
      }
    );
    console.log("sendPushNotifications response:", response.data);
    return response;
  } catch (err) {
    // Error handling here
    return err;
  }
};

app.get("/", (req, res) => {
  res.status(200).send("Welcome!");
});

///////////////////////////////////////CRUD//////////////////////////////////

//get items by user uid
app.get("/api/v2/tracks/:uid", async (req, res) => {
  console.log("get items by user uid");
  try {
    const { uid } = req.params;
    const data = await connection
      .promise()
      .query(
        `SELECT id, track_id, track_title, status, last_status FROM tracks WHERE user_id = ?`,
        [uid]
      );
    console.log("index.js/api/v2/tracks/:uid data", data);
    res.status(200).json({
      tracks: data,
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

//user login
app.post("/api/v2/user/login", async (req, res) => {
  console.log('api/v2/user/login', req);
  try {
    const { email, password } = req.body;
    const data = await connection
      .promise()
      .query(`SELECT id, email FROM users WHERE email = ? AND password = ?`, [
        email,
        password,
      ]);
    console.log("user:", data);
    if (data[0].length > 0) {
      res.status(200).json({
        data: data[0],
      });
    } else {
      res.status(404).json({
        message: "user not found",
      });
    }
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//add new user
app.post("/api/v2/user/register", async (req, res) => {
  try {
    const { email, password } = req.body; // destruct to get all properties
    console.log("index.js/app.post/api/v2/user/register", req.body);

    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO users (device_id, email, password, push_token, push_notifications, language, location, created, updated) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "123456789",
        email,
        password,
        "",
        0,
        "en",
        "israel",
        "2024-08-29 00:00:00",
        "2024-08-29 00:00:00",
      ]
    );
    if (insertId) {
      console.log("/api/v2/add user insertId:", insertId);
    }
    res.status(202).json({
      data: {id: insertId, email: email},
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      data: err,
    });
  }
});

//add new parcel
app.post("/api/v2/addTrack", async (req, res) => {
  try {
    const { user_id, track_id, track_title, push_token, status, last_status } =
      req.body; // destruct to get all properties
    console.log("app.post/api/v2/addTrack", req.body);

    const [{ insertId }] = await connection.promise().query(
      `INSERT INTO tracks (user_id, device_id, push_token, track_id, track_title, status, states, last_status, valid, delivered, notification, created, updated) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        "123456789",
        push_token,
        track_id,
        track_title,
        status,
        status,
        last_status,
        1,
        0,
        1,
        "2024-08-29 00:00:00",
        "2024-08-29 00:00:00",
      ]
    );
    if (insertId) {
      console.log("/api/v2/addTrack insertId:", insertId);
    }
    res.status(202).json({
      message: "Track Created",
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//update parcel
app.post("/api/v2/updateTrack", async (req, res) => {
  try {
    const { user_id, track_id, status, states, last_status } = req.body; // destruct to get all properties
    console.log("app.post/api/v2/updateTrack", req.body);

    let deliveredFlag = 0;
    if(status === 'delivered') {
      deliveredFlag = 1;
    }

    const [{ updatedId }] = await connection
      .promise()
      .query('UPDATE tracks SET ?, ?, ? WHERE track_id = ?', [{ status: status }, { delivered: deliveredFlag },{ last_status: JSON.stringify(last_status) }, track_id]);
    if (updatedId) {
      console.log("/api/v2/updateTrack updateTrack:", updatedId);
    }
    res.status(200).json({
      message: "Track Updated",
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//update track status
app.post("/api/v2/updateTrackStatus", async (req, res) => {
  try {
    const { id, status } = req.body; // destruct to get all properties
    let deliveredFlag = 0;
    if(status === 'delivered') {
      deliveredFlag = 1;
    }
    const [{ updatedId }] = await connection
      .promise()
      .query('UPDATE tracks SET ?, ? WHERE id = ?', [{ status: status }, { delivered: deliveredFlag }, id]);
    if (updatedId) {
      console.log("/api/v2/updateTrackStatus updatedTrack:", updatedId);
    }
    res.status(200).json({
      message: "Track Status Updated",
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//delete parcel
app.post("/api/v2/deleteTrack", async (req, res) => {
  try {
    const { id } = req.body; // destruct to get all properties
    console.log("app.post/api/v2/deleteTrack", req.body);

    const [{ updatedId }] = await connection
      .promise()
      .query(`DELETE FROM tracks WHERE id=${id}`);
    res.status(200).json({
      message: "Track Deleted",
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//update push notification flag
app.post("/api/v2/updatePushNotificationsFlag", async (req, res) => {
  try {
    const { id, flag } = req.body; // destruct to get all properties
    console.log('update push notification flag', id);

    const [{ updatedId }] = await connection
      .promise()
      .query('UPDATE users SET ? WHERE id = ?', [{ push_notifications: flag }, id]);
    if (updatedId) {
      console.log("/api/v2/updatePushNotificationsFlag updated user:", updatedId);
    }
    res.status(200).json({
      data: flag,
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//update push notification token
app.post("/api/v2/updatePushNotificationsToken", async (req, res) => {
  try {
    const { id, token } = req.body;
    console.log('update push notification token', id);

    const [{ updatedId }] = await connection
      .promise()
      .query('UPDATE users SET ? WHERE id = ?', [{ push_token: token }, id]);
    if (updatedId) {
      console.log("/api/v2/updatePushNotificationsToken updated user:", updatedId);
    }
    res.status(200).json({
      data: token,
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});

//update app language
app.post("/api/v2/updateAppLanguage", async (req, res) => {
  try {
    const { id, language } = req.body;
    console.log('update updateAppLanguage', id);

    const [{ updatedId }] = await connection
      .promise()
      .query('UPDATE users SET ? WHERE id = ?', [{ language: language }, id]);
    if (updatedId) {
      console.log("/api/v2/updateAppLanguage:", updatedId);
    }
    res.status(200).json({
      data: language,
    });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({
      message: err,
    });
  }
});


//Push notifications test
app.get("/push/send", (req, res) => {
  generatePushNotifications();
});

//server started
app.listen(5000, () => {
  console.log("Server started at 5000");
});

//cron job
cron.schedule("0 * * * *", generatePushNotifications);
