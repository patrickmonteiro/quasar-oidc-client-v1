<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      timeSetTimeOut: null,
      tempoRestante: '00:30',
      tempoAtividadeUsuarioMinutos: 0,
      tempoAtividadeUsuarioMilisegundos: 0,
      temporizador: null,
      timeProgress: 30,
      verifiyCondititionTemporizador: false

    }
  },
  mounted () {
    this.$mgr.getUserProfileNoSigIn().then(
      success => {
        let retorno = success.profile
        this.tempoAtividadeUsuarioMinutos = parseInt(retorno.numTempoInatividade)
      },
      err => {
        console.log('Erro na recuperação de usuário', err)
      }
    )
  }
}
</script>

<style>
</style>
