
import firebaseAdmin from 'firebase-admin'
import jsonConfig from './config.json'
const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(jsonConfig as any)
});

export default (message: any) => {
  message.tokens = message.tokens.filter((a: any) => a !== "")
  admin.messaging().sendMulticast(message).then((res) => {
    console.log('Notication sent')
  }).catch(e => {
    console.log(e)
    console.log('Notication not sent')
  })

}

