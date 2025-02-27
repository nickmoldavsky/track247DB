const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const puppeteer = require("puppeteer");
//var proxy = require('express-http-proxy');
const request = require("request");
const cron = require("node-cron");
const axios = require("axios");
//const pool = require("./db");
//import mysql from 'mysql2';

//const PORT = process.env.PORT || 3000;
const app = express();
//app.use('/api/v2/trackInfo', proxy('www.track24.net'));
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

// const connection = mysql.createConnection({

//   host: "localhost",
//   port: "3306",
//   user: "root",
//   password: "q4t2fz",
//   database: "track247",
//   //database: "time360",
// });

//Connect to the MySQL database
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database: " + err.stack);
//     return;
//   }

//   console.log("Connected to the database as ID " + connection.threadId);
// });

///////////////////////////////////////////////////////////////////////track24.7
const EXPO_PUBLIC_API_URL = "https://parcelsapp.com/api/v3/shipments/tracking";
const EXPO_PUBLIC_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzMjUwMDk3MC1mZDNhLTExZWQtYjViZC03MTg2YTk3NzRiOTEiLCJzdWJJZCI6IjY0NzMxZjBmNzNkMGJiNTE5NzllNmJmYiIsImlhdCI6MTY4NTI2NjE5MX0.w4gvxSgOOWM1gsUoKcqR-pTJAWPqjSFPmv7TV_-urCs";
const NOTIFICATIONS_ARRAY = [];
const NOTIFICATION_TITLE = "Your parcel has an update!";
const NOTIFICATION_STATUS = " has an update from";
const PARCEL_DETAILS_ERROR_MESSAGE =
  "No information about your parcel. We checked all relevant couriers for parcel ";

const getValidTracks = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT tracks.id, tracks.track_id, tracks.track_title, tracks.delivered, users.push_token AS push_token, tracks.last_status FROM tracks LEFT JOIN users ON users.id = tracks.user_id WHERE users.push_notifications = 1 AND tracks.delivered = 0",
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
  const data = {
    shipments: [
      {
        trackingId: params.trackingId,
        destinationCountry: "USA",
      },
    ],
    language: "ENG",
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
          title: "Your parcel " + params.trackingTitle + " has an update!",
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
            title: "Your parcel " + params.trackingTitle + " has an update!",
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
        `SELECT id, track_id, track_title, status FROM tracks WHERE user_id = ?`,
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
        data,
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
      `INSERT INTO users (device_id, email, password, push_token, push_notifications, created, updated) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        "123456789",
        email,
        password,
        "",
        0,
        "2024-08-29 00:00:00",
        "2024-08-29 00:00:00",
      ]
    );
    if (insertId) {
      console.log("/api/v2/add user insertId:", insertId);
    }
    res.status(202).json({
      data: insertId,
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
      // .query(
      //   `UPDATE tracks SET status=${status}, states=${JSON.stringify(states)}, last_status=${JSON.stringify(last_status)} WHERE user_id=${user_id} AND track_id=${track_id}`
      // );
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

//Push notification
app.get("/push/send", (req, res) => {
  generatePushNotifications();
});

app.get("/api/v2/tracks", (req, res) => {
  if (connection.state === "disconnected") {
    connection.connect();
  }
  connection.query("SELECT * FROM tracks", (error, results) => {
    if (error) {
      console.error("Error getting tracks from database: " + error.stack);
      return res.status(500).json({ error: "Failed to get tracks.." });
    }

    // Send a success response
    res.json({ message: "tracks result", results: results });
    //connection.end();
  });
});

app.get("/api/v2/users", (req, res) => {
  if (connection.state === "disconnected") {
    //TODO:
    //connection.release();
    // connection.connect().then(() => {

    //});
    connection.connect((err) => {
      if (err) {
        console.error("Error connecting to the database: " + err.stack);
        return;
      }

      console.log("Connected to the database as ID " + connection.threadId);
    });
    console.log("connection.state:", connection.state);
  }
  connection.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error getting tracks from database: " + error.stack);
      return res.status(500).json({
        error: "Failed to get users..",
        connectionState: connection.state,
      });
    }

    // Send a success response
    res.json({
      message: "users result",
      results: results,
      connectionState: connection.state,
    });

    //connection.end();
  });
});

app.get("/api/v2/trackInfo", async (req, res) => {
  try {
    // if get =>/articles/:id
    //req.params.id
    if (!req.query.code) {
      return res.status(500).json({
        err: "Track code not found!",
      });
    }
    console.log("req", req.query.code);
    const data = await parseL(req.query.code);
    return res.status(200).json({
      result: data,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.post("/api/v2/signIn", (req, res) => {
  console.log("receiving data ...", req);
  console.log("body is ", req.body);
  //res.send(req.body);
  const email = req.email;
  const password = req.password;
  connection.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error getting user from database: " + error.stack);
      return res.status(500).json({ error: "Failed to login.." });
    }

    // Send a success response
    return res.status(200).json(results);
    //connection.end();
  });
});

app.post("/api/v2/signUp", (req, res) => {
  console.log("receiving data ...", req);
  console.log("body is ", req.body);
  //res.send(req.body);
  const email = req.email;
  const password = req.password;
  connection.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.error("Error getting tracks from database: " + error.stack);
      return res.status(500).json({ error: "Failed to login.." });
    }

    // Send a success response
    return res.status(200).json(results);
    //connection.end();
  });
});

app.post("/api/v2/getUserData", (req, res) => {
  console.log("receiving data ...", req);
  console.log("body is ", req.body.uid);
  //res.send(req.body);
  const email = req.email;
  const password = req.password;
  connection.query(
    "SELECT * FROM statistics WHERE user_id=" + req.body.uid,
    (error, results) => {
      if (error) {
        console.error("Error getting tracks from database: " + error.stack);
        return res
          .status(500)
          .json({ error: "Failed to get user statistics." });
      }

      // Send a success response
      return res.status(200).json(results);
      //connection.end();
    }
  );
});

app.listen(5000, () => {
  console.log("Server started at 5000");
});

async function parseLogRocketBlogHome() {
  // Launch the browser
  const browser = await puppeteer.launch();

  // Open a new tab
  const page = await browser.newPage();

  // Visit the page and wait until network connections are completed
  await page.goto("https://track24.net/?code=UZ0627176106Y", {
    waitUntil: "networkidle2",
  });

  //test
  // Get the node and extract the text
  //const titleNode = await page.$('h1');
  //const title = await page.evaluate(el => el.innerText, titleNode);

  // We can do both actions with one command
  // In this case, extract the href attribute instead of the text
  //const link = await page.$eval('a', anchor => anchor.getAttribute('href'));

  //console.log({ title, link });

  const titles = await page.evaluate(() => {
    //return document.querySelectorAll("#trackingEvents");
    return [...document.querySelectorAll("#trackingEvents")].map(
      (el) => el.textContent
    );
  });
  titles.forEach((element) => {
    console.log("element:", element);
  });
  console.log("titles:::", titles);

  // Get page data
  const tracks = await page.evaluate(() => {
    // Fetch the first element with class "quote"
    // Get the displayed text and returns it
    const trackingEvents = document.querySelectorAll("#trackingEvents");
    console.log("trackingEvents???????????", trackingEvents);

    // Convert the quoteList to an iterable array
    // For each quote fetch the text and author
    return Array.from(trackingEvents).map((trackingEvent, index) => {
      // Fetch the sub-elements from the previously fetched quote element
      // Get the displayed text and return it (`.innerText`)
      const trackingInfoDetails = trackingEvent.querySelector(
        ".trackingInfoDetails"
      ).textContent;
      const trackingInfoDateTime = trackingEvent.querySelector(
        ".trackingInfoDateTime"
      ).innerText;

      return { trackingInfoDetails, trackingInfoDateTime, index };
      //console.log('trackingEvent::::', trackingEvent.textContent);
    });
  });
  //#test

  // Interact with the DOM to retrieve the titles
  // const titles = await page.evaluate(() => {
  // Select all elements with crayons-tag class
  // return [...document.querySelectorAll('#trackingEvents')].map(el => el.textContent);

  //});

  // Display the tracks
  console.log(tracks);

  // Don't forget to close the browser instance to clean up the memory
  await browser.close();

  // Print the results
  //titles.forEach(title => console.log(`-- ${title}`));
  //tracks.forEach(title => console.log(`-- ${trackingEvent}`));
}

////////////////////////////////////////////////////////////////////
async function parseL(id) {
  console.log("id:", id);
  //UZ0627176106Y
  //return;

  const proxyServer = "1.248.219.25:8080";
  const browser = await puppeteer.launch({
    //headless: 'shell',
    //args: ['--enable-gpu', '--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${proxyServer}`],
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], //`--proxy-server=${proxyServer}`
  });

  //const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://track24.net/?code=" + id, {
    waitUntil: "networkidle2",
    //waitUntil: "load",
    //timeout: 0,
  });

  //const ip = await body.getProperty('textContent');
  //console.log(await ip.jsonValue());

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll(".trackingInfoRow"));
    console.log("tds:", tds);
    //return {tds};
    return tds.map((div, index) => {
      //const innerHTML = (div.innerHTML);
      const trackingInfoDetails = {
        operationAttribute: div.querySelector(".operationAttribute")
          .textContent,
        operationType: div.querySelector(".operationType").textContent,
        operationPlace: div.querySelector(".operationPlace").textContent,
      };
      const trackingInfoDateTime = {
        date: div.querySelector(".date").innerText,
        time: div.querySelector(".time").innerText,
      };
      const courierLabel = div.querySelector(".label.label-info").innerText;

      return { trackingInfoDetails, trackingInfoDateTime, courierLabel, index };
      //return innerHTML.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim();
    });
  });

  console.log(data);
  await browser.close();
  return data;
}

//////////////////////////////////////////////////////////////////////

async function parcelsapp(id) {
  console.log("id:", id);
  //UZ0627176106Y
  //return;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://parcelsapp.com/en/tracking/" + id, {
    waitUntil: "networkidle2",
  });

  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll(".event"));
    return tds.map((div, index) => {
      //const innerHTML = (div.innerHTML);
      const trackingInfoDetails = {
        operationAttribute: div.querySelector(".event-content").innerText,
        //operationType: div.querySelector(".operationType").innerText,
        //operationPlace: div.querySelector(".operationPlace").innerText,
      };
      const trackingInfoDateTime = {
        date: div.querySelector(".event-time").innerText,
        time: div.querySelector(".event-time").innerText,
      };
      //const courierLabel = div.querySelector(".label.label-info").innerText;

      return { trackingInfoDetails, trackingInfoDateTime, index };
      //return innerHTML.replace(/<a [^>]+>[^<]*<\/a>/g, '').trim();
    });
  });

  console.log(data);
  await browser.close();
  return data;
}

//parseL();
//parcelsapp('RS1072416916Y');
//parseLogRocketBlogHome();

cron.schedule("0 * * * *", generatePushNotifications);
