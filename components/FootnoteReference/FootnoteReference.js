import React, { PureComponent } from "react";
import PropTypes from "prop-types";

class FootnoteReference extends PureComponent {
  static propTypes = {
    identifier: PropTypes.string.isRequired,
    label: PropTypes.string,
  };

  render() {
    const { identifier, label } = this.props;

    return (
      <sup id={`fnref-${identifier}`}>
        <a href={`#fn-${identifier}`} className="footnote-ref">
          {label}
        </a>
      </sup>
    );
  }
}

export default FootnoteReference;
