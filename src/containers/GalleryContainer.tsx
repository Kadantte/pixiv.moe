import React from 'react';
import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader
} from '@material-ui/core';
import { Menu as MenuIcon, Done as DoneIcon } from '@material-ui/icons';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';

import config from '@/config';

import * as GalleryActions from '@/actions/gallery';
import { IGalleryAction, TGalleryThunkDispatch } from '@/actions/gallery';
import InfiniteScroll from '@/components/InfiniteScroll';
import GalleryList from '@/components/GalleryList';
import Loading from '@/components/Loading';
import Refresh from '@/components/Refresh';
import Message from '@/components/Message';
import LanguageSelector from '@/components/LanguageSelector';
import SearchInput from '@/components/SearchInput';
import Content, { IContentHandles } from '@/components/Content';
import Storage from '@/utils/Storage';

import LoginContainer, {
  ILoginContainerHandles,
  UserButton
} from '@/containers/LoginContainer';

import { ICombinedState } from '@/reducers';

export const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  toolbarTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '@media screen and (max-width: 649px)': {
      maxWidth: '50%'
    }
  },
  toolbarMiddle: {
    flex: 1
  },
  root: {
    margin: '0 auto'
    // paddingLeft: 3,
    // paddingRight: 20
  }
});

interface IGalleryContainerProps {
  dispatch: Dispatch<IGalleryAction> & TGalleryThunkDispatch;
}

const GalleryContainer: React.FunctionComponent<IGalleryContainerProps> = () => {
  const classes = useStyles();
  const intl = useIntl();
  const dispatch = useDispatch();
  const location = useLocation();
  const gallery = useSelector((state: ICombinedState) => state.gallery);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isSearchByPopularity] = React.useState(false);
  const loginRef = React.useRef<ILoginContainerHandles>(null);
  const contentRef = React.useRef<IContentHandles>(null);

  const fetchSource = (isFirstLoad: boolean) => {
    if (isFirstLoad) {
      dispatch(GalleryActions.setPage(1));
    }
    dispatch(GalleryActions.fetchSourceIfNeeded());
  };

  const onLoadMore = () => {
    if (gallery.errorTimes < 3) {
      fetchSource(false);
    }
  };

  const reRenderContent = () => {
    dispatch(GalleryActions.clearErrorTimes());
    dispatch(GalleryActions.clearSource());
    fetchSource(true);
  };

  const fetchTags = () => {
    dispatch(GalleryActions.fetchTags());
  };

  const onSearch = (word: string) => {
    if (!word) {
      return;
    }
    Storage.set('word', word);
    dispatch(GalleryActions.clearErrorTimes());
    dispatch(GalleryActions.clearSource());
    dispatch(GalleryActions.setWord(word));
    fetchSource(true);
  };

  const onKeywordClick = (word: string) => {
    dispatch(GalleryActions.setWord(word));
    reRenderContent();
    Storage.set('word', word);
  };

  React.useEffect(() => {
    if (gallery.fromIllust) {
      onSearch(gallery.word);
      dispatch(GalleryActions.setFromIllust(false));
    } else {
      const search = new URLSearchParams(location.search);
      if (search.get('entry') === 'ranking') {
        dispatch(GalleryActions.setWord('ranking'));
        Storage.set('word', 'ranking');
      } else {
        const cachedWord = Storage.get('word');
        dispatch(GalleryActions.setWord(cachedWord ? cachedWord : 'ranking'));
      }
      if (gallery.items.length === 0) {
        fetchSource(true);
      }
      fetchTags();
    }
  }, []);

  const renderKeywords = () => {
    const keywords = [...gallery.tags];
    keywords.unshift({ tag: 'ranking' });

    if (gallery.isFetchingTags) {
      return <Loading />;
    }

    const word = String(gallery.word);
    let found = false;
    for (const item of keywords) {
      if (item.tag === word) {
        found = true;
        break;
      }
    }

    return (
      <>
        {!found && word !== 'ranking' && word.trim() !== '' && (
          <ListItem button onClick={() => onKeywordClick(word)}>
            <ListItemIcon>
              <DoneIcon style={{ color: '#4caf50' }} />
            </ListItemIcon>
            <ListItemText style={{ fontWeight: 'bold' }} primary={word} />
          </ListItem>
        )}
        {keywords.map(elem => {
          const ranking = elem.tag === 'ranking';
          const highlight =
            elem.tag === gallery.word ||
            (gallery.word === 'ranking' && ranking);

          return (
            <ListItem
              key={elem.tag}
              button
              onClick={() => onKeywordClick(ranking ? 'ranking' : elem.tag)}>
              {highlight && (
                <ListItemIcon>
                  <DoneIcon style={{ color: '#4caf50' }} />
                </ListItemIcon>
              )}
              <ListItemText
                style={{ fontWeight: 'bold' }}
                primary={
                  ranking ? intl.formatMessage({ id: 'Ranking' }) : elem.tag
                }
              />
            </ListItem>
          );
        })}
      </>
    );
  };

  const onHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    if (
      typeof target.className === 'string' &&
      target.className.indexOf(classes.toolbar) > -1
    ) {
      contentRef?.current?.toTop();
    }
  };

  const onToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <Helmet>
        <title>{config.siteTitle}</title>
      </Helmet>
      <AppBar position="static" onClick={onHeaderClick}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            color="inherit"
            onClick={onToggleDrawer}
            aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.toolbarTitle}>
            {config.siteTitle}
          </Typography>
          <div className={classes.toolbarMiddle} />
          <SearchInput
            onSearch={onSearch}
            isSearchByPopularity={isSearchByPopularity}
          />
          <LanguageSelector />
          <UserButton onClick={() => loginRef.current?.open()} />
        </Toolbar>
      </AppBar>
      <Drawer open={isDrawerOpen} onClose={onToggleDrawer}>
        <div
          tabIndex={0}
          role="button"
          onClick={onToggleDrawer}
          onKeyDown={onToggleDrawer}>
          <List
            subheader={
              <ListSubheader disableSticky>
                {intl.formatMessage({ id: 'Tags' })}
              </ListSubheader>
            }>
            {renderKeywords()}
          </List>
        </div>
      </Drawer>
      <Content ref={contentRef}>
        <InfiniteScroll
          distance={200}
          onLoadMore={onLoadMore}
          isLoading={gallery.isFetching}
          hasMore>
          <div className={classes.root}>
            <GalleryList items={gallery.items} />
            {gallery.isFetching && <Loading />}
            {gallery.isError && (
              <Message text={intl.formatMessage({ id: 'Failed to Load' })} />
            )}
            <Refresh onClick={reRenderContent} />
          </div>
        </InfiniteScroll>
      </Content>
      <LoginContainer ref={loginRef} />
    </>
  );
};

export default GalleryContainer;
