import { Notify } from 'quasar'

export default ({ router, store, Vue }) => {
  let transacoes = []
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const transacao = to.meta.transacao
    if (requiresAuth) {
      Vue.prototype.$mgr.getUser().then(
        (success) => {
          if (success.profile.transacoes) {
            if (Array.isArray(success.profile.transacoes)) {
              success.profile.transacoes.forEach(element => {
                transacoes.push(JSON.parse(element))
              })
            } else {
              transacoes.push(JSON.parse(success.profile.transacoes))
            }
          }
          if (transacao) {
            setTimeout(() => {
              if (transacoes.some((value) => { return value.vchTransacao === transacao })) {
                next()
              } else {
                Notify.create({
                  color: 'negative',
                  position: 'top',
                  message: 'Você não tem acesso a este módulo!',
                  icon: 'report_problem'
                })
                next('/dashboard') // -------- AQUI É ONDE A ROTA É BARRADA E REDIRECIONADA AO DASHBOARD
              }
            }, 150)
          }
          next()
        },
        err => {
          console.log('Erro na recuperação de usuário', err)
        }
      )
    } else {
      next()
    }
  })
}
