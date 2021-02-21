import React, { PureComponent } from "react";
import PropTypes from "prop-types";

class FootnoteDefinition extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    identifier: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  };

  render() {
    const { children, identifier, label } = this.props;

    console.log(this.props);

    return (
      <span id={`fn-${identifier}`} className="footnote-definition">
        <p>{label}:</p>
        {children}
        <a href={`#fnref-${identifier}`} className="footnote-backref">
          ↩
        </a>
      </span>
    );
  }
}

export default FootnoteDefinition;
