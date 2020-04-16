import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
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
import H from 'history';
import { Helmet } from 'react-helmet';
import { FormattedMessage, injectIntl, InjectedIntl } from 'react-intl';

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

import DecoratedLoginContainer, {
  LoginContainer,
  UserButton
} from '@/containers/LoginContainer';

import { ICombinedState } from '@/reducers';
import { IGalleryState } from '@/reducers/gallery';
import { IAuthState } from '@/reducers/auth';

export const styles = createStyles({
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

interface IGalleryContainerProps extends WithStyles<typeof styles> {
  dispatch: Dispatch<IGalleryAction> & TGalleryThunkDispatch;
  intl: InjectedIntl;
  gallery: IGalleryState;
  auth: IAuthState;
  location: H.Location;
}

interface IGalleryContainerState {
  isDrawerOpen: boolean;
  isSearchByPopularity: boolean;
}

class GalleryContainer extends React.Component<
  IGalleryContainerProps,
  IGalleryContainerState
> {
  contentRef = React.createRef<IContentHandles>();
  loginRef: LoginContainer;

  constructor(props: IGalleryContainerProps) {
    super(props);

    this.state = {
      isDrawerOpen: false,
      isSearchByPopularity: false
    };
  }

  componentDidMount() {
    if (this.props.gallery.fromIllust) {
      this.onSearch(this.props.gallery.word);
      this.props.dispatch(GalleryActions.setFromIllust(false));
    } else {
      const search = new URLSearchParams(this.props.location.search);
      if (search.get('entry') === 'ranking') {
        this.props.dispatch(GalleryActions.setWord('ranking'));
        Storage.set('word', 'ranking');
      } else {
        const cachedWord = Storage.get('word');
        this.props.dispatch(
          GalleryActions.setWord(cachedWord ? cachedWord : 'ranking')
        );
      }

      if (this.props.gallery.items.length === 0) {
        this.fetchSource(true);
      }
      this.fetchTags();
    }
  }

  onLoadMore = () => {
    if (this.props.gallery.errorTimes < 3) {
      this.fetchSource(false);
    }
  };

  reRenderContent = () => {
    this.props.dispatch(GalleryActions.clearErrorTimes());
    this.props.dispatch(GalleryActions.clearSource());
    this.fetchSource(true);
  };

  fetchSource(isFirstLoad: boolean) {
    if (isFirstLoad) {
      this.props.dispatch(GalleryActions.setPage(1));
    }
    this.props.dispatch(GalleryActions.fetchSourceIfNeeded());
  }

  fetchTags = () => {
    this.props.dispatch(GalleryActions.fetchTags());
  };

  onSearch = (word: string) => {
    if (!word) {
      return;
    }
    Storage.set('word', word);
    this.props.dispatch(GalleryActions.clearErrorTimes());
    this.props.dispatch(GalleryActions.clearSource());
    this.props.dispatch(GalleryActions.setWord(word));
    this.fetchSource(true);
  };

  onKeywordClick = (word: string) => {
    this.props.dispatch(GalleryActions.setWord(word));
    this.reRenderContent();
    Storage.set('word', word);
  };

  renderKeywords() {
    const keywords = [...this.props.gallery.tags];
    keywords.unshift({ tag: 'ranking' });

    if (this.props.gallery.isFetchingTags) {
      return <Loading />;
    }

    const word = String(this.props.gallery.word);
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
          <ListItem button onClick={() => this.onKeywordClick(word)}>
            <ListItemIcon>
              <DoneIcon style={{ color: '#4caf50' }} />
            </ListItemIcon>
            <ListItemText style={{ fontWeight: 'bold' }} primary={word} />
          </ListItem>
        )}
        {keywords.map(elem => {
          const ranking = elem.tag === 'ranking';
          const highlight =
            elem.tag === this.props.gallery.word ||
            (this.props.gallery.word === 'ranking' && ranking);

          return (
            <ListItem
              key={elem.tag}
              button
              onClick={() =>
                this.onKeywordClick(ranking ? 'ranking' : elem.tag)
              }>
              {highlight && (
                <ListItemIcon>
                  <DoneIcon style={{ color: '#4caf50' }} />
                </ListItemIcon>
              )}
              <ListItemText
                style={{ fontWeight: 'bold' }}
                primary={
                  ranking
                    ? this.props.intl.formatMessage({ id: 'Ranking' })
                    : elem.tag
                }
              />
            </ListItem>
          );
        })}
      </>
    );
  }

  onHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const tagName = target.tagName.toLowerCase();

    if (
      tagName !== 'button' &&
      tagName !== 'span' &&
      tagName !== 'svg' &&
      tagName !== 'path' &&
      tagName !== 'input'
    ) {
      this?.contentRef?.current?.toTop();
    }
  };

  onToggleDrawer = () => {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <>
        <Helmet>
          <title>{config.siteTitle}</title>
        </Helmet>
        <AppBar position="static" onClick={this.onHeaderClick}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              color="inherit"
              onClick={this.onToggleDrawer}
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
              onSearch={this.onSearch}
              isSearchByPopularity={this.state.isSearchByPopularity}
            />
            <LanguageSelector />
            <UserButton
              onClick={() => this.loginRef.open()}
              authData={this.props.auth.authData}
            />
          </Toolbar>
        </AppBar>
        <Drawer open={this.state.isDrawerOpen} onClose={this.onToggleDrawer}>
          <div
            tabIndex={0}
            role="button"
            onClick={this.onToggleDrawer}
            onKeyDown={this.onToggleDrawer}>
            <List
              subheader={
                <ListSubheader disableSticky>
                  <FormattedMessage id="Tags" />
                </ListSubheader>
              }>
              {this.renderKeywords()}
            </List>
          </div>
        </Drawer>
        <Content ref={this.contentRef}>
          <InfiniteScroll
            distance={200}
            onLoadMore={this.onLoadMore}
            isLoading={this.props.gallery.isFetching}
            hasMore>
            <div className={classes.root}>
              <GalleryList items={this.props.gallery.items} />
              {this.props.gallery.isFetching && <Loading />}
              <Message
                text={this.props.intl.formatMessage({ id: 'Failed to Load' })}
                isHidden={!this.props.gallery.isError}
              />
              <Refresh onClick={this.reRenderContent} />
            </div>
          </InfiniteScroll>
        </Content>
        <DecoratedLoginContainer onRef={ref => (this.loginRef = ref)} />
      </>
    );
  }
}

export default connect((state: ICombinedState) => ({
  gallery: state.gallery,
  auth: state.auth
}))(injectIntl(withStyles(styles)(GalleryContainer)));
