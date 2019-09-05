<template>
    <q-page>
      <div class="fixed-center text-center">
        <p>
          <q-icon name="person" size="8em" color="grey-5" />
        </p>
        <p class="text-faded">Estamos preparando sua sessão.</p>
        <p class="text-faded"><strong>Aguarde enquanto configuramos suas informações...</strong></p>
      </div>
    </q-page>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  mounted () {
    this.$oidc.signinRedirectCallback()
      .then((user) => {
        console.log('USER IN CALLBACK', user)
        window.location.href = process.env.REDIRECT_CALLBACK
      }).catch((err) => {
        console.error('Erro signinRedirectCallback', err)
        if (err.message === 'No matching state found in storage') {
          this.$mgr.signIn()
            .then((suc) => {
              console.log('SUCESSO NO LOGIN', suc)
            })
            .catch((err) => {
              console.log('Erro no sign', err.message)
            })
        }
      })
  }
}
</script>
