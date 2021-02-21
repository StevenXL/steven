import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare } from "@fortawesome/free-solid-svg-icons";

import styles from "./FootnoteDefinition.module.scss";

class FootnoteDefinition extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    identifier: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  };

  render() {
    const { children, identifier, label } = this.props;

    return (
      <span id={`fn-${identifier}`} className={styles.fnDefinition}>
        <p>{label}:</p>
        {children}
        <a href={`#fnref-${identifier}`}>
          <FontAwesomeIcon icon={faShare} />
        </a>
      </span>
    );
  }
}

export default FootnoteDefinition;
