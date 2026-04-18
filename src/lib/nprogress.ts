import NProgress from 'nprogress'

// 配置 NProgress
NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  minimum: 0.2
})

export default NProgress
