import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { injectIntl } from 'react-intl';

import { getCurrentEntities } from 'store/selectors/entity.selectors';
import {
  currentSectorSelector,
  isInitializedSelector,
} from 'store/selectors/base.selectors';
import OverviewList from './overview-list';

const mapStateToProps = state => ({
  currentSector: currentSectorSelector(state),
  entities: getCurrentEntities(state),
  isInitialized: isInitializedSelector(state),
});

const mapDispatchToProps = dispatch => ({
  toHome: () => dispatch(push('/')),
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(OverviewList),
);
