import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import { intlShape, FormattedMessage } from 'react-intl';

import MapPrintable from 'components/printables/map-printable';
import FlexContainer from 'primitives/container/flex-container';
import Header, { HeaderType } from 'primitives/text/header';

import Entities from 'constants/entities';

import './style.css';
import '../style.css';

export default class ExpandedPrintable extends Component {
  static propTypes = {
    entities: PropTypes.shape().isRequired,
    printable: PropTypes.shape({
      hexes: PropTypes.arrayOf(PropTypes.object).isRequired,
      viewbox: PropTypes.string.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
    endPrint: PropTypes.func.isRequired,
  };

  componentDidMount() {
    setTimeout(() => {
      window.print();
      this.props.endPrint();
    }, 1);
  }

  renderEntity = (entityId, entityType, entity) => {
    const conf = Entities[entityType];

    const blockAttributes = [];
    if (entity.tags && entity.tags.length) {
      blockAttributes.push(
        <div key="tags">
          <b>
            <FormattedMessage id="misc.tags" />:{' '}
          </b>
          {entity.tags
            .map(tag => this.props.intl.formatMessage({ id: `tags.${tag}` }))
            .join(', ')}
        </div>,
      );
    }
    if ((conf.attributes || []).length) {
      conf.attributes
        .filter(({ key }) => entity[key])
        .forEach(({ key, name }) =>
          blockAttributes.push(
            <div key={key}>
              <b>
                <FormattedMessage id={name} />:{' '}
              </b>
              {this.props.intl.messages[entity[key]] ? (
                <FormattedMessage id={entity[key]} />
              ) : (
                entity[key]
              )}
            </div>,
          ),
        );
    }
    if (entity.neighbors) {
      blockAttributes.push(
        <div key="neighbors">
          <b>
            <FormattedMessage id="misc.neighbors" />:{' '}
          </b>
          {entity.neighbors}
        </div>,
      );
    }
    if (entity.children) {
      blockAttributes.push(
        <div key="children">
          <b>
            <FormattedMessage id="misc.children" />:{' '}
          </b>
          {entity.children}
        </div>,
      );
    }
    if (entity.description) {
      blockAttributes.push(
        <div key="description">
          <b>
            <FormattedMessage id="misc.description" />:{' '}
          </b>
          {entity.description}
        </div>,
      );
    }
    let attrBlock = null;
    if (blockAttributes.length) {
      attrBlock = (
        <FlexContainer justify="flexEnd">
          <FlexContainer className="ExpandedPrintable-Block" direction="column">
            {blockAttributes}
          </FlexContainer>
        </FlexContainer>
      );
    }

    return (
      <FlexContainer
        key={entityId}
        direction="column"
        className="ExpandedPrintable-Entity"
      >
        <FlexContainer align="baseline" className="ExpandedPrintable-Header">
          <Header type={HeaderType.header2} dark>
            {entity.name}
          </Header>
          <Header
            type={HeaderType.header4}
            dark
            className="ExpandedPrintable-Type"
          >
            (<FormattedMessage id={conf.name} />
            {entity.location ? ` - ${entity.location}` : ''})
          </Header>
        </FlexContainer>
        {attrBlock}
      </FlexContainer>
    );
  };

  renderEntities = () =>
    map(this.props.entities, (entityList, entityType) =>
      map(entityList, (entity, entityId) =>
        this.renderEntity(entityId, entityType, entity),
      ),
    );

  render() {
    return (
      <div className="Printable">
        <div className="Printable-Container">
          <MapPrintable
            hexes={this.props.printable.hexes}
            viewbox={this.props.printable.viewbox}
          />
        </div>
        <div className="Printable-EntityContainer">{this.renderEntities()}</div>
      </div>
    );
  }
}
