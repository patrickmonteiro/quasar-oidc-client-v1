import 'babel-polyfill'
import Oidc from 'oidc-client'
import { Dialog } from 'quasar'

let env = process.env
const mgr = new Oidc.UserManager({
  userStore: new Oidc.WebStorageStateStore({
    // prefix: 'w3as',
    store: window.localStorage
  }),
  authority: env.OIDC_AUTHORITY,
  client_id: env.OIDC_CLIENTID,
  redirect_uri: env.OIDC_REDIRECT_URI,
  response_type: 'id_token token',
  scope: env.OIDC_SCOPE, // 'openid profile',
  silent_redirect_uri: window.location.origin + env.OIDC_SILENT_REDIREC_URI,
  accessTokenExpiringNotificationTime: 1,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
  clockSkew: 100,
  silentRequestTimeout: 2000
})

mgr.startSilentRenew()

Oidc.Log.logger = console
Oidc.Log.level = Oidc.Log.INFO

mgr.events.addUserLoaded(function (user) {
  console.log('New User Loaded：', arguments)
  console.log('Acess_token: ', user.access_token)
})

// mgr.events.addUserUnloaded(function () {
//   mgr.removeUser().then(function () {
//     mgr.clearStaleState()
//       .then(() => {
//         mgr.signoutRedirect()
//       })
//   })
// })

mgr.events.addAccessTokenExpiring(function () {
  console.log('AccessToken Expiring：', arguments)
  mgr.signinSilentCallback()
    .then((suc) => {
      console.log('SUCESSO', suc)
    })
    .catch((err) => {
      console.log('Erro', err)
    })
})

mgr.events.addAccessTokenExpired(function () {
  console.log('AccessToken Expired：', arguments)
  Dialog.create({
    title: 'Sessão Expirada',
    message: 'Você será redirecionado para se autenticar.',
    preventClose: true
  }).then(() => {
    mgr.removeUser().then(function (resp) {
      mgr.clearStaleState()
        .then(() => {
          mgr.signoutRedirect()
        })
    })
  }).catch(function (err) {
    console.log(err)
  })
})

mgr.events.addSilentRenewError(function () {
  console.error('Silent Renew Error：', arguments)
})

mgr.events.addUserSignedOut(function () {
  mgr.removeUser().then(function (resp) {
    mgr.clearStaleState()
      .then(() => {
        mgr.signinRedirect()
      })
  })
})

export default ({ Vue }) => {
  const oidc = new Oidc.UserManager({ userStore: new Oidc.WebStorageStateStore() })
  const $mgr = {
    getUserProfileNoSigIn: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            return resolve(null)
          } else {
            return resolve(user)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getUser: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(null)
          } else {
            return resolve(user)
          }
        }).catch(function (err) {
          // console.log('ERRO NO PLUGIN', err)
          return reject(err)
        })
      })
    },
    getSignedIn: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(true)
          }
        }).catch(function (err) {
          // console.error(err)
          return reject(err)
        })
      })
    },
    signIn: () => {
      console.log('CHAMOU O SIGNIN')
      mgr.signinRedirect().catch(function (err) {
        console.log(err)
      })
    },
    signOut: () => {
      mgr.signoutRedirect().then(function (resp) {
        console.log('signed out', resp)
      }).catch(function (err) {
        console.log(err)
      })
    },
    getToken: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getProfile: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.profile)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getIdToken: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.id_token)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getSessionState: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.session_state)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getAcessToken: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.access_token)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getScopes: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.scopes)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    },
    getRole: () => {
      return new Promise((resolve, reject) => {
        mgr.getUser().then(function (user) {
          if (user == null) {
            $mgr.signIn()
            return resolve(false)
          } else {
            return resolve(user.profile.role)
          }
        }).catch(function (err) {
          console.log(err)
          return reject(err)
        })
      })
    }
  }
  Vue.prototype.$mgr = $mgr
  Vue.prototype.$oidc = oidc
}
