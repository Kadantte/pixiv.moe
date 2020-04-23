import React from 'react';
import { CircularProgress } from '@material-ui/core';

import { useStyles } from '@/components/Message';

const Loading: React.FunctionComponent<{}> = () => {
  const classes = useStyles();
  return (
    <div className={classes.message}>
      <CircularProgress size={30} />
    </div>
  );
};

export default Loading;
