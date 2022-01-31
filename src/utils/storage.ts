import store from 'store2';

const KEYS = {
  WORD: 'word',
  X_RESTRICT: 'x_restrict',
  LANG: 'lang',
  TOKEN: 'token',
  AUTH: 'auth',
  PREMIUM_KEY: 'premium_key'
};

export const getWord = () => store.get(KEYS.WORD);

export const setWord = (word: string) => store.set(KEYS.WORD, word);

export const removeWord = () => store.remove(KEYS.WORD);

export const getXRestrict = () => store.get(KEYS.X_RESTRICT);

export const setXRestrict = (xRestrict: boolean) =>
  store.set(KEYS.X_RESTRICT, xRestrict);

export const removeXRestrict = () => store.remove(KEYS.X_RESTRICT);

export const getLang = () => store.get(KEYS.LANG);

export const setLang = (lang: string) => store.set(KEYS.LANG, lang);

export const removeLang = () => store.remove(KEYS.LANG);

export const getToken = () => store.get(KEYS.TOKEN);

export const setToken = (token: string) => store.set(KEYS.TOKEN, token);

export const removeToken = () => store.remove(KEYS.TOKEN);

export const getAuth = () => store.get(KEYS.AUTH);

export const setAuth = (auth: any) => store.set(KEYS.AUTH, auth);

export const removeAuth = () => store.remove(KEYS.AUTH);

export const getPremiumKey = () => store.get(KEYS.PREMIUM_KEY);

export const setPremiumKey = (premiumKey: string) =>
  store.set(KEYS.PREMIUM_KEY, premiumKey);

export const removePremiumKey = () => store.remove(KEYS.PREMIUM_KEY);
