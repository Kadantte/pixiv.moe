import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  Twitter as TwitterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@material-ui/icons';
import shortid from 'shortid';
import Img from 'react-image';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import moment from 'moment';

import config from '@/config';

import * as IllustActions from '@/actions/illust';
import * as GalleryActions from '@/actions/gallery';
import * as AlertModal from '@/components/AlertModal';
import Comment from '@/components/Comment';
import GifPlayer from '@/components/GifPlayer';
import InfiniteScroll from '@/components/InfiniteScroll';
import Loading from '@/components/Loading';
import Message from '@/components/Message';
import Content from '@/components/Content';
import ImageBox from '@/components/ImageBox';
import LanguageSelector from '@/components/LanguageSelector';
import WeiboIcon from '@/icons/Weibo';
import LineIcon from '@/icons/Line';
import LoginContainer, {
  ILoginContainerHandles,
  UserButton
} from '@/containers/LoginContainer';
import { useStyles as useGalleryStyles } from '@/containers/GalleryContainer';
import * as api from '@/utils/api';
import Social from '@/utils/Social';
import { ICombinedState } from '@/reducers';

const useStyles = makeStyles({
  illust: {
    padding: 20
  },
  link: {
    cursor: 'default'
  },
  image: {
    overflow: 'hidden',
    textAlign: 'center',
    '& img': {
      display: 'block',
      position: 'relative',
      marginTop: 0,
      marginRight: 'auto',
      marginBottom: 10,
      marginLeft: 'auto',
      maxWidth: '100%',
      boxShadow:
        '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
      border: 0,
      zIndex: 1,
      cursor: 'zoom-in',
      transition: 'opacity 0.3s ease',
      '@media screen and (max-width: 768px) and (orientation: portrait)': {
        width: '100%'
      },
      '@media screen and (max-width: 1024px) and (orientation: landscape)': {
        width: '100%'
      }
    }
  },
  caption: {
    margin: 15,
    textAlign: 'center',
    '& p': {
      lineHeight: '18px'
    }
  },
  tags: {
    margin: 15,
    textAlign: 'center'
  },
  tagItem: {
    margin: 5,
    '& div': {
      color: 'rgb(255, 255, 255) !important',
      backgroundColor: 'rgb(0, 150, 136) !important'
    }
  },
  actions: {
    margin: 15,
    textAlign: 'center',
    '& button': {
      margin: 8
    }
  },
  detail: {
    textAlign: 'center',
    color: 'rgb(255, 64, 129)',
    '& time': {
      marginLeft: 10,
      color: '#999'
    },
    '& a': {
      textDecoration: 'none'
    }
  },
  author: {
    display: 'inline-block',
    '&:before': {
      content: '"by"',
      marginRight: 5
    },
    '& a': {
      color: '#258fb8'
    }
  },
  metas: {
    color: '#666'
  },
  divide: {
    '&:not(:first-child)': {
      marginLeft: 4,
      paddingLeft: 4,
      borderLeft: '1px solid #ccc'
    }
  },
  comments: {
    width: '100%'
  },
  commentList: {
    display: 'block',
    padding: '8px 0',
    listStyle: 'none'
  }
});

interface IIllustContainerRouteInfo {
  illustId: string;
}

const IllustContainer: React.FunctionComponent<{}> = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [boxIndex, setBoxIndex] = React.useState(0);
  const [showBox, setShowBox] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const classes = { ...useStyles(), ...useGalleryStyles() };

  const dispatch = useDispatch();
  const illust = useSelector((state: ICombinedState) => state.illust);
  const history = useHistory();
  const intl = useIntl();

  const { illustId } = useParams<IIllustContainerRouteInfo>();
  const loginRef = React.useRef<ILoginContainerHandles>(null);

  const fetchBookmark = () => {
    api
      .illustBookmarkDetail(illustId)
      .then(data => {
        if (data.status === 'success') {
          setIsBookmarked(
            data.response?.bookmark_detail?.is_bookmarked ?? false
          );
        }
      })
      .catch(() => {});
  };

  const item = illust.items[illustId] ? illust.items[illustId] : { title: '' };

  const urls = (): string[] => {
    if (item?.meta_single_page?.original_image_url) {
      return [item.meta_single_page?.original_image_url];
    }
    if (item?.meta_pages?.length > 0) {
      return item.meta_pages.map((page: any) => page.image_urls.original);
    }
    return [];
  };

  const onBackClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    history.push('/');
  };

  const onBookmarkClick = () => {
    const authData = api.getAuth();
    if (!authData) {
      return loginRef.current?.open();
    }

    setIsSubmitting(true);
    api[!isBookmarked ? 'illustBookmarkAdd' : 'illustBookmarkDelete'](
      illustId
    ).then(data => {
      if (data.status === 'success') {
        setIsSubmitting(false);
        setIsBookmarked(!isBookmarked);
      } else {
        AlertModal.make(
          'error',
          intl.formatMessage({
            id: 'Communication Error Occurred'
          })
        );
      }
    });
  };

  const onImageClick = (index: number) => {
    setBoxIndex(index);
    setShowBox(true);
  };

  const onImageClose = () => {
    setBoxIndex(0);
    setShowBox(false);
  };

  const onSocialClick = (type: 'toTwitter' | 'toLine' | 'toWeibo') => {
    new Social({
      text: `${item.title} | ${item.user.name} #pixiv`,
      url: window.location.href
    })[type]();
  };

  const onTagClick = (tag: string) => {
    dispatch(GalleryActions.setWord(tag));
    dispatch(GalleryActions.setFromIllust(true));
    history.push('/');
  };

  React.useEffect(() => {
    if (!item.id) {
      dispatch(IllustActions.fetchItem(illustId));
    }

    dispatch(IllustActions.fetchComments(illustId));
    fetchBookmark();

    return () => {
      dispatch(IllustActions.clearComments());
    };
  }, []);

  const renderImage = () => {
    if (item.meta_pages?.length > 0) {
      return item.meta_pages.map((elem: any, index: number) => {
        return (
          <Img
            key={shortid.generate()}
            src={[
              api.proxyImage(elem.image_urls.large),
              api.proxyImage(elem.image_urls.medium)
            ]}
            loader={<Loading />}
            onClick={() => onImageClick(index)}
          />
        );
      });
    }
    if (item.meta_pages?.length === 0) {
      return (
        <Img
          src={[
            api.proxyImage(item.image_urls.large),
            api.proxyImage(item.image_urls.medium)
          ]}
          loader={<Loading />}
          onClick={() => onImageClick(0)}
        />
      );
    }

    if (item.metadata?.zip_images?.length > 0) {
      return <GifPlayer images={item.metadata.zip_images} />;
    }
  };

  const renderContent = () => {
    if (illust.isFetching) {
      return <Loading />;
    }
    if (illust.isError) {
      return <Message text={intl.formatMessage({ id: 'An Error Occurred' })} />;
    }
    try {
      return (
        <div className={classes.illust}>
          <div className={classes.image}>{renderImage()}</div>
          <div className={classes.caption}>
            {typeof item.caption === 'string' &&
              (item.caption as string)
                .replace(/(\r\n|\n\r|\r|\n)/g, '\n')
                .split('\n')
                .map(elem => (
                  <p
                    key={shortid.generate()}
                    dangerouslySetInnerHTML={{
                      __html: elem
                    }}
                  />
                ))}
          </div>
          <div className={classes.tags}>
            {item.tags.map((elem: any) => {
              return (
                <Chip
                  key={shortid.generate()}
                  className={classes.tagItem}
                  avatar={<Avatar>#</Avatar>}
                  label={elem.name}
                  onClick={() => onTagClick(elem.name)}
                  clickable
                />
              );
            })}
          </div>
          <div className={classes.actions}>
            <Button
              variant="outlined"
              startIcon={
                isBookmarked ? (
                  <FavoriteIcon color="secondary" />
                ) : (
                  <FavoriteBorderIcon color="secondary" />
                )
              }
              onClick={onBookmarkClick}
              disabled={isSubmitting}>
              {intl.formatMessage({ id: 'Add to Bookmarks' })}
            </Button>
            <Button
              variant="outlined"
              startIcon={<TwitterIcon style={{ color: '#38A1F3' }} />}
              onClick={() => onSocialClick('toTwitter')}>
              {intl.formatMessage({ id: 'Tweet' })}
            </Button>
            <Button
              variant="outlined"
              startIcon={<LineIcon />}
              onClick={() => onSocialClick('toLine')}>
              {intl.formatMessage({ id: 'LINE' })}
            </Button>
            <Button
              variant="outlined"
              startIcon={<WeiboIcon />}
              onClick={() => onSocialClick('toWeibo')}>
              {intl.formatMessage({ id: 'Weibo' })}
            </Button>
          </div>
          <div className={classes.detail}>
            <div>
              <div className={classes.author}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`http://pixiv.me/${item.user.account}`}>
                  {item.user.name}
                </a>
              </div>
              <time>{`${moment(item.created_time).format('LLL')}(JST)`}</time>
              <div className={classes.metas}>
                <span
                  className={
                    classes.divide
                  }>{`${item.width}x${item.height}`}</span>
                {Array.isArray(item.tools) && (
                  <span
                    className={classNames({
                      [classes.divide]: item.tools.length > 0
                    })}>
                    {item.tools.join(' / ')}
                  </span>
                )}
              </div>
            </div>
            <p>
              <a target="_blank" rel="noopener noreferrer" href={`/${item.id}`}>
                {intl.formatMessage({ id: 'Redirect to pixiv' })}
              </a>
            </p>
          </div>
          <InfiniteScroll
            distance={200}
            onLoadMore={() => dispatch(IllustActions.fetchComments(illustId))}
            isLoading={illust.isFetchingComments}
            hasMore={!illust.isCommentsEnd}>
            <div className={classes.comments}>
              <h4>
                {intl.formatMessage({
                  id: illust.comments.length === 0 ? 'No Comments' : 'Comments'
                })}
              </h4>
              <ul className={classes.commentList}>
                {illust.comments.map(elem => {
                  return <Comment key={shortid.generate()} item={elem} />;
                })}
              </ul>
              {illust.isFetchingComments && <Loading />}
            </div>
          </InfiniteScroll>
          <LoginContainer ref={loginRef} />
        </div>
      );
    } catch (e) {
      return <Message text={intl.formatMessage({ id: 'An Error Occurred' })} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{item.title === '' ? config.siteTitle : item.title}</title>
      </Helmet>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <IconButton href="#" color="inherit" onClick={onBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.toolbarTitle}>
            {item.title}
          </Typography>
          <div className={classes.toolbarMiddle} />
          <LanguageSelector />
          <UserButton onClick={() => loginRef.current?.open()} />
        </Toolbar>
      </AppBar>
      <Content>{renderContent()}</Content>
      {showBox && (
        <ImageBox items={urls()} index={boxIndex} onClose={onImageClose} />
      )}
    </>
  );
};

export default IllustContainer;
