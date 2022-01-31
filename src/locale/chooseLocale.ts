import * as storage from '../utils/storage';
import * as config from '../config';

const chooseLocale = (
  language: string,
  setLocaleFunc?: (data: { lang: string; messages: any }) => void
) => {
  const cachedLang = storage.getLang();
  let lang;

  if (!cachedLang) {
    lang = language.split('-')[0];
  } else {
    lang = cachedLang;
  }

  let found = config.languages[0];
  let isFallback = true;
  for (const item of config.languages) {
    if (lang === item.value) {
      isFallback = false;
      found = item;
    }
  }

  const messages = found.messages;

  storage.setLang(isFallback ? 'ja' : lang);

  const settedLocale = {
    lang: isFallback ? 'ja' : lang,
    messages
  };

  if (setLocaleFunc) {
    setLocaleFunc(settedLocale);
  }

  return settedLocale;
};

export default chooseLocale;
