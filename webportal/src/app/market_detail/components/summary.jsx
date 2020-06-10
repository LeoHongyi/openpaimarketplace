// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FontClassNames, getTheme } from '@uifabric/styling';
import c from 'classnames';
import {
  DefaultButton,
  PrimaryButton,
  Stack,
  FontWeights,
  Text,
} from 'office-ui-fabric-react';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import t from '../../components/tachyons.scss';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { isNil } from 'lodash';
import PropTypes from 'prop-types';

import Card from './card';
import EditMarketItem from './edit_market_item';
import DeleteMarketItem from './delete_market_item';
import Context from 'App/context';
import { TagBar } from '../../components/tag_bar';
import ConfirmDialog from '../../components/confirm_dialog';
import {
  getStarStatus,
  deleteStar,
  addStar,
  increaseSubmits,
} from 'App/utils/marketplace_api';

const { spacing } = getTheme();

export default function Summary(props) {
  const { marketItem } = props;
  const { user, isAdmin } = useContext(Context);

  const [hideDialog, setHideDialog] = useState(true);
  const [hideApproveDialog, setHideApproveDialog] = useState(true);
  const [hideRejectDialog, setHideRejectDialog] = useState(true);
  const [hideDeleteDialog, setHideDeleteDialog] = useState(true);
  const [starNumber, setStarNumber] = useState(marketItem.starNumber);
  const [stared, setStared] = useState(false);

  useEffect(() => {
    async function fetchStarRelationWrapper() {
      const status = await getStarStatus(user, marketItem.id);
      if (status) {
        setStared(true);
      } else {
        setStared(false);
      }
    }
    fetchStarRelationWrapper();
  }, []);

  const checkAuthorAdmin = useCallback(() => {
    return isAdmin || user === marketItem.author;
  });

  const clickStar = useCallback(async () => {
    if (stared) {
      await deleteStar(user, marketItem.id);
      setStared(false);
      setStarNumber(starNumber - 1);
    } else {
      await addStar(user, marketItem.id);
      setStared(true);
      setStarNumber(starNumber + 1);
    }
  });

  const clickSubmit = async () => {
    window.localStorage.removeItem('marketItem');
    window.localStorage.setItem(
      'marketItem',
      JSON.stringify(marketItem.jobConfig),
    );
    await increaseSubmits(marketItem.id);
    if (isJobV2(marketItem.jobConfig)) {
      window.location.href = `/submit.html`;
    } else {
      window.location.href = `/submit_v1.html`;
    }
  };

  const isJobV2 = jobConfig => {
    return (
      !isNil(jobConfig.protocol_version) || !isNil(jobConfig.protocolVersion)
    );
  };

  return (
    <div
      style={{
        marginTop: spacing.m,
      }}
    >
      {/* summary */}
      <Card className={c(t.pv4, t.ph5)}>
        <Stack gap={'l1'}>
          {/* summary-row-1 */}
          <Text
            styles={{
              root: {
                fontSize: 16,
                fontWeight: FontWeights.semibold,
              },
            }}
          >
            {marketItem.name}
          </Text>
          <Stack horizontal gap={'m'}>
            <TooltipHost content='Author'>
              <Stack horizontal gap='s1'>
                <Icon iconName='Contact' />
                <Text
                  styles={{
                    root: {
                      fontSize: 14,
                      fontWeight: FontWeights.regular,
                    },
                  }}
                >
                  {marketItem.author}
                </Text>
              </Stack>
            </TooltipHost>
            {marketItem.status === 'approved' && (
              <Stack className={c(t.gray, FontClassNames.medium)}>
                <TooltipHost content='submits'>
                  <Stack horizontal gap={'s1'}>
                    <Icon iconName='Copy' />
                    <Text
                      styles={{
                        root: {
                          fontSize: 14,
                          fontWeight: FontWeights.regular,
                        },
                      }}
                    >
                      {String(marketItem.submits)}
                    </Text>
                  </Stack>
                </TooltipHost>
              </Stack>
            )}
            {marketItem.status === 'approved' && (
              <Stack className={c(t.gray, FontClassNames.medium)}>
                <TooltipHost content='stars'>
                  <Stack horizontal gap={'s'}>
                    <button
                      onClick={() => {
                        clickStar();
                      }}
                      style={{ backgroundColor: 'Transparent', border: 'none' }}
                    >
                      {stared && (
                        <Icon iconName='Like' className={{ color: 'gold' }} />
                      )}
                      {!stared && <Icon iconName='Like' />}
                    </button>
                    <Text
                      styles={{
                        root: {
                          fontSize: 14,
                          fontWeight: FontWeights.regular,
                        },
                      }}
                    >
                      {String(starNumber)}
                    </Text>
                  </Stack>
                </TooltipHost>
              </Stack>
            )}
          </Stack>
          {/* summary-row-3 */}
          <div className={c(t.gray)}>{marketItem.introduction}</div>
          {/* summary-row-4 */}
          <TagBar tags={marketItem.tags} />
          {/* summary-row-5 */}
          {marketItem.status === 'approved' && (
            <Stack horizontal gap='m'>
              <PrimaryButton
                text='Submit'
                styles={{
                  root: {
                    fontSize: 14,
                    fontWeight: FontWeights.regular,
                  },
                }}
                onClick={clickSubmit}
              />
              {checkAuthorAdmin() && (
                <Stack>
                  <DefaultButton
                    text='Edit'
                    styles={{
                      root: {
                        fontSize: 14,
                        fontWeight: FontWeights.regular,
                      },
                    }}
                    onClick={e => {
                      setHideDialog(false);
                    }}
                  />
                  <EditMarketItem
                    hideDialog={hideDialog}
                    setHideDialog={setHideDialog}
                    marketItem={marketItem}
                  />
                </Stack>
              )}
              {checkAuthorAdmin() && (
                <Stack>
                  <DefaultButton
                    text='Delete'
                    styles={{
                      root: {
                        fontSize: 14,
                        fontWeight: FontWeights.regular,
                      },
                    }}
                    onClick={e => {
                      setHideDeleteDialog(false);
                    }}
                  />
                  <DeleteMarketItem
                    hideDeleteDialog={hideDeleteDialog}
                    setHideDeleteDialog={setHideDeleteDialog}
                    itemId={marketItem.id}
                  />
                </Stack>
              )}
            </Stack>
          )}
          {marketItem.status === 'pending' && (
            <Stack horizontal gap='m'>
              <PrimaryButton
                text='Approve'
                styles={{
                  root: {
                    fontSize: 14,
                    fontWeight: FontWeights.regular,
                  },
                }}
                onClick={async () => {
                  setHideApproveDialog(false);
                }}
              />
              <ConfirmDialog
                hideDialog={hideApproveDialog}
                setHideDialog={setHideApproveDialog}
                action='approve'
                pageType='detail'
                itemId={marketItem.id}
              />
              <DefaultButton
                text='Reject'
                styles={{
                  root: {
                    fontSize: 14,
                    fontWeight: FontWeights.regular,
                  },
                }}
                onClick={async () => {
                  setHideRejectDialog(false);
                }}
              />
              <ConfirmDialog
                hideDialog={hideRejectDialog}
                setHideDialog={setHideRejectDialog}
                action='reject'
                pageType='detail'
                itemId={marketItem.id}
              />
            </Stack>
          )}
        </Stack>
      </Card>
    </div>
  );
}

Summary.propTypes = {
  marketItem: PropTypes.object,
};
