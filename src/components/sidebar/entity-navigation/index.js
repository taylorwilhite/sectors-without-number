import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import {
  userModelSelector,
  currentSectorSelector,
  isSidebarEditActiveSelector,
} from 'store/selectors/base.selectors';
import {
  isCurrentSectorSaved,
  isViewingSharedSector,
} from 'store/selectors/sector.selectors';
import {
  getCurrentEntity,
  getCurrentEntityType,
} from 'store/selectors/entity.selectors';

import { openExport } from 'store/actions/sector.actions';
import { saveEntityEdit, saveSector } from 'store/actions/entity.actions';
import {
  activateSidebarEdit,
  deactivateSidebarEdit,
} from 'store/actions/sidebar-edit.actions';
import EntityNavigation from './entity-navigation';

const mapStateToProps = state => ({
  isSaved: isCurrentSectorSaved(state),
  isSynced: !!userModelSelector(state),
  isShared: isViewingSharedSector(state),
  currentSector: currentSectorSelector(state),
  entity: getCurrentEntity(state),
  entityType: getCurrentEntityType(state),
  isSidebarEditActive: isSidebarEditActiveSelector(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  activateSidebarEdit: () => dispatch(activateSidebarEdit()),
  deactivateSidebarEdit: () => dispatch(deactivateSidebarEdit()),
  saveEntityEdit: () => dispatch(saveEntityEdit(props.intl)),
  saveSector: () => dispatch(saveSector(props.intl)),
  openExport: () => dispatch(openExport()),
});

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(EntityNavigation),
);
