/** 验证码类型枚举 */
export enum CaptchaTypeEnum {
  LOGIN = 'login', // 登录验证码
  REGISTER = 'register', // 注册验证码
  VERIFY_SELF = 'verify', // 身份校验验证码
  BIND_EMAIL = 'bind' // 邮箱绑定验证码
}
