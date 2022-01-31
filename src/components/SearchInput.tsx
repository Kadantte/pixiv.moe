import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useMount, useClickAway } from 'ahooks';
import classNames from 'classnames';
import makeStyles from '@mui/styles/makeStyles';
import { useKeyPress } from 'ahooks';
import { Search as SearchIcon } from '@mui/icons-material';
import { FormControlLabel, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import * as storage from '../utils/storage';

const useStyles = makeStyles({
  searchRoot: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 8,
    marginRight: 16,
    borderRadius: 2,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.25)'
    }
  },
  search: {
    width: 72,
    height: '100%',
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    pointerEvents: 'none',
    marginLeft: 10
  },
  searchInput: {
    font: 'inherit',
    color: 'inherit',
    width: 100,
    '@media screen and (max-width: 321px)': {
      width: 55
    },
    border: 0,
    margin: 0,
    padding: '8px 8px 8px 45px',
    outline: 0,
    display: 'block',
    background: 'none',
    whiteSpace: 'normal',
    verticalAlign: 'middle',
    transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  searchInputOpen: {
    '@media screen and (min-width: 650px)': {
      width: 220
    }
  },
  searchOptionCheckbox: {
    position: 'absolute',
    background: '#fff',
    width: '100%',
    color: '#000',
    fontSize: 14,
    display: 'none',
    boxShadow:
      '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
    zIndex: 99
  },
  searchOptionCheckboxOpen: {
    display: 'block'
  }
});

interface SearchInputProps {
  onSearch: (value: string) => void;
  onOptionsChange: (options: SearchOptions) => void;
  searchOptions: SearchOptions;
}

export interface SearchInputHandles {
  setValue: (value: string) => void;
}

export interface SearchOptions {
  xRestrict: boolean;
}

type SearchOptionsKeys = keyof SearchOptions;

const SearchInput = forwardRef<SearchInputHandles, SearchInputProps>(
  (props, ref) => {
    const classes = useStyles();
    const intl = useIntl();
    const searchRootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const switchRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    useMount(() => {
      if (props.searchOptions.xRestrict) {
        switchRef.current?.click();
      }
    });

    const onSearch = () => {
      if (inputRef.current) {
        props.onSearch(inputRef.current.value);
      }
    };

    const onFocus = () => {
      setOpen(true);
    };

    const onSwitchChange = (
      key: SearchOptionsKeys,
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { searchOptions } = { ...props };
      searchOptions[key] = event.target.checked;
      props.onOptionsChange(searchOptions);
    };

    useKeyPress(
      'enter',
      () => {
        inputRef?.current?.blur();
        setOpen(false);
        onSearch();
      },
      {
        target: inputRef.current
      }
    );

    useClickAway(() => {
      if (open) {
        setOpen(false);
      }
    }, searchRootRef);

    useImperativeHandle(ref, () => ({
      setValue: (value: string) => {
        if (inputRef.current) {
          inputRef.current.value = value;
        }
      }
    }));

    return (
      <div ref={searchRootRef} className={classes.searchRoot}>
        <div className={classes.search}>
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          className={classNames({
            [classes.searchInput]: true,
            [classes.searchInputOpen]: open
          })}
          onFocus={onFocus}
        />
        <div
          className={classNames({
            [classes.searchOptionCheckbox]: true,
            [classes.searchOptionCheckboxOpen]: open
          })}>
          <FormControlLabel
            style={{ marginLeft: 0 }}
            control={
              <Switch
                ref={switchRef}
                onChange={event => onSwitchChange('xRestrict', event)}
                name="xRestrict"
                color="primary"
              />
            }
            label={
              storage.getPremiumKey()
                ? 'R-18'
                : intl.formatMessage({ id: 'R-18 Premium' })
            }
          />
        </div>
      </div>
    );
  }
);

SearchInput.defaultProps = {
  onSearch() {}
};

export default SearchInput;
