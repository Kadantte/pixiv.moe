import React, { createContext } from 'react';
import { observable } from 'mobx';
import { useLocalStore } from 'mobx-react-lite';
import * as api from '../utils/api';
import * as storage from '../utils/storage';

export const createStore = () => {
  const store = observable({
    page: 1,
    xRestrict: false,
    isFetching: false,
    isError: false,
    errorMsg: '',
    errorTimes: 0,
    items: [] as any[],
    images: [] as string[],
    isFetchingTags: false,
    tags: [] as any[],
    word: 'ranking',
    fromIllust: false,

    async fetchSource() {
      if (store.isFetching) {
        return;
      }
      store.isError = false;
      store.isFetching = true;
      try {
        const data =
          store.word === 'ranking'
            ? await api.ranking(store.page)
            : storage.getPremiumKey()
            ? await api.searchPremium({
                word: store.word,
                page: store.page,
                x_restrict: store.xRestrict ? 1 : 0
              })
            : await api.search({
                word: store.word,
                page: store.page
              });
        if (data.response.illusts && data.response.illusts.length > 0) {
          store.items = [...store.items, ...data.response.illusts];
        } else {
          store.isError = true;
          store.errorTimes = store.errorTimes + 1;
        }
        store.page = store.page + 1;
      } catch (err) {
        if (err instanceof api.APIError) {
          store.errorMsg = err.message;
        } else {
          store.errorMsg = '';
        }
        store.isError = true;
        store.errorTimes = store.errorTimes + 1;
      } finally {
        store.isFetching = false;
      }
    },

    async fetchTags() {
      store.isFetchingTags = true;
      try {
        const data = await api.tags();
        if (data.response.tags) {
          store.tags = data.response.tags;
        }
      } finally {
        store.isFetchingTags = false;
      }
    },

    clearErrorTimes() {
      store.errorTimes = 0;
    },

    clearSource() {
      store.items = [];
      store.images = [];
    },

    setWord(word: string) {
      store.word = word;
    },

    setFromIllust(fromIllust: boolean) {
      store.fromIllust = fromIllust;
    }
  });
  return store;
};

type GalleryStore = ReturnType<typeof createStore>;

export const GalleryContext = createContext<GalleryStore>({} as GalleryStore);

export const GalleryProvider: React.FC<{}> = props => {
  const store = useLocalStore(createStore);

  return (
    <GalleryContext.Provider value={store}>
      {props.children}
    </GalleryContext.Provider>
  );
};
