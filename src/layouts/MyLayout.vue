<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://github.quasar.dev">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>github.com/quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://chat.quasar.dev">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>chat.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://forum.quasar.dev">
          <q-item-section avatar>
            <q-icon name="record_voice_over" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>forum.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://twitter.quasar.dev">
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>@quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://facebook.quasar.dev">
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Facebook</q-item-label>
            <q-item-label caption>@QuasarFramework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: false,
      userinfo: {},
      signedIn: false,
      transacoes: [],
      dialogMS: null
    }
  },
  created () {
    this.$mgr.getUser().then(
      success => {
        this.userinfo = success
        if (success.profile.transacoes) {
          if (Array.isArray(success.profile.transacoes)) {
            this.ws(success.profile.vchLogin)
            success.profile.transacoes.forEach(element => {
              this.transacoes.push(JSON.parse(element))
            })
          } else {
            this.ws(success.profile.vchLogin)
            this.transacoes.push(JSON.parse(success.profile.transacoes))
          }
        }
        // success.profile.transacoes.forEach(element => {
        //   this.transacoes.push(JSON.parse(element))
        // })
      },
      err => {
        console.log('Erro na recuperação de usuário page: layout/default.vue', err)
      }
    )
  },
  mounted () {
    this.verificaVersaoNoCache()
    this.$mgr.getSignedIn().then(
      success => {
        this.signedIn = success
      },
      err => {
        this.signedIn = err
        console.log('NÃO ESTÁ LOGADO', err)
      }
    )
  },
  ready () {
    window.onunload = this.unloadWindow
  },
  methods: {
    openURL,
    verificaVersaoNoCache () {
      if (localStorage.getItem('w3_NOMEAPP_version') !== process.env.VERSION_APP) {
        localStorage.setItem('w3_NOMEAPP_version', process.env.VERSION_APP)
        setTimeout(() => {
          window.location.reload(true)
        }, 300)
      }
    },
    unloadWindow () {
      if (this.$connectionMulti) {
        this.$connectionMulti().close()
      }
    },
    ws (login) {
      // console.log('WS')
      // console.log(login)
      const ws = new WebSocket(`${process.env.MULTISESSION}?clientId=ssa&usuario=${login}`)
      ws.onopen = () => console.log('Ws Connected')
      ws.onerror = () => console.log('Error on ws')
      ws.onmessage = (evt) => {
        var obj = JSON.parse(evt.data)
        console.log(obj.action)
        switch (obj.action) {
          case 'contar':
            if (obj.count > 1) {
              if (this.dialogMS == null) {
                this.dialogMS = this.$q.dialog({
                  title: 'Aviso',
                  message: 'Existe outra sessão aberta para este usuário.',
                  color: 'primary',
                  ok: 'Continuar',
                  cancel: 'Sair',
                  persistent: true
                })
                  .onOk(() => {
                    ws.send(JSON.stringify({ action: 'ficar' }))
                    this.dialogMS = null
                  }).onCancel(() => {
                    ws.send(JSON.stringify({ action: 'sair' }))
                  })
                // this.dialogMS.then(() => {
                //   ws.send(JSON.stringify({ action: 'ficar' }))
                //   this.dialogMS = null
                // }).catch(() => {
                //   ws.send(JSON.stringify({ action: 'sair' }))
                // })
              }
            } else {
              if (this.dialogMS) {
                document.getElementsByClassName('modal-buttons row')[0].children[1].click()
              }
            }
            break
          case 'ficar':
            console.log(this.dialogMS)
            document.getElementsByClassName('modal-buttons row')[0].children[1].click()
            break
          case 'sair':
            // console.log('OBJETOOOOOOO', store.dispatch('Auth/setLogout'))
            window.location.href = process.env.ESCAPELINK
            break
          default:
            break
        }
      }
    }
  }
}
</script>

<style>
</style>
