const firebase = require("firebase-admin");

firebase.initializeApp({
    credential: firebase.credential.cert({
        "type": "service_account",
        "project_id": process.env.PROJECT_ID,
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY,
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": process.env.CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
      }),
    databaseURL: process.env.DATABASE_URL
})

const db = firebase.firestore(),
    servers = db.collection('servers');

module.exports = class FireBase {
    static createServer(server_id) {
        return new Promise(async resolve => {
            try {
                await servers.doc(server_id)
                    .set({
                        prefix: 'f!',
                        channel: '',
                    }).then(() => {
                        resolve(true);
                    });
            } catch (e) { resolve(false); }
        })
    }

    static getAllServers(serversIds) {
        return new Promise(async resolve => {
            try {
                let snap = await servers.get(),
                    result = snap.docs.reduce((r, o) => {
                        r[o.id] = o.data();
                        return r;
                    }, {});

                for (const server_id of serversIds) {
                    try {
                        if (!config.servers.hasOwnProperty(server_id)) {
                            if (await FireBase.createServer(server_id))
                                console.log(`${server_id} added on database.`);
                        }
                    } catch (e) { if (await FireBase.createServer(server_id)) console.log(`${server_id} added on database.`); }
                }

                if (Object.keys(result).length > 0) resolve(result);
                resolve(null);
            } catch (e) { resolve(null); }
        });
    }

    static observer(coll_name, callback) {
        try {
            db.collection(coll_name).onSnapshot(snap => {
                let result = snap.docs.reduce((r, o) => {
                    r[o.id] = o.data();
                    return r;
                }, {});

                if (Object.keys(result).length > 0) return callback(result);
                return callback(null);
            })
        } catch (e) { return callback(null); }
    }
}