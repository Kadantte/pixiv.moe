import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import { useAsyncEffect } from 'ahooks';
import supportsWebP from 'supports-webp';
import Loading from './Loading';
import Message from './Message';
import * as api from '../utils/api';
import * as storage from '../utils/storage';

const useStyles = makeStyles({
  loading: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const SessionContext: React.FC<{}> = props => {
  const classes = useStyles();
  const intl = useIntl();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(
    intl.formatMessage({
      id: 'This page is not available in your area'
    })
  );

  useAsyncEffect(async () => {
    try {
      const premiumKey = storage.getPremiumKey();
      const data = await api.session({ premium_key: premiumKey });
      setToken(data.response.access_token);
      if (!data.response.premium) {
        storage.removePremiumKey();
      }
      storage.setToken(data.response.access_token);
      api.refreshToken();
      setLoading(false);
      if (await supportsWebP) {
        document.body.classList.add('supports-webp');
      } else {
        document.body.classList.add('not-supports-webp');
      }
    } catch (err) {
      setLoading(false);
      if (err instanceof api.APIError) {
        setMessage(err.message);
      } else if (
        err instanceof TypeError &&
        err.message === 'Failed to fetch'
      ) {
        setMessage('Failed to fetch');
      }
    }
  }, []);

  if (loading) {
    return (
      <div className={classes.loading}>
        <Loading />
      </div>
    );
  }
  if (token) {
    return <>{props.children}</>;
  }

  let code = 403;
  const messageStart = String(message).substr(0, 3);
  if (/^\d+$/.test(messageStart)) {
    code = Number(messageStart);
  }
  return <Message code={code} text={message} />;
};

export default SessionContext;
